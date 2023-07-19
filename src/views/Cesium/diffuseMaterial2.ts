//圆的圆环扩散扫描
import Cesium from '@/utils/importCesium'

export default class Diffuse2MaterialProperty {
  private _color: object //颜色及透明度
  private _speed: number //旋转速度
  private _repeat: number //圈数
  private _gradual: boolean //是否渐变
  private _thickness: number //厚度
  private _reverse: boolean //扩散方向是否反向
  private _angle: number //uv纹理旋转角度
  private _definitionChanged: any
  private duration: number
  private _time: number
  constructor(options?: { color?: object, duration?: number, speed?: number, repeat: number,thickness: number, gradual?: boolean, reverse?: boolean, angle: number }) {
    this._definitionChanged = new Cesium.Event()
    this._color = options?.color ?? new Cesium.Color(0.0, 0.0, 1.0, 1.0)
    this.duration = options?.duration ?? 10000
    this._time = (new Date()).getTime()
    this._speed = options?.speed ?? 1.0
    this._repeat = options?.repeat ?? 4.0
    this._thickness = options?.thickness ?? 0.2
    this._reverse = options?.reverse ?? false
    this._gradual = options?.gradual ?? true
    this._angle = options?.angle ?? 0
    this.conbineProp()
    this.init()
  }
  getType() {
    return 'Diffuse2'
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
    result.gradual = this._gradual
    result.angle = this._angle

    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration * this._speed
    return result
  }
  equals(other: object) {
    return this === other
  }
  conbineProp() {
    Object.defineProperties(Diffuse2MaterialProperty.prototype, {
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
    Cesium.Diffuse2MaterialProperty = Diffuse2MaterialProperty
    Cesium.Material.Diffuse2Type = 'Diffuse2'
    Cesium.Material.Diffuse2Source =
      // eslint-disable-next-line no-multi-str
      `czm_material czm_getMaterial(czm_materialInput materialInput)\n\
      {\n\
          czm_material material = czm_getDefaultMaterial(materialInput);\n\
          float sp = 1.0/(repeat*2.0);\n\
          float x = materialInput.st.s;
          float y = materialInput.st.t;
          // float dis = distance(materialInput.st, vec2(0.0, 0.0));\n\
          // 获取当前片元的纹理坐标
          vec2 uv = materialInput.st;
          // 计算旋转后的纹理坐标
          float cosTheta = cos(radians(angle));
          float sinTheta = sin(radians(angle));
          mat2 rotationMatrix = mat2(cosTheta, -sinTheta, sinTheta, cosTheta);
          float x1 = (uv.x - 0.5)*cosTheta + (uv.y - 0.5)*sinTheta + 0.5;
          float y1 = (uv.y - 0.5)*cosTheta - (uv.x - 0.5)*sinTheta + 0.5;
          // uv = rotationMatrix * uv;
          float dis = 1.0 - distance(vec2(x1,y1), vec2(0.0, 0.0))+0.2;\n\

          material.alpha = color.a * dis;\n\
          material.diffuse = color.rgb;\n\
          return material;\n\
      }`
    // material.alpha:透明度;
    // material.diffuse：颜色;
    // fract(x) 返回 x 的小数部分
    Cesium.Material._materialCache.addMaterial(Cesium.Material.Diffuse2Type, {
      fabric: {
        type: Cesium.Material.Diffuse2Type,
        uniforms: {
          color: this._color,
          PI: Math.PI,
          time: 0.0,
          repeat: this._repeat,
          reverse: this._reverse,
          thickness: this._thickness,
          speed: this._speed,
          angle: this._angle,
        },
        source: Cesium.Material.Diffuse2Source
      },
      translucent: function () {
        return true
      }
    })
  }
}

new Diffuse2MaterialProperty()