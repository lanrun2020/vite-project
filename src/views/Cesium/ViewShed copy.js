/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-underscore-dangle */
// ViewShed.js
import Cesium from "@/utils/importCesium"
import flagImg from '../../assets/guoqi.png'
const viewPosition = [121.4991830727844, 31.236923471021075]

function getHeading(fromPosition, toPosition) {
  const finalPosition = new Cesium.Cartesian3()
  const matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
  Cesium.Matrix4.inverse(matrix4, matrix4)
  Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
  Cesium.Cartesian3.normalize(finalPosition, finalPosition)
  return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y))
}

function getPitch(fromPosition, toPosition) {
  const finalPosition = new Cesium.Cartesian3()
  const matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
  Cesium.Matrix4.inverse(matrix4, matrix4)
  Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
  Cesium.Cartesian3.normalize(finalPosition, finalPosition)
  return Cesium.Math.toDegrees(Math.asin(finalPosition.z))
}

/**
 * 可视域分析。
 *
 * @author Jack
 * @alias ViewShedStage
 * @class
 * @param {Cesium.Viewer} viewer Cesium三维视窗。
 * @param {Object} options 选项。
 * @param {Cesium.Cartesian3} options.viewPosition 观测点位置。
 * @param {Cesium.Cartesian3} options.viewPositionEnd 最远观测点位置（如果设置了观测距离，这个属性可以不设置）。
 * @param {Number} options.viewDistance 观测距离（单位`米`，默认值100）。
 * @param {Number} options.viewHeading 航向角（单位`度`，默认值0）。
 * @param {Number} options.viewPitch 俯仰角（单位`度`，默认值0）。
 * @param {Number} options.horizontalViewAngle 可视域水平夹角（单位`度`，默认值90）。
 * @param {Number} options.verticalViewAngle 可视域垂直夹角（单位`度`，默认值60）。
 * @param {Cesium.Color} options.visibleAreaColor 可视区域颜色（默认值`绿色`）。
 * @param {Cesium.Color} options.invisibleAreaColor 不可视区域颜色（默认值`红色`）。
 * @param {Boolean} options.enabled 阴影贴图是否可用。
 * @param {Boolean} options.softShadows 是否启用柔和阴影。
 * @param {Boolean} options.size 每个阴影贴图的大小。
 */
