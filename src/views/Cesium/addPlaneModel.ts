import Cesium from "@/utils/importCesium"
let entities: Array<any> = []
// 根据两个坐标点,获取Heading(朝向)
function getHeading(pointA, pointB) {
  //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
  //向量AB
  const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
  //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
  //AB为世界坐标中的向量
  //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
  const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
  //归一化
  const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
  //heading
  const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
  return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
}
// const start = Cesium.JulianDate.now()
//Generate a random circular pattern with varying heights.
function computeCirclularFlight(Points) {
  const start = Cesium.JulianDate.now()
  const stop = Cesium.JulianDate.addSeconds(start, 5, new Cesium.JulianDate())
  const property = new Cesium.SampledPositionProperty();
  for (let i = 0; i < Points.length; i++) {
    const time = Cesium.JulianDate.addSeconds(
      start,
      i,
      new Cesium.JulianDate()
    );
    const position = Cesium.Cartesian3.fromDegrees(
      Points[i].lon,
      Points[i].lat,
      100000,
    );
    property.addSample(time, position);
  }
  return property;
}

let resArr = [
  { lon: 108.36707938843418, lat: 22.82040673160957, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.41378409564336, lat: 22.819920224242807, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.46048880285254, lat: 22.819433716876045, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.50719351006173, lat: 22.818947209509282, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.5538982172709, lat: 22.81846070214252, height: 0, weatherName: "小雨", weatherImg: "" },
  { lon: 108.5684908551974, lat: 22.79975173193051, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.54682627836809, lat: 22.75866797098716, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.5364187466562, lat: 22.713135019747657, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.51012491242496, lat: 22.684817620988767, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.46390406008231, lat: 22.678094587920747, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.41768320773969, lat: 22.67137155485273, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.40521353712411, lat: 22.63231030624854, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.40047211282993, lat: 22.585844348165494, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.40076314236018, lat: 22.539429102792543, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.40643999603807, lat: 22.493068131089686, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.40927369012122, lat: 22.446956147780245, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.3956249685447, lat: 22.40228760443888, height: 0, weatherName: "阴", weatherImg: "" },
  { lon: 108.39365522094775, lat: 22.358234673324827, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.41192432111414, lat: 22.315248555286278, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.42500817357596, lat: 22.271118918346254, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.42651407546654, lat: 22.224435959738113, height: 0, weatherName: "雷阵雨", weatherImg: "" },
  { lon: 108.43518145756487, lat: 22.17864681103129, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.4451958307643, lat: 22.133025777567156, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.44898976012885, lat: 22.086544506394528, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.4569608382348, lat: 22.04154387903869, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.48114597278934, lat: 22.00158583064425, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.50729410478296, lat: 21.963447043352055, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.54530135015922, lat: 21.93629901094044, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.58330859553548, lat: 21.909150978528828, height: 0, weatherName: "中雨", weatherImg: "" },
  { lon: 108.62717065532753, lat: 21.904893075811103, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.67098222685098, lat: 21.896572536781637, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.71231431555826, lat: 21.874818805883073, height: 0, weatherName: "大雨", weatherImg: "" },
  { lon: 108.75609068622725, lat: 21.861157212821972, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.8025541826556, lat: 21.85639172600881, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.84746943394899, lat: 21.844801687465267, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.89144073261119, lat: 21.829050774511643, height: 0, weatherName: "", weatherImg: "" },
  { lon: 108.93541203127339, lat: 21.81329986155802, height: 0, weatherName: "多云", weatherImg: "" },
  { lon: 108.97980814203709, lat: 21.799033177178963, height: 0, weatherName: "", weatherImg: "" },
  { lon: 109.02545431177013, lat: 21.78913400783927, height: 0, weatherName: "", weatherImg: "" },
  { lon: 109.07110048150317, lat: 21.779234838499573, height: 0, weatherName: "", weatherImg: "" },
  { lon: 109.1167466512362, lat: 21.76933566915988, height: 0, weatherName: "", weatherImg: "" },
  { lon: 109.16245083841007, lat: 21.75972231270521, height: 0, weatherName: "大暴雨", weatherImg: "" },
  { lon: 109.20834398370768, lat: 21.751039825757015, height: 0, weatherName: "", weatherImg: "" },
  { lon: 109.23344423638372, lat: 21.725129392815596, height: 0, weatherName: "", weatherImg: "" },
  { lon: 109.23344423638372, lat: 21.678422151782613, height: 0, weatherName: "", weatherImg: "" },
  { lon: 109.22763271225567, lat: 21.632430342063202, height: 0, weatherName: "", weatherImg: "" },
  { lon: 109.21630454235802, lat: 21.587117662472572, height: 0, weatherName: "特大暴雨", weatherImg: "" },
  { lon: 109.22595001238774, lat: 21.541659339628023, height: 0, weatherName: "", weatherImg: "" },
  { lon: 109.22053316667653, lat: 21.5044292752671, height: 0, weatherName: "", weatherImg: "" },
  { lon: 109.1774187903384, lat: 21.486464951792875, height: 0, weatherName: "", weatherImg: "" },
  { lon: 109.15388011769447, lat: 21.47665717152458, height: 0, weatherName: "", weatherImg: "" },
];
export const addPlaneModel = (viewer: any, active: boolean) => {
  if (active) {
    let property = computeCirclularFlight(resArr)
    const arr:Array<number> =  []
    resArr.forEach((item)=>{
      arr.push(item.lon,item.lat,100000)
    })
    //Populate it with data
    if (entities?.length) return
    entities.push(viewer.entities.add({
      id: "Blueline",
      name: "Blue dashed line",
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(arr),
        width: 4,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.CYAN,
        }),
      }
    }))
    entities.push(viewer.entities.add({
      id: "modelPlane",
      position: property,
      model: {
        uri: `/model/CesiumAir.glb`,
        scale: 500,
      },
      orientation: new Cesium.VelocityOrientationProperty(property),
    }));
    
  } else {
    if (entities?.length) {
      entities.forEach((entity) => {
        viewer.entities.remove(entity)
      })
      entities = []
    }
  }
}