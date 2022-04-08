import Cesium from '@/utils/importCesium'
import { Vector4 } from 'three'

const source = `
\n 
uniform vec4 color;\n 
uniform float repeat;\n 
uniform float thickness;\n 
uniform float time;\n
czm_material czm_getMaterial(czm_materialInput materialInput)\n 
{\n 
  czm_material material = czm_getDefaultMaterial(materialInput);\n 
  float sp = 1.0/repeat;\n
  vec2 st = materialInput.st;\n 
  float dis = distance(st, vec2(0.5)) - fract(time);\n 
  float dis2 = distance(st, vec2(0.5, 0.5));\n
  float m = mod(dis, sp);\n 
  float a = step(sp*(1.0-thickness), m);\n 
  material.diffuse = color.rgb;\n 
  // material.alpha = a * color.a;\n 
  material.alpha = a * color.a * (1.0 - dis2);\n //渐变
  return material;\n 
}\n 
`

const radarMaterial = new Cesium.Material({
  fabric: {
    type: 'radarMaterial2',
    uniforms: {
      color: new Cesium.Color(.1, 1, 0, 1),
      repeat: 30,
      thickness: 0.2,// 环高
      time: 0,
      close: false,
    },
    source: source
  }, translucent: !1,
})

const ntime = (new Date()).getTime()
let d = 100000 
let s = 1
function tick() {
  if (!radarMaterial.uniforms.close) {
    radarMaterial.uniforms.time = (((new Date()).getTime() - ntime) % d) / d * s
    Cesium.requestAnimationFrame(tick);
  }
}

const setPosition = (color: Vector4 = new Cesium.Color(.1, 1, 0, 1), duration: number = 10000,speed:number = 1,repeat:number = 10,thickness:number = 0.2) => {
  radarMaterial.uniforms.color = color
  radarMaterial.uniforms.repeat = repeat
  radarMaterial.uniforms.thickness = thickness
  d = duration
  s = speed
}
export { tick, radarMaterial ,setPosition}