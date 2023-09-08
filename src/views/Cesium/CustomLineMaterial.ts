// 线材质
import Cesium from '@/utils/importCesium'
import redimg from '../../assets/ts.png'
export default class CustomLineMaterialProperty {
  private _color: object
  private _speed: number
  private _thickness: number
  private _definitionChanged: any
  private duration: number
  private _time: number
  constructor(options?: { color?: object, duration?: number, speed?: number, thickness?: number }) {
    this._definitionChanged = new Cesium.Event()
    this._color = options?.color || new Cesium.Color(0.0, 0.0, 1.0, 1.0)
    this.duration = options?.duration || 10000
    this._time = (new Date()).getTime()
    this._speed = options?.speed || 1.0
    this._thickness = options?.thickness || 0.5
    this.conbineProp()
    this.init()
  }
  getType() {
    return 'Customline'
  }
  getValue(time: object, result: any) {
    if (!Cesium.defined(result)) {
      result = {}
    }
    result.color = this._color
    result.thickness = this._thickness
    result.duration = this.duration
    result.speed = this._speed
    result.color = this._color
    result.image = Cesium.Material.CustomLineImage
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration * this._speed
    return result
  }
  equals(other: object) {
    return this === other
  }
  conbineProp() {
    Object.defineProperties(CustomLineMaterialProperty.prototype, {
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
    Cesium.CustomLineMaterialProperty = CustomLineMaterialProperty
    Cesium.Material.CustomLineType = 'Customline'
    Cesium.Material.CustomLineImage = redimg // 图片
    Cesium.Material.CustomLineSource =
       `uniform vec4 color;
        uniform vec4 gapColor;
        uniform float dashLength;
        uniform float dashPattern;
        const float maskLength = 16.0;
        varying float v_polylineAngle;
        mat2 rotate(float rad) {
            float c = cos(rad);
            float s = sin(rad);
            return mat2(
                c, s,
                -s, c
            );
        }
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
            czm_material material = czm_getDefaultMaterial(materialInput);
            vec2 pos = rotate(v_polylineAngle) * gl_FragCoord.xy;
            // 获取破折号内从0到1的相对位置
            float dashPosition = fract(pos.x / (dashLength * czm_pixelRatio));//像素长度*单位像素比例
            // dashPosition 区间为 0-1
            // Figure out the mask index.
            float maskIndex = floor(dashPosition * maskLength);//向下取整,0-16整数
            // Test the bit mask.
            // dashPattern = 255,虚线样式, pow(2.0, maskIndex) 0-256整数
            float maskTest = floor(dashPattern / pow(2.0, maskIndex));//向下取整,255-0
            //mod取余数 0-2 0-2 0-2循环
            vec2 st = materialInput.st;
            vec4 colorImage = texture2D(image, vec2(st.s*mod(maskTest, 2.0), st.t));//0.1取下,0.9取上
            vec4 fragColor = (mod(maskTest, 2.0) < 1.0) ? gapColor : (colorImage);
            if (fragColor.a < 0.005) {   // matches 0/255 and 1/255
                discard;
            }
            fragColor = czm_gammaCorrect(fragColor);
            material.emission = fragColor.rgb;
            material.alpha = fragColor.a;
            return material;
        }`
    Cesium.Material._materialCache.addMaterial(Cesium.Material.CustomLineType, {
      fabric: {
        type: Cesium.Material.CustomLineType,
        uniforms: {
          thickness: this._thickness,
          time: 0,
          dashLength: 100,
          dashPattern: 255,
          gapColor: Cesium.Color.TRANSPARENT,
          color: this._color,
          image: '',
        },
        source: Cesium.Material.CustomLineSource
      },
      translucent: function () {
        return true
      }
    })
  }
}

new CustomLineMaterialProperty()