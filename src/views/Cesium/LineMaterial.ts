// 线材质
import Cesium from '@/utils/importCesium'

export default class PolylineMaterialProperty {
  private _color: object
  private _speed: number
  private _repeat: number
  private _thickness: number
  private _definitionChanged: any
  private duration: number
  private _time: number
  constructor(options?: { color?: object, duration?: number, speed?: number, repeat?: number, thickness?: number }) {
    this._definitionChanged = new Cesium.Event()
    this._color = options?.color || new Cesium.Color(0.0, 0.0, 1.0, 1.0)
    this.duration = options?.duration || 10000
    this._time = (new Date()).getTime()
    this._speed = options?.speed || 1.0
    this._repeat = options?.repeat || 1.0
    this._thickness = options?.thickness || 0.5
    this.conbineProp()
    this.init()
  }
  getType() {
    return 'Polyline'
  }
  getValue(time: object, result: any) {
    if (!Cesium.defined(result)) {
      result = {}
    }
    result.color = this._color
    result.repeat = this._repeat
    result.thickness = this._thickness
    result.duration = this.duration
    result.speed = this._speed
    result.color = this._color
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration * this._speed
    return result
  }
  equals(other: object) {
    return this === other
  }
  conbineProp() {
    Object.defineProperties(PolylineMaterialProperty.prototype, {
      isConstant: {
        get: function () {
          return false
        },
        configurable: true
      },
      definitionChanged: {
        get: function () {
          return this._definitionChanged
        },
        configurable: true
      }
    })
  }
  init() {
    Cesium.PolylineMaterialProperty = PolylineMaterialProperty
    Cesium.Material.PolylineType = 'Polyline'
    Cesium.Material.PolylineSource =
      // eslint-disable-next-line no-multi-str
      `czm_material czm_getMaterial(czm_materialInput materialInput)\n\
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
    // material.alpha:透明度;
    // material.diffuse：颜色;
    // fract(x) 返回 x 的小数部分
    Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineType, {
      fabric: {
        type: Cesium.Material.PolylineType,
        uniforms: {
          color: this._color,
          repeat: this._repeat,
          thickness: this._thickness,
          time: 0,
        },
        source: Cesium.Material.PolylineSource
      },
      translucent: function () {
        return true
      }
    })
  }
}

//@ts-ignore
new PolylineMaterialProperty()