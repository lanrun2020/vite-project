// 城市 白膜建筑
import Cesium from "@/utils/importCesium"
let primitive: any
let tilesetPrimitive: any
let handler: typeof Cesium.ScreenSpaceEventHandler
let cartesian: null
const activeShapePoints: any = []
let num = 0
let activeEntity: any
let localTile: any
export const addCity = (viewer: any, active: boolean) => {
  if (active) {
    if (primitive) {
      viewer.zoomTo(
        tilesetPrimitive,
        new Cesium.HeadingPitchRange(
          0.0,
          -0.5,
          tilesetPrimitive.boundingSphere.radius * 2.0
        )
      );
      return
    }
    primitive = viewer.scene.primitives.add(new Cesium.PrimitiveCollection());
    new Cesium.Cesium3DTileset({
      url: "/cdu2/tileset.json",
    }).readyPromise
      .then((data: any) => {
        tilesetPrimitive = data
        loadTilesShader(tilesetPrimitive)
        primitive.add(tilesetPrimitive)
        viewer.zoomTo(
          tilesetPrimitive,
          new Cesium.HeadingPitchRange(
            0.0,
            -0.5,
            tilesetPrimitive.boundingSphere.radius * 2.0
          )
        );
      })
      .catch(function (error: Error) {
        console.log(error);
      });
      //createEdgeDetectionStage 创建一个检测边缘的后处理阶段。当颜色在边缘上时，将颜色写入设置为1.0的输出纹理中
      //length边缘长度，默认0.5
      const silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
      silhouetteBlue.uniforms.color = Cesium.Color.BLUE;
      silhouetteBlue.uniforms.length = 0.01;
      silhouetteBlue.selected = [];

      const silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
      silhouetteGreen.uniforms.color = Cesium.Color.LIME;
      silhouetteGreen.uniforms.length = 0.01;
      silhouetteGreen.selected = [];
      //createSilhouetteStage 创建一个应用轮廓效果的后期处理阶段。轮廓效果将来自边缘检测通道的颜色与输入的颜色纹理进行合成
      viewer.scene.postProcessStages.add(
        Cesium.PostProcessStageLibrary.createSilhouetteStage([
          silhouetteBlue,
          silhouetteGreen,
        ])
      );
      const scene = viewer.scene
      const selected = {
        feature: undefined,
        originalColor: new Cesium.Color(),
      };
      handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      const ellipsoid = scene.globe.ellipsoid;
      activeEntity = viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(activeShapePoints),
          material: new Cesium.ColorMaterialProperty(
            Cesium.Color.WHITE.withAlpha(0.5)
          ),
        },
      })
      handler.setInputAction((event: any) => {
          cartesian = viewer.camera.pickEllipsoid(event.position, ellipsoid);
          if (cartesian && num < 3) {
            const cartographic = ellipsoid.cartesianToCartographic(cartesian);
            const longitude = Cesium.Math.toDegrees(cartographic.longitude);
            const latitude = Cesium.Math.toDegrees(cartographic.latitude);
            activeShapePoints.push(cartesian)
            console.log(activeShapePoints);
            console.log(longitude,latitude);
            num++
            addPoint(viewer, longitude, latitude)
            if (num == 1) {
              activeEntity.polygon.hierarchy = new Cesium.CallbackProperty(() => {
                return new Cesium.PolygonHierarchy(activeShapePoints)
              }, false)
            }
            if (num ==3 ){
              updateShader();
            }
          }
          silhouetteBlue.selected = [];
          // const pickedFeature = viewer.scene.pick(event.position);//pick返回具有' primitive'属性的对象，该对象包含场景中的第一个（顶部）基本体在特定的窗口坐标处
          const pickedFeatures = viewer.scene.drillPick(event.position);//drillPick返回所有对象的对象列表，每个对象包含一个' primitive'属性。特定的窗口坐标位置。
          if(pickedFeatures && pickedFeatures.length){
            for(const picked of pickedFeatures){
              if(picked.constructor === Cesium.Cesium3DTileFeature){
                if (!Cesium.defined(picked)) {
                  return;
                }
                // Highlight the feature if it's not already selected.
                if (picked !== selected.feature) { //选取符合条件的第一个
                  silhouetteBlue.selected = [picked];
                  break
                }
              }
            }
          }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  } else {
    if (primitive) {
      primitive.removeAll()
      primitive = null
      // view2.destroy()
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)//移除事件
    }
  }
}

