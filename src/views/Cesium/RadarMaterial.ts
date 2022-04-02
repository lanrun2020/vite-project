import Cesium from '@/utils/importCesium'
export default class RadarScanMaterialProperty {
  private _color: object | undefined
  private _image: number
  private _d: number
  private _repeat: number
  private _definitionChanged: any
  duration: number
  private _time: number
  constructor(color: object, duration: number,image:number,d:number = 1,repeat:number = 1, U?: object) {
    this._definitionChanged = new Cesium.Event()
    this._color = color
    this.duration = duration
    this._time = (new Date()).getTime()
    this._image = image
    this._d = d
    this._repeat = repeat
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
    result.image = this._image
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration * this._d
    return result
  }
  equals(other) {
    return this === other || (other instanceof RadarScanMaterialProperty && Cesium.Property.equals(this._color, other._color) && Cesium.Property.equals(this._repeat, other._repeat))
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
        float sp = 1.0/repeat;\n  //1/30
        vec2 st = materialInput.st;\n
        float dis = distance(st, vec2(0.5, 0.5));\n //从上自下 0 到 1/2
        float m = mod(dis, sp);\n // 两数余数 返回0 - 1/30 
        //fract(materialInput.s - time) //0-1
 
        // float a = step(m, sp*(thickness));\n //(0 - 1/30,1/60在中间) //一半0 一半1
        // float a = step(m, sp*(thickness) * fract(time));\n  // 0 -> 1 增加
        float a = step( sp*(thickness) * fract(-time),m) ;\n  //1 -> 0 增加
        //float a = (1.0 - step(m, sp*(thickness)*(1.0 - fract(materialInput.s - time)))) *  step(m,sp*(thickness)*(fract(materialInput.s - time)));\n //返回0或1交错的repeat个阶梯值
        // float a = step(sp*(thickness)*(fract(time - materialInput.s) - 0.5),m - 0.5);\n //返回0或1交错的repeat个阶梯值 //下部增加
        //float a =step(sp*(thickness)*(fract(time - materialInput.s)-0.5),m);\n // 上部减少
        // float a = step(m , sp*(thickness)*(0.5 - fract(materialInput.s - time))) + step(sp*(thickness)*(fract(time - materialInput.s) - 0.5),m - 0.5);\n
        material.diffuse = color.rgb;\n
        material.alpha = a * color.a * (0.5 - dis);\n
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
          color: new Cesium.Color(.2, 1, 0, 1),
          repeat: this._repeat,
          time: 0,
          thickness:this._image,
        },
        source: Cesium.Material.RadarScanSource
      },
      translucent: function () {
        return true
      }
    })
  }
}

//@ts-ignore
new RadarScanMaterialProperty()