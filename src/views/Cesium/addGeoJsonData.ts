//中国地图geo json数据
import Cesium from '@/utils/importCesium'
import radarMaterialsProperty from "./RadarMaterial6"
let dataSourceValue: any
let entitieArr = []
export const addGeoJsonData = (viewer: any, active: boolean) => {
  if (active) {
    const primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection())
    const promise = Cesium.GeoJsonDataSource.load('../../../public/chinaMap/china.json')
    promise.then((dataSource) => {
      dataSourceValue = dataSource
      // viewer.dataSources.add(dataSource)
      const entities = dataSource.entities.values
      const colorHash = {}
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        const radarMaterial = new radarMaterialsProperty()
        const appearance = radarMaterial.getAppearance({
          v_color: new Cesium.Color.fromRandom({
            alpha: 0.4
          }),
        })
        // 获取多边形的几何数据
        const h = Math.random()*100000
        const positions = entity.polygon.hierarchy.getValue().positions;
        entitieArr.push(viewer.entities.add({
          polygon: {
            hierarchy: new Cesium.PolygonHierarchy(positions),
            outline: true,
            outlineColor: Cesium.Color.WHITE.withAlpha(0.2),
            outlineWidth: 2,
            material: Cesium.Color.fromRandom({ alpha: 0.5 }),
            height: h,
            extrudedHeight: h + 100000.0,
          }
        }))
        // 创建 Primitive
        const primitive = new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(positions),
              height: 0,
              perPositionHeight: false,
              extrudedHeight: 3000
            })
          }),
          appearance: appearance
        })
        // primitives.add(primitive)
      }
    })
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(117.16, 32.71, 10000000.0)
    });
  } else {
    viewer.dataSources.remove(dataSourceValue)
    if (entitieArr.length){
      entitieArr.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      entitieArr = []
    }
  }
}