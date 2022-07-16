// 雷达扫描波形材质
import Cesium from '@/utils/importCesium'
import { Vector4 } from 'three'
export default class WallScanMaterialProperty {
  private _color: object | undefined
  private _d: number
  private _repeat: number
  private _definitionChanged: any
  duration: number
  private _time: number
  private _thickness: number
  constructor(color: typeof Vector4 = new Cesium.Color(.1, 1, 0, 1), duration: number = 10000, d: number = 1, repeat: number = 10, thickness: number = 0.2, U?: object) {
    this._definitionChanged = new Cesium.Event()
    this._color = color
    this.duration = duration
    this._time = (new Date()).getTime()
    this._d = d
    this._repeat = repeat
    this._thickness = thickness
    this.conbineProp()
    this.init()
  }
  getType () {
    return 'WallScan'
  }
  getValue (time: object, result: any) {
    if (!Cesium.defined(result)) {
      result = {}
    }
    result.color = this._color
    result.repeat = this._repeat
    result.thickness = this._thickness
    result.duration = this.duration
    result.d = this._d
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration * this._d
    return result
  }
  equals (other: any) {
    return this === other
  }
  conbineProp () {
    Object.defineProperties(WallScanMaterialProperty.prototype, {
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
  init () {
    Cesium.WallScanMaterialProperty = WallScanMaterialProperty
    Cesium.Material.WallScanType = 'WallScan'
    Cesium.Material.WallScanSource =
      `
      czm_material czm_getMaterial(czm_materialInput materialInput)
      {
          czm_material material = czm_getDefaultMaterial(materialInput);
          // float sp = 1.0/repeat;
          // float m = mod(materialInput.st.t-fract(time - materialInput.s),sp);
          // float m = mod(materialInput.st.t,sp);
          // float a = step(sp * (1.0 - 0.5),m);
          float a =step(0.1,materialInput.st.t)*(materialInput.st.t + (1.0 - fract(time - materialInput.s)) - 1.0 * step(fract(time - materialInput.s),materialInput.st.t)) + step(materialInput.st.t,0.2);
          material.diffuse = vec3(0.0,1.0,0.0);
          material.alpha = a * color.a;
          return material;
      }
      `
    // material.alpha:透明度;
    // material.diffuse：颜色;
    // fract(x) 返回 x 的小数部分
    // float mod(float x, float y)  此函数会返回x除以y的余数。 
    // float step(float edge, float x)此函数会根据两个数值生成阶梯函数，如果x<edge则返回0.0，否则返回1.0
    Cesium.Material._materialCache.addMaterial(Cesium.Material.WallScanType, {
      fabric: {
        type: Cesium.Material.WallScanType,
        uniforms: {
          color: this._color,
          repeat: this._repeat,
          time: this._time,
          thickness: this._thickness,// 环高
        },
        source: Cesium.Material.WallScanSource,
      },
      //translucent 为 true 或返回 true 的函数时，几何图形看起来应该是半透明的
      translucent: function () {
        return true
      },
    })
  }
}

//@ts-ignore
new WallScanMaterialProperty()