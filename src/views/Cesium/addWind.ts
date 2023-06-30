// 风场
import Cesium from "@/utils/importCesium"
import axios from "axios"
import CanvasWindy from '@/jslibs/Windy.js'
import { nextTick } from "vue"
let windy,renderFuc
let canvasWidth = 0
let canvasHeight = 0
export const addWind = (viewer: any, active: boolean) => {
  if (active) {
    drawCanvas(viewer)
  } else {
    windy.removeLines()
    windy = null
    document.getElementById('windycanvas').remove()
    viewer.scene.postRender.removeEventListener(renderFuc)
  }
}
const drawCanvas = async (viewer) => {
  let globalExtent = [];
  const showWindy = function(){
      if (windy){
        document.getElementById('windycanvas').style.display = 'block'
      }
  };
  const hideWindy = function(){
    if (windy){
      document.getElementById('windycanvas').style.display = 'none'
    }
  };
  //获取当前三维窗口左上、右上、左下、右下坐标
  const getCesiumExtent = function(){
      const canvaswidth = viewer.canvas.width,
      canvasheight = viewer.canvas.height;

      const left_top_pt = new Cesium.Cartesian2(0,0);
      const left_bottom_pt = new Cesium.Cartesian2(0,canvasheight);
      const right_top_pt = new Cesium.Cartesian2(canvaswidth,0);
      const right_bottom_pt = new Cesium.Cartesian2(canvaswidth,canvasheight);

      const pick1= viewer.scene.globe.pick(viewer.camera.getPickRay(left_top_pt), viewer.scene);
      const pick2= viewer.scene.globe.pick(viewer.camera.getPickRay(left_bottom_pt), viewer.scene);
      const pick3= viewer.scene.globe.pick(viewer.camera.getPickRay(right_top_pt), viewer.scene);
      const pick4= viewer.scene.globe.pick(viewer.camera.getPickRay(right_bottom_pt), viewer.scene);
      if(pick1 && pick2 && pick3 && pick4){
          //将三维坐标转成地理坐标---只需计算左下右上的坐标即可
          const geoPt1= viewer.scene.globe.ellipsoid.cartesianToCartographic(pick2);
          const geoPt2= viewer.scene.globe.ellipsoid.cartesianToCartographic(pick3);
          //地理坐标转换为经纬度坐标
          const point1=[geoPt1.longitude / Math.PI * 180,geoPt1.latitude / Math.PI * 180];
          const point2=[geoPt2.longitude / Math.PI * 180,geoPt2.latitude / Math.PI * 180];
          // console.log(point1,point2);
          //此时说明extent需要分为东西半球
          if(point1[0]>point2[0]){
              globalExtent = [point1[0],180,point1[1],point2[1],-180,point2[0],point1[1],point2[1]];
          }else{
              globalExtent = [point1[0],point2[0],point1[1],point2[1]];
          }
      }else{
          globalExtent = [];
      }
  };
  // 开启监听器--无论对当前地球做的任何操作都会监听到
  viewer.scene.postRender.addEventListener(renderFuc = () => {
      getCesiumExtent();
  });
  const refreshTimer = -1;
  let mouse_down = false;
  let mouse_move = false;
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  //鼠标滚动、旋转后是否需要重新生成风场---如果需要，打开以下注释--旋转或者移动到北半球的时候计算会有问题
  let timer
  handler.setInputAction(function(e) {
      clearTimeout(refreshTimer);
      hideWindy();
      clearTimeout(timer)
      timer = setTimeout(function(){
          // windy.extent = globalExtent;
          if (windy) {
            windy.redraw();
          }
          showWindy();
      },300);
  },Cesium.ScreenSpaceEventType.WHEEL);
  //鼠标左键、右键按下
  handler.setInputAction(function(e) {
      mouse_down = true;
  },Cesium.ScreenSpaceEventType.LEFT_DOWN);
  handler.setInputAction(function(e) {
      mouse_down = true;
  },Cesium.ScreenSpaceEventType.RIGHT_DOWN);
  //鼠标移动
  handler.setInputAction(function(e) {
      if(mouse_down){
          hideWindy();
          mouse_move = true;
      }
  },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  //鼠标左键、右键抬起
  handler.setInputAction(function(e) {
      if(mouse_down && mouse_move && windy){
          // windy.extent = globalExtent;
          windy.redraw();
      }
      showWindy();
      mouse_down = false;
      mouse_move = false;
  },Cesium.ScreenSpaceEventType.LEFT_UP);
  handler.setInputAction(function(e) {
      if(mouse_down && mouse_move && windy){
          // windy.extent = globalExtent;
          windy.redraw();
      }
      showWindy();
      mouse_down = false;
      mouse_move = false;
  },Cesium.ScreenSpaceEventType.RIGHT_UP);
  const canvas2 = viewer.canvas
  const canvas = document.createElement('canvas')
  canvas.setAttribute("id", "windycanvas");
  canvas.style.position = 'absolute'
  canvas.style.top = '0px'
  canvas.style.left = '0px'
  canvas.style.pointerEvents = 'none'
  viewer._container.appendChild(canvas)
  canvas.width = canvas2.width
  canvas.height = canvas2.height
  canvasWidth = canvas2.width
  canvasHeight = canvas2.height
  await axios.get('/windyData/data.json').then((res) => {
    const params = {
      viewer:viewer,
      canvas: canvas,
      canvasWidth:canvasWidth,
      canvasHeight:canvasHeight,
      speedRate:1000,
      particlesNumber:5000,
      maxAge:20,
      frameRate:10,
      color:'#ffffff',
      lineWidth:1,
    };
    windy = new CanvasWindy(res.data, params);
    window.onresize = () => {
      nextTick(() => {
        setTimeout(() => {
          if (!viewer.canvas || !windy) return
          canvas.width=viewer.canvas.width;
          canvas.height=viewer.canvas.height;
          // windy.extent = globalExtent
          windy._resize(viewer.canvas.width,viewer.canvas.height)
        },300)
      })
    }
  })
}