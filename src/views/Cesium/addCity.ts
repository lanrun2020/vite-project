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
export const addCity = (viewer: any, active: boolean) => {
  if (active) {
    view2 = new CesiumVideo3d(Cesium, viewer,{
      far: 300,
      url: '/src/views/Cesium/video.mp4',
      type: 3,
      position: {x:121.5061830727844, y:31.22923471021075, z: 50},
      rotation: {x: 0,y: 0} //x垂直方向偏转，y水平方向偏转
    })
    // let y = 0.00001
    // setInterval(() => {
    //   y += 0.00001
    //   view2._changePosition({x:121.5061830727844+y, y:31.22923471021075, z: 50})//改变位置
    //   // view2._changeRotation({x:30 , y:0})//改变偏转角度
    // },100)
    // const vew = new ViewShed(viewer)
    // 流动水面效果
    viewer.scene.primitives.add(
      new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
              geometry: new Cesium.RectangleGeometry({
                  rectangle: Cesium.Rectangle.fromDegrees(
                      121.5061830727844, 31.22923471021075,
                      121.5461830727844, 31.25923471021075,
                  ),
                  height: 10,
                  vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
              }),
          }),
          appearance: new Cesium.MaterialAppearance({
            material: waterMaterial.getMaterial(), faceForward: !1, closed: !0
          }),
      })
    );
    setTimeout(() => {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(121.5061830727844, 31.22923471021075, 3000),
        duration: 1.6,
      });
    },100)
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
    primitive = viewer.scene.primitives.add(new Cesium.PrimitiveCollection());
    new Cesium.Cesium3DTileset({
      url: "/city/tileset.json",
    }).readyPromise
      .then((data: any) => {
        tilesetPrimitive = data
        primitive.add(tilesetPrimitive)
        loadTilesShader(tilesetPrimitive)
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
      handler.setInputAction((event: any) => {
          // const feature = inspectorViewModel.feature;
          // console.log(feature);
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
      view2.destroy()
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)//移除事件
    }
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
  //实现渐变效果
  tileset.tileVisible.addEventListener(function (tile: any) {
    const content = tile.content;
    const featuresLength = content.featuresLength;
    for (let i = 0; i < featuresLength; i += 2) {
      const feature = content.getFeature(i)
      const model = feature.content._model
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
          const color = `vec4(${feature.color.toString()})`;

          model._rendererResources.sourceShaders[program.fragmentShader] =
            `
            varying vec3 ${v_position};
            void main(void){
              vec4 position = czm_inverseModelView * vec4(${v_position},1); // 位置
              gl_FragColor = ${color}; // 颜色
              gl_FragColor *= vec4(vec3(position.z / 50.0), 1.0); // 渐变
              // 动态光环
              float time = fract(czm_frameNumber / 180.0);
              time = abs(time - 0.5) * 2.0;
              float glowRange = 180.0; // 光环的移动范围(高度)
              float diff = step(0.005, abs( clamp(position.z / glowRange, 0.0, 1.0) - time));
              gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
            }
          `
        })
        model._shouldRegenerateShaders = true
      }
    }
  });
}