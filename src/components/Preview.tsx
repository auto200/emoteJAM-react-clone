import { useEffect, useRef, useState } from "react";
import { Filter } from "../filters";
import { Program, VertexAttribs } from "../pages";
import {
  TRIANGLE_PAIR,
  TRIANGLE_VERTICIES,
  VEC2_COUNT,
  VEC2_X,
  VEC2_Y,
} from "../constants";

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

interface Props {
  filter: Filter;
  vertexAttribs: VertexAttribs;
  imageEl: HTMLImageElement | null;
}

const Preview: React.FC<Props> = ({ filter, vertexAttribs, imageEl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gl, setGl] = useState<WebGLRenderingContext>();
  const programRef = useRef<Program | null>();
  const emoteTextureRef = useRef<WebGLTexture | null>();

  useEffect(() => {
    imageEl?.addEventListener("load", () => {
      if (!gl || !imageEl) return;
      if (emoteTextureRef.current) {
        gl.deleteTexture(emoteTextureRef.current);
      }
      const newTexture = createTextureFromImage(gl, imageEl);
      if (newTexture) {
        emoteTextureRef.current = newTexture;
      }
    });
  });

  useEffect(() => {
    if (!gl || !programRef.current) return;

    gl.deleteProgram(programRef.current.id);

    const newProgram = loadFilterProgram(gl, filter, vertexAttribs);
    programRef.current = newProgram;
  }, [filter]);

  useEffect(() => {
    const gl = canvasRef.current?.getContext("webgl", {
      antialias: false,
      alpha: false,
    });
    if (!gl) {
      return;
    }
    setGl(gl);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const program = loadFilterProgram(gl, filter, vertexAttribs);
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

  return <canvas ref={canvasRef} width="112px" height="112px" />;
};

export default Preview;
