//圆的多页扇形旋转扫描
import Cesium from '@/utils/importCesium'

export default class DiffuseMaterialProperty {
  private _color: object //颜色及透明度
  private _speed: number //旋转速度
  private _repeat: number //圈数
  private _gradual: boolean //是否渐变
  private _thickness: number //厚度
  private _reverse: boolean //扩散方向是否反向
  private _reverseColor: boolean //颜色渐变是否反向
  private _definitionChanged: any
  private duration: number
  private _time: number
  constructor(options?: { color?: object, duration?: number, speed?: number, repeat: number,thickness: number, gradual?: boolean, reverse?: boolean, reverseColor?: boolean }) {
    this._definitionChanged = new Cesium.Event()
    this._color = options?.color ?? new Cesium.Color(0.0, 0.0, 1.0, 1.0)
    this.duration = options?.duration ?? 10000
    this._time = (new Date()).getTime()
    this._speed = options?.speed ?? 1.0
    this._repeat = options?.repeat ?? 4.0
    this._thickness = options?.thickness ?? 0.2
    this._reverse = options?.reverse ?? false
    this._reverseColor = options?.reverseColor ?? false
    this._gradual = options?.gradual ?? true
    this.conbineProp()
    this.init()
  }
  getType() {
    return 'Diffuse'
  }
  getValue(time: object, result: any) {
    if (!Cesium.defined(result)) {
      result = {}
    }
    result.color = this._color
    result.duration = this.duration
    result.speed = this._speed
    result.repeat = this._repeat
    result.thickness = this._thickness
    result.reverse = this._reverse
    result.reverseColor = this._reverseColor
    result.gradual = this._gradual
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration * this._speed
    return result
  }
  equals(other: object) {
    return this === other
  }
  conbineProp() {
    Object.defineProperties(DiffuseMaterialProperty.prototype, {
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
    Cesium.DiffuseMaterialProperty = DiffuseMaterialProperty
    Cesium.Material.DiffuseType = 'Diffuse'
    Cesium.Material.DiffuseSource =
      // eslint-disable-next-line no-multi-str
      `czm_material czm_getMaterial(czm_materialInput materialInput)\n\
      {\n\
          czm_material material = czm_getDefaultMaterial(materialInput);\n\
          float sp = 1.0/(repeat*2.0);\n\
          float x = materialInput.st.s;
          float y = materialInput.st.t;
          float dis = distance(materialInput.st, vec2(0.5, 0.5)) - fract(time * speed * (reverse ? -1.0 : 1.0));\n\
          float dis2 = sqrt((x-0.5)*(x-0.5) + (y-0.5)*(y-0.5));
          dis2 = reverseColor ? dis2 : (0.5 - dis2);
          float m = mod(dis, sp);\n\
          float a = step(m, sp*(thickness));\n\
          material.alpha = color.a * dis2 * 2.0 * a ;\n\
          material.diffuse = color.rgb;\n\
          return material;\n\
      }`
    // material.alpha:透明度;
    // material.diffuse：颜色;
    // fract(x) 返回 x 的小数部分
    Cesium.Material._materialCache.addMaterial(Cesium.Material.DiffuseType, {
      fabric: {
        type: Cesium.Material.DiffuseType,
        uniforms: {
          color: this._color,
          PI: Math.PI,
          time: 0.0,
          repeat: this._repeat,
          reverse: this._reverse,
          reverseColor: this._reverseColor,
          thickness: this._thickness,
          speed: this._speed,
        },
        source: Cesium.Material.DiffuseSource
      },
      translucent: function () {
        return true
      }
    })
  }
}

new DiffuseMaterialProperty()