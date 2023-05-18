// 城市 白膜建筑
import Cesium from "@/utils/importCesium"
import CesiumVideo3d from './CesiumVideo3d'
let primitive: any
let tilesetPrimitive: any
export const addCity = (viewer: any, active: boolean) => {
  if (active) {
    const view2 = new CesiumVideo3d(Cesium, viewer,{
      far: 300,
      url: 'http://localhost:3015/src/views/Cesium/video.mp4',
      type: 3,
      position: {x:121.5061830727844, y:31.22923471021075, z: 50},
      rotation: {x: 1,y: 1,z: 1}
    })
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
    primitive = viewer.scene.primitives.add(new Cesium.PrimitiveCollection());
    new Cesium.Cesium3DTileset({
      url: "/city/tileset.json",
    }).readyPromise
      .then((data: any) => {
        tilesetPrimitive = data
        primitive.add(tilesetPrimitive)
        loadTilesShader(tilesetPrimitive)
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
  } else {
    if (primitive) {
      primitive.removeAll()
      primitive = null
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