import Cesium from "@/utils/importCesium"
let entities = []
export const addArrowLoad = async (viewer: any, active: boolean) => {
  if (active) {
    const material2 = new Cesium.CustomLineMaterialProperty({
      color: new Cesium.Color(0.0, 1.0, 0.0, 1.0),
      speed: 2,
      repeat: 5,
      thickness: .5
    });

    const line = viewer.entities.add({
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
        width: 20,
        material: material2,
      },
    });
    entities.push(line)
    const m = new Cesium.PolylineDashMaterialProperty({
      color: Cesium.Color.CYAN,
    })
    const dashedLine = viewer.entities.add({
      name: "Blue dashed line",
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          110.59777, 30.03883, 0,
          110.59777, 30.03883, 20000,
          110.59777, 31.03883, 20000,
          110.99777, 31.03883, 20000,
        ]),
        width: 4,
        arcType: Cesium.ArcType.NONE,
        material: m,
      },
    });
    entities.push(dashedLine)
    viewer.flyTo(entities)
  } else {
    if(entities.length){
      entities.forEach((entity) => viewer.entities.remove(entity))
      entities = []
    }
  }
}
