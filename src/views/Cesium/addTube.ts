import Cesium from "@/utils/importCesium"
import redimg from '../../assets/redLine.png'

let entity: any = null
const computeCircle = (radius:number) => {
  const positions:Array<object> = [];
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

export const addTude = (viewer:any, active:boolean) => {
  if (active) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(110.43934237419626, 31.01, 20000),
      duration: 1.6,
      orientation: {
        // 指向
          heading: Cesium.Math.toRadians(-30),
          // 视角
          pitch: Cesium.Math.toRadians(-35),
          roll: 0
        }
    });
    
    if (entity) return
    entity = viewer.entities.add({
      name: "Red tube with rounded corners",
      polylineVolume: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          110.0,
          31.0,
          112.0,
          32.0,
          112.0,
          34.0,
        ]),
        shape: computeCircle(60000.0),
        material: new Cesium.PolylineTrailLinkMaterialProperty(
          Cesium.Color.BLUE,
          3000,
          redimg,
          1
        ),
      },
    });
  } else {
    if (entity) {
      viewer.entities.remove(entity)
      entity = null
    }
  }

}