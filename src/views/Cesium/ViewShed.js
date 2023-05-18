/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-underscore-dangle */
// ViewShed.js
import Cesium from "@/utils/importCesium"
const viewPosition = [121.5061830727844, 31.22923471021075, 50]

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
    this.viewPosition = options.viewPosition || Cesium.Cartesian3.fromDegrees(...viewPosition)
    this.viewPositionEnd = options.viewPositionEnd
    this.viewDistance = this.viewPositionEnd ? Cesium.Cartesian3.distance(this.viewPosition, this.viewPositionEnd) : (options.viewDistance || 300.0)
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
    uniform float mixNum;
    uniform sampler2D colorTexture;
    uniform sampler2D stcshadow;
    uniform sampler2D videoTexture;
    uniform sampler2D depthTexture;
    uniform mat4 _shadowMap_matrix;
    uniform vec4 shadowMap_lightPositionEC;
    uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
    uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
    varying vec2 v_textureCoordinates;
    vec4 toEye(in vec2 uv, in float depth){
        vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));
        vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);
        posInCamera =posInCamera / posInCamera.w;
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
        _czm_shadowDepthCompare(shadowMap, uv, depth) +
        _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy0), depth) +
        _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy0), depth) +
        _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy0), depth) +
        _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, 0.0), depth) +
        _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, 0.0), depth) +
        _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy1), depth) +
        _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy1), depth) +
        _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy1), depth)
        ) * (1.0 / 9.0);
        return visibility;
    }
    vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point){
        vec3 v01 = point -planeOrigin;
        float d = dot(planeNormal, v01) ;
        return (point - planeNormal * d);
    }
    float ptm(vec3 pt){
        return sqrt(pt.x*pt.x + pt.y*pt.y + pt.z*pt.z);
    }
    void main() {
        const float PI = 3.141592653589793;
        vec4 color = texture2D(colorTexture, v_textureCoordinates);
        vec4 currD = texture2D(depthTexture, v_textureCoordinates);
        if(currD.r>=1.0){
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
        if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0))))
        {
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
                if(abs(shadowPosition.z-0.0)<0.01){
                    gl_FragColor = color;
                    return;
                }
                gl_FragColor = color;
            }
        }`
    this.update()
  }

  // 创建相机
  createLightCamera() {
    this.lightCamera = new Cesium.Camera(this.viewer.scene)
    this.lightCamera.position = this.viewPosition
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
      context: this.viewer.scene.context,
      lightCamera: this.lightCamera,
      enabled: false,
      isPointLight: false,
      isSpotLight: true,
      pointLightRadius: 300,
      cascadesEnabled: false,
    })
    this.viewer.scene.shadowMap = this.shadowMap
  }

  // 创建PostStage
  createPostStage() {
    const that = this
    const fs = this.VideoShead3D_FS
    this.activeVideoListener = function () {
      if (that.texture){
        that.texture.destroy()
      }
      that.texture = new Cesium.Texture({
          context: (that.viewer.scene).context,
          source: dom,
          pixelFormat: Cesium.PixelFormat.RGBA,
          pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE
      });
    }
    this.viewer.clock.onTick.addEventListener(this.activeVideoListener);
    const dom = document.getElementById('myVideo')
    // 创建视频投影纹理
    // var video = document.getElementById('myVideo');
    // var projectionTexture = new Cesium.VideoSynchronizer({
    //     clock: this.viewer.clock,
    //     element: video
    // }).createTexture();

    // 创建后期处理效果
    // var postProcessStage = new Cesium.PostProcessStage({
    //     name : 'project shadow',
    //     fragmentShader : `uniform sampler2D shadowMap;\n\
    //                       uniform sampler2D colorMap;\n\
    //                       uniform sampler2D depthTexture;
    //                       varying vec2 v_textureCoordinates;\n\
    //                       uniform mat4 czm_modelViewProjectionRelativeToEye;
    //                       void main()\n\
    //                       {\n\
    //                           // 将像素坐标转换为摄像机空间坐标
    //                           vec3 cameraSpacePos;
    //                           cameraSpacePos.z = czm_reverseLogDepth(texture2D(depthTexture, v_textureCoordinates).r);\n\
    //                           cameraSpacePos.xy *= cameraSpacePos.z;\n\
    //                           vec4 cameraPosition = czm_inverseProjection * vec4(cameraSpacePos, 1.0);\n\
    //                           cameraPosition = cameraPosition / cameraPosition.w;\n\
    //                           // 转换到地球表面上的坐标
    //                           // 世界坐标
    //                           vec4 worldPosition = czm_inverseView * cameraPosition;
    //                           // 投影到平面坐标系
    //                           vec4 positionEC = czm_modelViewProjectionRelativeToEye * vec4(worldPosition, 1.0);\n\
    //                           vec2 projectedCoords = positionEC.xy / positionEC.w * 0.5 + 0.5;\n\
    //                           // 从视频投影纹理中获取颜色值
    //                           gl_FragColor = texture2D(colorMap, projectedCoords) * texture2D(shadowMap, v_textureCoordinates);\n\
    //                       }`,
    //     uniforms : {
    //         colorMap : function() { return that.texture; },
    //         shadowMap : function() { return that.shadowMap._shadowMapTexture; },
    //     }
    // });
    // 将后期处理效果添加到场景中
    // this.viewer.scene.postProcessStages.add(postProcessStage);
  console.log(that.shadowMap);
    const postStage = new Cesium.PostProcessStage({
      fragmentShader: fs,
      uniforms: {
        videoTexture: function () {
          return that.texture;
        },
        dis: () => {
          return 600
        },
        mixNum: () => {
          return 1.0
        },
        stcshadow: () => {
          return that.shadowMap._shadowMapTexture
        },
        shadowMap_lightUp: () => {
          that.shadowMap.update(Reflect.get(that.viewer.scene, '_frameState'))
          return that.shadowMap._lightCamera.up
        },
        shadowMap_lightDir: () => {
          that.shadowMap.update(Reflect.get(that.viewer.scene, '_frameState'))
          return that.shadowMap._lightCamera.direction
        },
        shadowMap_lightRight: () => {
          that.shadowMap.update(Reflect.get(that.viewer.scene, '_frameState'))
          return that.shadowMap._lightCamera.right
        },
        shadowMap_textureCube: () => {
          that.shadowMap.update(Reflect.get(that.viewer.scene, '_frameState'))
          return Reflect.get(that.shadowMap, '_shadowMapTexture')
        },
        _shadowMap_matrix: () => {
          that.shadowMap.update(Reflect.get(that.viewer.scene, '_frameState'))
          return Reflect.get(that.shadowMap, '_shadowMapMatrix')
        },
        shadowMap_lightPositionEC: () => { //阴影贴图的光源位置
          that.shadowMap.update(Reflect.get(that.viewer.scene, '_frameState'))
          return Reflect.get(that.shadowMap, '_lightPositionEC')
        },
        shadowMap_lightDirectionEC: () => { //阴影贴图的光源方向
          that.shadowMap.update(Reflect.get(that.viewer.scene, '_frameState'))
          return Reflect.get(that.shadowMap, '_lightDirectionEC')
        },
        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
          that.shadowMap.update(Reflect.get(that.viewer.scene, '_frameState'))
          const bias = that.shadowMap._pointBias
          return Cesium.Cartesian4.fromElements(
            bias.normalOffsetScale,
            that.shadowMap._distance,
            that.shadowMap.maximumDistance,
            0.0,
            new Cesium.Cartesian4()
          )
        },
        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
          that.shadowMap.update(Reflect.get(that.viewer.scene, '_frameState'))
          const bias = that.shadowMap._pointBias
          const scratchTexelStepSize = new Cesium.Cartesian2()
          const texelStepSize = scratchTexelStepSize
          texelStepSize.x = 1.0 / that.shadowMap._textureSize.x
          texelStepSize.y = 1.0 / that.shadowMap._textureSize.y

          return Cesium.Cartesian4.fromElements(
            texelStepSize.x,
            texelStepSize.y,
            bias.depthBias,
            bias.normalShadingSmooth,
            new Cesium.Cartesian4()
          )
        },
        camera_projection_matrix: that.lightCamera.frustum.projectionMatrix,
        camera_view_matrix: that.lightCamera.viewMatrix,
        helsing_viewDistance: () => {
          return that.viewDistance
        },
        helsing_visibleAreaColor: that.visibleAreaColor,
        helsing_invisibleAreaColor: that.invisibleAreaColor
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

  add(frameState) {
    this.createLightCamera()
    this.createShadowMap()
    this.createPostStage(frameState)
    this.drawFrustumOutline()
    this.drawSketch()
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
