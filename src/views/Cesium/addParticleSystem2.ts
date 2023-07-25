// 粒子系统 模拟云雾
import Cesium from "@/utils/importCesium"
import { mat3, mat4 } from 'gl-matrix'
let ParticleSystems: Array<typeof Cesium.ParticleSystem> = []
let particleCanvas
let gl, program, aPosAttBuffer
const getImage = () => {
  if (!Cesium.defined(particleCanvas)) {
    particleCanvas = document.createElement("canvas");
    particleCanvas.width = 20;
    particleCanvas.height = 20;
    const context2D = particleCanvas.getContext("2d");
    context2D.beginPath();
    context2D.arc(8, 8, 8, 0, Cesium.Math.TWO_PI, true);
    context2D.closePath();
    context2D.fillStyle = "rgb(255, 255, 255)";
    context2D.fill();
  }
  return particleCanvas;
}

const createFirework = (viewer, color, position) => {
  const ParticleSystem = viewer.scene.primitives.add(
    new Cesium.ParticleSystem({
      image: init(),
      startColor: color,
      endColor: color.withAlpha(0.0),
      startScale: 4.0,
      endScale: 4.0,
      particleLife: 2.0,
      speed: 10.0,
      imageSize: new Cesium.Cartesian2(100, 100),
      emissionRate: 20,//每秒发射数量
      emitter: new Cesium.SphereEmitter(10.0),
      lifetime: 30.0,
      modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
    })
  );
  ParticleSystems.push(ParticleSystem)
}

