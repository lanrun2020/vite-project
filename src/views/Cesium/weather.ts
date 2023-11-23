import Cesium from "@/utils/importCesium"
import {
    Viewer,
    PostProcessStage,
    Color
} from 'cesium';

/** 0-无效果，1-下雪，2-下雨，3-雾霾 */
type WeatherStatus = 0 | 1 | 2 | 3;

export default class Weather {

    private viewer: Viewer;

    constructor(viewer: Viewer) {
        this.viewer = viewer;
    }

    /** 天气状态 */
    private status: WeatherStatus = 0;

    /** 下雪阶段 */
    private snowStage: PostProcessStage | null = null;

    /** 下雨阶段 */
    private rainStage: PostProcessStage | null = null;

    /** 雾霾阶段 */
    private fogStage: PostProcessStage | null = null;

    /**
     * @name: snow
     * @Date: 2022-09-28 15:27:58
     * @description: 下雪 
     * @param {number} snowSize 大小
     * @param {number} snowSpeed 速度
     */
    public snow(snowSize: number = 0.02, snowSpeed: number = 60.0) {
        this.remove();
        this.status = 1;
        this.snowStage = new PostProcessStage({
            name: 'snow',
            fragmentShader: `uniform sampler2D colorTexture;\n\
            varying vec2 v_textureCoordinates;\n\
            uniform float snowSpeed;\n\
                    uniform float snowSize;\n\
            float snow(vec2 uv,float scale)\n\
            {\n\
                float time=czm_frameNumber/snowSpeed;\n\
                float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
                uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
                uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
                p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
                k=smoothstep(0.,k,sin(f.x+f.y)*snowSize);\n\
                return k*w;\n\
            }\n\
            void main(void){\n\
                vec2 resolution=czm_viewport.zw;\n\
                vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                vec3 finalColor=vec3(0);\n\
                //float c=smoothstep(1.,0.3,clamp(uv.y*.3+.8,0.,.75));\n\
                float c=0.;\n\
                c+=snow(uv,30.)*.0;\n\
                c+=snow(uv,20.)*.0;\n\
                c+=snow(uv,15.)*.0;\n\
                c+=snow(uv,10.);\n\
                c+=snow(uv,8.);\n\
                c+=snow(uv,6.);\n\
                c+=snow(uv,5.);\n\
                finalColor=(vec3(c));\n\
                gl_FragColor=mix(texture2D(colorTexture,v_textureCoordinates),vec4(finalColor,1),.5);\n\
                }\n\
                `,
            uniforms: { snowSize, snowSpeed }
        });
        this.viewer.scene.postProcessStages.add(this.snowStage);
    }

    /**
     * @name: rain
     * @Date: 2022-09-28 15:37:01
     * @description: 下雨
     * @param {number} tiltAngle 倾斜角度
     * @param {number} rainSize 大小
     * @param {number} rainSpeed 速度
     */
    public rain(tiltAngle: number = -0.6, rainSize: number = 0.3, rainSpeed: number = 60.0) {
        this.remove();
        this.status = 2;
        this.rainStage = new PostProcessStage({
            name: 'rain',
            fragmentShader: `uniform sampler2D colorTexture;\n\
            varying vec2 v_textureCoordinates;\n\
            uniform float tiltAngle;\n\
            uniform float rainSize;\n\
            uniform float rainSpeed;\n\
            float hash(float x) {\n\
                return fract(sin(x * 133.3) * 13.13);\n\
            }\n\
            void main(void) {\n\
                float time = czm_frameNumber / rainSpeed;\n\
                vec2 resolution = czm_viewport.zw;\n\
                vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);\n\
                vec3 c = vec3(.6, .7, .8);\n\
                float a = tiltAngle;\n\
                float si = sin(a), co = cos(a);\n\
                uv *= mat2(co, -si, si, co);\n\
                uv *= length(uv + vec2(0, 4.9)) * rainSize + 1.;\n\
                float v = 1. - sin(hash(floor(uv.x * 100.)) * 2.);\n\
                float b = clamp(abs(sin(20. * time * v + uv.y * (5. / (2. + v)))) - .95, 0., 1.) * 20.;\n\
                c *= v * b;\n\
                gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c, 1), .5);\n\
            }\n\
            `,
            uniforms: { tiltAngle, rainSize, rainSpeed }
        });
        this.viewer.scene.postProcessStages.add(this.rainStage);
    }

    /**
     * @name: fog
     * @Date: 2022-09-28 15:37:33
     * @description: 雾霾
     * @param {number} visibility 可见度
     * @param {Color} fogColor 颜色
     */
    public fog(visibility: number = 0.1, fogColor: Color = new Color(0.8, 0.8, 0.8, 0.5)) {
        this.remove();
        this.status = 3;
        this.fogStage = new PostProcessStage({
            name: 'fog',
            fragmentShader: `uniform sampler2D colorTexture;\n\
            uniform sampler2D depthTexture;\n\
            uniform float visibility;\n\
            uniform vec4 fogColor;\n\
            varying vec2 v_textureCoordinates; \n\
            void main(void) \n\
            { \n\
               vec4 origcolor = texture2D(colorTexture, v_textureCoordinates); \n\
               float depth = czm_readDepth(depthTexture, v_textureCoordinates); \n\
               vec4 depthcolor = texture2D(depthTexture, v_textureCoordinates); \n\
               float f = visibility * (depthcolor.r - 0.3) / 0.2; \n\
               if (f < 0.0) f = 0.0; \n\
               else if (f > 1.0) f = 1.0; \n\
               gl_FragColor = mix(origcolor, fogColor, f); \n\
            }\n
            `,
            uniforms: { visibility, fogColor }
        });
        this.viewer.scene.postProcessStages.add(this.fogStage);
    }

    /**
     * @name: remove
     * @Date: 2022-09-28 16:01:30
     * @description: 移除天气
     */
    public remove() {
        if (this.status == 0) return;
        switch (this.status) {
            case 1:
                this.viewer.scene.postProcessStages.remove(this.snowStage!);
            case 2:
                this.viewer.scene.postProcessStages.remove(this.rainStage!);
            case 3:
                this.viewer.scene.postProcessStages.remove(this.fogStage!);
        }
        this.status = 0;
    }

    /**
     * @name: show
     * @Date: 2022-09-28 17:38:44
     * @description: 控制显示隐藏
     * @param {boolean} visible 是否显示
     */    
    public show(visible: boolean) {
        if (this.status == 0) return;
        switch (this.status) {
            case 1:
                this.snowStage!.enabled = visible;
            case 2:
                this.rainStage!.enabled = visible;
            case 3:
                this.fogStage!.enabled = visible;
        }
    }

}