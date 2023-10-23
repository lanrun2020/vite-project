//雷达扫描波形材质
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
const source = `
float angleFuc(float x2,float y2, float angle) { //计算此位置的角度的弧度值(返回结果是0-2PI)
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
    float mtime = time;
    mtime = reverse ? -mtime : mtime;
    float x = materialInput.st.s;
    float y = materialInput.st.t;
    float dis = sqrt((x-0.5)*(x-0.5) + (y-0.5)*(y-0.5));
    float alpha2 = (dis - (0.5 - outLineWidth/2.0)); //用于计算最外层透明度alpha
    alpha2 = alpha2 > 0.0 ? alpha2 : 0.0;
    float alpha1 = (1.0 - angleFuc(x-0.5,y-0.5,mtime)/(2.0*PI)); //用于计算渐变透明度
    float modValue = mod(alpha1, 1.0/edge);
    modValue = reverse ? (1.0/edge - modValue) : modValue;
    float gradualAlpha = gradual ? modValue : 1.0;
    alpha1 = step(modValue, percent/edge) * gradualAlpha * edge / percent;
    alpha1 = alpha1 > 0.0 ? alpha1 : 0.0;
    float alpha3 = step(0.96*(0.5/radiusLineNumber),mod(dis,0.5/radiusLineNumber)) + step(dis,0.004); //圆心到半径的多层环线
    alpha3 = alpha3 * 0.5 * (sin(mtime*4.0) + 2.0)/2.0; //环线透明度降低一点
    float alpha4 = step(0.98/angleLineNumber, mod(angleFuc(x-0.5,y-0.5,0.0)/(2.0*PI), 1.0/angleLineNumber));
    float a = outLineShow ? (alpha2/(outLineWidth/2.0) + alpha1) : alpha1; //计算最终透明度
    a = radiusLine ? (a + alpha3) : a;
    a = angleLine ? (a + alpha4) : a;
    material.alpha = color.a * a;
    material.diffuse = color.rgb;
    return material;
}
`

const fabric = {
  uniforms: {
    time: 0,
    speed: 1.0,
    color: new Cesium.Color(.1, 1, 0, 1),
    PI: Math.PI,
    edge: 1.0,
    percent: 1.0,
    gradual: true, //是否渐变
    reverse: false, //是否逆向旋转
    outLineShow: false, //是否需要展示椭圆的外围圆圈
    outLineWidth: 0.1, //0-1之间取值，从圆心到半径为1
    radiusLine: false, //以半径划分圆环切割线
    radiusLineNumber: 3,
    angleLine: false, //以角度划分切割线
    angleLineNumber: 3,
  },
  source: source
}

export default class radarMaterialsProperty {
  private material: any
  private _time: number
  constructor() {
    this.material = new Cesium.Material({ fabric, translucent: true })
    this._time = (new Date()).getTime()
  }
  close() {
    this.material.uniforms.close = true
  }
  getMaterial(options?: Options) {
    this.material.uniforms = {...fabric.uniforms, ...options }
    this.material.uniforms.close = false
    this.tick()
    return this.material
  }
  setOptions(options?: Options) {
    this.material.uniforms = { ...this.material.uniforms, ...options }
  }
  tick: Function = () => {
    if (!this.material.uniforms.close) {
      this.material.uniforms.time = ((new Date()).getTime() - this._time) / 500.0 * this.material.uniforms.speed
      Cesium.requestAnimationFrame(this.tick);
    }
  }
}