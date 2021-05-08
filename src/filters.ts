export interface Filter {
  transparent: number | null;
  duration: number;
  vertex: string;
  fragment: string;
}

export interface Filters {
  [key: string]: Filter;
}

const filters: Filters = {
  Hop: {
    transparent: 0x00ff00,
    duration: 0.85 * 2,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;
uniform float time;

varying vec2 uv;

float sliding_from_left_to_right(float time_interval) {
    return (mod(time, time_interval) - time_interval * 0.5) / (time_interval * 0.5);
}

float flipping_directions(float time_interval) {
    return 1.0 - 2.0 * mod(floor(time / time_interval), 2.0);
}

void main() {
    float scale = 0.40;
    float hops = 2.0;
    float x_time_interval = 0.85;
    float y_time_interval = x_time_interval / (2.0 * hops);
    float height = 0.5;
    vec2 offset = vec2(
        sliding_from_left_to_right(x_time_interval) * flipping_directions(x_time_interval) * (1.0 - scale),
        ((sliding_from_left_to_right(y_time_interval) * flipping_directions(y_time_interval) + 1.0) / 4.0) - height);

    gl_Position = vec4(
        meshPosition * scale + offset,
        0.0,
        1.0);

    uv = (meshPosition + vec2(1.0, 1.0)) / 2.0;

    uv.x = (flipping_directions(x_time_interval) + 1.0) / 2.0 - uv.x * flipping_directions(x_time_interval);
}
`,
    fragment: `#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

void main() {
    gl_FragColor = texture2D(emote, vec2(uv.x, 1.0 - uv.y));
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
  Hopper: {
    transparent: 0x00ff00,
    duration: 0.85,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;
uniform float time;

varying vec2 uv;

float sliding_from_left_to_right(float time_interval) {
    return (mod(time, time_interval) - time_interval * 0.5) / (time_interval * 0.5);
}

float flipping_directions(float time_interval) {
    return 1.0 - 2.0 * mod(floor(time / time_interval), 2.0);
}

void main() {
    float scale = 0.40;
    float hops = 2.0;
    float x_time_interval = 0.85 / 2.0;
    float y_time_interval = x_time_interval / (2.0 * hops);
    float height = 0.5;
    vec2 offset = vec2(
        sliding_from_left_to_right(x_time_interval) * flipping_directions(x_time_interval) * (1.0 - scale),
        ((sliding_from_left_to_right(y_time_interval) * flipping_directions(y_time_interval) + 1.0) / 4.0) - height);

    gl_Position = vec4(
        meshPosition * scale + offset,
        0.0,
        1.0);

    uv = (meshPosition + vec2(1.0, 1.0)) / 2.0;

    uv.x = (flipping_directions(x_time_interval) + 1.0) / 2.0 - uv.x * flipping_directions(x_time_interval);
}
`,
    fragment: `#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

void main() {
    gl_FragColor = texture2D(emote, vec2(uv.x, 1.0 - uv.y));
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
  Overheat: {
    transparent: 0x00ff00,
    duration: (0.85 / 8.0) * 2.0,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;
uniform float time;

varying vec2 uv;

float sliding_from_left_to_right(float time_interval) {
    return (mod(time, time_interval) - time_interval * 0.5) / (time_interval * 0.5);
}

float flipping_directions(float time_interval) {
    return 1.0 - 2.0 * mod(floor(time / time_interval), 2.0);
}

void main() {
    float scale = 0.40;
    float hops = 2.0;
    float x_time_interval = 0.85 / 8.0;
    float y_time_interval = x_time_interval / (2.0 * hops);
    float height = 0.5;
    vec2 offset = vec2(
        sliding_from_left_to_right(x_time_interval) * flipping_directions(x_time_interval) * (1.0 - scale),
        ((sliding_from_left_to_right(y_time_interval) * flipping_directions(y_time_interval) + 1.0) / 4.0) - height);

    gl_Position = vec4(
        meshPosition * scale + offset,
        0.0,
        1.0);

    uv = (meshPosition + vec2(1.0, 1.0)) / 2.0;

    uv.x = (flipping_directions(x_time_interval) + 1.0) / 2.0 - uv.x * flipping_directions(x_time_interval);
}
`,
    fragment: `#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

void main() {
    gl_FragColor = texture2D(emote, vec2(uv.x, 1.0 - uv.y)) * vec4(1.0, 0.0, 0.0, 1.0);
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
  Bounce: {
    transparent: 0x00ff00,
    duration: Math.PI / 5.0,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;

uniform vec2 resolution;
uniform float time;

varying vec2 uv;

void main() {
    float scale = 0.30;
    float period_interval = 5.0;
    vec2 offset = vec2(0.0, (2.0 * abs(sin(time * period_interval)) - 1.0) * (1.0 - scale));
    gl_Position = vec4(meshPosition * scale + offset, 0.0, 1.0);
    uv = (meshPosition + 1.0) / 2.0;
}
`,
    fragment: `
#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

void main() {
    gl_FragColor = texture2D(emote, vec2(uv.x, 1.0 - uv.y));
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
  Circle: {
    transparent: 0x00ff00,
    duration: Math.PI / 4.0,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;

uniform vec2 resolution;
uniform float time;

varying vec2 uv;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main() {
    float scale = 0.30;
    float period_interval = 8.0;
    float pi = 3.141592653589793238;
    vec2 outer_circle = vec2(cos(period_interval * time), sin(period_interval * time)) * (1.0 - scale);
    vec2 inner_circle = rotate(meshPosition * scale, (-period_interval * time) + pi / 2.0);
    gl_Position = vec4(
        inner_circle + outer_circle,
        0.0,
        1.0);
    uv = (meshPosition + 1.0) / 2.0;
}
`,
    fragment: `
#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

void main() {
    float speed = 1.0;
    gl_FragColor = texture2D(emote, vec2(uv.x, 1.0 - uv.y));
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
  Slide: {
    transparent: 0x00ff00,
    duration: 0.85 * 2,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;
uniform float time;

varying vec2 uv;

float sliding_from_left_to_right(float time_interval) {
    return (mod(time, time_interval) - time_interval * 0.5) / (time_interval * 0.5);
}

float flipping_directions(float time_interval) {
    return 1.0 - 2.0 * mod(floor(time / time_interval), 2.0);
}

void main() {
    float scale = 0.40;
    float hops = 2.0;
    float x_time_interval = 0.85;
    float y_time_interval = x_time_interval / (2.0 * hops);
    float height = 0.5;
    vec2 offset = vec2(
        sliding_from_left_to_right(x_time_interval) * flipping_directions(x_time_interval) * (1.0 - scale),
        - height);

    gl_Position = vec4(
        meshPosition * scale + offset,
        0.0,
        1.0);

    uv = (meshPosition + vec2(1.0, 1.0)) / 2.0;

    uv.x = (flipping_directions(x_time_interval) + 1.0) / 2.0 - uv.x * flipping_directions(x_time_interval);
}
`,
    fragment: `#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

void main() {
    gl_FragColor = texture2D(emote, vec2(uv.x, 1.0 - uv.y));
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
  Laughing: {
    transparent: 0x00ff00,
    duration: Math.PI / 12.0,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;
uniform float time;

varying vec2 uv;

void main() {
    float a = 0.3;
    float t = (sin(24.0 * time) * a + a) / 2.0;

    gl_Position = vec4(
        meshPosition - vec2(0.0, t),
        0.0,
        1.0);
    uv = (meshPosition + vec2(1.0, 1.0)) / 2.0;
}
`,
    fragment: `#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

void main() {
    gl_FragColor = texture2D(emote, vec2(uv.x, 1.0 - uv.y));
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
  Blob: {
    transparent: 0x00ff00,
    duration: Math.PI / 3,
    vertex: `#version 100

precision mediump float;

attribute vec2 meshPosition;

uniform vec2 resolution;
uniform float time;

varying vec2 uv;

void main() {
    float stretch = sin(6.0 * time) * 0.5 + 1.0;

    vec2 offset = vec2(0.0, 1.0 - stretch);
    gl_Position = vec4(
        meshPosition * vec2(stretch, 2.0 - stretch) + offset,
        0.0,
        1.0);
    uv = (meshPosition + vec2(1.0, 1.0)) / 2.0;
}
`,
    fragment: `#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

void main() {
    gl_FragColor = texture2D(emote, vec2(uv.x, 1.0 - uv.y));
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
  Go: {
    transparent: 0x00ff00,
    duration: 1 / 4,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;

uniform vec2 resolution;
uniform float time;

varying vec2 uv;

void main() {
    gl_Position = vec4(meshPosition, 0.0, 1.0);
    uv = (meshPosition + 1.0) / 2.0;
}
`,
    fragment: `
#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

float slide(float speed, float value) {
    return mod(value - speed * time, 1.0);
}

void main() {
    float speed = 4.0;
    gl_FragColor = texture2D(emote, vec2(slide(speed, uv.x), 1.0 - uv.y));
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
  Elevator: {
    transparent: 0x00ff00,
    duration: 1 / 4,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;

uniform vec2 resolution;
uniform float time;

varying vec2 uv;

void main() {
    gl_Position = vec4(meshPosition, 0.0, 1.0);
    uv = (meshPosition + 1.0) / 2.0;
}
`,
    fragment: `
#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

float slide(float speed, float value) {
    return mod(value - speed * time, 1.0);
}

void main() {
    float speed = 4.0;
    gl_FragColor = texture2D(
        emote,
        vec2(uv.x, slide(speed, 1.0 - uv.y)));
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
  Rain: {
    transparent: 0x00ff00,
    duration: 1,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;

uniform vec2 resolution;
uniform float time;

varying vec2 uv;

void main() {
    gl_Position = vec4(meshPosition, 0.0, 1.0);
    uv = (meshPosition + 1.0) / 2.0;
}
`,
    fragment: `
#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

float slide(float speed, float value) {
    return mod(value - speed * time, 1.0);
}

void main() {
    float speed = 1.0;
    gl_FragColor = texture2D(
        emote,
        vec2(mod(4.0 * slide(speed, uv.x), 1.0),
             mod(4.0 * slide(speed, 1.0 - uv.y), 1.0)));
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
  Pride: {
    transparent: null,
    duration: 2.0,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;

uniform vec2 resolution;
uniform float time;

varying vec2 uv;

void main() {
    gl_Position = vec4(meshPosition, 0.0, 1.0);
    uv = (meshPosition + 1.0) / 2.0;
}
`,
    fragment: `
#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

void main() {
    float speed = 1.0;

    vec4 pixel = texture2D(emote, vec2(uv.x, 1.0 - uv.y));
    pixel.w = floor(pixel.w + 0.5);
    pixel = vec4(mix(vec3(1.0), pixel.xyz, pixel.w), 1.0);
    vec4 rainbow = vec4(hsl2rgb(vec3((time - uv.x - uv.y) * 0.5, 1.0, 0.80)), 1.0);
    gl_FragColor = pixel * rainbow;
}
`,
  },
  Hard: {
    transparent: 0x00ff00,
    duration: (2.0 * Math.PI) / 32.0,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;

uniform vec2 resolution;
uniform float time;

varying vec2 uv;

void main() {
    float zoom = 1.4;
    float intensity = 32.0;
    float amplitude = 1.0 / 8.0;
    vec2 shaking = vec2(cos(intensity * time), sin(intensity * time)) * amplitude;
    gl_Position = vec4(meshPosition * zoom + shaking, 0.0, 1.0);
    uv = (meshPosition + 1.0) / 2.0;
}
`,
    fragment: `
#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

void main() {
    gl_FragColor = texture2D(emote, vec2(uv.x, 1.0 - uv.y));
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
  Peek: {
    transparent: 0x00ff00,
    duration: 2.0 * Math.PI,
    vertex: `#version 100
precision mediump float;

attribute vec2 meshPosition;

uniform vec2 resolution;
uniform float time;

varying vec2 uv;

void main() {
    float time_clipped= mod(time * 2.0, (4.0 * 3.14));

    float s1 = float(time_clipped < (2.0 * 3.14));
    float s2 = 1.0 - s1;

    float hold1 = float(time_clipped > (0.5 * 3.14) && time_clipped < (2.0 * 3.14));
    float hold2 = 1.0 - float(time_clipped > (2.5 * 3.14) && time_clipped < (4.0 * 3.14));

    float cycle_1 = 1.0 - ((s1 * sin(time_clipped) * (1.0 - hold1)) + hold1);
    float cycle_2 = s2 * hold2 * (sin(time_clipped) - 1.0); 

    gl_Position = vec4(meshPosition.x + 1.0 + cycle_1 + cycle_2 , meshPosition.y, 0.0, 1.0);
    uv = (meshPosition + 1.0) / 2.0;
}
`,
    fragment: `
#version 100

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform sampler2D emote;

varying vec2 uv;

void main() {
    gl_FragColor = texture2D(emote, vec2(uv.x, 1.0 - uv.y));
    gl_FragColor.w = floor(gl_FragColor.w + 0.5);
}
`,
  },
};

export default filters;