export default class ViewShed {
  constructor(viewer, options = {}) {
    this.viewer = viewer
    // this.viewPosition = options.viewPosition || Cesium.Cartesian3.fromDegrees(99.25, 26.86, 100)
    this.viewPosition = options.viewPosition || Cesium.Cartesian3.fromDegrees(...viewPosition, 0)
    this.viewPositionEnd = options.viewPositionEnd
    this.viewDistance = this.viewPositionEnd ? Cesium.Cartesian3.distance(this.viewPosition, this.viewPositionEnd) : (options.viewDistance || 1300.0)
    this.viewHeading = this.viewPositionEnd ? getHeading(this.viewPosition, this.viewPositionEnd) : (options.viewHeading || 0.0)
    this.viewPitch = this.viewPositionEnd ? getPitch(this.viewPosition, this.viewPositionEnd) : (options.viewPitch || 0.0)
    this.horizontalViewAngle = options.horizontalViewAngle || 90.0
    this.verticalViewAngle = options.verticalViewAngle || 60.0
    this.visibleAreaColor = options.visibleAreaColor || Cesium.Color.GREEN
    this.invisibleAreaColor = options.invisibleAreaColor || Cesium.Color.RED
    this.enabled = (typeof options.enabled === 'boolean') ? options.enabled : true
    this.softShadows = (typeof options.softShadows === 'boolean') ? options.softShadows : true
    this.size = options.size || 2048
    this.VideoShead3D_FS = `
  uniform float czzj;
  uniform float dis;
  uniform float spzj;
  uniform vec3 visibleColor;
  uniform vec3 disVisibleColor;
  uniform float mixNum;
  uniform sampler2D videoTexture;
  uniform sampler2D colorTexture;
  uniform sampler2D stcshadow;
  uniform sampler2D depthTexture;
  uniform mat4 _shadowMap_matrix;
  uniform vec4 shadowMap_lightPositionEC;
  uniform vec4 shadowMap_lightDirectionEC;
  uniform vec3 shadowMap_lightUp;
  uniform vec3 shadowMap_lightDir;
  uniform vec3 shadowMap_lightRight;
  uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
  uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
  varying vec2 v_textureCoordinates;
  vec4 toEye(in vec2 uv, in float depth) {
    vec2 xy = vec2((uv.x * 2.0 - 1.0), (uv.y * 2.0 - 1.0));
    vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0); posInCamera = posInCamera / posInCamera.w; return posInCamera;
  }
  float getDepth(in vec4 depth){
    float z_window = czm_unpackDepth(depth);
    z_window = czm_reverseLogDepth(z_window);
    float n_range = czm_depthRange.near;
    float f_range = czm_depthRange.far;
    return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
  }
  float _czm_sampleShadowMap(sampler2D shadowMap, vec2 uv){
    return texture2D(shadowMap, uv).r;
  }
  float _czm_shadowDepthCompare(sampler2D shadowMap, vec2 uv, float depth){
    return step(depth, _czm_sampleShadowMap(shadowMap, uv));
  }
  float _czm_shadowVisibility(sampler2D shadowMap, czm_shadowParameters shadowParameters){
    float depthBias = shadowParameters.depthBias;
    float depth = shadowParameters.depth;
    float nDotL = shadowParameters.nDotL;
    float normalShadingSmooth = shadowParameters.normalShadingSmooth;
    float darkness = shadowParameters.darkness;
    vec2 uv = shadowParameters.texCoords; depth -= depthBias;
    vec2 texelStepSize = shadowParameters.texelStepSize;
    float radius = 1.0;
    float dx0 = -texelStepSize.x * radius;
    float dy0 = -texelStepSize.y * radius;
    float dx1 = texelStepSize.x * radius;
    float dy1 = texelStepSize.y * radius;
    float visibility = (_czm_shadowDepthCompare(shadowMap, uv, depth) + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy0), depth) + _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy0), depth) + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy0), depth) + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, 0.0), depth) + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, 0.0), depth) + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy1), depth) + _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy1), depth) + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy1), depth)) * (1.0 / 9.0);
    return visibility;
  }
  vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point){
    vec3 v01 = point - planeOrigin;
    float d = dot(planeNormal, v01);
    return (point - planeNormal * d);
  }
  float ptm(vec3 pt){
    return sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z);
  }
  void main(){
    const float PI = 3.141592653589793;
    vec4 color = texture2D(colorTexture, v_textureCoordinates);
    vec4 currD = texture2D(depthTexture, v_textureCoordinates);
    if (currD.r >= 1.0) {
      gl_FragColor = color;
      return;
    }
    float depth = getDepth(currD);
    vec4 positionEC = toEye(v_textureCoordinates, depth);
    vec3 normalEC = vec3(1.0);
    czm_shadowParameters shadowParameters;
    shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
    shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
    shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
    shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
    shadowParameters.depthBias *= max(depth * 0.01, 1.0);
    vec3 directionEC = normalize(positionEC.xyz - shadowMap_lightPositionEC.xyz);
    float nDotL = clamp(dot(normalEC, -directionEC), 0.0, 1.0);
    vec4 shadowPosition = _shadowMap_matrix * positionEC;
    shadowPosition /= shadowPosition.w;
    if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))) {
      gl_FragColor = color; return;
    }
    //坐标与视点位置距离，大于最大距离则舍弃阴影效果
    vec4 lw = czm_inverseView * vec4(shadowMap_lightPositionEC.xyz, 1.0);
    vec4 vw = czm_inverseView * vec4(positionEC.xyz, 1.0);
    if(distance(lw.xyz,vw.xyz)>dis){
      gl_FragColor = color;
      return;
    }
    //水平夹角限制
    vec3 ptOnSP = pointProjectOnPlane(shadowMap_lightUp,lw.xyz,vw.xyz);
    directionEC = ptOnSP - lw.xyz;
    float directionECMO = ptm(directionEC.xyz);
    float shadowMap_lightDirMO = ptm(shadowMap_lightDir.xyz);
    float cosJJ = dot(directionEC,shadowMap_lightDir)/(directionECMO*shadowMap_lightDirMO);
    float degJJ = acos(cosJJ)*(180.0 / PI);
    degJJ = abs(degJJ);
    if(degJJ>spzj/2.0){
      gl_FragColor = color;
      return;
    }
    //垂直夹角限制
    vec3 ptOnCZ = pointProjectOnPlane(shadowMap_lightRight,lw.xyz,vw.xyz);
    vec3 dirOnCZ = ptOnCZ - lw.xyz;
    float dirOnCZMO = ptm(dirOnCZ);
    float cosJJCZ = dot(dirOnCZ,shadowMap_lightDir)/(dirOnCZMO*shadowMap_lightDirMO);
    float degJJCZ = acos(cosJJCZ)*(180.0 / PI);
    degJJCZ = abs(degJJCZ);
    if(degJJCZ>czzj/2.0){
      gl_FragColor = color;
      return;
    }
    shadowParameters.texCoords = shadowPosition.xy;
    shadowParameters.depth = shadowPosition.z;
    shadowParameters.nDotL = nDotL;
    float visibility = _czm_shadowVisibility(stcshadow, shadowParameters);
    vec4 videoColor = texture2D(videoTexture,shadowPosition.xy);
    if(visibility==1.0){
      gl_FragColor = mix(color,vec4(videoColor.xyz,1.0),mixNum*videoColor.a);
    }else{
      if(abs(shadowPosition.z-0.0)<0.01){return;}
      gl_FragColor = color;
    }
  }
  //main函数结束
  `
    this.GLSL = `
    #define USE_CUBE_MAP_SHADOW true
    uniform sampler2D colorTexture;
    uniform sampler2D depthTexture;
    // uniform sampler2D u_map;
    // uniform sampler2D videoTexture;
    varying vec2 v_textureCoordinates;
    uniform mat4 camera_projection_matrix;
    uniform mat4 camera_view_matrix;
    uniform samplerCube shadowMap_textureCube;
    uniform mat4 shadowMap_matrix;
    uniform vec4 shadowMap_lightPositionEC;
    uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
    uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
    uniform float helsing_viewDistance;
    uniform vec4 helsing_visibleAreaColor;
    uniform vec4 helsing_invisibleAreaColor;
    struct zx_shadowParameters
    {
        vec3 texCoords;
        float depthBias;
        float depth;
        float nDotL;
        vec2 texelStepSize;
        float normalShadingSmooth;
        float darkness;
    };
    float czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)
    {
        float depthBias = shadowParameters.depthBias;
        float depth = shadowParameters.depth;
        float nDotL = shadowParameters.nDotL;
        float normalShadingSmooth = shadowParameters.normalShadingSmooth;
        float darkness = shadowParameters.darkness;
        vec3 uvw = shadowParameters.texCoords;
        depth -= depthBias;
        float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
        return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
    }
    vec4 getPositionEC(){
        return czm_windowToEyeCoordinates(gl_FragCoord);
    }
    vec3 getNormalEC(){
        return vec3(1.);
    }
    vec4 toEye(in vec2 uv,in float depth){
        vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));
        vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);
        posInCamera=posInCamera/posInCamera.w;
        return posInCamera;
    }
    vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){
        vec3 v01=point-planeOrigin;
        float d=dot(planeNormal,v01);
        return(point-planeNormal*d);
    }
    float getDepth(in vec4 depth){
        float z_window=czm_unpackDepth(depth);
        z_window=czm_reverseLogDepth(z_window);
        float n_range=czm_depthRange.near;
        float f_range=czm_depthRange.far;
        return(2.*z_window-n_range-f_range)/(f_range-n_range);
    }
    float shadow(in vec4 positionEC){
        vec3 normalEC=getNormalEC();
        zx_shadowParameters shadowParameters;
        shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
        shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
        shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
        shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
        vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;
        float distance=length(directionEC);
        directionEC=normalize(directionEC);
        float radius=shadowMap_lightPositionEC.w;
        if(distance>radius)
        {
            return 2.0;
        }
        vec3 directionWC=czm_inverseViewRotation*directionEC;
        shadowParameters.depth=distance/radius-0.0003;
        shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);
        shadowParameters.texCoords=directionWC;
        float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);
        return visibility;
    }
    bool visible(in vec4 result)
    {
        result.x/=result.w;
        result.y/=result.w;
        result.z/=result.w;
        return result.x>=-1.&&result.x<=1.
        &&result.y>=-1.&&result.y<=1.
        &&result.z>=-1.&&result.z<=1.;
    }
    void main(){
        // 釉色 = 结构二维(颜色纹理, 纹理坐标)
        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);
        // 深度 = 获取深度(结构二维(深度纹理, 纹理坐标))
        float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
        // 视角 = (纹理坐标, 深度)
        vec4 viewPos = toEye(v_textureCoordinates, depth);
        // 世界坐标
        vec4 wordPos = czm_inverseView * viewPos;
        // 虚拟相机中坐标
        vec4 vcPos = camera_view_matrix * wordPos;
        float near = .001 * helsing_viewDistance;
        float dis = length(vcPos.xyz);
        vec4 shadowPosition = shadowMap_matrix * viewPos;
        if(dis > near && dis < helsing_viewDistance){
            // 透视投影
            vec4 posInEye = camera_projection_matrix * vcPos;
            // 可视区颜色
            // vec4 helsing_visibleAreaColor=vec4(0.,1.,0.,.5);
            // vec4 helsing_invisibleAreaColor=vec4(1.,0.,0.,.5);
            if(visible(posInEye)){
                float vis = shadow(viewPos);
                if(vis > 0.3){
                    // vec4 color4 = texture2D(u_map, v_textureCoordinates) * czm_inverseView;
                    // vec4 videoColor = texture2D(videoTexture, shadowPosition.xy);
                    // gl_FragColor = vec4(color4.rgb, .1);
                    // gl_FragColor = mix(color,vec4(videoColor.xyz,1.0),mixNum*videoColor.a);
                    gl_FragColor = mix(gl_FragColor,helsing_visibleAreaColor,.5);
                } else{
                    gl_FragColor = mix(gl_FragColor,helsing_invisibleAreaColor,.5);
                }
            }
        }
    }`
    this.GLSL2 = `
    #define USE_CUBE_MAP_SHADOW true
    uniform sampler2D colorTexture;
    uniform sampler2D depthTexture;
    uniform sampler2D videoTexture;
    varying vec2 v_textureCoordinates;
    uniform mat4 camera_projection_matrix;
    uniform mat4 camera_view_matrix;
    uniform samplerCube shadowMap_textureCube;
    uniform mat4 shadowMap_matrix;
    uniform vec4 shadowMap_lightPositionEC;
    uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
    uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
    uniform float helsing_viewDistance;
    uniform vec4 helsing_visibleAreaColor;
    uniform vec4 helsing_invisibleAreaColor;
    struct zx_shadowParameters
    {
        vec3 texCoords;
        float depthBias;
        float depth;
        float nDotL;
        vec2 texelStepSize;
        float normalShadingSmooth;
        float darkness;
    };
    float czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)
    {
        float depthBias = shadowParameters.depthBias;
        float depth = shadowParameters.depth;
        float nDotL = shadowParameters.nDotL;
        float normalShadingSmooth = shadowParameters.normalShadingSmooth;
        float darkness = shadowParameters.darkness;
        vec3 uvw = shadowParameters.texCoords;
        depth -= depthBias;
        float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
        return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
    }
    vec4 getPositionEC(){
        return czm_windowToEyeCoordinates(gl_FragCoord);
    }
    vec3 getNormalEC(){
        return vec3(1.);
    }
    vec4 toEye(in vec2 uv,in float depth){
        vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));
        vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);
        posInCamera=posInCamera/posInCamera.w;
        return posInCamera;
    }
    vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){
        vec3 v01=point-planeOrigin;
        float d=dot(planeNormal,v01);
        return(point-planeNormal*d);
    }
    float getDepth(in vec4 depth){
        float z_window=czm_unpackDepth(depth);
        z_window=czm_reverseLogDepth(z_window);
        float n_range=czm_depthRange.near;
        float f_range=czm_depthRange.far;
        return(2.*z_window-n_range-f_range)/(f_range-n_range);
    }
    float shadow(in vec4 positionEC){
        vec3 normalEC=getNormalEC();
        zx_shadowParameters shadowParameters;
        shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
        shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
        shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
        shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
        vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;
        float distance=length(directionEC);
        directionEC=normalize(directionEC);
        float radius=shadowMap_lightPositionEC.w;
        if(distance>radius)
        {
            return 2.0;
        }
        vec3 directionWC=czm_inverseViewRotation*directionEC;
        shadowParameters.depth=distance/radius-0.0003;
        shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);
        shadowParameters.texCoords=directionWC;
        float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);
        return visibility;
    }
    bool visible(in vec4 result)
    {
        result.x/=result.w;
        result.y/=result.w;
        result.z/=result.w;
        return result.x>=-1.&&result.x<=1.
        &&result.y>=-1.&&result.y<=1.
        &&result.z>=-1.&&result.z<=1.;
    }
    vec4 toWindowCoords(vec2 texCoord) {
      vec2 windowCoord = (2.0 * gl_FragCoord.xy - czm_viewport.zw) / czm_viewport.zw;
      return vec4(windowCoord, czm_packDepth(czm_pickDepth(windowCoord)), 1.0);
  }
    void main(){
        // 釉色 = 结构二维(颜色纹理, 纹理坐标)
        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);
        // 深度 = 获取深度(结构二维(深度纹理, 纹理坐标))
        float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
        // 视角 = (纹理坐标, 深度)
        vec4 viewPos = toEye(v_textureCoordinates, depth);
        // 世界坐标
        vec4 wordPos = czm_inverseView * viewPos;
        // 虚拟相机中坐标
        vec4 vcPos = camera_view_matrix * wordPos;
        float near = .001 * helsing_viewDistance;
        float dis = length(vcPos.xyz);
        vec4 shadowPosition = shadowMap_matrix * viewPos;
        shadowPosition /= shadowPosition.w;
        if(dis > near && dis < helsing_viewDistance){
            // 透视投影
            vec4 posInEye = camera_projection_matrix * vcPos;
            // vec4 videoColor = texture2D(videoTexture, v_textureCoordinates);
            // gl_FragColor = videoColor;
            // 可视区颜色
            vec4 helsing_visibleAreaColor=vec4(0.,1.,0.,.5);
            vec4 helsing_invisibleAreaColor=vec4(1.,0.,0.,.5);
            if(visible(posInEye)){
                float vis = shadow(viewPos);
                if(vis > 0.3){
                  // 将纹理坐标转换为窗口坐标和深度值
                  vec4 windowCoord = toWindowCoords(v_textureCoordinates);

                  // 将窗口坐标和深度值转换为投影坐标
                  vec4 projectedCoord = czm_windowToDrawingBufferCoordinates(windowCoord);

                  // 计算阴影值
                  float shadowValue = czm_sampleShadowMap(projectedCoord);

                  // 从视频纹理中获取颜色值
                  vec4 videoColor = texture2D(videoTexture, projectedCoord);
                  gl_FragColor =  videoColor;
                } else{
                    gl_FragColor = mix(gl_FragColor,helsing_invisibleAreaColor,.5);
                }
            }
        }
    }`
    this.shaderGL = `
    varying vec2 v_textureCoordinates;
    uniform sampler2D colorTexture;
    uniform sampler2D depthTexture;
    uniform sampler2D shadowMap_texture;
    uniform mat4 shadowMap_matrix;
    uniform vec4 shadowMap_lightPositionEC;
    uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
    uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
    uniform int helsing_textureType;
    uniform sampler2D helsing_texture;
    uniform float helsing_alpha;
    vec4 toEye(in vec2 uv, in float depth){
        vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));
        vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0);
        posInCamera = posInCamera / posInCamera.w;
        return posInCamera;
    }
    float getDepth(in vec4 depth){
        float z_window = czm_unpackDepth(depth);
        z_window = czm_reverseLogDepth(z_window);
        float n_range = czm_depthRange.near;
        float f_range = czm_depthRange.far;
        return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
    }
    float _czm_sampleShadowMap(sampler2D shadowMap, vec2 uv){
        return texture2D(shadowMap, uv).r;
    }
    float _czm_shadowDepthCompare(sampler2D shadowMap, vec2 uv, float depth){
        return step(depth, _czm_sampleShadowMap(shadowMap, uv));
    }
    float _czm_shadowVisibility(sampler2D shadowMap, czm_shadowParameters shadowParameters){
      float depthBias = shadowParameters.depthBias;
      float depth = shadowParameters.depth;
      float nDotL = shadowParameters.nDotL;
      float normalShadingSmooth = shadowParameters.normalShadingSmooth;
      float darkness = shadowParameters.darkness;
      vec2 uv = shadowParameters.texCoords;
      depth -= depthBias;
      vec2 texelStepSize = shadowParameters.texelStepSize;
      float radius = 1.0;
      float dx0 = -texelStepSize.x * radius;
      float dy0 = -texelStepSize.y * radius;
      float dx1 = texelStepSize.x * radius;
      float dy1 = texelStepSize.y * radius;
      float visibility = (
        _czm_shadowDepthCompare(shadowMap, uv, depth)
        + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy0), depth)
        + _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy0), depth)
        + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy0), depth)
        + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, 0.0), depth)
        + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, 0.0), depth)
        + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy1), depth)
        + _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy1), depth)
        + _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy1), depth))
        * (1.0 / 9.0);
      return visibility;
    }
    vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point){
        vec3 v01 = point -planeOrigin;
        float d = dot(planeNormal, v01) ;
        return (point - planeNormal * d);
    }
    void main(){
        const float PI = 3.141592653589793;
        vec4 color = texture2D(colorTexture, v_textureCoordinates);
        vec4 currentDepth = texture2D(depthTexture, v_textureCoordinates);
        if(currentDepth.r >= 1.0){
            gl_FragColor = color;
            return;
        }
        float depth = getDepth(currentDepth);
        vec4 positionEC = toEye(v_textureCoordinates, depth);
        vec3 normalEC = vec3(1.0);
        // 可视区颜色
        vec4 helsing_visibleAreaColor=vec4(0.,1.,0.,.5);
        vec4 helsing_invisibleAreaColor=vec4(1.,0.,0.,.5);
        czm_shadowParameters shadowParameters;
        shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
        shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
        shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
        shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
        shadowParameters.depthBias *= max(depth * 0.01, 1.0);
        vec3 directionEC = normalize(positionEC.xyz - shadowMap_lightPositionEC.xyz);
        float nDotL = clamp(dot(normalEC, -directionEC), 0.0, 1.0);
        vec4 shadowPosition = shadowMap_matrix * positionEC;
        shadowPosition /= shadowPosition.w;
        if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))){
            gl_FragColor = color;
            return;
        }
        shadowParameters.texCoords = shadowPosition.xy;
        shadowParameters.depth = shadowPosition.z;
        shadowParameters.nDotL = nDotL;
        float visibility = _czm_shadowVisibility(shadowMap_texture, shadowParameters);
        if (helsing_textureType < 2){ // 视频或图片模式
          vec4 videoColor = texture2D(helsing_texture, shadowPosition.xy);
          if (visibility == 0.0){
              gl_FragColor =  mix(color, vec4(videoColor.xyz, 1.0), helsing_alpha * videoColor.a);
          }
          else{
              if(abs(shadowPosition.z - 0.0) < 0.01){
                  return;
              }
              gl_FragColor = mix(color, helsing_visibleAreaColor, 0.2);;
          }
      }
      else{ // 可视域模式
          if (visibility == 1.0){
              gl_FragColor = mix(color, helsing_visibleAreaColor, 1.0);
          }
          else{
              if(abs(shadowPosition.z - 0.0) < 0.01){
                  return;
              }
              gl_FragColor = mix(color, helsing_invisibleAreaColor, helsing_alpha);
          }
      }
    }`
    this.update()
  }

