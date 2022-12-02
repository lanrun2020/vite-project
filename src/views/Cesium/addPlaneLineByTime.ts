// 飞机航线
import Cesium from "@/utils/importCesium"
let renderId: any
let primitivesLine: any
let primitivesModelList: any[] = []
let handler: any
let matx4Last = new Cesium.Matrix4()
let pickModelLast: any
let positionCur: any
let fly = false
let cameraHeight = 0
let timer:any
const lineNum = 50 //一种轨迹的数量
const alltime = 50000 //实时数据时间段长度，秒
let start: any; //起始时间
let stop: any //终止时间 一个点一秒

export const addPlaneLineByTime = (viewer: any, active: boolean) => {
  if (active) {
    start = viewer.clock.currentTime
    stop = Cesium.JulianDate.addSeconds(start, alltime, new Cesium.JulianDate()) //终止时间 一个点一秒
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider({})
    viewer.scene.globe.depthTestAgainstTerrain = true;
    //时间段循环
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    viewer.timeline.zoomTo(start, stop);
    viewer.clock.shouldAnimate = true
    viewer.clock.canAnimate = false
    const airList = new Array(lineNum).fill('').map((item, index) => {
      const lon = Math.random() * 180 - 90
      const lat = Math.random() * 90 - 45
      return {
        id: index,
        lon,
        lat,
      }
    })
    const airList2 = new Array(lineNum).fill('').map((item, index) => {
      const lon = Math.random() * 180 - 90
      const lat = Math.random() * 90 - 45
      return {
        id: index,
        lon,
        lat,
      }
    })
    primitivesLine = viewer.scene.primitives.add(new Cesium.PolylineCollection())
    const pathList = [ //轨迹数据
      {
        url: `/model/un.glb`,
        scale: 1,
        minimumPixelSize: 25,
        airList: airList,
      },
      {
        url: `/model/airplane02.glb`,
        scale: 1,
        minimumPixelSize: 15,
        airList: airList2,
      }
    ]
    let pathStartIndex = 0
    primitivesModelList = []
    pathList.forEach((path, index) => {
      path.airList.forEach((item) => {
        addPlane(item, primitivesLine, pathStartIndex, index) //item轨迹， num轨迹点数量，start轨迹起始时间，primitives用于存放轨迹primitive
      })
      const instances: any = getInstances(path.airList.length) //轨迹数量
      const primitivesModel = new Cesium.ModelInstanceCollection({
        id: {
          id: 'pathModelType' + index,
          pathStartIndex: pathStartIndex,
        },
        url: path.url,
        scale: path.scale,
        minimumPixelSize: path.minimumPixelSize,
        silhouetteSize: 10,
        silhouetteColor: new Cesium.Color(0, 1, 0, 1),
        instances: instances
      })
      primitivesModelList.push(primitivesModel)
      primitivesModel.readyPromise.then(function (model:any) {
        model.activeAnimations.addAll({
          loop: Cesium.ModelAnimationLoop.REPEAT,
        })
      })
      pathStartIndex += path.airList.length
    })
    primitivesModelList.forEach((primitivesModel) => {
      viewer.scene.primitives.add(primitivesModel)
    })
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    let pickedPath: any[] = []
    handler.setInputAction((clickEvent: any) => {
      // const cartesian = viewer.camera.pickEllipsoid(clickEvent.position, viewer.scene.globe.ellipsoid);
      const pickModel = viewer.scene.pick(clickEvent.position);
      const matx = new Cesium.Matrix4()
      Cesium.Matrix4.fromScale(new Cesium.Cartesian3(0, 0, 0), matx)
      if (pickModel) {
        if (pickModel.constructor && pickModel.constructor.name === 'ModelInstance') { //点击的是模型
          if (pickModelLast && matx4Last) {
            pickModelLast.modelMatrix = matx4Last
          }
          matx4Last = pickModel.model.modelMatrix.clone()
          pickModelLast = pickModel.model
          const line = primitivesLine.get(pickModel.model.id.pathStartIndex + pickModel.instanceId)
          positionCur = line.id.propertyPosition
          fly = true
          viewer.camera.position = new Cesium.Cartesian3(0, 0, 500000);
          cameraHeight = 0
        } else {//点击的是路径线
          fly = false
          viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
          if (pickModelLast && matx4Last) {
            pickModelLast.modelMatrix = matx4Last
          }
          pickedPath.forEach((path) => {
            path._material.uniforms.color = new Cesium.Color(0, 1, 0, 1)
          })
          pickedPath = []
          pickModel.primitive._material.uniforms.color = new Cesium.Color(1, 0, 0, 1)
          pickedPath.push(pickModel.primitive)
        }
      } else {
        fly = false
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
        if (pickModelLast && matx4Last) {
          pickModelLast.modelMatrix = matx4Last
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction((event:any) => {
      // TODO
      if(fly){
        setCameraControl(viewer,false)
        cameraHeight -= event
        if(cameraHeight < 0) cameraHeight=0
      }else{
        setCameraControl(viewer,true)
      }
  }, Cesium.ScreenSpaceEventType.WHEEL);

    const tick = () => {
      primitivesLine._polylines.forEach((polyline: any, index: number) => {
        const position = polyline.id.propertyPosition.getValue(viewer.clock.currentTime) //查点坐标位置
        if (position) { //修改模型所在位置矩阵
          const quaternion = polyline.id.orientation.getValue(viewer.clock.currentTime)
          const mtx4 = Cesium.Matrix4.fromTranslationQuaternionRotationScale(position, quaternion, new Cesium.Cartesian3(1, 1, 1))
          primitivesModelList[polyline.id.pathTypeIndex]._instances[index - polyline.id.startIndex].modelMatrix = mtx4 //instances方式添加的模型，更新飞机位置
        }
        polyline._material.uniforms.curP = polyline.id.propertyIndex.getValue(viewer.clock.currentTime)//查当时时刻，飞机运行到第几个点
      })
      if (fly) {
        const c3 = positionCur.getValue(viewer.clock.currentTime)
        if (c3) {
          const transform = Cesium.Transforms.eastNorthUpToFixedFrame(c3);
          viewer.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(viewer.camera.heading,  viewer.camera.pitch, 150000 + cameraHeight*2000));
        }
      }
      renderId = Cesium.requestAnimationFrame(tick);
    }
    tick()
    const timeTick = () => {
      primitivesLine._polylines.forEach((polyline: any) => {
        const time = Cesium.JulianDate.addSeconds(
          start,
          polyline.id.num,//第一个点时间差为0
          new Cesium.JulianDate()
        );
        polyline.id.num += 1
        const c3 = new Cesium.Cartesian3.fromDegrees(polyline.id.lon + Math.random()*2,polyline.id.lat + Math.random()*2,50000)
        polyline.id.pointList.push(c3)
        polyline.positions = polyline.id.pointList
        polyline.id.propertyPosition.addSample(time,c3)
        polyline.id.propertyIndex.addSample(time, polyline.id.num - 1)
        polyline._material.uniforms.allP = polyline.id.num - 1 //目前轨迹上所有点数量
      })
    }
    timeTick()
    timeTick()//初始加载时，需要至少两个点

    let count = 2
    timer = setInterval(() => { //一秒查询一次
      if(count>alltime){
        clearInterval(timer)
      }else{
        count ++
        timeTick()
      }
    },1000)
  } else {
    clearInterval(timer)
    cancelAnimationFrame(renderId)
    viewer.clock.shouldAnimate = false
    viewer.clock.currentTime = start.clone();
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    primitivesLine.removeAll()
    viewer.scene.primitives.remove(primitivesLine)
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)//移除事件
    handler.removeInputAction(Cesium.ScreenSpaceEventType.WHEEL)//移除事件
    primitivesModelList.forEach((primitives) => {
      viewer.scene.primitives.remove(primitives)
    })
  }
}
const setCameraControl = (viewer:any, value = true) => { // 控制鼠标是否可缩放地图
  viewer.scene.screenSpaceCameraController.enableZoom = value
}

const getInstances = (num: number) => {
  const instances = new Array(num).fill('').map(() => {
    return {
      modelMatrix: new Cesium.Matrix4(),
    }
  });
  return instances;
}

// 根据点坐标集合将坐标点加上时间参数
const computeCirclularFlight2 = () => {
  const propertyPosition = new Cesium.SampledPositionProperty();
  const propertyIndex = new Cesium.SampledProperty(Number)
  return {
    propertyPosition,
    propertyIndex
  };
}

const addPlane = (item: any, primitives: any, startIndex: number, pathTypeIndex: number) => {
  //轨迹起点，终点
  const lon = item.lon
  const lat = item.lat
  const pointList:any = []
  const { propertyPosition, propertyIndex } = computeCirclularFlight2()
  const orientation = new Cesium.VelocityOrientationProperty(propertyPosition)
  const source = `
    uniform vec4 color;\n
    uniform float curP;\n
    uniform float allP;\n
    czm_material czm_getMaterial(czm_materialInput materialInput)\n\
    {\n\
        czm_material material = czm_getDefaultMaterial(materialInput);\n\
        float dis = materialInput.s;\n\
        bool b = bool(step(dis, curP/allP));\n\
        material.alpha = b ? color.a : 0.0;\n\
        material.diffuse = color.rgb;\n\
        return material;\n\
    }`

  primitives.add({
    id: {
      id: 'path' + pathTypeIndex + '_' + item.id, //路径id
      num: 0,//路径点数量
      startIndex, //此路径第一个点起始下标
      pathTypeIndex, //此路径类型下标，第一种飞机路径都是为0，第二种ufo路径都是为1，...类推其他（每一种路径类型下面的所有路径都是相同值）
      propertyIndex, //存路径点下标
      propertyPosition, //存路径点地理位置
      orientation, //存路径点方向
      pointList,
      lon,
      lat,
    },
    positions: pointList,
    width: 1,
    material: new Cesium.Material({
      fabric: {
        uniforms: {
          color: new Cesium.Color(0, 1, 0, 1),
          curP: 0.0,
          allP: 1,
        },
        source: source
      },
      translucent: true,
    })
  });
}