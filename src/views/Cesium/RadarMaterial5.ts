//雷达扫描波形材质
import Cesium from '@/utils/importCesium'
interface Options {
  v_color?: typeof Cesium.Color,
  v_center?: typeof Cesium.Cartesian3,
  v_radius?: number,
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
uniform vec3 v_center;
varying float dis;
varying vec2 v_st;
varying vec2 f_dis;
varying vec3 v_positionEC;
void main()
{
    vec4 p = czm_computePosition(); //使用czm_computePosition必须要使用---> position3DHigh,position3DLow,batchId;
    v_positionEC = (czm_modelViewRelativeToEye * p).xyz;
    gl_Position = czm_modelViewProjectionRelativeToEye * p;
}`
const f = `
uniform vec3 v_center;
varying vec3 v_positionEC;
uniform float v_radius;
uniform vec4 v_color;
uniform float time;
uniform float repeat;
uniform float thickness;
void main()
{
    vec4 color = v_color;
    vec4 pos = czm_inverseModelView3D * vec4(v_positionEC, 1.0);
    float dis = distance(vec4(v_center,1.0),pos);
    float sp = 1.0/repeat;
    float d = 1.0 - dis/v_radius;//1~0范围内
    float m = mod(d + time, sp);
    float a = step(m, sp*thickness)+0.01;//这里加上0.01是保证颜色透明度最低不等于0,这样鼠标才可以拾取到透明度为0的部分
    gl_FragColor = vec4(1.0,0.0,0.0, a * d);
    // gl_FragColor = vec4(1.0,0.0,0.0, 1.0);
}`

const uniforms:Options = {
    v_color: new Cesium.Color(.1, 1, 0, 1),
    v_radius: 1,
    v_center: new Cesium.Cartesian3.fromDegrees(0,0,0),
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
      faceForward: !1, closed: !0,
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