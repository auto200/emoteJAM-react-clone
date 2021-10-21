export interface VertexAttribs {
  [key: string]: number;
}

export interface Program {
  id: WebGLProgram;
  resolutionUniform: WebGLUniformLocation | null;
  timeUniform: WebGLUniformLocation | null;
  duration: number;
}

export interface RenderData {
  [key: string]: [WebGLRenderingContext, HTMLCanvasElement, Program];
}

export type AppState = "initial" | "rendering" | "rendered";
