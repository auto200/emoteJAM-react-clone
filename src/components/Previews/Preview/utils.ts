import { Filter } from "../../../utils/filters";
import { VertexAttribs } from "../../../utils/interfaces";

export const loadFilterProgram = (
  gl: WebGLRenderingContext,
  filter: Filter,
  vertexAttribs: VertexAttribs
) => {
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
  };
};

const compileShaderSource = (
  gl: WebGLRenderingContext,
  source: string,
  shaderType: GLenum
) => {
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
};

const shaderTypeToString = (gl: WebGLRenderingContext, shaderType: GLenum) => {
  switch (shaderType) {
    case gl.VERTEX_SHADER:
      return "Vertex";
    case gl.FRAGMENT_SHADER:
      return "Fragment";
    default:
      return shaderType;
  }
};

const linkShaderProgram = (
  gl: WebGLRenderingContext,
  shaders: [WebGLShader, WebGLShader],
  vertexAttribs: VertexAttribs
) => {
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
};

export const createTextureFromImage = (
  gl: WebGLRenderingContext,
  image: TexImageSource
) => {
  const textureId = gl.createTexture();
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
};
