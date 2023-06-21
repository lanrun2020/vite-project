// 线材质
import Cesium from '@/utils/importCesium'
const source = `
uniform vec4 color;\n
uniform float repeat;\n
uniform float thickness;\n
czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    float sp = 1.0/repeat;\n\
    float dis = materialInput.s - fract(czm_frameNumber * 0.01);\n\
    float m = mod(dis, sp);\n\
    float a =1.0 - step(sp*(thickness), m);\n\
    material.alpha = a * mod(m,sp) * 2.0 * repeat * color.a ;\n\
    material.diffuse = color.rgb;\n\
    return material;\n\
}`

const fabric = {
  uniforms: {
    color: new Cesium.Color(.1, 1, 0, 1),
    repeat: 30,
    thickness: 0.2,
    close: false,
  },
  source: source
}

export default class lineMaterialProperty {
  private material: any
  private duration: number
  private speed: number
  constructor(options?: { color?: typeof Cesium.Color, repeat?: number, thickness?: number, duration?: number, speed?: number, translucent?: boolean, U?: object }) {
    this.material = new Cesium.Material({ fabric, translucent: options?.translucent || false })
    this.material.uniforms.color = options?.color || new Cesium.Color(.1, 1, 0, 1)
    this.material.uniforms.repeat = (options?.repeat || 10)
    this.material.uniforms.thickness = options?.thickness || 0.5
    this.duration = options?.duration || 10000
    this.speed = options?.speed || 1
  }
  close() {
    this.material.uniforms.close = true
  }
  getMaterial() {
    this.material.uniforms.close = false
    this.tick()
    return this.material
  }
  tick: Function = () => {
    if (!this.material.uniforms.close) {
      Cesium.requestAnimationFrame(this.tick);
    }
  }
}

new lineMaterialProperty()