const init = () => {
  const canvas = document.createElement("canvas");
  const width = 500, height = 500;
  canvas.width = width;
  canvas.height = height;
  gl = canvas.getContext('webgl', { alpha: true })!;
  //顶点着色器源码
  const vertexShaderSource = `
        attribute vec3 aPos; //需要用户传入的顶点位置
        uniform mat3 aMatrix;
        varying vec3 v_pos;
        void main() {
            v_pos = aPos + 0.5;
            gl_Position = vec4(aPos * aMatrix, 1.0);
        }
        `;
  // 片元着色器
  const fragShaderSource = `
  precision mediump float;
  varying vec3 v_pos;
  uniform vec3 uColor;
  float cloudscale = 1.0;
  mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );

  vec2 hash( vec2 p ) {
    p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
  }
  
  float noise( in vec2 p ) {
      const float K1 = 0.366025404; // (sqrt(3)-1)/2;
      const float K2 = 0.211324865; // (3-sqrt(3))/6;
      vec2 i = floor(p + (p.x+p.y)*K1);	
      vec2 a = p - i + (i.x+i.y)*K2;
      vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0); //vec2 of = 0.5 + 0.5*vec2(sign(a.x-a.y), sign(a.y-a.x));
      vec2 b = a - o + K2;
      vec2 c = a - 1.0 + 2.0*K2;
      vec3 h = max(0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
      vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
      return dot(n, vec3(70.0));	
  }
  
  float fbm(vec2 n) {
    float total = 0.0, amplitude = 0.1;
    for (int i = 0; i < 7; i++) {
      total += noise(n) * amplitude;
      n = m * n;
      amplitude *= 0.4;
    }
    return total;
  }
  void main() {
      vec2 p = v_pos.xy;
      vec2 uv = p;
      float q = fbm(uv * cloudscale * 0.5);
      
      //ridged noise shape 脊状噪音形状
      float r = 0.0;
      uv *= cloudscale;
      uv -= q;
      float weight = 0.8;
      for (int i=0; i<8; i++){
        r += abs(weight*noise( uv ));
        uv = m*uv;
        weight *= 0.7;
      }
      
      //noise shape 噪音外形
      float f = 0.0;
      uv = p*vec2(1.0,1.0);
      uv *= cloudscale;
      uv -= q;
      weight = 0.7;
      for (int i=0; i<8; i++){
        f += weight*noise( uv );
        uv = m*uv;
        weight *= 0.6;
      }
      f *= r + f;

      //noise colour 噪音颜色
      float c = 0.0;
      uv = p*vec2(1.0,1.0);
      uv *= cloudscale*2.0;
      uv -= q;
      weight = 0.4;
      for (int i=0; i<7; i++){
        c += weight*noise( uv );
        uv = m*uv;
        weight *= 0.6;
      }
      
      //noise ridge colour 噪音山脊颜色
      float c1 = 0.0;
      uv = p*vec2(1.0,1.0);
      uv *= cloudscale*3.0;
      uv -= q;
      weight = 0.4;
      for (int i=0; i<7; i++){
        c1 += abs(weight*noise( uv ));
        uv = m*uv;
        weight *= 0.6;
      }
    
      c += c1;

    vec3 cloudcolour = vec3(1.0, 1.0, 1.0) * clamp((0.1 + 0.3*c), 0.0, 1.0);
    if (cloudcolour.y > 0.2) {
      float dis = distance(v_pos.xy,vec2(0.5,0.5));
        if (dis < 1.0){
          gl_FragColor = vec4(cloudcolour, (1.0-dis)*0.6);
        } else {
          discard;
      }
    } else {
      discard;
    }
    }
    `;
  //声明初始化着色器函数
  function initShader(vertexShaderSource: any, fragmentShaderSource: any) {
    //创建顶点着色器对象
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    //创建片元着色器对象
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    //引入顶点、片元着色器源代码
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    //编译顶点、片元着色器
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    let success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!success) {
      throw "colud not compile vertex shader:" + gl.getShaderInfoLog(vertexShader);
    }
    success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!success) {
      throw "colud not compile vertex shader:" + gl.getShaderInfoLog(fragmentShader);
    }

    //创建程序对象program
    const program = gl.createProgram()!;
    //附着顶点着色器和片元着色器到program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    //链接program
    gl.linkProgram(program);
    success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      throw "colud not link shader: " + gl.getProgramInfoLog(program);
    }
    // 已经链接成程序，可以删除着色器
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    //使用program
    gl.useProgram(program);
    //返回程序program对象
    return program;
  }
  //初始化着色器
  program = initShader(vertexShaderSource, fragShaderSource);
  // 三角形的顶点数据
  const vertexs: number[] = [
    -1, 1, 0,
    1, 1, 0,
    -1, -1, 0,
    -1, -1, 0,
    1, -1, 0,
    1, 1, 0,
  ];
  // initBuffers(gl)
  const aPosAttLocation = gl.getAttribLocation(program, "aPos"); // 获得变量位置
  const matrixUniformLocation = gl.getUniformLocation(program, "aMatrix")
  const rotationMatrix = mat3.fromRotation(mat3.create(), 0)
  // 将矩阵传递给着色器程序
  // gl.useProgram(gl.program)
  gl.uniformMatrix3fv(matrixUniformLocation, false, rotationMatrix)
  aPosAttBuffer = gl.createBuffer(); // 创建缓冲
  const buffers2 = new Float32Array(vertexs)
  gl.bindBuffer(gl.ARRAY_BUFFER, aPosAttBuffer); // 绑定缓冲到指定类型
  gl.bufferData(gl.ARRAY_BUFFER, buffers2, gl.STATIC_DRAW); // 传入数据
  gl.vertexAttribPointer(aPosAttLocation, 3, gl.FLOAT, false, 0, 0); // 告诉gl如何解析数据
  gl.enableVertexAttribArray(aPosAttLocation); // 启用数据
  const uColorLocation = gl.getUniformLocation(program, "uColor");
  gl.uniform3f(uColorLocation, 1.0, 1.0, 1.0);
  gl.clearColor(0, 0, 0, 0.0)//将透明色设置为黑色，完全不透明
  // 清空画布
  gl.clear(gl.COLOR_BUFFER_BIT);//使用指定的透明颜色清除颜色缓冲
  gl.drawArrays(gl.TRIANGLES, 0, 6); //gl.TRIANGLES绘制一系列三角形。每三个点作为顶点
  // render()
  return canvas
}
// const render = () => {
//     const vertexs2: number[] = [
//       0, 0.8, 0,
//       -0.08, 0, 0,
//       0.08, 0, 0
//     ];
//     const buffers2 = new Float32Array(vertexs2)
//     gl.bindBuffer(gl.ARRAY_BUFFER, aPosAttBuffer); // 绑定缓冲
//     gl.bufferData(gl.ARRAY_BUFFER, buffers2, gl.STATIC_DRAW); // 传入数据
//   const matrixUniformLocation = gl.getUniformLocation(program, "aMatrix")
//   // 计算旋转矩阵
//   const angle = performance.now() / 15000 * Math.PI
//   const rotationMatrix = mat3.fromRotation(mat3.create(), angle)
//   // 将矩阵传递给着色器程序
//   // gl.useProgram(gl.program)
//   gl.uniformMatrix3fv(matrixUniformLocation, false, rotationMatrix)
//   // 绘制三角形
//   gl.clearColor(0, 0, 0, 0.0)//将透明色设置为黑色，完全不透明
//   gl.clear(gl.COLOR_BUFFER_BIT)
//   gl.drawArrays(gl.TRIANGLES, 0, 3)
//   // 循环调用渲染函数以实现动态旋转
//   requestAnimationFrame(render)
// }

export const addParticleSystem2 = (viewer: any, active: boolean) => {
  if (active) {
    if (ParticleSystems?.length) {
      return
    }
    ParticleSystems = []
    const color = Cesium.Color.WHITE;
    const x = Cesium.Math.randomBetween(0, 1) * 0.01;
    const y = Cesium.Math.randomBetween(0, 1) * 0.01;
    const z = Cesium.Math.randomBetween(0, 1) * 0.01;
    const position = Cesium.Cartesian3.fromDegrees(110 + x, 35 + y, 1000 + z)
    createFirework(viewer, color, position);
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(110, 35, 3000.0),
      duration: 1.6
    });
  } else {
    if (ParticleSystems?.length) {
      ParticleSystems.forEach((item) => {
        viewer.scene.primitives.remove(item)
      })
      ParticleSystems = []
    }
  }
}