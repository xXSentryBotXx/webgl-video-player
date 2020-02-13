console.log('Main script loaded!');
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas()

const gl = canvas.getContext('webgl');

const triangleVertices = [
  //X      Y
   0.0,  0.5,
  -0.5, -0.5,
   0.5, -0.5
];

const vertexShaderText = `
  precision mediump float;

  attribute vec3 a_vertPosition;

  void main() {
    gl_Position = vec4(a_vertPosition, 1.0);
  }
`;

const fragmentShaderText = `
  precision mediump float;

  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 0.1);
  }
`;

gl.clearColor(0.3, 0.0, 0.5, 1.0); // Purple background RGBA
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderText);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
  console.error(
    'ERROR compiling vertex shader:',
    gl.getShaderInfoLog(vertexShader)
  );
}

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderText);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
  console.error(
    'ERROR compiling fragment shader:',
    gl.getShaderInfoLog(fragmentShader)
  );
}

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error(
    'ERROR linking progeam:',
    gl.getProgramInfoLog(program)
  );
}

gl.validateProgram(program);
if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
  console.error(
    'ERROR validating program:',
    gl.getProgramInfoLog(program)
  );
}

const triangleVertexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(triangleVertices),
  gl.STATIC_DRAW
);

const positionAttribLocation = gl.getAttribLocation(program, 'a_vertPosition');
gl.vertexAttribPointer(
  positionAttribLocation,
  2,
  gl.FLOAT,
  gl.FALSE,
  2 * Float32Array.BYTES_PER_ELEMENT,
  0
);

gl.enableVertexAttribArray(positionAttribLocation);

gl.useProgram(program);
function draw() {
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

draw();