const updateShader = () => {
  const tileset = tilesetPrimitive;
  const center = tileset.boundingSphere.center.clone();
  const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(center.clone());
  const localMatrix = Cesium.Matrix4.inverse(matrix, new Cesium.Matrix4());
  const points = cartesiansToLocal(activeShapePoints, localMatrix);
  
  let instr = ``;
  points.forEach((item,index) => {
    instr += `mypoints[${index}] = vec2(${item[0]},${item[1]});`
  })
  
  let localMatrixStr = `mat4(`;
  for(let i = 0; i < 16; i=i+4){
    localMatrixStr += `vec4(${localMatrix[i]},${localMatrix[i+1]},${localMatrix[i+2]},${localMatrix[i+3]})`
    if ((i+4)<16) {
      localMatrixStr += ','
    }
  }
  localMatrixStr += ')';
  const tile = localTile
  const content = tile.content;
  const model = content._model;
  if (model && model._sourcePrograms && model._rendererResources) {
    Object.keys(model._sourcePrograms).forEach(key => {
      const program = model._sourcePrograms[key]
      model._rendererResources.sourceShaders[program.vertexShader] =
        `
          precision highp float;\n
          uniform mat4 u_modelViewMatrix;\n//模型视图矩阵
          uniform mat4 u_projectionMatrix;\n//投影矩阵
          uniform mat3 u_normalMatrix;\n//正规矩阵
          attribute vec3 a_position;\n
          varying vec3 v_positionEC;\n
          attribute vec3 a_normal;\n //法线
          varying vec3 v_normal;\n
          attribute float a_batchId;\n
          varying mat4 u_tileset_worldToLocalMatrix;
          varying vec2 mypoints[${points.length}];
          bool isPointInPolygon(vec2 point){
            int nCross = 0; // 交点数
            const int n = ${points.length};
            for(int i = 0; i < n; i++){
                vec2 p1 = mypoints[i];
                vec2 p2 = mypoints[int(mod(float(i+1),float(n)))];
                if(p1[1] == p2[1]){
                    continue;
                }
                if(point[1] < min(p1[1], p2[1])){
                    continue;
                }
                if(point[1] >= max(p1[1], p2[1])){
                    continue;
                }
                float x = p1[0] + ((point[1] - p1[1]) * (p2[0] - p1[0])) / (p2[1] - p1[1]);
                if(x > point[0]){
                  nCross++;
                }
            }
            return int(mod(float(nCross), float(2))) == 1;
          }
          void main(void) \n
          {\n
            ${instr}
            u_tileset_worldToLocalMatrix = ${localMatrixStr};
            vec3 weightedPosition = a_position;\n //a_position模型坐标, y表示高度,x表示纬度方向,z表示经度方向,单位米,x,z的0,0点在模型中央,与相机观察位置无关
            vec3 weightedNormal = a_normal;\n
            float time = czm_frameNumber / 5.0;\n
            vec4 model_local_position = vec4(a_position.xyz, 1.0);
            vec4 tileset_local_position = u_tileset_worldToLocalMatrix * czm_model * model_local_position;
            vec2 position2D = vec2(tileset_local_position.x,tileset_local_position.y);
            if ( isPointInPolygon(position2D) ){ //判断顶点是否在范围内
              weightedPosition.x += sin(time) * a_position.y / 8.0;//可控制摇晃方向和距离
            }
            vec4 position = u_modelViewMatrix * vec4(weightedPosition, 1.0);\n
            v_positionEC = position.xyz;\n
            gl_Position = u_projectionMatrix * position;\n
            v_normal = u_normalMatrix * weightedNormal;\n
          }\n
        `
    })
    model._shouldRegenerateShaders = true
  }
}

const loadTilesShader = (tileset: any) => {
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: {
        conditions: [
          ['true', 'rgba(0, 127.5, 255 ,1)']
        ]
      }
    });
    tileset.tileLoad.addEventListener(function (tile: any) {
      localTile = tile;
      const content = tile.content;
      const model = content._model;
      if (model && model._sourcePrograms && model._rendererResources) {
        Object.keys(model._sourcePrograms).forEach(key => {
          const program = model._sourcePrograms[key]
          //console.log(model._rendererResources.sourceShaders);
          //debugger
          //在这里打断点可以查看原本的着色器代码
          //在原有的着色器代码上添加修改顶点坐标的代码
          model._rendererResources.sourceShaders[program.vertexShader] =
            `
              precision highp float;\n
              uniform mat4 u_modelViewMatrix;\n
              uniform mat4 u_projectionMatrix;\n
              uniform mat3 u_normalMatrix;\n
              attribute vec3 a_position;\n
              varying vec3 v_positionEC;\n
              attribute vec3 a_normal;\n
              varying vec3 v_normal;\n
              attribute float a_batchId;\n
              void main(void) \n
              {\n
                vec3 weightedPosition = a_position;\n
                vec3 weightedNormal = a_normal;\n
                float time = czm_frameNumber / 5.0;\n
                if ( a_position.y > 0.0 ){ //判断顶点高度
                  weightedPosition.x += sin(time) * a_position.y / 8.0;//可控制摇晃方向和距离
                }
                vec4 position = u_modelViewMatrix * vec4(weightedPosition, 1.0);\n //转屏幕坐标(x,y的0,0在屏幕中央,水平是x,垂直是y)
                v_positionEC = position.xyz;\n
                gl_Position = u_projectionMatrix * position;\n //u_projectionMatrix 投影矩阵， 屏幕坐标position转投影坐标
                v_normal = u_normalMatrix * weightedNormal;\n
              }\n
            `
        })
        model._shouldRegenerateShaders = true
      }
    });
}

const addPoint = (viewer: any, longitude: number, latitude: number) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
    point: {
      show: true, // default
      color: Cesium.Color.SKYBLUE, // default: WHITE
      pixelSize: 5, // default: 1
      outlineColor: Cesium.Color.YELLOW, // default: BLACK
      outlineWidth: 2, // default: 0
    },
  });
}
// 世界坐标转数组局部坐标
const cartesiansToLocal = (positions: any[], localMatrix:any) => {
  const arr = [];
  for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const localp = Cesium.Matrix4.multiplyByPoint(
          localMatrix,
          position.clone(),
          new Cesium.Cartesian3()
      )
      arr.push([localp.x, localp.y]);
  }
  return arr
}