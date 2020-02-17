(async function () {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);

  const video = document.createElement('video');
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.src = '../assets/video/sample1.mp4';

  await video.play();

  window.addEventListener('resize', resizeCanvas, false);
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();

  const gl = canvas.getContext('webgl');

  const vertices = [
    //X    Y
    -1,  0.6,
    1,  0.6,
    -1, -0.6,
    1, -0.6
  ];

  const texData = [
  // X   Y
    0, 1,
    1, 1,
    0, 0,
    1, 0,
  ];

  const indices = [
    0, 1, 2,
    1, 2, 3,
  ];

  const vertexShaderText = `
    precision mediump float;

    attribute vec2 a_vertPosition;
    attribute vec2 a_vertTexCoord;

    uniform mat4 u_mWorld;
    uniform mat4 u_mView;
    uniform mat4 u_mProj;

    varying vec2 v_fragTexCoord;

    void main() {
      v_fragTexCoord = a_vertTexCoord;
      gl_Position = u_mProj * u_mView * u_mWorld * vec4(a_vertPosition, 0.0, 1.0);
    }
  `;

  const fragmentShaderText = `
    precision mediump float;

    varying vec2 v_fragTexCoord;

    uniform sampler2D u_sampler;

    void main() {
      gl_FragColor = texture2D(u_sampler, v_fragTexCoord);
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

  const vertTexCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texData), gl.STATIC_DRAW);

  const texCoordAttribLocation = gl.getAttribLocation(program, 'a_vertTexCoord');
  gl.vertexAttribPointer(
    texCoordAttribLocation,
    2,
    gl.FLOAT,
    gl.FALSE,
    2 * Float32Array.BYTES_PER_ELEMENT,
    0
  );

  gl.enableVertexAttribArray(texCoordAttribLocation);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);

  gl.useProgram(program);

  const matWorldUniformLocation = gl.getUniformLocation(program, 'u_mWorld');
  const matViewUniformLocation = gl.getUniformLocation(program, 'u_mView');
  const matProjUniformLocation = gl.getUniformLocation(program, 'u_mProj');

  const worldMatrix = new Float32Array(16);
  const viewMatrix = new Float32Array(16);
  const projMatrix = new Float32Array(16);

  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -2], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(projMatrix, glMatrix.toRadian(60), canvas.width / canvas.height, 0.1, 1000.0);

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  function draw() {
    gl.clearColor(0.3, 0.0, 0.5, 1.0); // Purple background RGBA
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      video
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  function animate () {
    draw();
    requestAnimationFrame(animate);
  }

  animate();
})();