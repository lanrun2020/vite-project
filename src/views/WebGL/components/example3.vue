<template>
  <div>
    <canvas id="webgl3" width="500" height="500"></canvas>
  </div>
</template>

<script setup lang='ts'>
import { onMounted } from 'vue';
import { mat3, mat4 } from 'gl-matrix'
let gl,program,aPosAttBuffer
onMounted(() => {
  init()
})
const init = () => {
  //通过getElementById()方法获取canvas画布
  const canvas = document.getElementById('webgl3') as HTMLCanvasElement;
  //通过方法getContext()获取WebGL上下文
  const width = 500, height = 500;
  // const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  //通过方法getContext()获取WebGL上下文
  gl = canvas.getContext('webgl', { alpha: true})!;
  //顶点着色器源码
  const vertexShaderSource = `
        attribute vec3 aPos; //需要用户传入的顶点位置
        uniform mat3 aMatrix;
        void main() {
            gl_Position = vec4(aPos * aMatrix, 1.0);
        }
        `;

  // 片元着色器
  const fragShaderSource = `
    precision mediump float;
    uniform vec3 uColor;
            void main() {
                gl_FragColor = vec4(uColor, 1.0);
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
      0, 0.5, 0,
      -0.5, 0, 0,
      0.5, 0, 0
  ];
  // initBuffers(gl)
  const aPosAttLocation = gl.getAttribLocation(program, "aPos"); // 获得变量位置
  const matrixUniformLocation = gl.getUniformLocation(program, "aMatrix")
  const rotationMatrix = mat3.fromRotation(mat3.create(), 0)
  // 将矩阵传递给着色器程序
  // gl.useProgram(gl.program)
  gl.uniformMatrix3fv(matrixUniformLocation, false, rotationMatrix)
  aPosAttBuffer = gl.createBuffer(); // 创建缓冲
  let buffers2 = new Float32Array(vertexs)
  gl.bindBuffer(gl.ARRAY_BUFFER, aPosAttBuffer); // 绑定缓冲到指定类型
  gl.bufferData(gl.ARRAY_BUFFER, buffers2, gl.STATIC_DRAW); // 传入数据
  gl.vertexAttribPointer(aPosAttLocation, 3, gl.FLOAT, false, 0, 0); // 告诉gl如何解析数据
  gl.enableVertexAttribArray(aPosAttLocation); // 启用数据
  const uColorLocation = gl.getUniformLocation(program, "uColor");
  gl.uniform3f(uColorLocation, 1.0, 0.0, 0.0);
  gl.clearColor(0, 0, 0, 0.0)//将透明色设置为黑色，完全不透明
  // 清空画布
  gl.clear(gl.COLOR_BUFFER_BIT);//使用指定的透明颜色清除颜色缓冲
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  render()
  // setTimeout(() => {
  //   const vertexs2: number[] = [
  //     0, 0.8, 0,
  //     -0.3, -0.2, 0,
  //     0.3, -0.2, 0
  //   ];
  //   let buffers2 = new Float32Array(vertexs2)
  //   gl.bindBuffer(gl.ARRAY_BUFFER, aPosAttBuffer); // 绑定缓冲
  //   gl.bufferData(gl.ARRAY_BUFFER, buffers2, gl.STATIC_DRAW); // 传入数据
  //   gl.clear(gl.COLOR_BUFFER_BIT);//使用指定的透明颜色清除颜色缓冲
  //   gl.drawArrays(gl.TRIANGLES, 0, 3);
  // }, 2000)
}
const render = () => {
    const vertexs2: number[] = [
      0, 0.8, 0,
      -0.1, 0, 0,
      0.1, 0, 0
    ];
    let buffers2 = new Float32Array(vertexs2)
    gl.bindBuffer(gl.ARRAY_BUFFER, aPosAttBuffer); // 绑定缓冲
    gl.bufferData(gl.ARRAY_BUFFER, buffers2, gl.STATIC_DRAW); // 传入数据
  const matrixUniformLocation = gl.getUniformLocation(program, "aMatrix")
  // 计算旋转矩阵
  const angle = performance.now() / 2000 * Math.PI
  const rotationMatrix = mat3.fromRotation(mat3.create(), angle)
  // 将矩阵传递给着色器程序
  // gl.useProgram(gl.program)
  gl.uniformMatrix3fv(matrixUniformLocation, false, rotationMatrix)
  // 绘制三角形
  gl.clearColor(0, 0, 0, 0.0)//将透明色设置为黑色，完全不透明
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  // 循环调用渲染函数以实现动态旋转
  requestAnimationFrame(render)
}


</script>

<style scoped lang="scss"></style>
