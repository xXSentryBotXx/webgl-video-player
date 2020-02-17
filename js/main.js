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

const vertices = [
  //X      Y
  -1,  0.6,
   1,  0.6,
  -1, -0.6,
   1, -0.6,
];

const indices = [
  0, 1, 2,
  1, 2, 3,
];

const vertexShaderText = `
  precision mediump float;

  attribute vec3 a_vertPosition;

  uniform mat4 u_mWorld;
  uniform mat4 u_mView;
  uniform mat4 u_mProj;

  void main() {
    gl_Position = u_mProj * u_mView * u_mWorld * vec4(a_vertPosition, 1.0);
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

const vertexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array(vertices),
  gl.STATIC_DRAW
);

const indexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER, 
  new Uint16Array(indices),
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

const matWorldUniformLocation = gl.getUniformLocation(program, 'u_mWorld');
const matViewUniformLocation = gl.getUniformLocation(program, 'u_mView');
const matProjUniformLocation = gl.getUniformLocation(program, 'u_mProj');

const worldMatrix = new Float32Array(16);
const viewMatrix = new Float32Array(16);
const projMatrix = new Float32Array(16);

mat4.identity(worldMatrix);
mat4.lookAt(viewMatrix, [0, 0, -2], [0, 0, 0], [0, 1, 0]);
mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

function draw() {
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

draw();