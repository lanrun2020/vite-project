//雷达扫描波形材质
import Cesium from '@/utils/importCesium'
interface Options {
  v_color?: typeof Cesium.Color,
  repeat?: number,
  thickness?: number,
  speed?: number,
  time?: number,
}
const v = `
attribute vec3 position3DHigh;
attribute vec3 position3DLow;
attribute vec2 st;
attribute float batchId;
varying float dis;
varying vec2 v_st;
varying vec2 f_dis;
varying vec3 v_positionEC;
float cartesianToGeographic(vec3 cartesian)
{
    vec3 inverseRadii = czm_ellipsoidInverseRadii;
    float radiix = 1.0/inverseRadii.x;
    float radiiy = 1.0/inverseRadii.y;
    float radiiz = 1.0/inverseRadii.z;
    float scale = sqrt( 1.0 / (cartesian.x * cartesian.x / (radiix * radiix) + cartesian.y * cartesian.y / (radiiy * radiiy) + cartesian.z * cartesian.z / (radiiz * radiiz)));
    vec3 pos = scale * cartesian;
    float dis = distance(cartesian, pos);
    return dis;
}
void main()
{
    //czm_computePosition 返回模型坐标相对于眼睛的位置
    vec4 p = czm_computePosition(); //使用czm_computePosition必须要使用---> position3DHigh,position3DLow,batchId;
    v_positionEC = (czm_modelViewRelativeToEye * p).xyz; //模型坐标转眼睛坐标
    vec4 pos = czm_inverseModelView * vec4(v_positionEC, 1.0);//眼睛坐标转换到模型坐标
    float height = cartesianToGeographic(pos.xyz);
    gl_Position = czm_modelViewProjectionRelativeToEye * p;
}`
const f = `
varying vec3 v_positionEC;
uniform vec4 v_color;
uniform float time;
uniform float repeat;
uniform float thickness;
uniform float fromCartesian;
float cartesianToGeographic(vec3 cartesian)
{
    vec3 inverseRadii = czm_ellipsoidInverseRadii;
    float radiix = 1.0/inverseRadii.x;
    float radiiy = 1.0/inverseRadii.y;
    float radiiz = 1.0/inverseRadii.z;
    float scale = sqrt( 1.0 / (cartesian.x * cartesian.x / (radiix * radiix) + cartesian.y * cartesian.y / (radiiy * radiiy) + cartesian.z * cartesian.z / (radiiz * radiiz)));
    vec3 pos = scale * cartesian;
    float dis = distance(cartesian, pos);
    return dis;
}
void main()
{
    vec4 color = v_color;
    vec4 pos = czm_inverseModelView * vec4(v_positionEC, 1.0);//眼睛坐标转换到模型坐标
    float height = cartesianToGeographic(pos.xyz) /100000.0;
    float sp = 1.0/5.0;\n
    float dis = height - fract(time);\n
    float m = mod(dis, sp);\n
    float a = step(sp*(1.0-0.5), m);\n
    if(height<0.01){
      discard;
    }
    gl_FragColor = vec4(color.xyz,color.w * a * (1.0 - height) );
}`
const uniforms:Options = {
    v_color: new Cesium.Color(.1, 1, 0, 1),
    speed: 1,
    time: 0,
    thickness: 0.5,
    repeat: 5,
}

export default class radarMaterialsProperty {
  private appearance: any
  private _time: number
  constructor() {
    this.appearance = new Cesium.MaterialAppearance({
      faceForward: false,
      closed: true,
      translucent: false,
      vertexShaderSource: v,
      fragmentShaderSource: f,
    })
    this._time = (new Date()).getTime()
  }
  close() {
    this.appearance.uniforms.close = true
  }
  getAppearance(options?: Options) {
    this.appearance.uniforms = {...uniforms, ...options }
    this.appearance.uniforms.close = false
    this.appearance.setOptions = this.setOptions.bind(this)
    this.tick()
    return this.appearance
  }
  setOptions(options?: Options) {
    Object.keys(options).forEach(key => {
      this.appearance.uniforms[key] = options[key]
    })
  }
  tick: Function = () => {
    if (!this.appearance.uniforms.close) {
      this.appearance.uniforms.time = ((new Date()).getTime() - this._time) / 4000.0 * this.appearance.uniforms.speed
      Cesium.requestAnimationFrame(this.tick);
    }
  }
}