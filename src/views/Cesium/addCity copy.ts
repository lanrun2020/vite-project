// 城市 白膜建筑
import Cesium from "@/utils/importCesium"
import CesiumVideo3d from './CesiumVideo3d'
import waterImg from '../../assets/waterNormals.jpg'
import userImg from '../../assets/user.png'
import WaterMirrorMaterialsProperty from './waterMaterial'
const waterMaterial = new WaterMirrorMaterialsProperty({ normalMap:waterImg })
let primitive: any
let tilesetPrimitive: any
let view2: any
let handler: typeof Cesium.ScreenSpaceEventHandler
let cartesian: null
const activeShapePoints: any = []
let num = 0
let activeEntity: any
let localTile: any
export const addCity = (viewer: any, active: boolean) => {
  if (active) {
    // view2 = new CesiumVideo3d(Cesium, viewer,{
    //   far: 300,
    //   url: '/src/views/Cesium/video.mp4',
    //   type: 3,
    //   position: {x:121.5061830727844, y:31.22923471021075, z: 50},
    //   rotation: {x: 0,y: 0} //x垂直方向偏转，y水平方向偏转
    // })
    // let y = 0.00001
    // setInterval(() => {
    //   y += 0.00001
    //   view2._changePosition({x:121.5061830727844+y, y:31.22923471021075, z: 50})//改变位置
    //   // view2._changeRotation({x:30 , y:0})//改变偏转角度
    // },100)
    // const vew = new ViewShed(viewer)
    // 流动水面效果
    // viewer.scene.primitives.add(
    //   new Cesium.Primitive({
    //       geometryInstances: new Cesium.GeometryInstance({
    //           geometry: new Cesium.RectangleGeometry({
    //               rectangle: Cesium.Rectangle.fromDegrees(
    //                   121.5061830727844, 31.22923471021075,
    //                   121.5461830727844, 31.25923471021075,
    //               ),
    //               height: 10,
    //               vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
    //           }),
    //       }),
    //       appearance: new Cesium.MaterialAppearance({
    //         material: waterMaterial.getMaterial(), faceForward: !1, closed: !0
    //       }),
    //   })
    // );
    // setTimeout(() => {
    //   viewer.camera.flyTo({
    //     destination: Cesium.Cartesian3.fromDegrees(121.5061830727844, 31.22923471021075, 3000),
    //     duration: 1.6,
    //   });
    // },100)
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
    // const inspectorViewModel = new Cesium.Cesium3DTilesInspector('cesiumContainer',viewer.scene).viewModel
    //Cesium.ExperimentalFeatures.enableModelExperimental = true; //如果不提前设置，customShader不会生效
    primitive = viewer.scene.primitives.add(new Cesium.PrimitiveCollection());
    new Cesium.Cesium3DTileset({
      url: "/cdu2/tileset.json",
    }).readyPromise
      .then((data: any) => {
        tilesetPrimitive = data
        loadTilesShader(tilesetPrimitive)
        primitive.add(tilesetPrimitive)
        // inspectorViewModel.tileset = tilesetPrimitive
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
          // const feature = inspectorViewModel.feature;
          // console.log(feature);
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
            // computeDistance(viewer)
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
  console.log(localMatrix);
  
  const points = cartesiansToLocal(activeShapePoints, localMatrix);
  let instr = ``;
  points.forEach((item,index) => {
    instr += `mypoints[${index}] = vec2(${item[0]},${item[1]});`
  })
  //tileset.backFaceCulling = false
    // tileset.customShader = new Cesium.CustomShader({
    //   lightingModel: Cesium.LightingModel.UNLIT,
    //   uniforms: {
    //     maxHeight: {
    //       type: Cesium.UniformType.FLOAT,
    //       value: 30.0,
    //     },
    //     minHeight: {
    //       type: Cesium.UniformType.FLOAT,
    //       value: 0.0,
    //     },
    //     u_tileset_localToWorldMatrix: {
    //       type: Cesium.UniformType.MAT4,
    //       value: matrix,
    //     },
    //     u_tileset_worldToLocalMatrix: {
    //         type: Cesium.UniformType.MAT4,
    //         value: localMatrix,
    //     },
    //   },
    //   fragmentShaderText: `
    //       void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
    //               float cury = fsInput.attributes.positionMC.y;
    //               // float d = (cury - minHeight) / (maxHeight - minHeight);
    //               float time = fract(czm_frameNumber / 180.0);
    //               time = abs(time - 0.5) * 2.0;
    //               vec3 linearColor = vec3(0.0, cury / 50.0, 1.0); //渐变
    //               float glowRange = 28.0;
    //               float diff = step(0.005, abs(clamp(cury/glowRange,0.0,1.0) - time));
    //               material.diffuse = linearColor * (1.5 - diff);
    //   }`,
    //   vertexShaderText: `
    //   bool isPointInPolygon(vec2 point){
    //             int nCross = 0; // 交点数
    //             const int n = 3;
    //             vec2 mypoints[3];
    //             ${instr}
    //             for(int i = 0; i < n; i++){
    //                 vec2 p1 = mypoints[i];
    //                 vec2 p2 = mypoints[int(mod(float(i+1),float(n)))];
    //                 if(p1[1] == p2[1]){
    //                     continue;
    //                 }
    //                 if(point[1] < min(p1[1], p2[1])){
    //                     continue;
    //                 }
    //                 if(point[1] > max(p1[1], p2[1])){
    //                     continue;
    //                 }
    //                 float x = p1[0] + ((point[1] - p1[1]) * (p2[0] - p1[0])) / (p2[1] - p1[1]);
    //                 if(x > point[0]){
    //                  nCross++;
    //                 }
    //             }
    //             return int(mod(float(nCross), float(2))) == 1;
    //    }
    //   void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput){
    //             vec3 modelMC = vsInput.attributes.positionMC;
    //             vec4 model_local_position = vec4(modelMC.x, modelMC.y, modelMC.z, 1.0);
    //             vec4 tileset_local_position = u_tileset_worldToLocalMatrix * czm_model * model_local_position;
    //             vec2 position2D = vec2(tileset_local_position.x,tileset_local_position.y);
    //             float time = czm_frameNumber / 6.0;
    //             if(isPointInPolygon(position2D)){ //判断顶点坐标是否在多边形内
    //                 vsOutput.positionMC.x += sin(time) * (vsOutput.positionMC.y / 30.0) * 2.0;//可控制摇晃方向和距离
    //                 return;
    //             }
    //         }
    //   `
    // })
    console.log(tileset);
    const tile = localTile
    Cesium.ExperimentalFeatures.enableModelExperimental = false;
    const content = tile.content;
    const model = content._model;
    if (model && model._sourcePrograms && model._rendererResources) {
      Object.keys(model._sourcePrograms).forEach(key => {
        const program = model._sourcePrograms[key]
        const fragmentShader = model._rendererResources.sourceShaders[program.fragmentShader];
        let v_position = "";
        if (fragmentShader.indexOf(" v_positionEC;") != -1) {
          v_position = "v_positionEC";
        } else if (fragmentShader.indexOf(" v_pos;") != -1) {
          v_position = "v_pos";
        }
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
            varying vec2 mypoints[3];
            bool isPointInPolygon(vec2 point){
              int nCross = 0; // 交点数
              const int n = 3;
           
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
              u_tileset_worldToLocalMatrix = mat4(vec4(${localMatrix[0]},${localMatrix[1]},${localMatrix[2]},${localMatrix[3]}),
                                                  vec4(${localMatrix[4]},${localMatrix[5]},${localMatrix[6]},${localMatrix[7]}),
                                                  vec4(${localMatrix[8]},${localMatrix[9]},${localMatrix[10]},${localMatrix[11]}),
                                                  vec4(${localMatrix[12]},${localMatrix[13]},${localMatrix[14]},${localMatrix[15]}));
              vec3 weightedPosition = a_position;\n //a_position模型坐标, y表示高度,x表示纬度方向,z表示经度方向,单位米,x,z的0,0点在模型中央,与相机观察位置无关
              vec4 eye_position = u_modelViewMatrix * vec4(a_position, 1.0);//屏幕坐标 x水平方向,y垂直方向,z表示垂直屏幕相机观察方向的距离,单位都是米 原点0,0在屏幕中央观察点对应的位置,所以坐标与相机观察位置相关
              float time = czm_frameNumber / 5.0;\n
              vec4 ty_pos = u_projectionMatrix * (u_modelViewMatrix * vec4(a_position, 1.0)); //投影坐标
              vec3 modelMC = a_position;
              vec4 model_local_position = vec4(modelMC.x, modelMC.y, modelMC.z, 1.0);
              vec4 tileset_local_position = u_tileset_worldToLocalMatrix * czm_model * model_local_position;
              vec2 position2D = vec2(tileset_local_position.x,tileset_local_position.y);
              if ( isPointInPolygon(position2D) ){ //判断顶点高度
                weightedPosition.x += sin(time) * a_position.y / 8.0;//可控制摇晃方向和距离
              }
              vec4 position = u_modelViewMatrix * vec4(weightedPosition, 1.0);\n //转屏幕坐标(x,y的0,0在屏幕中央,水平是x,垂直是y)
              v_positionEC = position.xyz;\n
              gl_Position = u_projectionMatrix * position;\n //u_projectionMatrix 投影矩阵， 屏幕坐标position转投影坐标

              vec3 weightedNormal = a_normal;\n
              v_normal = u_normalMatrix * weightedNormal;\n
            }\n
          `
          console.log( model._rendererResources.sourceShaders[program.vertexShader] );
          
        model._rendererResources.sourceShaders[program.fragmentShader] =
          `
            varying vec3 ${v_position};
            void main(void){
              vec4 position = czm_inverseModelView * vec4(${v_position},1); // 位置
              //模型坐标 = czm_inverseModelView * eyePosition眼睛坐标
              gl_FragColor = vec4(vec3(position.y / 50.0), 1.0); // 渐变
              // 动态光环
              float time = fract(czm_frameNumber / 180.0);
              time = abs(time - 0.5) * 2.0;
              float glowRange = 30.0; // 光环的移动范围(高度)
              float diff = step(0.005, abs( clamp(position.y / glowRange, 0.0, 1.0) - time));
              gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
            }
          `
      })
      model._shouldRegenerateShaders = true
    }
}

const loadTilesShader = (tileset: any) => {
  const center = tileset.boundingSphere.center.clone();
  const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(center.clone());
  const localMatrix = Cesium.Matrix4.inverse(matrix, new Cesium.Matrix4());
  tileset.style = new Cesium.Cesium3DTileStyle({
    color: {
      conditions: [
        ['true', 'rgba(0, 127.5, 255 ,1)']
      ]
    }
  });
  // tileset.allTilesLoaded.addEventListener(function (event: any) {
  //   console.log('All tiles are loaded', event);
  // });
  const [maxheight, minheight] = [
    tileset.properties.height.maximum,
    tileset.properties.height.minimum,
  ];
    // tileset.backFaceCulling = false
    // tileset.customShader = new Cesium.CustomShader({
    //   lightingModel: Cesium.LightingModel.UNLIT,
    //   uniforms: {
    //     maxHeight: {
    //       type: Cesium.UniformType.FLOAT,
    //       value: 30.0,
    //     },
    //     minHeight: {
    //       type: Cesium.UniformType.FLOAT,
    //       value: 0.0,
    //     },
    //     u_tileset_localToWorldMatrix: {
    //       type: Cesium.UniformType.MAT4,
    //       value: matrix,
    //     },
    //     u_tileset_worldToLocalMatrix: {
    //         type: Cesium.UniformType.MAT4,
    //         value: localMatrix,
    //     },
    //   },
    //   fragmentShaderText: `
    //       void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
    //               float cury = fsInput.attributes.positionMC.y;
    //               // float d = (cury - minHeight) / (maxHeight - minHeight);
    //               float time = fract(czm_frameNumber / 180.0);
    //               time = abs(time - 0.5) * 2.0;
    //               vec3 linearColor = vec3(0.0, cury / 50.0, 1.0); //渐变
    //               float glowRange = 28.0;
    //               float diff = step(0.005, abs(clamp(cury/glowRange,0.0,1.0) - time));
    //               material.diffuse = linearColor * (1.5 - diff);
    //   }`,
    //   vertexShaderText: `
    //   void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput){
    //             vec3 modelMC = vsInput.attributes.positionMC;
    //             vec4 model_local_position = vec4(modelMC.x, modelMC.y, modelMC.z, 1.0);
    //             vec4 tileset_local_position = u_tileset_worldToLocalMatrix * czm_model * model_local_position;
    //             vec2 position2D = vec2(tileset_local_position.x,tileset_local_position.y);
    //             float time = czm_frameNumber / 5.0;
    //             if ( vsOutput.positionMC.y > 6.02 ){ //判断顶点高度
    //               vsOutput.positionMC.x += sin(time) * vsOutput.positionMC.y / 8.0;//可控制摇晃方向和距离
    //             }
    //         }
    //   `
    // })
    // tileset.customShader.setUniform("maxHeight", maxheight);
    // tileset.customShader.setUniform("minHeight", minheight);
    tileset.tileLoad.addEventListener(function (tile: any) {
      localTile = tile;
      const content = tile.content;
      const model = content._model;
      if (model && model._sourcePrograms && model._rendererResources) {
        Object.keys(model._sourcePrograms).forEach(key => {
          const program = model._sourcePrograms[key]
          const fragmentShader = model._rendererResources.sourceShaders[program.fragmentShader];
          let v_position = "";
          if (fragmentShader.indexOf(" v_positionEC;") != -1) {
            v_position = "v_positionEC";
          } else if (fragmentShader.indexOf(" v_pos;") != -1) {
            v_position = "v_pos";
          }
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
              void main(void) \n
              {\n
                vec3 weightedPosition = a_position;\n //a_position模型坐标, y表示高度,x表示纬度方向,z表示经度方向,单位米,x,z的0,0点在模型中央,与相机观察位置无关
                vec4 eye_position = u_modelViewMatrix * vec4(a_position, 1.0);//屏幕坐标 x水平方向,y垂直方向,z表示垂直屏幕相机观察方向的距离,单位都是米 原点0,0在屏幕中央观察点对应的位置,所以坐标与相机观察位置相关
                float time = czm_frameNumber / 5.0;\n
                vec4 ty_pos = u_projectionMatrix * (u_modelViewMatrix * vec4(a_position, 1.0)); //投影坐标
                if ( abs(ty_pos.y) < 10.0 ){ //判断顶点高度
                  weightedPosition.x += sin(time) * a_position.y / 8.0;//可控制摇晃方向和距离
                }
                vec4 position = u_modelViewMatrix * vec4(weightedPosition, 1.0);\n //转屏幕坐标(x,y的0,0在屏幕中央,水平是x,垂直是y)
                v_positionEC = position.xyz;\n
                gl_Position = u_projectionMatrix * position;\n //u_projectionMatrix 投影矩阵， 屏幕坐标position转投影坐标
  
                vec3 weightedNormal = a_normal;\n
                v_normal = u_normalMatrix * weightedNormal;\n
              }\n
            `
          model._rendererResources.sourceShaders[program.fragmentShader] =
            `
              varying vec3 ${v_position};
              void main(void){
                vec4 position = czm_inverseModelView * vec4(${v_position},1); // 位置
                //模型坐标 = czm_inverseModelView * eyePosition眼睛坐标
                gl_FragColor = vec4(vec3(position.y / 50.0), 1.0); // 渐变
                // 动态光环
                float time = fract(czm_frameNumber / 180.0);
                time = abs(time - 0.5) * 2.0;
                float glowRange = 30.0; // 光环的移动范围(高度)
                float diff = step(0.005, abs( clamp(position.y / glowRange, 0.0, 1.0) - time));
                gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
              }
            `
        })
        model._shouldRegenerateShaders = true
      }
    });
  // tileset.tileLoad.addEventListener(function (tile: any) {
  //   const content = tile.content;
  //   const model = content._model;
  //   if (model && model._sourcePrograms && model._rendererResources) {
  //     Object.keys(model._sourcePrograms).forEach(key => {
  //       const program = model._sourcePrograms[key]
  //       const fragmentShader = model._rendererResources.sourceShaders[program.fragmentShader];
  //       let v_position = "";
  //       if (fragmentShader.indexOf(" v_positionEC;") != -1) {
  //         v_position = "v_positionEC";
  //       } else if (fragmentShader.indexOf(" v_pos;") != -1) {
  //         v_position = "v_pos";
  //       }
  //       model._rendererResources.sourceShaders[program.vertexShader] =
  //         `
  //           precision highp float;\n
  //           uniform mat4 u_modelViewMatrix;\n//模型视图矩阵
  //           uniform mat4 u_projectionMatrix;\n//投影矩阵
  //           uniform mat3 u_normalMatrix;\n//正规矩阵
  //           attribute vec3 a_position;\n
  //           varying vec3 v_positionEC;\n
  //           attribute vec3 a_normal;\n //法线
  //           varying vec3 v_normal;\n
  //           attribute float a_batchId;\n
  //           void main(void) \n
  //           {\n
  //             vec3 weightedPosition = a_position;\n //a_position模型坐标, y表示高度,x表示纬度方向,z表示经度方向,单位米,x,z的0,0点在模型中央,与相机观察位置无关
  //             vec4 eye_position = u_modelViewMatrix * vec4(a_position, 1.0);//屏幕坐标 x水平方向,y垂直方向,z表示垂直屏幕相机观察方向的距离,单位都是米 原点0,0在屏幕中央观察点对应的位置,所以坐标与相机观察位置相关
  //             float time = czm_frameNumber / 5.0;\n

  //             vec4 ty_pos = u_projectionMatrix * (u_modelViewMatrix * vec4(a_position, 1.0)); //投影坐标
  //             if ( abs(ty_pos.y) < 10.0 ){ //判断顶点高度
  //               weightedPosition.x += sin(time) * a_position.y / 8.0;//可控制摇晃方向和距离
  //             }
  //             vec4 position = u_modelViewMatrix * vec4(weightedPosition, 1.0);\n //转屏幕坐标(x,y的0,0在屏幕中央,水平是x,垂直是y)
  //             v_positionEC = position.xyz;\n
  //             gl_Position = u_projectionMatrix * position;\n //u_projectionMatrix 投影矩阵， 屏幕坐标position转投影坐标

  //             vec3 weightedNormal = a_normal;\n
  //             v_normal = u_normalMatrix * weightedNormal;\n
  //           }\n
  //         `
  //       model._rendererResources.sourceShaders[program.fragmentShader] =
  //         `
  //           varying vec3 ${v_position};
  //           void main(void){
  //             vec4 position = czm_inverseModelView * vec4(${v_position},1); // 位置
  //             //模型坐标 = czm_inverseModelView * eyePosition眼睛坐标
  //             gl_FragColor = vec4(vec3(position.y / 50.0), 1.0); // 渐变
  //             // 动态光环
  //             float time = fract(czm_frameNumber / 180.0);
  //             time = abs(time - 0.5) * 2.0;
  //             float glowRange = 30.0; // 光环的移动范围(高度)
  //             float diff = step(0.005, abs( clamp(position.y / glowRange, 0.0, 1.0) - time));
  //             gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
  //           }
  //         `
  //     })
  //     model._shouldRegenerateShaders = true
  //   }
  // });
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
const polygonFilter = (checkPoint: { lat: number, lng: number }, polygonPoints: Array<any>) => {
  let counter = 0;
  let i;
  let xinters;
  let p1, p2;
  const pointCount = polygonPoints.length;
  p1 = polygonPoints[0];
  for (i = 1; i <= pointCount; i++) {
    p2 = polygonPoints[i % pointCount];
    if (
      checkPoint.lat > Math.min(p1.lat, p2.lat) &&
      checkPoint.lat <= Math.max(p1.lat, p2.lat)
    ) {
      if (checkPoint.lng <= Math.max(p1.lng, p2.lng)) {
        if (p1.lat != p2.lat) {
          xinters = (checkPoint.lat - p1.lat) * (p2.lng - p1.lng) / (p2.lat - p1.lat) + p1.lng;
          if (p1.lng == p2.lng || checkPoint.lng <= xinters) {
            counter++;
          }
        }
      }
    }
    p1 = p2;
  }
  if (counter % 2 == 0) {
    return false;
  } else {
    return true;
  }
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