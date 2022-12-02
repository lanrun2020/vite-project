// 飞机航线
import Cesium from "@/utils/importCesium"
let renderId: any
let primitivesLine: any
let primitivesModelList: any[] = []
let airPlane: any
let matx4Last = new Cesium.Matrix4()
let pickModelLast: any
let positionCur: any
let fly = false
let cameraHeight = 0
let handler: any
const num = 50 //一条轨迹上的点个数
const lineNum = 5 //一种轨迹的数量
const start = new Cesium.JulianDate(2459905, 21600, Cesium.TimeStandard.UTC); //起始时间
const stop = Cesium.JulianDate.addSeconds(start, num, new Cesium.JulianDate()) //终止时间 一个点一秒

export const addPlaneLine = (viewer: any, active: boolean) => {
  if (active) {
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
    console.log(viewer.camera);

    const airList = new Array(lineNum).fill('').map((item, index) => {
      const lon = Math.random() * 180 - 90
      const lon2 = lon + Math.random() * 180 - 90
      const lat = 0 + Math.random() * 90 - 45
      const lat2 = lat + Math.random() * 90 - 45
      return {
        id: index,
        startPoint: Cesium.Cartesian3.fromDegrees(lon, lat, 50000),
        endPoint: Cesium.Cartesian3.fromDegrees(lon2, lat2, 50000)
      }
    })
    const airList2 = new Array(lineNum).fill('').map((item, index) => {
      const lon = Math.random() * 180 - 90
      const lon2 = lon + Math.random() * 180 - 90
      const lat = 0 + Math.random() * 90 - 45
      const lat2 = lat + Math.random() * 90 - 45
      return {
        id: index,
        startPoint: Cesium.Cartesian3.fromDegrees(lon, lat, 50000),
        endPoint: Cesium.Cartesian3.fromDegrees(lon2, lat2, 50000)
      }
    })

    primitivesLine = viewer.scene.primitives.add(new Cesium.PolylineCollection())
    const pathList = [ //历史轨迹数据
      {
        url: `/model/airplane02.glb`,
        scale: 1,
        minimumPixelSize: 25,
        airList: airList,
      },
      {
        url: `/model/CesiumAir.glb`,
        scale: 1,
        minimumPixelSize: 40,
        airList: airList2,
      }
    ]
    let pathStartIndex = 0
    primitivesModelList = []
    pathList.forEach((path, index) => {
      path.airList.forEach((item) => {
        addPlane(item, num, start, primitivesLine, pathStartIndex, index) //item轨迹， num轨迹点数量，start轨迹起始时间，primitives用于存放轨迹primitive
      })
      const instances: any = getInstances2(path.airList.length) //轨迹数量
      const primitivesModel = new Cesium.ModelInstanceCollection({
        id: {
          id: 'pathModelType' + index,
          pathStartIndex: pathStartIndex,
        },
        url: path.url,
        dynamic: true,
        scale: path.scale,
        minimumPixelSize: path.minimumPixelSize,
        silhouetteSize: 10,
        silhouetteColor: new Cesium.Color(0, 1, 0, 1),
        instances: instances
      })
      primitivesModel.readyPromise.then(function (model:any) {
        model.activeAnimations.addAll({
          loop: Cesium.ModelAnimationLoop.REPEAT,
        })
      })
      primitivesModelList.push(primitivesModel)
      pathStartIndex += path.airList.length
    })
    primitivesModelList.forEach((primitivesModel) => {
      viewer.scene.primitives.add(primitivesModel)
    })
    const m = addModelInstance()
    const newInstances = getInstances2(50)
    console.log(m._instances);
    setTimeout(()=>{
       console.log(newInstances);
       newInstances.forEach((item, index)=>{
        m._instances[index].modelMatrix = item.modelMatrix
      })
      console.log(m._instances);
      console.log('change');
    },5000)
    viewer.scene.primitives.add(m)
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    let pickedPath: any[] = []
    handler.setInputAction((clickEvent: any) => {
      const cartesian = viewer.camera.pickEllipsoid(clickEvent.position, viewer.scene.globe.ellipsoid);
      const pickModel = viewer.scene.pick(clickEvent.position);
      // eslint-disable-next-line no-debugger
      // console.log(pickModel.constructor.name);
      const matx = new Cesium.Matrix4()
      Cesium.Matrix4.fromScale(new Cesium.Cartesian3(0, 0, 0), matx)
      if (pickModel) {
        // console.log(pickModel);
        if (pickModel.constructor && pickModel.constructor.name === 'ModelInstance') { //点击的是模型
          if (pickModelLast && matx4Last) {
            pickModelLast.modelMatrix = matx4Last
          }
          matx4Last = pickModel.model.modelMatrix.clone()
          pickModelLast = pickModel.model
          // Cesium.Matrix4.multiply(pickModel.model.modelMatrix, matx, pickModel.model.modelMatrix)
          // console.log(pickModel.model); //这种轨迹的第一条轨迹起始下标
          const line = primitivesLine.get(pickModel.model.id.pathStartIndex + pickModel.instanceId)
          // console.log(line);
          // console.log(pickModel.model);
          positionCur = line.id.propertyPosition
          fly = true
          viewer.camera.position = new Cesium.Cartesian3(0, 0, 500000);
          // console.log(viewer.camera);
          if (airPlane) viewer.entities.remove(airPlane)
          // airPlane = viewer.entities.add({ //entity方式加载model
          //   position: line.id.propertyPosition,
          //   model: {
          //     uri: pickModel.model._resource._url,
          //     scale: 25,
          //     minimumPixelSize: 25,
          //     silhouetteSize:2,
          //   },
          //   orientation: line.id.orientation
          // })
          // viewer.trackedEntity = airPlane
        } else {//点击的是路径线
          fly = false
          viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
          if (airPlane) viewer.entities.remove(airPlane)
          if (pickModelLast && matx4Last) {
            pickModelLast.modelMatrix = matx4Last
          }
          // viewer.trackedEntity = undefined
          pickedPath.forEach((path) => {
            path._material.uniforms.color = new Cesium.Color(0, 1, 0, 1)
          })
          pickedPath = []
          pickModel.primitive._material.uniforms.color = new Cesium.Color(1, 0, 0, 1)
          pickedPath.push(pickModel.primitive)
        }
      } else {
        if (airPlane) viewer.entities.remove(airPlane)
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
          if(viewer.scene.mode === Cesium.SceneMode.SCENE3D){
            primitivesModelList[polyline.id.pathTypeIndex]._instances[index - polyline.id.startIndex].modelMatrix = mtx4 //instances方式添加的模型，更新飞机位置
          }else{
            //暂停
            cancelAnimationFrame(renderId)
            // primitivesModelList[polyline.id.pathTypeIndex]._instances[index - polyline.id.startIndex].modelMatrix = mtx4 //instances方式添加的模型，更新飞机位置
            // primitivesModelList[polyline.id.pathTypeIndex]._instances[index - polyline.id.startIndex].modelMatrix = new Cesium.Matrix4(1,1,1,1,  1,1,1,1,  1,1,1,1,  1,1,1,1) //instances方式添加的模型，更新飞机位置
          }
        }
        polyline._material.uniforms.curP = polyline.id.propertyIndex.getValue(viewer.clock.currentTime)//查当时时刻，飞机运行到第几个点
      })
      if (fly) {
        const c3 = positionCur.getValue(viewer.clock.currentTime)
        if (c3) {
          const transform = Cesium.Transforms.eastNorthUpToFixedFrame(c3);
          viewer.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(viewer.camera.heading,  viewer.camera.pitch, 50000 + cameraHeight*2000));
        }
      }
      // cancelAnimationFrame(renderId)
      renderId = Cesium.requestAnimationFrame(tick);
    }
    tick()
    setTimeout(()=>{
      console.log(primitivesModelList);
    })
  } else {
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
const setCameraControl = (viewer:any, value = true) => { // 控制鼠标是否可拖动地图
  // viewer.scene.screenSpaceCameraController.enableTilt = value
  // viewer.scene.screenSpaceCameraController.enableRotate = value
  // viewer.scene.screenSpaceCameraController.enableTranslate = value
  viewer.scene.screenSpaceCameraController.enableZoom = value
}
const setView = (viewer: any, position: any) => {
  viewer.camera.lookAt(position.getValue(viewer.clock.currentTime), new Cesium.Cartesian3(0, 0, 5000))
  console.log('set');
  setTimeout(() => {
    setView(viewer, position)
  }, 1000)
}

const getInstances = (num: number) => {
  const instances = new Array(num).fill('').map(() => {
    const position = Cesium.Cartesian3.fromDegrees(
      110+Math.random(),
      30+Math.random(),
      5000
    );
    const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
      position,
      new Cesium.HeadingPitchRoll(0, 0, 0)
    );
    return {
      modelMatrix: modelMatrix,
    }
  });
  return instances;
}
const getInstances2 = (num: number) => {
  const instances = [];
  const gridSize = Math.sqrt(num);
  const cLon = 110 + Math.random()*10;
  const cLat = 32 + Math.random()*10;
  const spacing = 0.5;
  const height = 50000;
  for (let y = 0; y < gridSize; ++y) {
    for (let x = 0; x < gridSize; ++x) {
      const longitude = cLon + spacing * (x - gridSize / 2);
      const latitude = cLat + spacing * (y - gridSize / 2);
      const position = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );
      const heading = 0;
      const pitch = 0;
      const roll = 0;
      const scale = 1;
      const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
        position,
        new Cesium.HeadingPitchRoll(heading, pitch, roll)
      );
      Cesium.Matrix4.multiplyByUniformScale(
        modelMatrix,
        scale,
        modelMatrix
      );
      instances.push({
        modelMatrix: modelMatrix
      });
    }
  }
  return instances;
}

