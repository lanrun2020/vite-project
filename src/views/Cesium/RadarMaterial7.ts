//扇形扩散扫描
import Cesium from '@/utils/importCesium'
interface Options {
  color?: typeof Cesium.Color,
  duration?: number,
  speed?: number,
  reverse?: boolean,
  reverseColor?: boolean,
  repeat?: number,
  thickness?: number,
  angleStart?: number,
  angleEnd?: number,
  time?: number,
  PI?:  number,
}
const source = `
float angleFuc(float x2,float y2) { //计算此位置的角度的弧度值(返回结果是0-2PI)
  //此方法返回的是从正北开始顺时针计算的角度
  //atan()函数 第一象限是0至PI/2,第二象限是-PI/2至0,第三象限是0至PI/2,第四象限是-PI/2至0
  float x = x2 ;
  float y = y2 ;
  if(x>0.0){
    if(y<0.0){
      return atan(-y/x) + PI/2.0; //第四象限,返回[3*PI/2,2PI]
    }
    if(y>0.0){
      return atan(x/y); //第一象限,返回[0,PI/2]
    }
  }else{
    if(x<0.0){
      if(y<0.0){
        return atan(x/y)+PI; //第三象限,返回[PI/2,3PI/2]
      }
      if(y>0.0){
        return atan(y/-x)+3.0*PI/2.0; //第二象限,返回[PI/2,3PI/2]
      }
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
    float mtime = reverse ? -time : time;
    float x = materialInput.st.s;
    float y = materialInput.st.t;
    float dis = sqrt((x-0.5)*(x-0.5) + (y-0.5)*(y-0.5))*2.0; //范围0到1
    float alpha1 = angleFuc(x-0.5,y-0.5)/(2.0*PI); //用于计算渐变透明度
    if(alpha1>=angleStart/360.0 && alpha1<=angleEnd/360.0){ //控制显示角度范围
      alpha1 = 1.0;
    }else{
      alpha1 = 0.0;
    }
    float alpha3 = step(mod(dis-mtime,1.0/repeat),thickness*(1.0/repeat)) + 0.01; //圆心到半径分段
    alpha3 = reverseColor? alpha3 * dis : alpha3 * (1.0 - dis);
    float a = (alpha1 * alpha3);
    a = clamp(a,0.0,1.0);
    if(a == 0.0){
      discard;
    }
    material.alpha = color.a * a;
    if (czm_sceneMode == czm_sceneMode2D ||czm_sceneMode== czm_sceneModeColumbusView){//在2D或2.5D模式下颜色需要扩展到255,否则颜色会比较暗淡
      material.diffuse = color.rgb*2.0;
    } else {
      material.diffuse = color.rgb;
    }
    return material;
}
`


  const uniforms:Options = {
    time: 0,
    speed: 1.0,
    color: new Cesium.Color(0, 1, 0, 1),
    PI: Math.PI,
    reverse: false, //扩散方向反转
    reverseColor: false,//颜色反转
    repeat: 3,
    thickness: 0.5,
    angleStart: 0.0,
    angleEnd: 360.0,
  }


export default class radarMaterialsProperty {
  private appearance: any
  private _time: number
  constructor() {
    this.appearance = new Cesium.MaterialAppearance({
      material: new Cesium.Material({
        fabric: {
          uniforms,
          source
        },
        translucent: true
      }),
      faceForward: false,
      closed: !0,
    })
    this._time = (new Date()).getTime()
  }
  close() {
    this.appearance.material.uniforms.close = true
  }
  getAppearance(options?: Options) {
    this.appearance.material.uniforms = {...uniforms, ...options }
    this.appearance.material.uniforms.close = false
    this.appearance.setOptions = this.setOptions.bind(this)
    this.tick()
    return this.appearance
  }
  setOptions(options?: Options) {
    Object.keys(options).forEach(key => {
      this.appearance.material.uniforms[key] = options[key]
    })
  }
  tick: Function = () => {
    if (!this.appearance.material.uniforms.close) {
      this.appearance.material.uniforms.time = ((new Date()).getTime() - this._time) / 4000.0 * this.appearance.material.uniforms.speed
      Cesium.requestAnimationFrame(this.tick);
    }
  }
}