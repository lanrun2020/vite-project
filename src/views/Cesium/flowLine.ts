import redimg from '../../assets/redLine.png'
import Cesium from '@/utils/importCesium'

export function initPolylineTrailLinkMaterialProperty () {
  function PolylineTrailLinkMaterialProperty (this: any, color:object, duration:number, U?:object) {
    this._definitionChanged = new Cesium.Event()
    this._color = U
    this._colorSubscription = U
    this.color = color
    this.duration = duration
    //    this._time = new Date().getTime()
    this._time = performance.now()
  }
  Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
    isConstant: {
      get: function () {
        return false
      }
    },
    definitionChanged: {
      get: function () {
        return this._definitionChanged
      }
    },
    color: Cesium.createPropertyDescriptor('color')
  })
  PolylineTrailLinkMaterialProperty.prototype.getType = function () {
    return 'PolylineTrailLink'
  }
  PolylineTrailLinkMaterialProperty.prototype.getValue = function (time:object, result:any) {
    if (!Cesium.defined(result)) {
      result = {}
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color)
    result.image = Cesium.Material.PolylineTrailLinkImage
    //    result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration
    result.time = ((performance.now() - this._time) % this.duration) / this.duration
    return result
  }
  PolylineTrailLinkMaterialProperty.prototype.equals = function (other:{_color:any}) {
    return this === other || (other instanceof PolylineTrailLinkMaterialProperty && Cesium.Property.equals(this._color, other._color))
  }
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