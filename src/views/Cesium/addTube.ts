import Cesium from "@/utils/importCesium"
import redimg from '../../assets/newredLine.png'
let entity: Array<object> | null = null
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
        material: new Cesium.PolylineTrailLinkMaterialProperty({
          color:Cesium.Color.BLUE,
          duration:3000,
          image:redimg,
          repeat:12
        }),
      },
    }));
  } else {
    if (entity?.length) {
      entity.forEach((item) => {
        viewer.entities.remove(item)
      })
      entity = null
    }
  }
}