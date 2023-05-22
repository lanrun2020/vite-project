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
  outLineWidth?: number,
  radiusLine?: boolean,
  radiusLineNumber?: number,
  angleLine?: boolean,
  angleLineNumber?: number,
}

export default class RotationMaterialProperty {
  private _color: object //颜色及透明度
  private _speed: number //旋转速度
  private _edge: number //扇形数量
  private _percent: number //颜色占比
  private _gradual: boolean //是否渐变
  private _outLineShow: boolean //是否展示圆环
  private _outLineWidth: number //圆环宽度
  private _radiusLine: boolean //半径刻度线，从圆心向外分层级
  private _radiusLineNumber: number //分段数量
  private _angleLine: boolean //角度线，按角度划分
  private _angleLineNumber: number //角度线，按角度划分
  private _reverse: boolean //逆向旋转
  private _definitionChanged: any
  private duration: number
  private _time: number
  constructor(options?: Options) {
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
    this._radiusLine = options?.radiusLine ?? false
    this._radiusLineNumber = options?.radiusLineNumber ?? 5.0
    this._angleLine = options?.angleLine ?? false
    this._angleLineNumber = options?.angleLineNumber ?? 5.0
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
    result.radiusLine = this._radiusLine
    result.radiusLineNumber = this._radiusLineNumber
    result.angleLine = this._angleLine
    result.angleLineNumber = this._angleLineNumber
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
      `float angleFuc(float x2,float y2, float angle) { //计算此位置的角度的弧度值
        float x = x2 * cos(angle) - y2 * sin(angle);
        float y = x2 * sin(angle) + y2 * cos(angle);
        if(x>0.0){
          if(y<0.0){
            return atan(y/x) + 2.0*PI; //四象限
          }
          if(y>0.0){
            return atan(y/x); //第一象限
          }
        }else{
          if(x<0.0){
            return atan(y/x)+PI; //第二三象限
          }else{ //x=0即在y轴上时
            if(y>0.0){ //y轴正半轴
              return PI/2.0;
            }else{
              if(y<0.0){ //y轴负半轴
                return -PI/2.0;
              }else{ //x=0,y=0
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
          float alpha2 = (dis - (0.5 - outLineWidth/2.0)); //用于计算最外层透明度alpha
          alpha2 = alpha2 > 0.0 ? alpha2 : 0.0;
          float alpha1 = (1.0 - angleFuc(x-0.5,y-0.5,time)/(2.0*PI)); //用于计算渐变透明度
          float modValue = mod(alpha1, 1.0/edge);
          modValue = reverse ? (1.0/edge - modValue) : modValue;
          float gradualAlpha = gradual ? modValue : 1.0;
          alpha1 = step(modValue, percent/edge) * gradualAlpha * edge / percent;
          alpha1 = alpha1 > 0.0 ? alpha1 : 0.0;
          float alpha3 = step(0.96*(0.5/radiusLineNumber),mod(dis,0.5/radiusLineNumber)) + step(dis,0.004); //圆心到半径的多层环线
          alpha3 = alpha3 * 0.6; //环线透明度降低一点
          float alpha4 = step(0.98/angleLineNumber, mod(angleFuc(x-0.5,y-0.5,0.0)/(2.0*PI), 1.0/angleLineNumber));
          float a = outLineShow ? (alpha2/(outLineWidth/2.0) + alpha1) : alpha1; //计算最终透明度
          a = radiusLine ? (a + alpha3) : a;
          a = angleLine ? (a + alpha4) : a;
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
          radiusLine: this._radiusLine,
          radiusLineNumber: this._radiusLineNumber,
          angleLine: this._angleLine,
          angleLineNumber: this._angleLineNumber,
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