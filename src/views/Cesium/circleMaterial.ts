// 圆面的材质
import Cesium from '@/utils/importCesium'

export default class CircleMaterialProperty {
  private _color: object
  private _speed: number
  private _repeat: number
  private _thickness: number
  private _flash: boolean
  private _definitionChanged: any
  private duration: number
  private _time: number
  constructor(options?: { color?: object, duration?: number, speed?: number, repeat?: number, thickness?: number, flash?:boolean }) {
    this._definitionChanged = new Cesium.Event()
    this._color = options?.color || new Cesium.Color(0.0, 0.0, 1.0, 1.0)
    this.duration = options?.duration || 10000
    this._time = (new Date()).getTime()
    this._speed = options?.speed || 1.0
    this._repeat = options?.repeat || 1.0
    this._thickness = options?.thickness || 0.5
    this._flash = options?.flash || false
    this.conbineProp()
    this.init()
  }
  getType() {
    return 'Circle'
  }
  getValue(time: object, result: any) {
    if (!Cesium.defined(result)) {
      result = {}
    }
    result.color = this._color
    result.repeat = this._repeat
    result.flash = this._flash
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
    Object.defineProperties(CircleMaterialProperty.prototype, {
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
    Cesium.CircleMaterialProperty = CircleMaterialProperty
    Cesium.Material.CircleType = 'Circle'
    Cesium.Material.CircleSource = 
      // eslint-disable-next-line no-multi-str
      `czm_material czm_getMaterial(czm_materialInput materialInput)\n\
      {\n\
          czm_material material = czm_getDefaultMaterial(materialInput);\n\
          float sp = 1.0/(repeat*2.0);\n\
          float dis = distance(materialInput.st, vec2(0.5, 0.5)) - fract(time);\n\
          float dis2 = 1.0 - distance(materialInput.st, vec2(0.5, 0.5));\n\
          float m = mod(dis, sp);\n\
          float a = step(m, sp*(thickness));\n\
          material.alpha = color.a * dis2 * ( flash ?  (sin(time*55.0) + 1.0)/5.0 : a * 0.5) ;\n\
          material.diffuse = color.rgb;\n\
          return material;\n\
      }`
    // material.alpha:透明度;
    // material.diffuse：颜色;
    // fract(x) 返回 x 的小数部分
    Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleType, {
      fabric: {
        type: Cesium.Material.CircleType,
        uniforms: {
          color: this._color,
          repeat: this._repeat,
          thickness: this._thickness,
          time: 0,
          flash: this._flash
        },
        source: Cesium.Material.CircleSource,
      },
      translucent: function () {
        return true
      }
    })
  }
}

new CircleMaterialProperty()