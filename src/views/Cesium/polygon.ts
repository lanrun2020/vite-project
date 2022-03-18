import { reactive } from "@vue/reactivity"

const Cesium = window.Cesium
const hierarchyPoints: Array<number> = reactive([])
let num = 0
export const addPolygon = (viewer, options) => {
  const { id, name } = options.conf || {}
  const { longitude, latitude } = options || {}
  if(longitude && latitude){
    hierarchyPoints.push(longitude,latitude)
  }
  if(hierarchyPoints.length>4 && num===0){
    num = 1
    let arr = new Cesium.CallbackProperty(function(){
      hierarchyPoints.push(longitude,latitude)
      return hierarchyPoints
    },false)
    console.log(arr);
    createPolygon(viewer,arr)
  }
}
const createPolygon = (viewer,arr) => {
  viewer.entities.add(
    {
      polygon: {
        hierarchy:Cesium.Cartesian3.fromDegreesArray(arr),
        material: Cesium.Color.RED.withAlpha(0.5),
        outline: true,
        outlineColor: Cesium.Color.BLUE.withAlpha(0.2),
        outlineWidth: 1
      },
    },
  )
}