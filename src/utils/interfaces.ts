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
