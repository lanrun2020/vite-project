import option from '../../../public/chinaMap/china.json' //飞机航线
import Cesium from '@/utils/importCesium'

let dataSourceValue:any
export const addGeoJsonData = (viewer: any, active: boolean) => {
  if (active) {
    const promise = Cesium.GeoJsonDataSource.load('../../../public/chinaMap/china.json')
    promise.then((dataSource) => {
      dataSourceValue = dataSource
      viewer.dataSources.add(dataSource)
      const entities = dataSource.entities.values
      const colorHash = {}
      for(let i=0;i<entities.length;i++){
        const entity = entities[i]
        const name = entity.name
        let color = colorHash[name]
        if (!color){
          color = Cesium.Color.fromRandom({
            alpha: 1.0
          })
          colorHash[name] = color
        }
        entity.polygon.material = color
        entity.polygon.outline = false
        entity.polygon.extrudedHeight = 10000
      }
    })
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(117.16, 32.71, 10000000.0)
    });
  } else {
    viewer.dataSources.remove(dataSourceValue)
  }
}