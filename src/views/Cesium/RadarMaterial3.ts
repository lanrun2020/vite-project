//雷达扫描波形材质
import Cesium from '@/utils/importCesium'

const source = `
czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    float sp = 1.0/(repeat*2.0);\n\
    float x = materialInput.st.s;
    float y = materialInput.st.t;
    // float dis = distance(materialInput.st, vec2(0.0, 0.0));\n\
    // vec3 positionWC = (czm_model * vec4(materialInput.position, 1.0)).xyz;
    // float dis = distance(positionWC, vec3(center));\n\
    material.alpha = color.a;\n\
    material.diffuse = color.rgb;\n\
    return material;\n\
}`

const fabric = {
  uniforms: {
    color: new Cesium.Color(.1, 1, 0, 1),
    repeat: 30,
    thickness: 0.2,// 环高
    time: 0,
    close: false,
    gradual: 0.0,
    gradualValue: 0.5,
  },
  source: source
}

export default class radarMaterialsProperty {
  private material: any
  private duration: number
  private speed: number
  private _time: number
  constructor(options?: { color?: typeof Cesium.Color, repeat?: number, thickness?: number, duration?: number, speed?: number, translucent?: boolean, gradual?: boolean, gradualValue?: number, U?: object }) {
    this.material = new Cesium.Material({ fabric, translucent: options?.translucent ?? false })
    this.material.uniforms.color = options?.color ?? new Cesium.Color(.1, 1, 0, 1)
    this.material.uniforms.repeat = (options?.repeat ?? 10) * 2
    this.material.uniforms.thickness = options?.thickness ?? 0.5
    this.material.uniforms.gradual = (options?.gradual ?? false) ? 1.0 : 0.0
    this.material.uniforms.gradualValue = options?.gradualValue ?? 0.5
    this.duration = options?.duration ?? 10000
    this.speed = options?.speed ?? 1
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