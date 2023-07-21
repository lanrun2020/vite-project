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
      speed: 100.0,
      imageSize: new Cesium.Cartesian2(100, 100),
      emissionRate: 10,//每秒发射数量
      emitter: new Cesium.SphereEmitter(0.1),
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
    float Hash(vec3 p)
    {
      p  = fract(p * MOD3);
        p += dot(p.xyz, p.yzx + 19.19);
        return fract(p.x * p.y * p.z);
    }

    float Noise3d(in vec3 p)
    {
        vec2 add = vec2(1.0, 0.0);
      p *= 10.0;
        float h = 0.0;
        float a = .3;
        for (int n = 0; n < 4; n++)
        {
            vec3 i = floor(p);
            vec3 f = fract(p);
            f *= f * (3.0-2.0*f);

            h += mix(
                mix(mix(Hash(i), Hash(i + add.xyy),f.x),
                    mix(Hash(i + add.yxy), Hash(i + add.xxy),f.x),
                    f.y),
                mix(mix(Hash(i + add.yyx), Hash(i + add.xyx),f.x),
                    mix(Hash(i + add.yxx), Hash(i + add.xxx),f.x),
                    f.y),
                f.z)*a;
            a*=.5;
            p += p;
        }
        return h;
    }
    float fogmap(in vec3 p, in float d)
    {
        p.xz -= time*7.+sin(p.z*.3)*3.;
        p.y -= time*.5;
        return (max(Noise3d(p*.008+.1)-.1,0.0)*Noise3d(p*.1))*.3;
    }
            void main() {
                gl_FragColor = vec4(uColor, v_pos.x*v_pos.y);
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
    -0.5, 0.5, 0,
    0.5, 0.5, 0,
    -0.5, -0.5, 0,
    -0.5, -0.5, 0,
    0.5, -0.5, 0,
    0.5, 0.5, 0,
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