// 线材质
import Cesium from '@/utils/importCesium'
const source = `
    uniform vec4 color;\n
    uniform float ctime;\n
    uniform float atime;\n
    czm_material czm_getMaterial(czm_materialInput materialInput)\n\
    {\n\
        czm_material material = czm_getDefaultMaterial(materialInput);\n\
        float dis = materialInput.s;\n\
        bool b = bool(step(dis, ctime/atime));\n\
        material.alpha = b ? color.a : 0.0;\n\
        material.diffuse = color.rgb;\n\
        return material;\n\
    }`

const fabric = {
      uniforms: {
        color: new Cesium.Color(.1, 1, 0, 1),
        ctime: 100.0,
        atime: 500.0,
      },
      source: source
}

export default class planeLineMaterial {
  private material: any
  private _time: number
  private viewer: any
  constructor(options?: {viewer?:any, color?: typeof Cesium.Color, repeat?: number, thickness?: number, duration?: number, speed?: number, translucent?: boolean, U?: object }) {
    this.material = new Cesium.Material({ fabric, translucent: true })
    this.material.uniforms.color = options?.color || new Cesium.Color(.1, 1, 0, 1)
    this.material.uniforms.repeat = (options?.repeat || 10) * 2
    this.material.uniforms.thickness = options?.thickness || 0.5
    this.viewer = options?.viewer
    this._time = options?.viewer.clock.currentTime.secondsOfDay
    this.tick()
  }
  close() {
    this.material.uniforms.close = true
  }
  getMaterial() {
    this.material.uniforms.close = false
    return this.material
  }
  tick: Function = () => {
    if (this.material.uniforms.close) {
      this.material.uniforms.ctime = (this.viewer.clock.currentTime.secondsOfDay - this._time)
      Cesium.requestAnimationFrame(this.tick);
    }
  }
}

new planeLineMaterial()