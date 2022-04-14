import Cesium from '@/utils/importCesium'
export default class PolylineTrailLinkMaterialProperty {
  private _color: object | undefined
  private _image: object | undefined
  private _d: number
  private _repeat: number
  private _definitionChanged: any
  private duration: number
  private _time: number
  constructor(options?:{color?: object, duration?: number,image?:any,d?:number,repeat?:number}, U?: object) {
    this._definitionChanged = new Cesium.Event()
    this._color = options?.color
    this.duration = options?.duration || 100000
    this._time = (new Date()).getTime()
    this._image = options?.image
    this._d = options?.d || 1.0
    this._repeat = options?.repeat || 1.0
    this.conbineProp()
    this.init()
  }
  getType() {
    return 'PolylineTrailLink'
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
    return this === other
  }
  conbineProp() {
    Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
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
    Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty
    Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink'
    Cesium.Material.PolylineTrailLinkSource =
      // eslint-disable-next-line no-multi-str
      'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
      {\n\
          czm_material material = czm_getDefaultMaterial(materialInput);\n\
          vec2 st = fract (repeat *materialInput.st);\n\
          vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
          material.alpha = colorImage.a * color.a;\n\
          material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
          return material;\n\
      }'
    // material.alpha:透明度;
    // material.diffuse：颜色;
    // fract(x) 返回 x 的小数部分
    Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
      fabric: {
        type: Cesium.Material.PolylineTrailLinkType,
        uniforms: {
          color: this._color,
          image: this._image,
          repeat: new Cesium.Cartesian2(this._repeat, 1.0),
          time: 0,
        },
        source: Cesium.Material.PolylineTrailLinkSource
      },
      translucent: function () {
        return true
      }
    })
  }
}

//@ts-ignore
new PolylineTrailLinkMaterialProperty()