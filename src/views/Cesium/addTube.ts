import Cesium from "@/utils/importCesium"
import redimg from '../../assets/newredLine.png'
import greenPng from "@/assets/green.png";
import bluePng from "@/assets/blue12.png";
let entity:Array<object>|null = null
const computeCircle = (radius: number) => {
  const positions: Array<object> = [];
  for (let i = 0; i < 360; i++) {
    const radians = Cesium.Math.toRadians(i);
    positions.push(
      new Cesium.Cartesian2(
        radius * Math.cos(radians),
        radius * Math.sin(radians)
      )
    );
  }
  return positions;
}

export const addTude = (viewer: any, active: boolean) => {
  if (active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(113, 28.5, 600000),
      duration: 1.6,
      orientation: {
        // 指向
        heading: Cesium.Math.toRadians(-30),
        // 视角
        pitch: Cesium.Math.toRadians(-55),
        roll: 0
      }
    });

    if (entity?.length) return
    entity = []
    entity?.push(viewer.entities.add({
      name: "Red tube with rounded corners",
      polylineVolume: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          108.0,
          31.0,
          5000,
          112.0,
          32.0,
          5000,
          112.0,
          34.0,
          3000,
        ]),
        // cornerType: Cesium.CornerType.MITERED, // 拐角样式 
        // cornerType: Cesium.CornerType.ROUNDED, // 拐角样式 
        shape: computeCircle(6000.0),
        material: new Cesium.PolylineTrailLinkMaterialProperty(
          Cesium.Color.BLUE,
          3000,
          redimg,
          1,
          12
        ),
      },
    }));
    

    entity?.push(viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(112.0, 32.0, 200000),
      cylinder: {
        length: 400000.0,
        topRadius: 0.0,
        bottomRadius: 200000.0,
        material: new Cesium.RadarScanMaterialProperty(
                new Cesium.Color(.1, 1, 0, 0.9),
                10000,// 循环时长
                1.0,//速度
                20,//圈数
                0.2,//环高
              )
      },
    }));
  } else {
    if (entity?.length) {
      entity.forEach((item)=>{
        viewer.entities.remove(item)
      })
      entity = null
    }
  }
}