const addModelInstance = () => {
  const instances =  getInstances2(50)
  const primitivesModel = new Cesium.ModelInstanceCollection({
    url: `/model/CesiumAir.glb`,
    dynamic: true,
    scale: 1,
    minimumPixelSize: 35,
    silhouetteSize: 10,
    silhouetteColor: new Cesium.Color(0, 1, 0, 1),
    instances: instances
  })
  return primitivesModel
}

// 根据点坐标集合将坐标点加上时间参数
const computeCirclularFlight = (Points: Array<object>, start: object) => {
  const propertyPosition = new Cesium.SampledPositionProperty();
  const propertyIndex = new Cesium.SampledProperty(Number)
  let t = 0
  for (let i = 0; i < Points.length; i++) {
    t = t + Math.random()*2
    const time = Cesium.JulianDate.addSeconds(
      start,
      i*1,
      new Cesium.JulianDate()
    );
    propertyPosition.addSample(time, Points[i]);
    propertyIndex.addSample(time, i); //存当前是第几个点
  }
  return {
    propertyPosition,
    propertyIndex
  };
}

const addPlane = (item: any, num: number, start: any, primitives: any, startIndex: number, pathTypeIndex: number) => {
  //轨迹起点，终点
  const startPoint = item.startPoint
  const endPoint = item.endPoint
  const points = generateCurve(startPoint, endPoint, num, 50000) //轨迹点集合，获取路径上的点
  const { propertyPosition, propertyIndex } = computeCirclularFlight(points, start)
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
      startIndex, //此路径第一个点起始下标
      pathTypeIndex, //此路径类型下标，第一种飞机路径都是为0，第二种ufo路径都是为1，...类推其他（每一种路径类型下面的所有路径都是相同值）
      propertyIndex, //存路径点下标
      propertyPosition, //存路径点地理位置
      orientation, //存路径点方向
    },
    positions: points,
    width: 1,
    material: new Cesium.Material({
      fabric: {
        uniforms: {
          color: new Cesium.Color(0, 1, 0, 1),
          curP: 0.0,
          allP: num,
        },
        source: source
      },
      translucent: true,
    })
  });
}

