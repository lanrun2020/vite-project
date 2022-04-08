import Cesium from '@/utils/importCesium'
import { Vector4 } from 'three'
export default class RadarScanMaterialProperty {
  private _color: object | undefined
  private _d: number
  private _repeat: number
  private _definitionChanged: any
  duration: number
  private _time: number
  private _thickness: number
  constructor(color: Vector4 = new Cesium.Color(.1, 1, 0, 1), duration: number = 10000,d:number = 1,repeat:number = 10,thickness:number = 0.2, U?: object) {
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
  getType() {
    return 'RadarScan'
  }
  getValue(time:object,result: any) {
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
  equals(other:any) {
    return this === other
  }
  conbineProp() {
    Object.defineProperties(RadarScanMaterialProperty.prototype, {
      isConstant: {
        get: function () {
          return false
        },
        configurable:true
      },
      definitionChanged: {
        get: function () {
          return this._definitionChanged
        },
        configurable:true
      }
    })
  }
  init() {
    Cesium.RadarScanMaterialProperty = RadarScanMaterialProperty
    Cesium.Material.RadarScanType = 'RadarScan'
    Cesium.Material.RadarScanSource =
      // eslint-disable-next-line no-multi-str
      `\n
      uniform vec4 color;\n
      uniform float repeat;\n
      uniform float offset;\n
      uniform float thickness;\n
      czm_material czm_getMaterial(czm_materialInput materialInput)\n
      {\n
        czm_material material = czm_getDefaultMaterial(materialInput);\n
        float sp = 1.0/repeat;\n
        vec2 st = materialInput.st;\n
        float dis = distance(st, vec2(0.5, 0.5)) + fract(materialInput.s - time);\n
        float dis2 = distance(st, vec2(0.5, 0.5));\n
        float m = mod(dis, sp);\n
        float a = step(m, sp*(thickness));\n
        material.diffuse = color.rgb;\n
        material.alpha = a * color.a * (1.0 - dis2);\n //渐变
        // material.alpha = a * color.a;\n
        return material;\n
      }\n`
    // material.alpha:透明度;
    // material.diffuse：颜色;
    // fract(x) 返回 x 的小数部分
    // float mod(float x, float y)  此函数会返回x除以y的余数。 
    // float step(float edge, float x)此函数会根据两个数值生成阶梯函数，如果x<edge则返回0.0，否则返回1.0
    Cesium.Material._materialCache.addMaterial(Cesium.Material.RadarScanType, {
      fabric: {
        type: Cesium.Material.RadarScanType,
        uniforms: {
          color: this._color,
          repeat: this._repeat,
          time: this._time,
          thickness:this._thickness,// 环高
        },
        source: Cesium.Material.RadarScanSource,
      },
      //translucent 为 true 或返回 true 的函数时，几何图形看起来应该是半透明的
      translucent:  function () {
        return true
      },
    })
  }
}

//@ts-ignore
new RadarScanMaterialProperty()