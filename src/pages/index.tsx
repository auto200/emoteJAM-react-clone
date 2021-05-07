import {
  chakra,
  Box,
  Flex,
  Select,
  Image,
  Button,
  Progress,
  Spinner,
  Link,
  Text,
  Heading,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Preview from "../components/Preview";
import { TRIANGLE_PAIR, TRIANGLE_VERTICIES } from "../constants";
import filters from "../filters";

const FileInput = chakra("input");

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

const vertexAttribs = {
  meshPosition: 0,
};

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

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gl, setGl] = useState<WebGLRenderingContext>();
  const [currentFilterName, setCurrentFilterName] = useState<string>(
    () => Object.keys(filters)[0]
  );
  const [webGlError, setWebGlError] = useState<string>("");
  // const gifRendererRef = useRef<any>();
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string>(
    "/imgs/tsodinClown.png"
  );
  const uploadedImageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [renderProgress, setRenderProgess] = useState<number>(0);
  // const [renderedImage, setRenderedImage] = useState<{
  //   name: string;
  //   src: string;
  // }>({ name: "", src: "" });

  useEffect(() => {
    const gl = canvasRef.current?.getContext("webgl", {
      antialias: false,
      alpha: false,
    });
    if (!gl) {
      setWebGlError("Could not initialize WebGL context");
      return;
    }
    setGl(gl);
  }, []);

  return (
    <Flex
      maxW="800px"
      m="40px auto"
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
          <FileInput
            ref={fileInputRef}
            m="10px"
            type="file"
            onChange={() => {
              if (!fileInputRef.current || !uploadedImageRef.current) return;
              setUploadedImageSrc(
                URL.createObjectURL(fileInputRef.current.files?.[0])
              );
            }}
          />
          <Image
            ref={uploadedImageRef}
            src={uploadedImageSrc}
            w="112px"
            h="112px"
            onError={() => {
              if (!fileInputRef.current) return;
              fileInputRef.current.value = "";
              setUploadedImageSrc("/imgs/error.png");
            }}
          />
          <Heading mt="15px" mb="5px">
            Filters:
          </Heading>
          <Flex wrap="wrap" justifyContent="center">
            {Object.entries(filters).map(([name, filter]) => (
              <Flex
                key={name}
                flexDirection="column"
                textAlign="center"
                m="15px"
                padding="10px"
                outline={currentFilterName === name ? "2px solid red" : ""}
                onClick={() => setCurrentFilterName(name)}
                _hover={{ cursor: "pointer" }}
              >
                <Text>{name}</Text>
                <Preview
                  filter={filter}
                  vertexAttribs={vertexAttribs}
                  imageEl={uploadedImageRef.current}
                />
              </Flex>
            ))}
          </Flex>
          <canvas
            ref={canvasRef}
            width="112px"
            height="112px"
            style={{ display: "none" }}
          />
          {/* <Progress
            m="15px"
            w="100%"
            hasStripe
            isAnimated
            value={renderProgress}
          /> */}
          {/* <Button
            mb="15px"
            onClick={() => {
              if (
                !gl ||
                !canvasRef.current ||
                !programRef.current ||
                !fileInputRef.current
              )
                return;

              if (gifRendererRef.current && gifRendererRef.current.running) {
                gifRendererRef.current.abort();
              }
              const file = fileInputRef.current.files?.[0];
              const filename = file ? removeFileNameExt(file.name) : "result";

              gifRendererRef.current = renderGif(
                gl,
                canvasRef.current,
                programRef.current
              );

              gifRendererRef.current.on("finished", (blob: Blob) => {
                setRenderedImage({
                  name: `${filename}-${currentFilterName}.gif`,
                  src: URL.createObjectURL(blob),
                });
                setRenderProgess(100);
                gifRendererRef.current.abort();
              });

              gifRendererRef.current.on("progress", (p: number) => {
                setRenderProgess(p * 100);
              });
            }}
          >
            Render
          </Button> */}
          {/* <Box>
            <Spinner size="xl" thickness="10px" />
            <Image w="112px" h="112px" src={renderedImage.src} />
          </Box>
          <Button
            as={Link}
            href={renderedImage.src}
            download={renderedImage.name}
            disabled={!renderedImage.name}
            title={!renderedImage.name ? "render gif first" : ""}
          >
            Download
          </Button> */}
        </>
      )}
    </Flex>
  );
};

export default Index;
