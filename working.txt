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
} from "@chakra-ui/react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  TRIANGLE_PAIR,
  TRIANGLE_VERTICIES,
  VEC2_COUNT,
  VEC2_X,
  VEC2_Y,
} from "../constants";
import filters, { Filter } from "../filters";

const FileInput = chakra("input");

interface VertexAttribs {
  [key: string]: number;
}

interface Program {
  id: WebGLProgram;
  resolutionUniform: WebGLUniformLocation | null;
  timeUniform: WebGLUniformLocation | null;
  duration: number;
  transparent: number | null;
}

function loadFilterProgram(
  gl: WebGLRenderingContext,
  filter: Filter,
  vertexAttribs: VertexAttribs
) {
  const vertexShader = compileShaderSource(gl, filter.vertex, gl.VERTEX_SHADER);
  const fragmentShader = compileShaderSource(
    gl,
    filter.fragment,
    gl.FRAGMENT_SHADER
  );
  if (!vertexShader || !fragmentShader) return null;

  const id = linkShaderProgram(
    gl,
    [vertexShader, fragmentShader],
    vertexAttribs
  );
  if (!id) return null;

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  gl.useProgram(id);

  return {
    id: id,
    resolutionUniform: gl.getUniformLocation(id, "resolution"),
    timeUniform: gl.getUniformLocation(id, "time"),
    duration: filter.duration,
    transparent: filter.transparent,
  };
}

function compileShaderSource(
  gl: WebGLRenderingContext,
  source: string,
  shaderType: GLenum
) {
  const shader = gl.createShader(shaderType);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(
      `Could not compile ${shaderTypeToString(
        gl,
        shaderType
      )} shader: ${gl.getShaderInfoLog(shader)}`
    );
  }
  return shader;
}

function shaderTypeToString(gl: WebGLRenderingContext, shaderType: GLenum) {
  switch (shaderType) {
    case gl.VERTEX_SHADER:
      return "Vertex";
    case gl.FRAGMENT_SHADER:
      return "Fragment";
    default:
      return shaderType;
  }
}

function linkShaderProgram(
  gl: WebGLRenderingContext,
  shaders: [WebGLShader, WebGLShader],
  vertexAttribs: VertexAttribs
) {
  const program = gl.createProgram();
  if (!program) return null;

  for (let shader of shaders) {
    gl.attachShader(program, shader);
  }

  for (let vertexName in vertexAttribs) {
    gl.bindAttribLocation(program, vertexAttribs[vertexName], vertexName);
  }

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
      `Could not link shader program: ${gl.getProgramInfoLog(program)}`
    );
  }
  return program;
}

function createTextureFromImage(
  gl: WebGLRenderingContext,
  image: TexImageSource
) {
  let textureId = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureId);
  gl.texImage2D(
    gl.TEXTURE_2D, // target
    0, // level
    gl.RGBA, // internalFormat
    gl.RGBA, // srcFormat
    gl.UNSIGNED_BYTE, // srcType
    image // image
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return textureId;
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

    let pixels = new Uint8ClampedArray(4 * canvas.width * canvas.height);
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
  const [currentFilterName, setCurrentFilterName] = useState<string>(
    () => Object.keys(filters)[0]
  );
  const [webGlError, setWebGlError] = useState<string>("");
  const [gl, setGl] = useState<WebGLRenderingContext>();
  const programRef = useRef<Program | null>();
  const gifRendererRef = useRef<any>();
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string>(
    "/imgs/tsodinClown.png"
  );
  const uploadedImageRef = useRef<HTMLImageElement>(null);
  const [emoteTexture, setEmoteTexture] = useState<WebGLTexture>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [renderProgress, setRenderProgess] = useState<number>(0);
  const [renderedImage, setRenderedImage] = useState<{
    name: string;
    src: string;
  }>({ name: "", src: "" });

  const onFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newFilterName = e.target.value;
    setCurrentFilterName(newFilterName);

    if (!gl || !programRef.current) return;

    gl.deleteProgram(programRef.current.id);

    const newProgram = loadFilterProgram(
      gl,
      filters[newFilterName],
      vertexAttribs
    );
    programRef.current = newProgram;
  };

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

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const program = loadFilterProgram(
      gl,
      filters[currentFilterName],
      vertexAttribs
    );
    programRef.current = program;

    // Mesh Position
    {
      const meshPositionBufferData = new Float32Array(
        TRIANGLE_PAIR * TRIANGLE_VERTICIES * VEC2_COUNT
      );
      for (let triangle = 0; triangle < TRIANGLE_PAIR; ++triangle) {
        for (let vertex = 0; vertex < TRIANGLE_VERTICIES; ++vertex) {
          const quad = triangle + vertex;
          const index =
            triangle * TRIANGLE_VERTICIES * VEC2_COUNT + vertex * VEC2_COUNT;
          meshPositionBufferData[index + VEC2_X] = 2 * (quad & 1) - 1;
          meshPositionBufferData[index + VEC2_Y] = 2 * ((quad >> 1) & 1) - 1;
        }
      }

      const meshPositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, meshPositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, meshPositionBufferData, gl.STATIC_DRAW);

      const meshPositionAttrib = vertexAttribs["meshPosition"];
      gl.vertexAttribPointer(
        meshPositionAttrib,
        VEC2_COUNT,
        gl.FLOAT,
        false,
        0,
        0
      );
      gl.enableVertexAttribArray(meshPositionAttrib);
    }

    let start: number;
    const step = (timestamp: number) => {
      if (!programRef.current || !canvasRef.current) return;
      if (start === undefined) {
        start = timestamp;
      }
      start = timestamp;

      gl.uniform1f(programRef.current.timeUniform, start * 0.001);
      gl.uniform2f(
        programRef.current.resolutionUniform,
        canvasRef.current.width,
        canvasRef.current.height
      );

      gl.clearColor(0.0, 1.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, TRIANGLE_PAIR * TRIANGLE_VERTICIES);

      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  }, []);

  return (
    <Flex
      maxW="650px"
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
                URL.createObjectURL(fileInputRef.current.files)
              );
            }}
          />
          <Image
            ref={uploadedImageRef}
            src={uploadedImageSrc}
            w="112px"
            h="112px"
            onLoad={() => {
              if (!gl || !uploadedImageRef.current) return;
              if (emoteTexture) {
                gl.deleteTexture(emoteTexture);
              }
              const newTexture = createTextureFromImage(
                gl,
                uploadedImageRef.current
              );
              if (newTexture) {
                setEmoteTexture(newTexture);
              }
            }}
            onError={() => {
              if (!fileInputRef.current) return;
              fileInputRef.current.value = "";
              setUploadedImageSrc("/imgs/error.png");
            }}
          />
          <Box width="300px">
            Filter:
            <Select value={currentFilterName} onChange={onFilterChange}>
              {Object.keys(filters).map((filterName) => (
                <option key={filterName} value={filterName}>
                  {filterName}
                </option>
              ))}
            </Select>
          </Box>
          {/* <Canvas ref={canvasRef} w="112px" h="112px" m="15px" /> */}
          <canvas
            ref={canvasRef}
            width="112px"
            height="112px"
            style={{ margin: 15 }}
          />
          <Progress
            m="15px"
            w="100%"
            hasStripe
            isAnimated
            value={renderProgress}
          />
          <Button
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
          </Button>
          <Box>
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
          </Button>
        </>
      )}
    </Flex>
  );
};

export default Index;
