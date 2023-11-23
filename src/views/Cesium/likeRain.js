import Cesium from "@/utils/importCesium";
let primitive = null;
/**
* @description: 产生随机线
* @param center：中心点坐标
* @param num：随机线数量
* @return 返回线
*/
export function generateRandomLines(center, num) {
    let geometryInstances = []
    for (let i = 0; i < num; i++) {
        let lon = center[0] + (Math.random() - 0.5) * 0.1;
        let lat = center[1] + (Math.random() - 0.5) * 0.1;
        const geometry = new Cesium.PolylineGeometry({
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                lon, lat, 0, lon, lat, 5000 * Math.random()
            ]),
            width: 1.0,
        })
        const instance = new Cesium.GeometryInstance({ geometry: geometry })
        geometryInstances.push(instance)
    }
    return geometryInstances
}
const fragmentShaderSource = `
        uniform vec4 color;
        uniform float speed;
        uniform float percent;
        uniform float gradient;
        
        czm_material czm_getMaterial(czm_materialInput materialInput){
          czm_material material = czm_getDefaultMaterial(materialInput);
          vec2 st = materialInput.st;
          float t = fract(czm_frameNumber * speed / 1000.0);
          t *= (1.0 - percent);
          float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
          alpha += gradient;
          material.diffuse = color.rgb;
          material.alpha = alpha;
          material.emission = vec3(0.7);
          return material;
        }
        `
export function createRain(viewer, center, num = 200) {
    primitive = new Cesium.Primitive({
        geometryInstances: generateRandomLines([center.longitude, center.latitude], num),
        appearance: new Cesium.PolylineMaterialAppearance({
            material: new Cesium.Material({
                fabric: {
                    uniforms: {
                        color: new Cesium.Color(1.0, 1.0, 1.0, 0.5),
                        speed: 2.0,
                        percent: 0.05,
                        gradient: 0.00
                    },
                    source: fragmentShaderSource
                },
            }),
        }),
        allowPicking: false
    })
    viewer.scene.primitives.add(primitive)
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(center.longitude, center.latitude, 20000),
        duration: 1.6,
    })
}
export function removeRain(viewer) {
    viewer.scene.primitives.remove(primitive);
    primitive = null;
}