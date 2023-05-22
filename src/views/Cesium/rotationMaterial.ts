//圆的多页扇形旋转扫描
import Cesium from '@/utils/importCesium'

interface Options {
  color?: typeof Cesium.Color,
  duration?: number,
  speed?: number,
  edge?: number,
  percent?: number,
  reverse?: boolean
  gradual?: boolean,
  outLineShow?: boolean,
  outLineWidth?: number
}

export default class RotationMaterialProperty {
  private _color: object //颜色及透明度
  private _speed: number //旋转速度
  private _edge: number //扇形数量
  private _percent: number //颜色占比
  private _gradual: boolean //是否渐变
  private _outLineShow: boolean //是否展示圆环
  private _outLineWidth: number //圆环宽度
  private _reverse: boolean //逆向旋转
  private _definitionChanged: any
  private duration: number
  private _time: number
  constructor(options?: Options){
    this._definitionChanged = new Cesium.Event()
    this._color = options?.color ?? new Cesium.Color(0.0, 0.0, 1.0, 1.0)
    this.duration = options?.duration ?? 10000
    this._time = (new Date()).getTime()
    this._speed = options?.speed ?? 1.0
    this._edge = options?.edge ?? 1.0
    this._percent = options?.percent ?? 1.0
    this._gradual = options?.gradual ?? true
    this._reverse = options?.reverse ?? false
    this._outLineShow = options?.outLineShow ?? true
    this._outLineWidth = options?.outLineWidth ?? 0.01
    this.conbineProp()
    this.init()
  }
  getType() {
    return 'Rotation'
  }
  getValue(time: object, result: any) {
    if (!Cesium.defined(result)) {
      result = {}
    }
    result.color = this._color
    result.duration = this.duration
    result.speed = this._speed
    result.edge = this._edge
    result.percent = this._percent
    result.reverse = this._reverse
    result.gradual = this._gradual
    result.outLineShow = this._outLineShow
    result.outLineWidth = this._outLineWidth
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration * this._speed
    return result
  }
  equals(other: object) {
    return this === other
  }
  conbineProp() {
    Object.defineProperties(RotationMaterialProperty.prototype, {
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
    Cesium.RotationMaterialProperty = RotationMaterialProperty
    Cesium.Material.RotationType = 'Rotation'
    Cesium.Material.RotationSource =
      // eslint-disable-next-line no-multi-str
      `float eagleFuc(float x2,float y2, float eagle) { //计算此位置的角度的弧度值
        float x = x2 * cos(eagle) - y2 * sin(eagle);
        float y = x2 * sin(eagle) + y2 * cos(eagle);
        if(x>0.0){
          if(y<0.0){
            return atan(y/x) + 2.0*PI;
          }
          if(y>0.0){
            return atan(y/x);
          }
        }else{
          if(x<0.0){
            return atan(y/x)+PI;
          }else{
            if(y>0.0){
              return PI/2.0;
            }else{
              if(y<0.0){
                return -PI/2.0;
              }else{
                return 0.0;
              }
            }
          }
        }
      }
      czm_material czm_getMaterial(czm_materialInput materialInput)
      {
          czm_material material = czm_getDefaultMaterial(materialInput);
          float time = czm_frameNumber * speed * 0.05;
          time = reverse ? -time : time;
          float x = materialInput.st.s;
          float y = materialInput.st.t;
          float dis = sqrt((x-0.5)*(x-0.5) + (y-0.5)*(y-0.5));
          float alpha2 = (dis - (0.5 - outLineWidth/2.0));
          alpha2 = alpha2 > 0.0 ? alpha2 : 0.0;
          float alpha1 = (1.0 - eagleFuc(x-0.5,y-0.5,time)/(2.0*PI));
          float modValue = mod(alpha1, 1.0/edge);
          modValue = reverse ? (1.0/edge - modValue) : modValue;
          float gradualAlpha = gradual ? modValue : 1.0;
          alpha1 = step(modValue, percent/edge) * gradualAlpha * edge / percent;
          alpha1 = alpha1 > 0.0 ? alpha1 : 0.0;
          float a = outLineShow ? (alpha2/(outLineWidth/2.0) + alpha1) : alpha1;
          material.alpha = color.a * a;
          material.diffuse = color.rgb;
          return material;
      }`
    // material.alpha:透明度;
    // material.diffuse：颜色;
    // fract(x) 返回 x 的小数部分
    Cesium.Material._materialCache.addMaterial(Cesium.Material.RotationType, {
      fabric: {
        type: Cesium.Material.RotationType,
        uniforms: {
          color: this._color,
          PI: Math.PI,
          edge: this._edge,
          speed: this._speed,
          percent: this._percent,
          gradual: this._gradual, //是否渐变
          reverse: this._reverse, //是否逆向旋转
          outLineShow: this._outLineShow, //是否需要展示椭圆的外围圆圈
          outLineWidth: this._outLineWidth, //0-1之间取值，从圆心到半径为1
        },
        source: Cesium.Material.RotationSource
      },
      translucent: function () {
        return true
      }
    })
  }
}

new RotationMaterialProperty()