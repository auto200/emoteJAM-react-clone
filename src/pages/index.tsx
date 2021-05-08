import {
  Box,
  Flex,
  Image,
  Button,
  Link,
  Heading,
  Divider,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import DropZoneOverlay from "../components/DropZoneOverlay";
import Previews from "../components/Previews";
import { IMAGE_SIZE, TRIANGLE_PAIR, TRIANGLE_VERTICIES } from "../constants";
import filters from "../filters";
import { DownloadIcon } from "@chakra-ui/icons";
import { BsUpload } from "react-icons/bs";
import GithubLink from "../components/GithubIcon";
import kekwFavicon from "../kekwFavicon";
const Favicon = require("react-favicon");

export interface VertexAttribs {
  [key: string]: number;
}

export interface Program {
  id: WebGLProgram;
  resolutionUniform: WebGLUniformLocation | null;
  timeUniform: WebGLUniformLocation | null;
  duration: number;
  transparent: number | null;
}

function removeFileNameExt(fileName: string) {
  if (fileName.includes(".")) {
    return fileName.split(".").slice(0, -1).join(".");
  } else {
    return fileName;
  }
}

const renderGif = (
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement,
  program: Program
) => {
  //@ts-ignore
  const gif = new window.GIF({
    workers: 5,
    quality: 10,
    width: canvas.width,
    height: canvas.height,
    transparent: program.transparent,
  });

  const fps = 30;
  const dt = 1.0 / fps;
  const duration = program.duration;

  let t = 0.0;
  while (t <= duration) {
    gl.uniform1f(program.timeUniform, t);
    gl.uniform2f(program.resolutionUniform, canvas.width, canvas.height);
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, TRIANGLE_PAIR * TRIANGLE_VERTICIES);

    const pixels = new Uint8ClampedArray(4 * canvas.width * canvas.height);
    gl.readPixels(
      0,
      0,
      canvas.width,
      canvas.height,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels
    );
    // Flip the image vertically
    {
      const center = Math.floor(canvas.height / 2);
      for (let y = 0; y < center; ++y) {
        const row = 4 * canvas.width;
        for (let x = 0; x < row; ++x) {
          const ai = y * 4 * canvas.width + x;
          const bi = (canvas.height - y - 1) * 4 * canvas.width + x;
          const a = pixels[ai];
          const b = pixels[bi];
          pixels[ai] = b;
          pixels[bi] = a;
        }
      }
    }

    gif.addFrame(new ImageData(pixels, canvas.width, canvas.height), {
      delay: dt * 1000,
      dispose: 2,
    });

    t += dt;
  }

  gif.render();

  return gif;
};

const vertexAttribs = {
  meshPosition: 0,
};

const Index = () => {
  const [state, setState] = useState<"idle" | "rendering" | "rendered">("idle");
  const [currentFilterName, setCurrentFilterName] = useState<string>(
    () => Object.keys(filters)[0]
  );
  const [webGlError, setWebGlError] = useState<string>("");
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string>(
    "/imgs/tsodinClown.png"
  );
  const [renderData, setRenderData] = useState<{
    [key: string]: [WebGLRenderingContext, HTMLCanvasElement, Program];
  }>({});
  const [renderedImage, setRenderedImage] = useState<{
    name: string;
    src: string;
  }>({ name: "", src: "" });
  const toast = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  let gifRenderer: any;

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
    });
    if (!gl) {
      setWebGlError("Could not initialize WebGL context");
      return;
    }
  }, []);

  useEffect(() => {
    if (!uploadedImageSrc) return;

    const image = new window.Image();
    image.src = uploadedImageSrc;

    image.addEventListener("error", () => {
      if (!fileInputRef.current) return;
      fileInputRef.current.value = "";
      setUploadedImageSrc("/imgs/error.png");
      toast({
        title: "Failed to convert image",
        status: "error",
        position: "bottom-left",
      });
    });
  }, [uploadedImageSrc]);

  useEffect(() => {
    if (state === "idle") {
      setRenderedImage({
        name: "",
        src: "",
      });
    }
  }, [state]);

  const render = () => {
    if (!renderData[currentFilterName] || !fileInputRef.current) return;

    setState("rendering");

    if (gifRenderer?.running) {
      gifRenderer.abort();
    }
    const file = fileInputRef.current.files?.[0];
    const filename = file ? removeFileNameExt(file.name) : "result";

    gifRenderer = renderGif(...renderData[currentFilterName]);

    gifRenderer.on("finished", (blob: Blob) => {
      setRenderedImage({
        name: `${filename}-${currentFilterName}.gif`,
        src: URL.createObjectURL(blob),
      });
      gifRenderer.abort();
      setState("rendered");
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e?.target.files?.[0];
    if (!file) return;
    setState("idle");
    setUploadedImageSrc(URL.createObjectURL(file));
  };

  const handleFileDrop = (e: DragEvent) => {
    const file = e?.dataTransfer?.files?.[0];
    if (!file) return;
    setState("idle");
    setUploadedImageSrc(URL.createObjectURL(file));
  };

  return (
    <Flex justifyContent="center" pb="100px">
      <Favicon url={kekwFavicon} animate animationDelay={50} />
      <GithubLink />
      <Flex
        maxW="800px"
        p="0 10px"
        textAlign="center"
        justifyContent="center"
        alignItems="center"
        flexDir="column"
      >
        {webGlError ? (
          webGlError
        ) : (
          <>
            <DropZoneOverlay handleFileDrop={handleFileDrop} />
            <Heading my="50px">Upload an image to animate</Heading>
            <Flex
              w="90%"
              h="150px"
              border="5px dashed"
              borderColor="slategray"
              textAlign="center"
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              _hover={{ cursor: "pointer" }}
            >
              Select or drop an image
              <Box fontSize="3xl">
                <BsUpload />
              </Box>
              <input
                ref={fileInputRef}
                style={{ display: "none" }}
                type="file"
                onChange={handleFileChange}
              />
            </Flex>
            <Heading mt="15px" mb="5px">
              Pick a filter:
            </Heading>
            <Text>
              (
              <Text as="span" color="#0f0">
                Green
              </Text>{" "}
              background will be gone after render)
            </Text>
            <Previews
              filters={filters}
              currentFilterName={currentFilterName}
              setRenderData={setRenderData}
              onClick={(filterName: string) => {
                if (state === "rendered") {
                  setState("idle");
                }
                setCurrentFilterName(filterName);
              }}
              vertexAttribs={vertexAttribs}
              uploadedImageSrc={uploadedImageSrc}
            />
            <Divider m="10px" />
            <Flex
              w={`${IMAGE_SIZE}px`}
              h={`${IMAGE_SIZE}px`}
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              outline={state === "idle" ? "solid 2px red" : ""}
            >
              {renderedImage.src ? (
                <Image src={renderedImage.src} />
              ) : (
                <>
                  <Box>Your rendered image will be here</Box>
                  <Box>👇</Box>
                </>
              )}
            </Flex>
            <Box m="15px" w="140px">
              {state === "idle" || state === "rendering" ? (
                <Button
                  isLoading={state === "rendering"}
                  loadingText="Rendering"
                  spinnerPlacement="end"
                  onClick={render}
                  colorScheme="red"
                  w="full"
                >
                  Render
                </Button>
              ) : (
                <Button
                  as={Link}
                  href={renderedImage.src}
                  download={renderedImage.name}
                  colorScheme="teal"
                  rightIcon={<DownloadIcon />}
                  w="full"
                >
                  Download
                </Button>
              )}
            </Box>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default Index;
