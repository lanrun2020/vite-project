<template>
  <div>
    <canvas id="webgl" width="500" height="500" style="background-color: blue"></canvas>
  </div>
</template>

<script setup lang='ts'>
import { onMounted } from 'vue';

onMounted(() => {
  init()
})
const init = () => {
  console.log('init');
  //通过getElementById()方法获取canvas画布
  const canvas = document.getElementById('webgl') as HTMLCanvasElement;
  //通过方法getContext()获取WebGL上下文
  const gl = canvas.getContext('webgl')!;

  //顶点着色器源码
  const vertexShaderSource = `
            void main () {
                gl_PointSize = 20.0;
                gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
            }
        `;

  // 片元着色器
  const fragShaderSource = `
            void main () {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
        `;

  //初始化着色器
  const program = initShader(vertexShaderSource, fragShaderSource);
  gl.clearColor(0, 0, 0, 1)
  // 清空画布
  gl.clear(gl.COLOR_BUFFER_BIT);
  //开始绘制，显示器显示结果
  gl.drawArrays(gl.POINTS, 0, 5);

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

    //创建程序对象program
    const program = gl.createProgram()!;
    //附着顶点着色器和片元着色器到program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    //链接program
    gl.linkProgram(program);
    //使用program
    gl.useProgram(program);
    //返回程序program对象
    return program;
  }
}

</script>

<style scoped lang="scss">

</style>
