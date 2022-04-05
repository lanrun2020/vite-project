import Cesium from "@/utils/importCesium"

const addRadar = (viewer: any,position:object = Cesium.Cartesian3.fromDegrees(110,32,200000), options: {length: number, bottomRadius: number, duration: number, speed: number, repeat: number, thickness: number }
  = { length: 400000, bottomRadius: 150000, duration: 100000, speed: 1, repeat: 10, thickness: 0.1 }) => {
  const entity = viewer.entities.add({
    position,
    cylinder: {
      length: options.length,
      topRadius: 0,
      bottomRadius: options.bottomRadius,
      material: new Cesium.RadarScanMaterialProperty(
        new Cesium.Color(.1, 1, 0, 0.5),
        options.duration,// 循环时长
        options.speed,//速度
        options.repeat,//圈数
        options.thickness,//环高
      )
    },
  })
  return entity
}

export default addRadar