// // @ts-ignore
// const Cesium = window.Cesium
// // import Cesium from 'cesium'
// // window.Cesium = Cesium

// Cesium.Ion.defaultAccessToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NTY0Mjk2ZS1kNzI5LTRiOGEtYjZjNy00YWQ3N2MwOWMwMWYiLCJpZCI6ODQ5ODQsImlhdCI6MTY0NjcxMTIwNn0.Xl93l2YDxc1lqLA0UZGcw6lg4jAAwmxVPc8vk6n-AJ8";
// export default Cesium
import * as C from 'cesium'
window.Cesium = C
const Cesium = window.Cesium
Cesium.Ion.defaultAccessToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NTY0Mjk2ZS1kNzI5LTRiOGEtYjZjNy00YWQ3N2MwOWMwMWYiLCJpZCI6ODQ5ODQsImlhdCI6MTY0NjcxMTIwNn0.Xl93l2YDxc1lqLA0UZGcw6lg4jAAwmxVPc8vk6n-AJ8";

// export default Cesium //此方式导出，Cesium不可修改
export default ({ ...Cesium })
