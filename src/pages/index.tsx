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
  Spinner,
  useColorMode,
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
import Footer from "../components/Footer";
import { Program } from "../utils/interfaces";
const Favicon = require("react-favicon");

const vertexAttribs = {
  meshPosition: 0,
};

interface RenderedGif {
  name: string;
  src: string;
}

const Index = () => {
  const [state, setState] =
    useState<"initial" | "rendering" | "rendered">("initial");
  const [currentFilterName, setCurrentFilterName] = useState<string>("");
  const [webGlError, setWebGlError] = useState<string>("");
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string>(
    "/imgs/tsodinClown.png"
  );
  const [renderData, setRenderData] = useState<{
    [key: string]: [WebGLRenderingContext, HTMLCanvasElement, Program];
  }>({});
  const [renderedGif, setRenderedGif] = useState<RenderedGif>({
    name: "",
    src: "",
  });

  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const gifRenderer = useRef<any>();
  const renderedGifsCacheRef = useRef<{ [key: string]: RenderedGif }>({});

  useEffect(() => {
    if (colorMode === "light") {
      toggleColorMode();
    }

    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
      setWebGlError("Could not initialize WebGL context");
      return;
    }
  }, []);

  useEffect(() => {
    if (!uploadedImageSrc) return;

    //clear cache
    {
      Object.values(renderedGifsCacheRef.current).map(({ src }) =>
        URL.revokeObjectURL(src)
      );
      renderedGifsCacheRef.current = {};
    }

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

  // auto render image on filter change
  useEffect(() => {
    if (!renderData[currentFilterName] || !fileInputRef.current) return;

    const cachedGif = renderedGifsCacheRef.current[currentFilterName];
    if (cachedGif) {
      setRenderedGif(cachedGif);
      return;
    }

    setState("rendering");

    if (gifRenderer.current?.running) {
      gifRenderer.current.abort();
    }
    const file = fileInputRef.current.files?.[0];
    const filename = file ? removeFileNameExt(file.name) : "result";

    gifRenderer.current = renderGif(...renderData[currentFilterName]);

    gifRenderer.current.on("finished", (blob: Blob) => {
      const renderedGif = {
        name: `${filename}-${currentFilterName}.gif`,
        src: URL.createObjectURL(blob),
      };
      renderedGifsCacheRef.current[currentFilterName] = renderedGif;
      setRenderedGif(renderedGif);
      gifRenderer.current.abort();
      setState("rendered");
    });
  }, [currentFilterName]);

  const handleFileUpload = (file: File) => {
    setState("initial");
    setUploadedImageSrc(URL.createObjectURL(file));
    setRenderedGif({
      name: "",
      src: "",
    });
    setCurrentFilterName("");
  };

  return (
    <Flex justifyContent="center">
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
            <DropZoneOverlay
              handleFileDrop={(e: DragEvent) => {
                const file = e.dataTransfer?.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <Heading mt="50px" mb="5px">
              Upload an image to animate
            </Heading>
            <Text>
              Fully{" "}
              <Text as="span" fontWeight="bold" background="black" px="3px">
                Black (#000000)
              </Text>{" "}
              color is not supported and will become tansparent on rendered gif
            </Text>
            <Flex
              w="90%"
              h="175px"
              mt="25px"
              border="5px dashed"
              borderColor="limegreen"
              textAlign="center"
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              _hover={{ cursor: "pointer" }}
              pos="relative"
            >
              <Step step={1} />
              Select or drop an image
              <Box fontSize="3xl">
                <BsUpload />
              </Box>
              <input
                ref={fileInputRef}
                style={{ display: "none" }}
                type="file"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </Flex>
            <Box pos="relative" w="90%" m="15px">
              <Step step={2} />
              <Heading mt="15px" mb="5px">
                Pick a filter:
              </Heading>
            </Box>
            <Previews
              filters={filters}
              currentFilterName={currentFilterName}
              setRenderData={setRenderData}
              onClick={(filterName: string) => {
                setCurrentFilterName(filterName);
              }}
              vertexAttribs={vertexAttribs}
              uploadedImageSrc={uploadedImageSrc}
            />
            <Divider m="10px" mb="0" />
            <Box pos="relative" w="90%" mb="15px" pt="10px">
              <Step step={3} />
              <Heading mt="10px">Get animated gif</Heading>
            </Box>
            <Flex
              w={`${IMAGE_SIZE}px`}
              h={`${IMAGE_SIZE}px`}
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              outline={state === "initial" ? "solid 2px red" : ""}
            >
              {state === "initial" && <Box>☝️Pick a filter to get the gif</Box>}
              {state === "rendering" && <Spinner size="lg" />}
              {state === "rendered" && <Image src={renderedGif.src} />}
            </Flex>
            <Button
              w="140px"
              m="15px"
              as={Link}
              isLoading={state === "rendering"}
              isDisabled={state === "initial"}
              loadingText="Rendering"
              spinnerPlacement="end"
              href={renderedGif.src}
              download={renderedGif.name}
              colorScheme="teal"
              rightIcon={<DownloadIcon />}
            >
              Download
            </Button>
          </>
        )}
        <Footer />
      </Flex>
    </Flex>
  );
};

export default Index;

const Step = ({ step }: { step: number }) => {
  return (
    <Box pos="absolute" top="5px" left="5px">
      <Text color="lightpink" fontWeight="bold">
        Step {step}
      </Text>
    </Box>
  );
};

const removeFileNameExt = (fileName: string) => {
  if (fileName.includes(".")) {
    return fileName.split(".").slice(0, -1).join(".");
  } else {
    return fileName;
  }
};

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
    transparent: "rgba(0, 0, 0, 0)",
  });

  const fps = 30;
  const dt = 1.0 / fps;
  const duration = program.duration;

  let t = 0.0;
  while (t <= duration) {
    gl.uniform1f(program.timeUniform, t);
    gl.uniform2f(program.resolutionUniform, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
