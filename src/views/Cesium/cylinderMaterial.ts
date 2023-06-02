//圆柱体材质
import Cesium from '@/utils/importCesium'

interface Options {
  color?: typeof Cesium.Color,
  duration?: number,
  speed?: number,
  edge?: number,
  percent?: number,
  reverse?: boolean
  gradual?: boolean,
}

export default class CylinderWallMaterialProperty {
  private _color: object //颜色及透明度
  private _speed: number //旋转速度
  private _edge: number //扇形数量
  private _percent: number //颜色占比
  private _gradual: boolean //是否渐变
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
    this.conbineProp()
    this.init()
  }
  getType() {
    return 'CylinderWall'
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
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration * this._speed
    return result
  }
  equals(other: object) {
    return this === other
  }
  conbineProp() {
    Object.defineProperties(CylinderWallMaterialProperty.prototype, {
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
    Cesium.CylinderWallMaterialProperty = CylinderWallMaterialProperty
    Cesium.Material.CylinderWallType = 'CylinderWall'
    Cesium.Material.CylinderWallSource =
      // eslint-disable-next-line no-multi-str
      `float angleFuc(float x2,float y2, float angle) { //计算此位置的角度的弧度值(返回结果是0-2PI)
        //atan()函数 第一象限是0至PI/2,第二象限是-PI/2至0,第三象限是0至PI/2,第四象限是-PI/2至0
        float x = x2 * cos(angle) - y2 * sin(angle);
        float y = x2 * sin(angle) + y2 * cos(angle);
        if(x>0.0){
          if(y<0.0){
            return atan(y/x) + 2.0*PI; //第四象限,返回[3*PI/2,2PI]
          }
          if(y>0.0){
            return atan(y/x); //第一象限,返回[0,PI/2]
          }
        }else{
          if(x<0.0){
            return atan(y/x)+PI; //第二三象限,返回[PI/2,3PI/2]
          }else{ //x=0即在y轴上时
            if(y>0.0){ //y轴正半轴
              return PI/2.0;
            }else{
              if(y<0.0){ //y轴负半轴
                return 3.0*PI/2.0;
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
          float alpha1 = (1.0 - angleFuc(x-0.5,y-0.5,time)/(2.0*PI)); //用于计算渐变透明度
          float modValue = mod(alpha1, 1.0/edge);
          modValue = reverse ? (1.0/edge - modValue) : modValue;
          float gradualAlpha = gradual ? modValue : 1.0;
          alpha1 = step(modValue, percent/edge) * gradualAlpha * edge / percent;
          alpha1 = alpha1 > 0.0 ? alpha1 : 0.0;
          float a2 = 0.0;
          if(dis > 0.499){
            a2 = 1.0;
          }
          material.alpha = color.a * alpha1 * a2;
          material.diffuse = color.rgb;
          return material;
      }`
    // material.alpha:透明度;
    // material.diffuse：颜色;
    // fract(x) 返回 x 的小数部分
    Cesium.Material._materialCache.addMaterial(Cesium.Material.CylinderWallType, {
      fabric: {
        type: Cesium.Material.CylinderWallType,
        uniforms: {
          color: this._color,
          PI: Math.PI,
          edge: this._edge,
          speed: this._speed,
          percent: this._percent,
          gradual: this._gradual, //是否渐变
          reverse: this._reverse, //是否逆向旋转
        },
        source: Cesium.Material.CylinderWallSource
      },
      translucent: function () {
        return true
      }
    })
  }
}

new CylinderWallMaterialProperty()