  // 加载三维模型
  addTileSet() {
    const tileset = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      url: `${import.meta.env.VITE_BUILD_PATH_PREFIX}/tilesets/buildings/tileset.json`
    }))

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        ...viewPosition,
        10
      ),
      orientation: {
        // 指向
        heading: Cesium.Math.toRadians(0, 0),
        // 视角
        pitch: Cesium.Math.toRadians(-10),
        roll: 0.0
      }
    })
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: {
        conditions: [
          // ['${Height} >= 84', 'rgba(45, 0, 75, 0.5)'],
          ['true', 'rgb(198, 106, 11)']
        ]
      }
    })
    this.tileset = tileset
  }

  // 创建相机
  createLightCamera() {
    this.lightCamera = new Cesium.Camera(this.viewer.scene)
    this.lightCamera.position = this.viewPosition
    // if (this.viewPositionEnd) {
    //     let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(this.viewPositionEnd, this.viewPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    //     this.lightCamera.direction = direction; // direction是相机面向的方向
    // }
    this.lightCamera.frustum.near = this.viewDistance * 0.001
    this.lightCamera.frustum.far = this.viewDistance
    const hr = Cesium.Math.toRadians(this.horizontalViewAngle)
    const vr = Cesium.Math.toRadians(this.verticalViewAngle)
    const aspectRatio =
        (this.viewDistance * Math.tan(hr / 2) * 2) /
        (this.viewDistance * Math.tan(vr / 2) * 2)
    this.lightCamera.frustum.aspectRatio = aspectRatio
    if (hr > vr) {
      this.lightCamera.frustum.fov = hr
    } else {
      this.lightCamera.frustum.fov = vr
    }
    this.lightCamera.setView({
      destination: this.viewPosition,
      orientation: {
        heading: Cesium.Math.toRadians(this.viewHeading || 0),
        pitch: Cesium.Math.toRadians(this.viewPitch || 0),
        roll: 0
      }
    })
  }

  // 创建阴影贴图
  createShadowMap() {
    this.shadowMap = new Cesium.ShadowMap({
      context: (this.viewer.scene).context,
      lightCamera: this.lightCamera,
      enabled: this.enabled,
      isPointLight: true,
      pointLightRadius: this.viewDistance,
      cascadesEnabled: false,
      size: this.size,
      softShadows: this.softShadows,
      normalOffset: false,
      fromLightSource: false
    })
    this.viewer.scene.shadowMap = this.shadowMap
  }

  // 创建PostStage
  createPostStage() {
    const fs = this.GLSL
    // const fs = this.VideoShead3D_FS
    const dom = document.getElementById('myVideo')
    const img = document.getElementById('myImage')
    this.videoTexture = new Cesium.Texture({
      context: this.viewer.scene.context,
      source: dom,
      pixelFormat: Cesium.PixelFormat.RGBA,
      pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE
    })
    const postStage2 = new Cesium.PostProcessStage({
      fragmentShader: fs,
      uniforms: {
        videoTexture: function () {
          return videoTexture;
        },
        shadowMap_textureCube: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          return Reflect.get(this.shadowMap, '_shadowMapTexture')
        },
        shadowMap_matrix: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          return Reflect.get(this.shadowMap, '_shadowMapMatrix')
        },
        shadowMap_lightPositionEC: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          return Reflect.get(this.shadowMap, '_lightPositionEC')
        },
        shadowMap_lightDirectionEC: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          return Reflect.get(this.shadowMap, '_lightDirectionEC')
        },
        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          const bias = this.shadowMap._pointBias
          return Cesium.Cartesian4.fromElements(
            bias.normalOffsetScale,
            this.shadowMap._distance,
            this.shadowMap.maximumDistance,
            0.0,
            new Cesium.Cartesian4()
          )
        },
        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          const bias = this.shadowMap._pointBias
          const scratchTexelStepSize = new Cesium.Cartesian2()
          const texelStepSize = scratchTexelStepSize
          texelStepSize.x = 1.0 / this.shadowMap._textureSize.x
          texelStepSize.y = 1.0 / this.shadowMap._textureSize.y

          return Cesium.Cartesian4.fromElements(
            texelStepSize.x,
            texelStepSize.y,
            bias.depthBias,
            bias.normalShadingSmooth,
            new Cesium.Cartesian4()
          )
        },
        camera_projection_matrix: this.lightCamera.frustum.projectionMatrix,
        camera_view_matrix: this.lightCamera.viewMatrix,
        helsing_viewDistance: () => {
          return this.viewDistance
        },
        helsing_visibleAreaColor: this.visibleAreaColor,
        helsing_invisibleAreaColor: this.invisibleAreaColor
      }
    })
    const postStage4 = new Cesium.PostProcessStage({
      fragmentShader: this.shaderGL,
      uniforms: {
        helsing_textureType: function () {
          return 1.0;
        },
        helsing_texture: function () {
            return that.texture;
        },
        helsing_alpha: function () {
            return .5;
        },
        shadowMap_texture: function () {
          that.shadowMap.update(Reflect.get(that.viewer.scene, '_frameState'))
          return Reflect.get(that.shadowMap, '_shadowMapTexture')
        },
        shadowMap_matrix: function () {
          that.shadowMap.update(Reflect.get(that.viewer.scene, '_frameState'))
          return Reflect.get(that.shadowMap, '_shadowMapMatrix')
        },
        shadowMap_lightPositionEC: function () {
            return shadowMap._lightPositionEC;
        },
        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function () {
            // const t = new Cartesian2;
            // t.x = 1 / this.shadowMap._textureSize.x;
            // t.y = 1 / this.shadowMap._textureSize.y;
            // return Cartesian4.fromElements(t.x, t.y, bias.depthBias, bias.normalShadingSmooth, that.#combinedUniforms1);
            // this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
            const bias = shadowMap._pointBias
            const scratchTexelStepSize = new Cesium.Cartesian2()
            const texelStepSize = scratchTexelStepSize
            texelStepSize.x = 1.0 / shadowMap._textureSize.x
            texelStepSize.y = 1.0 / shadowMap._textureSize.y
            return Cesium.Cartesian4.fromElements(
              texelStepSize.x,
              texelStepSize.y,
              bias.depthBias,
              bias.normalShadingSmooth,
              new Cesium.Cartesian4()
            )
        },
        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function () {
          // this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          const bias = shadowMap._pointBias
          return Cesium.Cartesian4.fromElements(
            bias.normalOffsetScale,
            shadowMap._distance,
            shadowMap.maximumDistance,
            0.0,
            new Cesium.Cartesian4()
          )
            // return Cartesian4.fromElements(bias.normalOffsetScale, that.#shadowMap._distance, that.#shadowMap.maximumDistance, that.#shadowMap._darkness, that.#combinedUniforms2);
        }
      }})
    const postStage = new Cesium.PostProcessStage({
      fragmentShader: fs,
      uniforms: {
        // videoTexture: function () {
        //   return this.videoTexture;
        // },
        shadowMap_textureCube: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          return Reflect.get(this.shadowMap, '_shadowMapTexture')
        },
        shadowMap_matrix: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          return Reflect.get(this.shadowMap, '_shadowMapMatrix')
        },
        shadowMap_lightPositionEC: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          return Reflect.get(this.shadowMap, '_lightPositionEC')
        },
        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          const bias = this.shadowMap._pointBias
          return Cesium.Cartesian4.fromElements(
            bias.normalOffsetScale,
            this.shadowMap._distance,
            this.shadowMap.maximumDistance,
            0.0,
            new Cesium.Cartesian4()
          )
        },
        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          const bias = this.shadowMap._pointBias
          const scratchTexelStepSize = new Cesium.Cartesian2()
          const texelStepSize = scratchTexelStepSize
          texelStepSize.x = 1.0 / this.shadowMap._textureSize.x
          texelStepSize.y = 1.0 / this.shadowMap._textureSize.y

          return Cesium.Cartesian4.fromElements(
            texelStepSize.x,
            texelStepSize.y,
            bias.depthBias,
            bias.normalShadingSmooth,
            new Cesium.Cartesian4()
          )
        },
        camera_projection_matrix: this.lightCamera.frustum.projectionMatrix,
        camera_view_matrix: this.lightCamera.viewMatrix,
        helsing_viewDistance: () => {
          return this.viewDistance
        },
        helsing_visibleAreaColor: this.visibleAreaColor,
        helsing_invisibleAreaColor: this.invisibleAreaColor
      }
    })
    this.postStage = this.viewer.scene.postProcessStages.add(postStage)
  }

  // 创建视锥线
  drawFrustumOutline() {
    const scratchRight = new Cesium.Cartesian3()
    const scratchRotation = new Cesium.Matrix3()
    const scratchOrientation = new Cesium.Quaternion()
    // const position = this.lightCamera.positionWC
    const direction = this.lightCamera.directionWC
    const up = this.lightCamera.upWC
    let right = this.lightCamera.rightWC
    right = Cesium.Cartesian3.negate(right, scratchRight)
    const rotation = scratchRotation
    Cesium.Matrix3.setColumn(rotation, 0, right, rotation)
    Cesium.Matrix3.setColumn(rotation, 1, up, rotation)
    Cesium.Matrix3.setColumn(rotation, 2, direction, rotation)
    const orientation = Cesium.Quaternion.fromRotationMatrix(rotation, scratchOrientation)

    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.FrustumOutlineGeometry({
        frustum: this.lightCamera.frustum,
        origin: this.viewPosition,
        orientation
      }),
      id: Math.random().toString(36).substr(2),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.YELLOWGREEN// new Cesium.Color(0.0, 1.0, 0.0, 1.0)
        ),
        show: new Cesium.ShowGeometryInstanceAttribute(true)
      }
    })

    this.frustumOutline = this.viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: [instance],
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true,
          translucent: false
        })
      })
    )
  }

  // 创建视网
  drawSketch() {
    this.sketch = this.viewer.entities.add({
      name: 'sketch',
      position: this.viewPosition,
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        this.viewPosition,
        Cesium.HeadingPitchRoll.fromDegrees(this.viewHeading - this.horizontalViewAngle, this.viewPitch, 0.0)
      ),
      ellipsoid: {
        radii: new Cesium.Cartesian3(
          this.viewDistance,
          this.viewDistance,
          this.viewDistance
        ),
        // innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0),
        minimumClock: Cesium.Math.toRadians(-this.horizontalViewAngle / 2),
        maximumClock: Cesium.Math.toRadians(this.horizontalViewAngle / 2),
        minimumCone: Cesium.Math.toRadians(this.verticalViewAngle + 7.75),
        maximumCone: Cesium.Math.toRadians(180 - this.verticalViewAngle - 7.75),
        fill: false,
        outline: true,
        subdivisions: 256,
        stackPartitions: 64,
        slicePartitions: 64,
        outlineColor: Cesium.Color.YELLOWGREEN
      }
    })
  }

  add() {
    this.createLightCamera()
    this.createShadowMap()
    this.createPostStage()
    this.drawFrustumOutline()
    this.drawSketch()
    // this.addTileSet()
  }

  update() {
    this.clear()
    this.add()
  }

  clear() {
    if (this.sketch) {
      this.viewer.entities.removeById(this.sketch.id)
      this.sketch = null
    }
    if (this.postStage) {
      this.viewer.scene.postProcessStages.remove(this.postStage)
      this.postStage = null
    }
    if (this.frustumOutline) {
      this.viewer.scene.primitives.remove(this.frustumOutline)
      this.frustumOutline = null
    }
    if (this.tileset) {
      this.viewer.scene.primitives.remove(this.tileset)
      this.tileset = null
    }
  }
}
