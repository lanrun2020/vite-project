// 线材质
import Cesium from '@/utils/importCesium'

export default class planelineMaterialProperty {
  private _color: object
  private _speed: number
  private _definitionChanged: any
  private duration: number
  private _time: number
  constructor(options?: { color?: object, duration?: number, speed?: number }) {
    this._definitionChanged = new Cesium.Event()
    this._color = options?.color || new Cesium.Color(0.0, 0.0, 1.0, 1.0)
    this.duration = options?.duration || 10000
    this._time = (new Date()).getTime()
    this._speed = options?.speed || 1.0
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
    Object.defineProperties(planelineMaterialProperty.prototype, {
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
    Cesium.planelineMaterialProperty = planelineMaterialProperty
    Cesium.Material.PolylineType = 'Polyline'
    Cesium.Material.PolylineSource =
      // eslint-disable-next-line no-multi-str
      `czm_material czm_getMaterial(czm_materialInput materialInput)\n\
      {\n\
          czm_material material = czm_getDefaultMaterial(materialInput);\n\
          float dis = materialInput.s;\n\
          material.alpha = color.a * abs(dis);\n\
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

new planelineMaterialProperty()