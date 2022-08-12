// 线材质
import Cesium from '@/utils/importCesium'
const source = `
uniform vec4 color;\n
uniform float repeat;\n
uniform float thickness;\n
uniform float time;\n
czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    float sp = 1.0/repeat;\n\
    float dis = materialInput.s - fract(time);\n\
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
    time: 0,
    close: false,
  },
  source: source
}

export default class lineMaterialProperty {
  private material: any
  private duration: number
  private speed: number
  private _time: number
  constructor(options?: { color?: typeof Cesium.Color, repeat?: number, thickness?: number, duration?: number, speed?: number, translucent?: boolean, U?: object }) {
    this.material = new Cesium.Material({ fabric, translucent: options?.translucent || false })
    this.material.uniforms.color = options?.color || new Cesium.Color(.1, 1, 0, 1)
    this.material.uniforms.repeat = (options?.repeat || 10) * 2
    this.material.uniforms.thickness = options?.thickness || 0.5
    this.duration = options?.duration || 10000
    this.speed = options?.speed || 1
    this._time = (new Date()).getTime()
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
      this.material.uniforms.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration * this.speed
      Cesium.requestAnimationFrame(this.tick);
    }
  }
}

new lineMaterialProperty()