// 获取流动曲线上多个连续点
const generateCurve = (startPoint: object, endPoint: object, length: number, height = 0) => {
  const addPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian); // 将两个笛卡尔坐标按照分量求和，addPointCartesian是两点(x,y,z)相加后返回的结果(x,y,z)
  const midPointCartesian = new Cesium.Cartesian3();
  Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian); // midPointCartesian是点(x,y,z)除以2后返回的结果(x,y,z)
  const midPointCartographic =
    Cesium.Cartographic.fromCartesian(midPointCartesian); // Cartographic.fromCartesian将笛卡尔位置转换为经纬度弧度值
  midPointCartographic.height = height || 6000; // 将起始点、终点两个坐标点之间的距离除x,设置为此中间点的高度
  const midPoint = new Cesium.Cartesian3();
  Cesium.Ellipsoid.WGS84.cartographicToCartesian(
    midPointCartographic,
    midPoint
  ); // 初始化为WGS84标准的椭球实例，cartographicToCartesian将经纬度弧度为单位的坐标转笛卡尔坐标（x,y,z）
  const spline = new Cesium.CatmullRomSpline({
    // 立方样条曲线
    times: [0.0, 0.5, 1], // 曲线变化参数，严格递增，times.length必须等于points.length,最后一个值,与下面的evaluate()的参数相关（参数区间在0~1）
    points: [startPoint, midPoint, endPoint], // 控制点,points.length必须 ≥ 2
  });
  const curvePoints: Array<object> = [spline.evaluate(0)];
  for (let i = 1, len = length; i <= len - 2; i++) {
    curvePoints.push(spline.evaluate(i / len)); // 传时间参数，返回曲线上给定时间点的新实例,时间段划分越多，曲线越平滑
  }
  curvePoints.push(spline.evaluate(1));
  return curvePoints; // 返回曲线上的多个点坐标集合
};