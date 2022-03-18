import redimg from '../../assets/redLine.png'
const Cesium = window.Cesium

export default class PolylineTrailLinkMaterialProperty {
  private _color: object | undefined
  private _definitionChanged: any
  private _colorSubscription: object | undefined
  duration: number
  private _time: number
  constructor(color: object, duration: number,d:number, U?: object) {
    this._definitionChanged = new Cesium.Event()
    this._colorSubscription = U
    this._color = color
    this.duration = duration
    this._time = (new Date()).getTime()
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
    result.image = Cesium.Material.PolylineTrailLinkImage
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration
    
    return result
  }
  equals(other) {
    return this === other || (other instanceof PolylineTrailLinkMaterialProperty && Cesium.Property.equals(this._color, other._color))
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
    Cesium.Material.PolylineTrailLinkImage = redimg // 图片
    Cesium.Material.PolylineTrailLinkSource =
      // eslint-disable-next-line no-multi-str
      'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
      {\n\
          czm_material material = czm_getDefaultMaterial(materialInput);\n\
          vec2 st = materialInput.st;\n\
          vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
          material.alpha = colorImage.a * color.a;\n\
          material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
          return material;\n\
      }'
    // material.alpha:透明度;
    // material.diffuse：颜色;
    Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
      fabric: {
        type: Cesium.Material.PolylineTrailLinkType,
        uniforms: {
          color: new Cesium.Color(0.0, 0.0, 0.0, 0.5),
          image: '',
          time: 0
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