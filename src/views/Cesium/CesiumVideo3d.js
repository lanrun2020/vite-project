import ECEF from "./CoordinateTranslate";
let CesiumVideo3d = (function () {

    var videoShed3dShader = `
    uniform float mixNum;
    uniform sampler2D colorTexture; //cesium的shader语言中colorTexture表示颜色帧缓冲区,表示颜色贴图变量
    uniform sampler2D stcshadow;
    uniform sampler2D videoTexture;
    uniform sampler2D depthTexture; //depthTexture表示深度贴图,用于存储场景中每个像素的深度信息
    uniform mat4 _shadowMap_matrix;
    uniform vec4 shadowMap_lightPositionEC;
    uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
    uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
    varying vec2 v_textureCoordinates;
    vec4 toEye(in vec2 uv, in float depth){
        vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));
        //即将屏幕坐标左上角为(0,0)的点移动到屏幕正中间位置，原来的(0,0)就变成(-1,-1),计算后的xy范围在[-1,1]之间
        vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);
        /*
        czm_inverseProjection 是 Cesium 中的一个内置变量，通常用于将屏幕空间坐标转换为相机坐标系下的坐标。这个变量是一个 mat4 类型的矩阵，表示相机投影矩阵的逆矩阵。
        该变量的定义在 Cesium 的 uniforms/Common.js 文件中，主要是通过计算相机投影矩阵的逆矩阵来实现的：
        czm_inverseProjection = inverse(czm_projection);
        其中,czm_projection 表示相机的投影矩阵，是一个标准的 4x4 矩阵。具体地，该变量定义在 Cesium 的 uniforms/Shadows.js 和 uniforms/LogDepth.js 文件中，
        并且在其他的 shader 文件中也可能会用到，用于实现从屏幕空间到相机坐标系下的变换。
        需要注意的是,czm_inverseProjection 是一个 uniform 类型的变量，可以被 shader 程序读写，但不可被修改。
        在使用 czm_inverseProjection 进行变换操作时，需要尽量遵循其定义的语义和使用场景，以保证程序的正确性和稳定性。
        */
        posInCamera = posInCamera / posInCamera.w;
        /*
        这行代码的作用是将三维坐标形式下的相机坐标系中的点 posInCamera 转换为齐次坐标形式，并确保其第四个分量为 1。这是在进行透视投影变换时产生的效果。
        在相机坐标系中,x、y、z 三个分量存储了对象在 3D 空间中的坐标位置，而第四个分量 w 主要是用于齐次坐标变换的。
        在变换过程中,w 分量通常被约定为 1,通过除以 w 分量可以将齐次坐标恢复为三维坐标,即(x/w, y/w, z/w)
        */
        return posInCamera;
    }
    /* toEye
    这个方法用于将齐次裁剪空间 （homogeneous clip space）下的屏幕空间坐标 ('uv.x', 'uv.y') 以及对应的深度值 depth 转换为相机坐标系（eye space）中的坐标。该方法对应了 Cesium 内部的 'SceneTransforms' 中的函数 'windowToEyeCoordinates'，用于实现从屏幕空间到相机坐标系的变换。
    将屏幕空间坐标转换到齐次裁剪空间坐标可以使用 Cesium 内置的函数 'czm_viewportOrthographic' 进行实现。而由于齐次裁剪空间坐标及其对应的深度值并不直观，因此需要进行进一步的变换，将其转换到相机坐标系下的坐标。该方法中主要的变换步骤包含以下几个：
    1. 根据屏幕空间坐标 uv，将其转换为范围为 '[-1, 1]'的齐次裁剪空间坐标 xy, 即 'vec2((uv.x * 2.0 - 1.0), (uv.y * 2.0 - 1.0))'。
    2. 利用相机的反投影矩阵 'czm_inverseProjection'，将齐次裁剪空间下的坐标以及对应的深度值 depth 转换为相机中的坐标 posInCamera。这里的 'czm_inverseProjection' 是相机投影矩阵的逆矩阵。
    3. 将相机坐标系下的坐标 posInCamera 通过除以其第四个分量（w 坐标）的方式，得到其齐次坐标形式。即 'posInCamera / posInCamera.w'。这个步骤实现了从齐次坐标到欧几里得坐标的转换，并使得得到的点位于相机坐标系中的三维空间坐标中。
    4. 最后返回的是一个四元组，即 'vec4(posInCamera.xyz, 1.0)'，其中第四个分量为 1.0。这个四元组表示从屏幕空间到相机坐标系下的变换，可以用于实现场景的渲染和基于深度的后处理等计算。
    需要注意的是，这个方法中的输入参数深度值 depth 通常采用的是经过标准化的深度值，即 'gl_FragCoord.z / gl_FragCoord.w'，其中 'gl_FragCoord.z' 表示在裁剪空间下的深度值，'gl_FragCoord.w' 表示齐次裁剪空间下的第四个分量。通过这种方式计算的深度值，可以消除投影变换和透视分布等因素的影响，从而更好地满足深度测试的要求。
    */
    float getDepth(in vec4 depth){
        float z_window = czm_unpackDepth(depth);
        //czm_unpackDepth是Cesium的shader内置方法之一,用于将一个深度值从 [0,1] 范围内的浮点数解压成深度值的真实模数形式
        //在 Cesium 的渲染管线中，深度缓冲通常以一种尺寸相对小的纹理进行存储，以节省内存和提高性能。
        //而在进行深度测试时，需要将屏幕上的片元的深度值与缓冲区中的深度值进行比较，判断片元是否可见。
        //此时就需要一个将 [0,1] 范围内的浮点深度值转换成真实深度值的工具函数，这就是 czm_unpackDepth 函数所实现的功能
        z_window = czm_reverseLogDepth(z_window);
        //czm_reverseLogDepth 是 Cesium 的 shader 内置函数之一, 主要用于将 “反对数深度” 值（反对数深度）还原回到 “线性深度” 值（线性深度）。
        //借助于这个函数, Cesium 能够更加有效地处理比较远或比较近的物体深度值，并避免因反对数深度的精度问题而导致的渲染问题和错误
        float n_range = czm_depthRange.near;
        float f_range = czm_depthRange.far;
        //czm_depthRange 是 Cesium 的 shader 内置变量之一，用于指定深度缓冲的存储区间。
        //在 OpenGL 中，深度值被限制在 [0, 1] 的范围内，因此深度缓冲的默认存储区间为 [0, 1]。
        //变量的第一个分量表示深度缓冲存储区间的最小深度值(near plane)第二个分量表示深度缓冲存储区间的最大深度值(far plane)。
        return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
        //z_window 表示线性深度值。n_range 和 f_range 分别表示深度缓冲存储区间的最小深度值和最大深度值，通常情况下取值为 [0, 1]。
        //该计算式实现了将 z_window 线性映射到 [n_range, f_range] 的深度缓冲区间内，然后再根据深度缓冲区间的范围，进行归一化处理，得到 [0, 1] 范围内的深度值
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
        float d = dot(planeNormal, v01);
        return (point - planeNormal * d);
    }
    float ptm(vec3 pt){
        return sqrt(pt.x*pt.x + pt.y*pt.y + pt.z*pt.z);
    }
    void main() {
        const float PI = 3.141592653589793;
        vec4 color = texture2D(colorTexture, v_textureCoordinates); //纹理颜色坐标位置
        vec4 currD = texture2D(depthTexture, v_textureCoordinates); //纹理深度坐标位置
        if(currD.r>=1.0){ //一般来说r的范围是[0,1],由于计算精度问题可能会出现大于1的情况,所以在这里进行异常处理
            gl_FragColor = color;
            return;
        }
        float depth = getDepth(currD);//获取在[0,1]之间的深度值
        vec4 positionEC = toEye(v_textureCoordinates, depth); //根据纹理坐标和深度值得到在相机坐标位置
        vec3 normalEC = vec3(1.0);
        czm_shadowParameters shadowParameters; //使用结构体czm_shadowParameters来定义一个结构类型数据shadowParameters
        /*
        czm_shadowParameters 是Cesium内部定义的结构体, 该结构体包含了多个 uniform 变量：
        texCoords: 用于保存阴影算法在阴影贴图中进行采样时所需要使用的采样坐标，该变量的类型为 vec2 或 vec3, 具体取决于是否使用立方体贴图算法。
        depthBias: 表示深度偏移量，用于处理深度值精度问题。
        depth: 表示当前像素的深度值。
        nDotL: 表示顶点法线与光源方向的点乘积，用于计算阴影亮度。
        texelStepSize: 表示当前像素距离阴影贴图上一格的距离。
        normalShadingSmooth: 表示法线矫正系数，取决于当前像素的法向量和光源方向。
        darkness: 表示阴影的不透明度，即阴影的强度。
        */
        shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
        shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
        shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
        shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
        shadowParameters.depthBias *= max(depth * 0.01, 1.0);
        vec3 directionEC = normalize(positionEC.xyz - shadowMap_lightPositionEC.xyz);
        //相机位置减去光源位置得到一个向量,表示当前像素和光源之间的方向向量,再归一化处理,它被用于确定该像素是否在阴影中
        float nDotL = clamp(dot(normalEC, -directionEC), 0.0, 1.0);//将点积dot(normalEC, -directionEC)结果限制在0到1之间
        vec4 shadowPosition = _shadowMap_matrix * positionEC; //阴影矩阵乘像素的相机坐标位置，得到阴影贴图坐标的位置
        shadowPosition /= shadowPosition.w; //将xyz归一化为三维坐标
        if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0))))
        {
            //处理值不符合的情况,直接终止mian函数
            gl_FragColor = color;
            return;
        }
        /*
        any() 函数是 GLSL 中的一个向量逻辑函数，用于检测向量中是否存在至少一个非零分量。如果存在，则返回 true,否则返回 false
        lessThan() 函数是 GLSL 中的一个向量比较函数,用于将两个向量的对应分量逐一进行大小比较,并返回一个布尔向量,
        如果第一个向量的某个分量小于第二个向量的相应分量,则返回真值(True),否则返回假值(False)。
        greaterThan() 是 GLSL 中的一个向量比较函数，用于将两个向量的对应分量逐一进行大小比较，并返回一个布尔向量,
        如果第一个向量的某个分量大于第二个向量的相应分量,则返回真值(True),否则返回假值(False)。
        */
        shadowParameters.texCoords = shadowPosition.xy;
        shadowParameters.depth = shadowPosition.z;
        shadowParameters.nDotL = nDotL;
        float visibility = _czm_shadowVisibility(stcshadow, shadowParameters);//计算该像素位置是否可见
        vec4 videoColor = texture2D(videoTexture,shadowPosition.xy);//传入视频纹理贴图和阴影纹理坐标
        if(visibility == 1.0){
            gl_FragColor = mix(color,vec4(videoColor.xyz,1.0),mixNum*videoColor.a);
        } else {
                if(abs(shadowPosition.z-0.0)<0.01){
                    return;
                }
                gl_FragColor = color;
            }
        }`
    var Cesium=null

    var videoShed3d = function(cesium,viewer, param) {
        Cesium=cesium
        this.ECEF = new ECEF();
        this.param = param;
        var option = this._initCameraParam();
        this.optionType = {
            Color: 1,
            Image: 2,
            Video: 3
        }
        this.near = option.near ? option.near : 0.1;
        if (option || (option = {}), this.viewer = viewer, this._cameraPosition = option.cameraPosition, this._position = option.position,
            this.type = option.type, this._alpha = option.alpha || 1, this.url = option.url, this.color = option.color,
            this._debugFrustum = Cesium.defaultValue(option.debugFrustum, !0), this._aspectRatio = option.aspectRatio || this._getWinWidHei(),
            this._camerafov = option.fov || Cesium.Math.toDegrees(this.viewer.scene.camera.frustum.fov), this.texture = option.texture || new Cesium.Texture({
                context: this.viewer.scene.context,
                source: {
                    width: 1,
                    height: 1,
                    arrayBufferView: new Uint8Array([255, 255, 255, 255])
                },
                flipY: !1
            }), this._videoPlay = Cesium.defaultValue(option.videoPlay, !0), this.defaultShow = Cesium.defaultValue(option.show, !0), !this.cameraPosition || !this.position) return void console.log('初始化失败：请确认相机位置与视点位置正确!');
        switch (this.type) {
            default:
            case this.optionType.Video:
                this.activeVideo(this.url);
                break;
            case this.optionType.Image:
                this.activePicture(this.url);
                this.deActiveVideo();
                break;
            case this.optionType.Color:
                this.activeColor(this.color),
                    this.deActiveVideo();
        }
        this._createShadowMap(),
            this._getOrientation(),
            this._addCameraFrustum()
        this._addPostProcess()
        this.viewer.scene.primitives.add(this)
    }
    Object.defineProperties(videoShed3d.prototype, {
        alpha: {
            get: function () {
                return this._alpha
            },
            set: function (e) {
                this._alpha = e
                // return true
            }
        },
        aspectRatio: {
            get: function () {
                return this._aspectRatio
            },
            set: function (e) {
                this._aspectRatio = e,
                    this._changeVideoWidHei()
            }
        },
        debugFrustum: {
            get: function () {
                return this._debugFrustum
            },
            set: function (e) {
                this._debugFrustum = e,
                    this.cameraFrustum.show = e
            }
        },
        fov: {
            get: function () {
                return this._camerafov
            },
            set: function (e) {
                this._camerafov = e,
                    this._changeCameraFov()
            }
        },
        cameraPosition: {
            get: function () {
                return this._cameraPosition
            },
            set: function (e) {
                e && (this._cameraPosition = e, this._changeCameraPos())
            }
        },
        position: {
            get: function () {
                return this._position
            },
            set: function (e) {
                e && (this._position = e, this._changeViewPos())
            }
        },
        videoPlay: {
            get: function () {
                return this._videoPlay
            },
            set: function (e) {
                this._videoPlay = Boolean(e),
                    this._videoEle && (this.videoPlay ? this._videoEle.paly() : this._videoEle.pause())
            }
        },
        params: {
            get: function () {
                var t = {}
                return t.type = this.type,
                    this.type == this.optionType.Color ? t.color = this.color : t.url = this.url,
                    t.position = this.position,
                    t.cameraPosition = this.cameraPosition,
                    t.fov = this.fov,
                    t.aspectRatio = this.aspectRatio,
                    t.alpha = this.alpha,
                    t.debugFrustum = this.debugFrustum,
                    t
            }
        },
        show: {
            get: function () {
                return this.defaultShow
            },
            set: function (e) {
                this.defaultShow = Boolean(e),
                    this._switchShow()
            }
        }
    })
    videoShed3d.prototype._initCameraParam = function () {
        var viewPoint = this.ECEF.enu_to_ecef({ longitude: this.param.position.x * 1, latitude: this.param.position.y * 1, altitude: this.param.position.z * 1 },
            { distance: this.param.far, azimuth: this.param.rotation.y * 1, elevation: this.param.rotation.x * 1 });
        var position = Cesium.Cartesian3.fromDegrees(viewPoint.longitude, viewPoint.latitude, viewPoint.altitude);
        var cameraPosition = Cesium.Cartesian3.fromDegrees(this.param.position.x * 1, this.param.position.y * 1, this.param.position.z * 1);
        return {
            type: 3,
            url: this.param.url,
            cameraPosition: cameraPosition,
            position: position,
            alpha: this.param.alpha,
            near: this.param.near,
            fov: this.param.fov,
            debugFrustum: this.param.debugFrustum
        }
    }
    /**
     * 旋转
     */
    videoShed3d.prototype._changeRotation = function (e) {
        if (e) {
            this.param.rotation = e;
            var option = this._initCameraParam();
            this.position = option.position;
        }
    }
    /**
     * 相机位置
     */
    videoShed3d.prototype._changeCameraPosition = function (e) {
        if (e) {
            this.param.position = e;
            var option = this._initCameraParam();
            this.cameraPosition = option.cameraPosition;
        }
    }
    videoShed3d.prototype._changeFar = function (e) {
        if (e) {
            this.param.far = e;
            var option = this._initCameraParam();
            this.position = option.position;
        }
    }
    videoShed3d.prototype._changeNear = function (e) {
        if (e) {
            this.param.near = e;
            this.near = this.param.near;
            this._changeCameraPos();
        }
    }
    /**获取三维地图容器像素大小
     */
    videoShed3d.prototype._getWinWidHei = function () {
        var viewer = this.viewer.scene;
        return viewer.canvas.clientWidth / viewer.canvas.clientHeight;
    }
    videoShed3d.prototype._changeCameraFov = function () {
        this.viewer.scene.postProcessStages.remove(this.postProcess)
        this.viewer.scene.primitives.remove(this.cameraFrustum),
            this._createShadowMap(this.cameraPosition, this.position),
            this._getOrientation(),
            this._addCameraFrustum(),
            this._addPostProcess()
    }
    videoShed3d.prototype._changeVideoWidHei = function () {
        this.viewer.scene.postProcessStages.remove(this.postProcess),
            this.viewer.scene.primitives.remove(this.cameraFrustum)
        this._createShadowMap(this.cameraPosition, this.position),
            this._getOrientation(),
            this._addCameraFrustum(),
            this._addPostProcess()
    }
    videoShed3d.prototype._changeCameraPos = function () {
        this.viewer.scene.postProcessStages.remove(this.postProcess),
            this.viewer.scene.primitives.remove(this.cameraFrustum),
            this.viewShadowMap.destroy(),
            this.cameraFrustum.destroy(),
            this._createShadowMap(this.cameraPosition, this.position),
            this._getOrientation(),
            this._addCameraFrustum(),
            this._addPostProcess()
    }
    videoShed3d.prototype._changeViewPos = function () {
        this.viewer.scene.postProcessStages.remove(this.postProcess),
            this.viewer.scene.primitives.remove(this.cameraFrustum),
            this.viewShadowMap.destroy(),
            this.cameraFrustum.destroy(),
            this._createShadowMap(this.cameraPosition, this.position),
            this._getOrientation(),
            this._addCameraFrustum(),
            this._addPostProcess()
    }
    videoShed3d.prototype._switchShow = function () {
        this.show ? !this.postProcess && this._addPostProcess() : (this.viewer.scene.postProcessStages.remove(this.postProcess), delete this.postProcess, this.postProcess = null),
            this.cameraFrustum.show = this.show
    }
    /** 创建视频Element
     * @param {String} url 视频地址
     **/
    videoShed3d.prototype._createVideoEle = function (url) {
        this.videoId = "visualDomId";
        var t = document.createElement("SOURCE");
        t.type = "video/mp4",
            t.src = url;
        var i = document.createElement("SOURCE");
        i.type = "video/quicktime",
            i.src = url;
        var a = document.createElement("VIDEO");
        return a.setAttribute("autoplay", !0),
            a.setAttribute("loop", !0),
            a.setAttribute("crossorigin", !0),
            a.appendChild(t),
            a.appendChild(i),
            // document.body.appendChild(a),
            this._videoEle = a,
            a
    }
    /** 视频投射
     * @param {String} url 视频地址
     */
    videoShed3d.prototype.activeVideo = function (url) {
        var video = this._createVideoEle(url),
            that = this;
        if (video) {
            this.type = that.optionType.Video;
            var viewer = this.viewer;
            this.activeVideoListener || (this.activeVideoListener = function () {
                that.videoTexture && that.videoTexture.destroy(),
                    that.videoTexture = new Cesium.Texture({
                        context: viewer.scene.context,
                        source: video,
                        width: 1,
                        height: 1,
                        pixelFormat: Cesium.PixelFormat.RGBA,
                        pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE
                    })
            }),
                viewer.clock.onTick.addEventListener(this.activeVideoListener)
        }
    }
    videoShed3d.prototype.deActiveVideo = function () {
        if (this.activeVideoListener) {
            this.viewer.clock.onTick.removeEventListener(this.activeVideoListener),
                delete this.activeVideoListener
        }
    }
    /** 图片投放
     * @param {String} url 图片地址
     **/
    videoShed3d.prototype.activePicture = function (url) {
        this.videoTexture = this.texture;
        var that = this,
            img = new Image;
        img.onload = function () {
            that.type = that.optionType.Image,
                that.videoTexture = new Cesium.Texture({
                    context: that.viewer.scene.context,
                    source: img
                })
        },
            img.onerror = function () {
                console.log('图片加载失败:' + url)
            },
            img.src = url
    }
    videoShed3d.prototype.locate = function () {
        var cameraPosition = Cesium.clone(this.cameraPosition),
            position = Cesium.clone(this.position);
        this.viewer.Camera.position = cameraPosition,
            this.viewer.camera.direction = Cesium.Cartesian3.subtract(position, cameraPosition, new Cesium.Cartesian3(0, 0, 0)),
            this.viewer.camera.up = Cesium.Cartesian3.normalize(cameraPosition, new Cesium.Cartesian3(0, 0, 0))
    }
    videoShed3d.prototype.update = function (e) {
        this.viewShadowMap && this.viewer.scene.frameState.shadowMaps.push(this.viewShadowMap) // *重点* 多投影
    }
    videoShed3d.prototype.destroy = function () {
        this.viewer.scene.postProcessStages.remove(this.postProcess),
            this.viewer.scene.primitives.remove(this.cameraFrustum),
            //this._videoEle && this._videoEle.parentNode.removeChild(this._videoEle),
            this.activeVideoListener && this.viewer.clock.onTick.removeEventListener(this.activeVideoListener),
            this.activeVideoListener && delete this.activeVideoListener,
            delete this.postProcess,
            delete this.viewShadowMap,
            delete this.color,
            delete this.viewDis,
            delete this.cameraPosition,
            delete this.position,
            delete this.alpha,
            delete this._camerafov,
            delete this._cameraPosition,
            delete this.videoTexture,
            delete this.cameraFrustum,
            delete this._videoEle,
            delete this._debugFrustum,
            delete this._position,
            delete this._aspectRatio,
            delete this.url,
            delete this.orientation,
            delete this.texture,
            delete this.videoId,
            delete this.type,
            this.viewer.scene.primitives.remove(this),
            delete this.viewer
    }
    // 创建shadowmap
    videoShed3d.prototype._createShadowMap = function () {
        var e = this.cameraPosition,
            t = this.position,
            i = this.viewer.scene,
            a = new Cesium.Camera(i);
        a.position = e,
            a.direction = Cesium.Cartesian3.subtract(t, e, new Cesium.Cartesian3(0, 0, 0)), //计算两个笛卡尔的组分差异。
            a.up = Cesium.Cartesian3.normalize(e, new Cesium.Cartesian3(0, 0, 0)); // 归一化
        var n = Cesium.Cartesian3.distance(t, e);
        this.viewDis = n,
            a.frustum = new Cesium.PerspectiveFrustum({
                fov: Cesium.Math.toRadians(this.fov),
                aspectRatio: this.aspectRatio,
                near: this.near,
                far: n
            });
        this.viewShadowMap = new Cesium.ShadowMap({
            lightCamera: a,
            enable: !1,
            isPointLight: !1,
            isSpotLight: !0,
            cascadesEnabled: !1,
            context: i.context,
            pointLightRadius: n
        })
    }
    // 获取shadowmap位置
    videoShed3d.prototype._getOrientation = function () {
        var e = this.cameraPosition,
            t = this.position,
            i = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(t, e, new Cesium.Cartesian3), new Cesium.Cartesian3),
            a = Cesium.Cartesian3.normalize(e, new Cesium.Cartesian3),
            n = new Cesium.Camera(this.viewer.scene);
        n.position = e,
            n.direction = i,
            n.up = a,
            i = n.directionWC,
            a = n.upWC;
        var r = n.rightWC,
            o = new Cesium.Cartesian3,
            l = new Cesium.Matrix3,
            u = new Cesium.Quaternion;
        r = Cesium.Cartesian3.negate(r, o);
        var d = l;
        Cesium.Matrix3.setColumn(d, 0, r, d),
            Cesium.Matrix3.setColumn(d, 1, a, d),
            Cesium.Matrix3.setColumn(d, 2, i, d);
        var c = Cesium.Quaternion.fromRotationMatrix(d, u);
        //ClassificationPrimitive
        return this.orientation = c,
            c
    }
    videoShed3d.prototype.creacteGeometry = function (width, height) {
        var hwidth = width / 2.0;
        var hheigt = height / 2.0;
        var positions = new Float64Array([hwidth, 0.0, hheigt, -hwidth, 0.0, hheigt, -hwidth, 0.0, -hheigt, hwidth, 0.0, -hheigt]);
        var sts = new Float32Array([1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]);
        var indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
        var ge = this._createGeometry(positions, sts, indices);
        return ge;
    },
    videoShed3d.prototype._createGeometry = function (positions, sts, indices) {
        /* var Cesium = this.Cesium;*/
        return new Cesium.Geometry({
            attributes: {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: positions
                }),
                normal: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: new Float32Array([255.0, 0.0, 0.0, 255.0, 0.0, 0.0, 255.0, 0.0, 0.0, 255.0, 0.0, 0.0])
                    // values: new Float32Array([0.0, 0.0, 0.0,0.0, 0.0, 0.0,0.0, 0.0, 0.0,0.0, 0.0, 0.0])
                }),
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: sts
                })
            },
            indices: indices,
            primitiveType: Cesium.PrimitiveType.TRIANGLES,
            vertexFormat: new Cesium.VertexFormat({
                position: true,
                color: true
            }),
            boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
        });
    },
    //创建视锥
    videoShed3d.prototype._addCameraFrustum = function () {
        var e = this;
        this.cameraFrustum = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.FrustumOutlineGeometry({
                    origin: e.cameraPosition,
                    orientation: e.orientation,
                    frustum: this.viewShadowMap._lightCamera.frustum,
                    _drawNearPlane: !0
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0, 0.5, 0.5))
                }
            }),
            appearance: new Cesium.PerInstanceColorAppearance({
                translucent: !1,
                flat: !0
            }),
            asynchronous: !1,
            show: this.debugFrustum && this.show
        }),
            this.viewer.scene.primitives.add(this.cameraFrustum)
    }
    videoShed3d.prototype._addPostProcess = function () {
        var e = this,
            t = videoShed3dShader,
            i = e.viewShadowMap._isPointLight ? e.viewShadowMap._pointBias : e.viewShadowMap._primitiveBias;
        this.postProcess = new Cesium.PostProcessStage({
            fragmentShader: t,
            uniforms: {
                mixNum: function () {
                    return e.alpha
                },
                stcshadow: function () {
                    return e.viewShadowMap._shadowMapTexture //存储的是阴影贴图深度信息的纹理
                },
                videoTexture: function () {
                    return e.videoTexture
                },
                _shadowMap_matrix: function () {
                    return e.viewShadowMap._shadowMapMatrix //阴影贴图矩阵
                },
                shadowMap_lightPositionEC: function () {
                    return e.viewShadowMap._lightPositionEC //光源位置
                },
                shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function () {
                    var t = new Cesium.Cartesian2;
                    return t.x = 1 / e.viewShadowMap._textureSize.x,
                        t.y = 1 / e.viewShadowMap._textureSize.y,
                        Cesium.Cartesian4.fromElements(t.x, t.y, i.depthBias, i.normalShadingSmooth, this.combinedUniforms1)
                },
                shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function () {
                    return Cesium.Cartesian4.fromElements(i.normalOffsetScale, e.viewShadowMap._distance, e.viewShadowMap.maximumDistance, e.viewShadowMap._darkness, this.combinedUniforms2)
                }

            }
        }),
        this.viewer.scene.postProcessStages.add(this.postProcess);
    }
    return videoShed3d;
})()

export default CesiumVideo3d