import { useEffect, useRef } from "react";
import {
  IMAGE_SIZE,
  TRIANGLE_PAIR,
  TRIANGLE_VERTICIES,
  VEC2_COUNT,
  VEC2_X,
  VEC2_Y,
} from "../../../utils/constants";
import { Filter } from "../../../utils/filters";
import { Program, VertexAttribs } from "../../../utils/interfaces";
import { createTextureFromImage, loadFilterProgram } from "./utils";

interface Props {
  filter: Filter;
  vertexAttribs: VertexAttribs;
  imageSrc: string;
  setRenderDataInfo: (
    gl: WebGLRenderingContext,
    canvas: HTMLCanvasElement,
    program: Program
  ) => void;
}

const Preview: React.FC<Props> = ({
  filter,
  vertexAttribs,
  imageSrc,
  setRenderDataInfo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext>();
  const programRef = useRef<Program | null>();
  const emoteTextureRef = useRef<WebGLTexture | null>();

  useEffect(() => {
    const gl = canvasRef.current?.getContext("webgl", {
      antialias: false,
    });
    if (!gl) {
      return;
    }
    glRef.current = gl;

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

      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, TRIANGLE_PAIR * TRIANGLE_VERTICIES);

      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const image = new Image(IMAGE_SIZE, IMAGE_SIZE);
    image.src = imageSrc;

    image.addEventListener("load", () => {
      if (!glRef.current) return;
      if (emoteTextureRef.current) {
        glRef.current.deleteTexture(emoteTextureRef.current);
      }
      const newTexture = createTextureFromImage(glRef.current, image);
      if (newTexture) {
        emoteTextureRef.current = newTexture;
      }
    });
  }, [imageSrc]);

  useEffect(() => {
    if (!glRef.current || !programRef.current) return;

    glRef.current.deleteProgram(programRef.current.id);

    const newProgram = loadFilterProgram(glRef.current, filter, vertexAttribs);
    programRef.current = newProgram;
  }, [filter]);

  useEffect(() => {
    if (glRef.current && canvasRef.current && programRef.current) {
      setRenderDataInfo(glRef.current, canvasRef.current, programRef.current);
    }
  }, [glRef.current, canvasRef.current, programRef.current]);

  return (
    <canvas
      ref={canvasRef}
      width={`${IMAGE_SIZE}px`}
      height={`${IMAGE_SIZE}px`}
    />
  );
};

export default Preview;
