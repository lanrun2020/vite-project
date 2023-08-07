// box
import Cesium from "@/utils/importCesium"

let model: any = null
export const addBox = (viewer: any, active: boolean) => {
  if (active) {
    const geometry = Cesium.BoxGeometry.fromDimensions({
      vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
      dimensions: new Cesium.Cartesian3(20.0, 15.0, 10.0),
    });

    const instance = new Cesium.GeometryInstance({
      geometry: geometry,
      modelMatrix: Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(
          Cesium.Cartesian3.fromDegrees(
            124.21936679679918,
            45.85136872098397
          )
        ),
        new Cesium.Cartesian3(0.0, 0.0, 80.0),
        new Cesium.Matrix4()
      ),
      id: "lsh",
    });

    const material = new Cesium.Material({
      fabric: {
        uniforms: {
          u_time: 0.0
        }
      },
      translucent: true
    });

    const aper = new Cesium.MaterialAppearance({
      fragmentShaderSource: ` 
      varying vec3 v_positionEC;
      varying vec3 v_normalEC;
      varying vec2 v_st;
      varying vec3 v_cameraPos;

  
      varying vec3 wc_p;
      void main()
      {
          vec3 positionToEyeEC = -v_positionEC;
  
          vec3 normalEC = normalize(v_normalEC);
      #ifdef FACE_FORWARD
          normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
      #endif
          vec3 wc_p_lxs=wc_p/vec3(10.0,7.5,5.0);
          wc_p_lxs=(wc_p_lxs+1.0)/2.0;
          float lxs_z=fract(wc_p_lxs.z-czm_frameNumber/200.0);
          gl_FragColor = vec4(vec3(0.,0.5,.9),lxs_z);
      }
     `,
      vertexShaderSource: `
    attribute vec3 position3DHigh;
    attribute vec3 position3DLow;
    attribute vec3 normal;
    attribute vec2 st;
    attribute float batchId;
  
    varying vec3 v_positionEC;
    varying vec3 v_normalEC;
    varying vec3 v_cameraPos;
    varying vec2 v_st;
  
    varying vec3 wc_p;
  
    void main()
    {    
        vec4 p = czm_computePosition();  //世界坐标
        wc_p=position3DHigh+position3DLow;
        v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
        v_normalEC = czm_normal * normal;                         // normal in eye coordinates
        v_st = st;
  
        vec3 cameraPos=czm_encodedCameraPositionMCHigh+czm_encodedCameraPositionMCLow; //相机位置
        v_cameraPos = cameraPos;
        
        gl_Position = czm_modelViewProjectionRelativeToEye * p;
    }`,
      closed: false
    });

    const lxs = viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: instance,
        appearance: aper,
        asynchronous: true,
      })
    );
    lxs.appearance.material = material;

    viewer.camera.lookAt(new Cesium.Cartesian3.fromDegrees(124.21936679679918,
      45.85136872098397, 80), new Cesium.Cartesian3(-115, 12, 0));

    viewer.scene.preRender.addEventListener(function (s, t) {
      const elaspTime = Cesium.JulianDate.now().secondsOfDay / 10.0;
      lxs.appearance.material.uniforms.u_time = elaspTime;
    });
  } else {
    if (model) {
      viewer.entities.remove(model);
      model = null
    }
  }
}