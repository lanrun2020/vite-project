import Cesium from '@/utils/importCesium'
import { Vector4 } from 'three'
export default class ContourLineMaterialProperty {
  private _color: object | undefined
  private _d: number
  private _definitionChanged: any
  duration: number
  private _time: number
  constructor(color: typeof Vector4 = new Cesium.Color(0.3, 1, 0, 1), duration = 10000, d = 1, U?: object) {
    this._definitionChanged = new Cesium.Event()
    this._color = color
    this.duration = duration
    this._time = (new Date()).getTime()
    this._d = d
    this.conbineProp()
    this.init()
  }
  getType() {
    return 'ContourLine'
  }
  getValue(time: object, result: any) {
    if (!Cesium.defined(result)) {
      result = {}
    }
    result.color = this._color
    result.duration = this.duration
    result.d = this._d
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration * this._d
    return result
  }
  equals(other: any) {
    return this === other
  }
  conbineProp() {
    Object.defineProperties(ContourLineMaterialProperty.prototype, {
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
    Cesium.ContourLineMaterialProperty = ContourLineMaterialProperty
    Cesium.Material.ContourLineType = 'ContourLine'
    Cesium.Material.ContourLineSource =
      `
      czm_material czm_getMaterial(czm_materialInput materialInput)
      {
          czm_material material = czm_getDefaultMaterial(materialInput);
          material.diffuse = vec3(1.0,1.0,0.0);
          material.alpha = color.a * (materialInput.height + 0.2);
          return material;
      }
      `
    // material.alpha:透明度;
    // material.diffuse：颜色;
    // fract(x) 返回 x 的小数部分
    // float mod(float x, float y)  此函数会返回x除以y的余数。
    // float step(float edge, float x)此函数会根据两个数值生成阶梯函数，如果x<edge则返回0.0，否则返回1.0
    Cesium.Material._materialCache.addMaterial(Cesium.Material.ContourLineType, {
      fabric: {
        type: Cesium.Material.ContourLineType,
        uniforms: {
          color: this._color,
          time: this._time,
        },
        source: Cesium.Material.ContourLineSource,
      },
      //translucent 为 true 或返回 true 的函数时，几何图形看起来应该是半透明的
      translucent: function () {
        return true
      },
    })
  }
}

new ContourLineMaterialProperty()