// 迁徙线
import Cesium from "@/utils/importCesium"
import { mat3 } from 'gl-matrix'
let entities: Array<any> = []
let gl,program,aPosAttBuffer,renderFuc
const startPoint = { longitude: 170, latitude: 32 }
const endPoint = [
  { longitude: -170, latitude: 32 },
  { longitude: 112, latitude: 31 },
  { longitude: 110, latitude: 30 },
  { longitude: 108, latitude: 32 },
  { longitude: 106, latitude: 31 }
]
export const addFlyLine = (viewer: any, active: boolean) => {
  if (active) {
    // createFlyLine(viewer, startPoint, endPoint)
    drawCanvas(viewer)
  } else {
    viewer.scene.postRender.removeEventListener(renderFuc)
    destroyFlyLine(viewer)
  }
}
const drawCanvas = (viewer) => {
  const canvas2 = viewer.canvas
  const canvas = document.createElement('canvas')
  canvas.style.position = 'absolute'
  canvas.style.top = '0px'
  canvas.style.left = '0px'
  canvas.style.pointerEvents = 'none'
  viewer._container.appendChild(canvas)
  canvas.width = canvas2.width
  canvas.height = canvas2.height
  //通过方法getContext()获取WebGL上下文
  gl = canvas.getContext('webgl', { alpha: true})!;
  gl.viewport(0, 0, canvas.width, canvas.height);
  //顶点着色器源码
  const vertexShaderSource = `
        attribute vec4 aPos; //需要用户传入的顶点位置
        uniform mat3 aMatrix;
        varying vec4 v_color;
        void main() {
          //aPos.z从起点0至终点为1
          v_color = vec4(0.0,aPos.z,0.0,0.0);
          gl_Position = vec4( vec3(aPos.xy, 0.0) * aMatrix, 1.0);
        }
        `;
  // 片元着色器
  const fragShaderSource = `
    precision mediump float;
    uniform vec3 uColor;
    varying vec4 v_color;
    varying float alpha;
            void main() {
                /*
                内置变量gl_FragCoord表示WebGL在canvas画布上渲染的所有片元或者说像素的坐标,
                坐标原点是canvas画布的左上角, x轴水平向右, y竖直向下, gl_FragCoord坐标的单位是像素,
                gl_FragCoord的值是vec2(x,y),通过gl_FragCoord.x、gl_FragCoord.y方式可以分别访问片元坐标的纵横坐标
                */
                gl_FragColor = vec4(v_color.xyz,0.0);
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
  const aPosAttLocation = gl.getAttribLocation(program, "aPos"); // 获得变量位置
  const matrixUniformLocation = gl.getUniformLocation(program, "aMatrix")
  const rotationMatrix = mat3.fromRotation(mat3.create(), 0)
  gl.uniformMatrix3fv(matrixUniformLocation, false, rotationMatrix)
  aPosAttBuffer = gl.createBuffer(); // 创建缓冲
  gl.bindBuffer(gl.ARRAY_BUFFER, aPosAttBuffer); // 绑定缓冲到指定类型
  const uColorLocation = gl.getUniformLocation(program, "uColor");
  gl.uniform3f(uColorLocation, 1.0, 0.0, 0.0);
  gl.clearColor(0, 0, 0, 0.0)//将透明色设置为黑色，完全不透明
  // 清空画布
  gl.clear(gl.COLOR_BUFFER_BIT);//使用指定的透明颜色清除颜色缓冲
  // gl.drawArrays(gl.TRIANGLES, 0, 3);
  let lines = []
  const points = Array(2000).fill('').map(() => {
    return {
      lon: 100 + Math.random() * 50 - 20,
      lat: Math.random() * 130 - 80,
      num: Math.random() * 50 //随机透明度起点
    }
  })
  let t = -10
  viewer.scene.postRender.addEventListener(renderFuc = () => {
    lines = []
    for(let i=0;i<points.length;i++){
      const point = points[i]
      point.num += 0.5
      if (point.num>50){
        point.num = -10
      }
      t = point.num
      const pos = Cesium.Cartesian3.fromDegrees(point.lon, point.lat,0); // 经纬度 转 笛卡尔世界坐标
      const pos2 = Cesium.Cartesian3.fromDegrees(point.lon-3, point.lat-3,0); // 经纬度 转 笛卡尔世界坐标
      const spline = new Cesium.CatmullRomSpline({
        // 立方样条曲线
        times: [0.0, 50], // 曲线变化参数，严格递增，times.length必须等于points.length,最后一个值,与下面的evaluate()的参数相关（参数区间在0~1）
        points: [pos, pos2], // 控制点,points.length必须 ≥ 2
      });
      const d = 10
      let start = t
      let end = t+d
      if (t < 0) {
        start = 0
      }
      if (t > (50-d)) {
        end = 50
      }
      const rp = spline.evaluate(start)
      const rp2 = spline.evaluate(end)
      const p1 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, rp); // 笛卡尔世界坐标 转 屏幕坐标
      const p2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, rp2); // 笛卡尔世界坐标 转 屏幕坐标
      if (!p1 || !p2){
        continue
      }
      const {x,y} = p1
      const {x:x2,y:y2} = p2
      const xw = x / (canvas2.width/2) - 1
      const xw2 = x2 / (canvas2.width/2) - 1
      const yw = 1 - y / (canvas2.height/2)
      const yw2 = 1 - y2 / (canvas2.height/2)

      lines.push(xw,yw,0.0,1.0,xw2,yw2,1.0,0.0)//第三个属性当作透明度
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(aPosAttLocation, 4, gl.FLOAT, false, 0, 0);
    //vertexAttribPointer --------->index, size, type, normalized, stride, offset
    //index顶点属性的索引，与顶点着色器中的attribute关键字关联
    //size指定每个顶点属性的分量数量,可以是1,2,3,4
    //type分量类型
    //normalized是否归一化
    //stride相邻两个顶点属性之间的字节跨度
    //offset指定这个属性的第一个分量在顶点数据缓冲区中的起始偏移量，以字节为单位
    gl.enableVertexAttribArray(aPosAttLocation);// 启用数据
    gl.uniform3f(uColorLocation, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, 4000);
    gl.flush();
  })
}
// 创建迁徙线
const createFlyLine = (viewer: any, start: { longitude: number, latitude: number }, endPoints: Array<{ longitude: number, latitude: number }>) => {
  const startPoint = Cesium.Cartesian3.fromDegrees(
    start.longitude,
    start.latitude,
    0
  ); // Cartesian3.fromDegrees经纬度转为笛卡尔坐标位置
  if (entities?.length){
    viewer.flyTo(entities)
    return
  }
  // 终点与飞行线
  const material = new Cesium.PolylineMaterialProperty({
    color: new Cesium.Color(0.0, 1.0, 0.0, 1.0),
    speed: 2,
    thickness: .5
  });
  endPoints.forEach((item) => {
    const endPoint = Cesium.Cartesian3.fromDegrees(
      item.longitude,
      item.latitude,
      0
    );
    entities.push(viewer.entities.add({
      polyline: {
        positions: generateCurve(startPoint, endPoint), // 多个点坐标构成线条路径
        width: 2,
        material: material,
      },
    }));
  })
  const material2 = new Cesium.PolylineMaterialProperty({
    color: new Cesium.Color(0.0, 1.0, 0.0, 1.0),
    speed: 2,
    repeat: 5,
    thickness: .5
  });
  entities.push(viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([
        110.5,
        31,
        5000,
        110.5,
        30,
        5000,
        111,
        30,
        5000,
        111,
        29,
        5000,
        111, 28,
        5000,
      ]), // 多个点坐标构成线条路径
      width: 2,
      material: material2,
    },
  }));
  viewer.flyTo(entities)
};
const generateCurve2 = (startPoint: typeof Cesium.Cartesian3, endPoint: typeof Cesium.Cartesian3) => {
  const addPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian); // 将两个笛卡尔坐标按照分量求和，addPointCartesian是两点(x,y,z)相加后返回的结果(x,y,z)
  const midPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian); // midPointCartesian是点(x,y,z)除以2后返回的结果(x,y,z)
  const midPointCartographic =
    Cesium.Cartographic.fromCartesian(midPointCartesian); // Cartographic.fromCartesian将笛卡尔位置转换为经纬度弧度值
  midPointCartographic.height = 0; //设置为此中间点的高度
  const midPoint = new Cesium.Cartesian3();
  Cesium.Ellipsoid.WGS84.cartographicToCartesian(
    midPointCartographic,
    midPoint
  ); // 初始化为WGS84标准的椭球实例，cartographicToCartesian将经纬度弧度为单位的坐标转笛卡尔坐标（x,y,z）
  const spline = new Cesium.CatmullRomSpline({
    // 立方样条曲线
    times: [0.0, 0.5, 1], // 曲线变化参数，严格递增，times.length必须等于points.length,最后一个值,与下面的evaluate()的参数相关（参数区间在0~1）
    points: [startPoint, midPoint, endPoint], // 控制点,points.length必须 ≥ 2
  });
  const curvePoints: Array<any> = [];
  for (let i = 0, len = 200; i < len; i++) {
    curvePoints.push(spline.evaluate(i / len)); // 传时间参数，返回曲线上给定时间点的新实例,时间段划分越多，曲线越平滑
  }
  return curvePoints; // 返回曲线上的多个点坐标Cartesian3集合
};
// 获取流动曲线上多个连续点
const generateCurve = (startPoint: typeof Cesium.Cartesian3, endPoint: typeof Cesium.Cartesian3) => {
  const addPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian); // 将两个笛卡尔坐标按照分量求和，addPointCartesian是两点(x,y,z)相加后返回的结果(x,y,z)
  const midPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian); // midPointCartesian是点(x,y,z)除以2后返回的结果(x,y,z)
  const midPointCartographic =
    Cesium.Cartographic.fromCartesian(midPointCartesian); // Cartographic.fromCartesian将笛卡尔位置转换为经纬度弧度值
  midPointCartographic.height =
    Cesium.Cartesian3.distance(startPoint, endPoint) / 5; // 将起始点、终点两个坐标点之间的距离除5,设置为此中间点的高度
  const midPoint = new Cesium.Cartesian3();
  Cesium.Ellipsoid.WGS84.cartographicToCartesian(
    midPointCartographic,
    midPoint
  ); // 初始化为WGS84标准的椭球实例，cartographicToCartesian将经纬度弧度为单位的坐标转笛卡尔坐标（x,y,z）
  const spline = new Cesium.CatmullRomSpline({
    // 立方样条曲线
    times: [0.0, 0.5, 1], // 曲线变化参数，严格递增，times.length必须等于points.length,最后一个值,与下面的evaluate()的参数相关（参数区间在0~1）
    points: [startPoint, midPoint, endPoint], // 控制点,points.length必须 ≥ 2
  });
  const curvePoints: Array<any> = [];
  for (let i = 1, len = 200; i < len; i++) {
    curvePoints.push(spline.evaluate(i / len)); // 传时间参数，返回曲线上给定时间点的新实例,时间段划分越多，曲线越平滑
  }
  return curvePoints; // 返回曲线上的多个点坐标Cartesian3集合
};
const destroyFlyLine = (viewer: any) => {
  if (entities?.length) {
    entities.forEach((entity) => {
      viewer.entities.remove(entity)
    })
    entities = []
  }
}