import * as T from 'three'
const THREE = T
// 面的流动材质
export const getFlowMaterial = (options?: { side?: object, transparent?: boolean, color?: THREE.Color, basicColor?: THREE.Color, repeat?: number, thickness?: number, speed?: number, opacity?: number, basic_opacity?: number }) => {
  const tubeShader = {
    vertexshader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
        `,
    fragmentshader: `
    varying vec2 vUv;
        uniform float opacity;
        uniform float basic_opacity;
        uniform vec3 color;
        uniform vec3 basicColor;
        uniform float time;
        uniform float speed;
        uniform float repeat;
        uniform float thickness;
        void main() {
            bool b = bool(step(fract(vUv.x * repeat - time*speed),thickness));
            float a = step(fract(vUv.x * repeat - time*speed),thickness); //1或0
            gl_FragColor = b ? vec4(color,fract(vUv.x * repeat - time*speed) * opacity * a) : vec4(basicColor, (1.0 - a) * basic_opacity);
        }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: options?.color || new THREE.Color(0x00ffff),
        type: "v3"
      },
      basicColor: {
        value: options?.basicColor || new THREE.Color(0xffffff),
        type: "v3"
      },
      time: {
        value: 1,
        type: "f"
      },
      repeat: {
        value: options?.repeat || 10,
        type: "f"
      },
      thickness: {
        value: options?.thickness || 0.5,
        type: "f"
      },
      speed: {
        value: options?.speed || 1.0,
        type: "f"
      },
      opacity: {
        value: options?.opacity || 1.0,
        type: "f"
      },
      basic_opacity: {
        value: options?.basic_opacity || 1.0,
        type: "f"
      },
    },
    side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}

// 动态飘动旗帜
export const getFlagMaterial = (options?: { side?: object, transparent?: boolean, url?: string }) => {
  const tubeShader = {
    vertexshader: `
    varying vec3 vp;
    varying vec2 vUv;
    uniform float time;
    uniform float repeat;
    uniform float speed;
    void main() {
      vp = position;
      vUv = uv;
      float dis = vUv.x;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      modelPosition.z += sin(modelPosition.x * repeat / 2.0  - 2.0*time * speed) * 1.2 * dis; //保证起始位置不动,越往后,摆动弧度越大
      modelPosition.y += sin(modelPosition.x * repeat  - 2.0*time*speed) * 0.5 * dis - 1.5*dis*dis;
      gl_Position = projectionMatrix * viewMatrix  * modelPosition;
    }
        `,
    fragmentshader: `
    varying vec2 vUv;
    uniform sampler2D u_map;
    uniform float u_opacity;
    uniform float time;
    uniform float speed;
    void main() {
        vec2 vUv2 = vUv;
        // vUv2.x = fract(vUv.x - time * speed);
        gl_FragColor = texture2D(u_map, vUv2);
    }`
  }
  const texture = new THREE.TextureLoader().load(options?.url || ''); //首先，获取到材质贴图纹理
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: {
        value: 1,
        type: "f"
      },
      speed: {
        value: 8.0,
        type: "f"
      },
      repeat: { //周期
        value: 1.5,
        type: "f"
      },
      u_opacity: {
        value: 0.9,
        type: "f"
      },
      u_map: {
        value: texture,
        type: "t2"
      }
    },
    side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}
//字体朝向相机位置
export const getTextMaterial2 = (options?: { textContent?:string, textWidth?:number, side?: object, transparent?: boolean, url?: string }) => {
  const fontSize = 512 //值越大越清晰，此值决定了canvas画布像素
  const textContent = options?.textContent ?? 'text'
  const textWidth = ((options?.textWidth + 1) * fontSize) ?? 128*5;
  const textHeight = fontSize*2.0;
  const canvas = document.createElement("canvas");
    canvas.width = textWidth;
    canvas.height = textHeight;
    const c = canvas.getContext('2d')!;
    c.fillStyle = 'rgba(0,0,0,0.0)';
    c.fillRect(0, 0, textWidth, textHeight);
    // 文字
    c.beginPath();
    c.translate(textWidth/2, textHeight/2);
    c.fillStyle = "#00ffff"; //文本填充颜色
    c.font = "bold " + fontSize + "px 宋体"; //字体样式设置
    c.textBaseline = "middle"; //文本与fillText定义的纵坐标
    c.textAlign = "center"; //文本居中(以fillText定义的横坐标)
    c.fillText(textContent, 0, 0);
    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.wrapS = THREE.RepeatWrapping;
    const tubeShader = {
      vertexshader: `
      varying vec3 vp;
      varying vec2 vUv;
      uniform float repeat;
      uniform float PI;
      uniform float time;
      mat3 rotate2d(float _angle){
        float angle = radians(_angle);//角度转为弧度
        return mat3(cos(angle),0.0,-sin(angle),
                    0.0,1.0,0.0,
                    -sin(angle),0.0,cos(angle)
                    );
      }
      void main() {
        vUv = uv;
        // 获取模型中心点坐标
        vec3 center = vec3(modelMatrix[3]);
        vec3 cameraDir = normalize(cameraPosition - center); //相机与模型之间的朝向向量
        float q = 0.0; //旋转弧度
        if (cameraDir.z > 0.0) {
          q = atan(cameraDir.x/cameraDir.z); //相机位置相对原点旋转的弧度
        } else {
          q = atan(cameraDir.x/cameraDir.z) + PI; //相机位置相对原点旋转的弧度
        }
        // 进行旋转变换,degrees弧度转角度,radians(角度转弧度)
        float angle = q; // 旋转弧度（示例值）
        //绕Y轴旋转的旋转矩阵
        mat3 rotationMatrix = mat3(
          cos(angle), 0.0, -sin(angle),
                   0, 1.0, 0,
          -sin(angle),0.0, cos(angle)
        );
        vec3 rotatedPosition = rotationMatrix * position;

        // 将世界空间坐标转换为裁剪空间坐标
        gl_Position = projectionMatrix * viewMatrix * vec4(rotatedPosition + center, 1.0);
      }
          `,
      fragmentshader: `
      varying vec2 vUv;
      uniform sampler2D u_map;
      uniform float u_opacity;
      uniform vec3 color;
      void main() {
          vec2 vUv2 = vUv;
          gl_FragColor = texture2D(u_map, vUv2) + vec4(color, u_opacity);;
      }`
    }
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0x000000),
          type: "v3"
        },
        repeat: { //周期
          value: 1.5,
          type: "f"
        },
        u_opacity: {
          value: 0.2,
          type: "f"
        },
        u_map: {
          value: canvasTexture,
          type: "t2"
        },
        PI: {
          value: Math.PI,
          type: "f"
        },
        time: {
          value: 1.0,
          type: "f"
        }
      },
      side: THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
      transparent: true,// 是否透明
      vertexShader: tubeShader.vertexshader, // 顶点着色器
      fragmentShader: tubeShader.fragmentshader // 片元着色器
    })
  return material
}
//朝向屏幕
export const getTextMaterial = (options?: { textContent?:string, textWidth?:number, side?: object, transparent?: boolean, url?: string }) => {
  const fontSize = 512 //值越大越清晰，此值决定了canvas画布像素
  const textContent = options?.textContent ?? 'text'
  const textWidth = ((options?.textWidth + 1) * fontSize) ?? 128*5;
  const textHeight = fontSize*2.0;
  const canvas = document.createElement("canvas");
    canvas.width = textWidth;
    canvas.height = textHeight;
    const c = canvas.getContext('2d')!;
    c.fillStyle = 'rgba(0,0,0,0.0)';
    c.fillRect(0, 0, textWidth, textHeight);
    // 文字
    c.beginPath();
    c.translate(textWidth/2, textHeight/2);
    c.fillStyle = "#00ffff"; //文本填充颜色
    c.font = "bold " + fontSize + "px 宋体"; //字体样式设置
    c.textBaseline = "middle"; //文本与fillText定义的纵坐标
    c.textAlign = "center"; //文本居中(以fillText定义的横坐标)
    c.fillText(textContent, 0, 0);
    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.wrapS = THREE.RepeatWrapping;
    const tubeShader = {
      vertexshader: `
      varying vec3 vp;
      varying vec2 vUv;
      uniform float PI;
      void main() {
        vUv = uv;
        // 模型的中心局部坐标 转换到 视图空间
        vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        // 在视图空间下,以模型中心做位置的上下偏移
        mvPosition.xy += position.xy;
        gl_Position = projectionMatrix * mvPosition;
      }
          `,
      fragmentshader: `
      varying vec2 vUv;
      uniform sampler2D u_map;
      uniform float u_opacity;
      uniform vec3 color;
      void main() {
          vec2 vUv2 = vUv;
          gl_FragColor = texture2D(u_map, vUv2) + vec4(color, u_opacity);
          if (gl_FragColor.a < 0.4) {
            discard;
          }
      }`
    }
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0x000000),
          type: "v3"
        },
        u_opacity: {
          value: 0.2,
          type: "f"
        },
        u_map: {
          value: canvasTexture,
          type: "t2"
        },
        PI: {
          value: Math.PI,
          type: "f"
        },
      },
      side: THREE.FrontSide,// side属性的默认值是前面THREE.FrontSide 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
      transparent: true,// 是否透明
      vertexShader: tubeShader.vertexshader, // 顶点着色器
      fragmentShader: tubeShader.fragmentshader // 片元着色器
    })
  return material
}
// 动态水面
export const getSeaMaterial = (options?: { side?: object, transparent?: boolean, url?: string }) => {
  const tubeShader = {
    vertexshader: `
    varying vec3 vp;
    varying vec2 vUv;
    uniform float time;
    uniform float repeat;
    void main() {
      vp = position;
      vUv = uv;
      float dis = vUv.x;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      modelPosition.y += sin(modelPosition.x * repeat  - 2.0*time) * 5.0; //保证起始位置不动,越往后,摆动弧度越大
      gl_Position = projectionMatrix * viewMatrix  * modelPosition;
    }
        `,
    fragmentshader: `
    varying vec2 vUv;
    uniform float u_opacity;
    uniform float time;
    uniform vec3 color;
    void main() {
        vec2 vUv2 = vUv;
        gl_FragColor = vec4(color, 0.5);
    }`
  }
  const texture = new THREE.TextureLoader().load(options?.url || ''); //首先，获取到材质贴图纹理
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: new THREE.Color(0x00ffff),
        type: "v3"
      },
      time: {
        value: 1,
        type: "f"
      },
      repeat: { //周期
        value: 1.5,
        type: "f"
      },
      u_opacity: {
        value: 0.9,
        type: "f"
      },
      u_map: {
        value: texture,
        type: "t2"
      }
    },
    side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}

// 水面材质
export const getWaterMaterial = () => {
  const methods = `
  /*
 * "Seascape" by Alexander Alekseev aka TDM - 2014
 * License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
 * Contact: tdmaav@gmail.com
 */

const int NUM_STEPS = 8;
const float PI = 3.141592;
const float EPSILON	= 1e-3;
#define EPSILON_NRM (0.1 / 11440.0)

// sea
const int ITER_GEOMETRY = 3;
const int ITER_FRAGMENT = 5;
const float SEA_HEIGHT = 0.6;
const float SEA_CHOPPY = 4.0;
const float SEA_SPEED = 0.8;
const float SEA_FREQ = 0.16;
const vec3 SEA_BASE = vec3(0.1,0.19,0.22);
const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6);
#define SEA_TIME (1.0 + time * SEA_SPEED)
const mat2 octave_m = mat2(1.6,1.2,-1.2,1.6);

// math
mat3 fromEuler(vec3 ang) {
	vec2 a1 = vec2(sin(ang.x),cos(ang.x));
  vec2 a2 = vec2(sin(ang.y),cos(ang.y));
  vec2 a3 = vec2(sin(ang.z),cos(ang.z));
  mat3 m;
  m[0] = vec3(a1.y*a3.y+a1.x*a2.x*a3.x,a1.y*a2.x*a3.x+a3.y*a1.x,-a2.y*a3.x);
  m[1] = vec3(-a2.y*a1.x,a1.y*a2.y,a2.x);
  m[2] = vec3(a3.y*a1.x*a2.x+a1.y*a3.x,a1.x*a3.x-a1.y*a3.y*a2.x,a2.y*a3.y);
  return m;
}
float hash( vec2 p ) {
	float h = dot(p,vec2(127.1,311.7));
    return fract(sin(h)*43758.5453123);
}
float noise( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );
	vec2 u = f*f*(3.0-2.0*f);
    return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ),
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ),
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

// lighting
float diffuse(vec3 n,vec3 l,float p) {
    return pow(dot(n,l) * 0.4 + 0.6,p);
}
float specular(vec3 n,vec3 l,vec3 e,float s) {
    float nrm = (s + 8.0) / (PI * 8.0);
    return pow(max(dot(reflect(e,n),l),0.0),s) * nrm;
}

// sky
vec3 getSkyColor(vec3 e) {
    e.y = max(e.y,0.0);
    return vec3(pow(1.0-e.y,2.0), 1.0-e.y, 0.6+(1.0-e.y)*0.4);
}

// sea
float sea_octave(vec2 uv, float choppy) {
    uv += noise(uv);
    vec2 wv = 1.0-abs(sin(uv));
    vec2 swv = abs(cos(uv));
    wv = mix(wv,swv,wv);
    return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
}

float map(vec3 p) {
    float freq = SEA_FREQ;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;
    vec2 uv = p.xz; uv.x *= 0.75;
    float d, h = 0.0;
    for(int i = 0; i < ITER_GEOMETRY; i++) {
    	d = sea_octave((uv+SEA_TIME)*freq,choppy);
    	d += sea_octave((uv-SEA_TIME)*freq,choppy);
        h += d * amp;
    	uv *= octave_m; freq *= 1.9; amp *= 0.22;
        choppy = mix(choppy,1.0,0.2);
    }
    return p.y - h;
}

float map_detailed(vec3 p) {
    float freq = SEA_FREQ;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;
    vec2 uv = p.xz; uv.x *= 0.75;
    float d, h = 0.0;
    for(int i = 0; i < ITER_FRAGMENT; i++) {
    	d = sea_octave((uv+SEA_TIME)*freq,choppy);
    	d += sea_octave((uv-SEA_TIME)*freq,choppy);
      h += d * amp;
    	uv *= octave_m; freq *= 1.9; amp *= 0.22;
      choppy = mix(choppy,1.0,0.2);
    }
    return p.y - h;
}

vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist) {
    float fresnel = clamp(1.0 - dot(n,-eye), 0.0, 1.0);
    fresnel = pow(fresnel,3.0) * 0.65;
    vec3 reflected = getSkyColor(reflect(eye,n));
    vec3 refracted = SEA_BASE + diffuse(n,l,80.0) * SEA_WATER_COLOR * 0.12;
    vec3 color = mix(refracted,reflected,fresnel);
    float atten = max(1.0 - dot(dist,dist) * 0.001, 0.0);
    color += SEA_WATER_COLOR * (p.y - SEA_HEIGHT) * 0.18 * atten;
    color += vec3(specular(n,l,eye,60.0));
    return color;
}

// tracing
vec3 getNormal(vec3 p, float eps) {
    vec3 n;
    n.y = map_detailed(p);
    n.x = map_detailed(vec3(p.x+eps,p.y,p.z)) - n.y;
    n.z = map_detailed(vec3(p.x,p.y,p.z+eps)) - n.y;
    n.y = eps;
    return normalize(n);
}

float heightMapTracing(vec3 ori, vec3 dir, out vec3 p) {
    float tm = 0.0;
    float tx = 1000.0;
    float hx = map(ori + dir * tx);
    if(hx > 0.0) return tx;
    float hm = map(ori + dir * tm);
    float tmid = 0.0;
    for(int i = 0; i < NUM_STEPS; i++) {
        tmid = mix(tm,tx, hm/(hm-hx));
        p = ori + dir * tmid;
    	float hmid = map(p);
		if(hmid < 0.0) {
        	tx = tmid;
            hx = hmid;
        } else {
            tm = tmid;
            hm = hmid;
        }
    }
    return tmid;
  }`
  const tubeShader = {
    vertexshader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
    `,
    fragmentshader: `
    // 时间
    uniform float time;
    // 分辨率
    //uniform vec2 iResolution;
    // 鼠标位置
    uniform vec2 iMouse;
    varying vec2 vUv;
    `+ methods + `
    void main() {
      vec2 uv = vUv;
      // gl_FragCoord 当前片元相对窗口坐标;
      uv = uv * 2.0 - 2.0;
      float time2 = time * 0.3;
      vec3 ang = vec3(0.0, 0.0, 1.0);
      vec3 ori = vec3(0.0, 3.5, time2 * 5.0);
      vec3 dir = normalize(vec3(uv.xy,-2.0));
      // normalize(x)将x归一化
      // dir.z += length(uv) * 0.15;
      dir = normalize(dir) * fromEuler(ang);
      // tracing
      vec3 p;
      heightMapTracing(ori,dir,p);
      vec3 dist = p - ori;
      // dot()函数是求点积
      vec3 n = getNormal(p, dot(dist,dist) * EPSILON_NRM);
      vec3 light = normalize(vec3(0.0,1.0,0.8));
      // color
      vec3 color = getSeaColor(p,n,light,dir,dist);
      // mix(x, y, a): x, y的线性混叠, x(1-a) + y*a; a为0 结果为x, a为1 结果为y
      // pow(x,y)返回x的y次幂
      // smoothstep(edge0,edge1,x)函数将x在[edge0, edge1]的部分平滑的映射到[0,1]
      gl_FragColor = vec4(pow(color,vec3(0.75)), 0.9);
    }`
  }
  // const texture = new THREE.TextureLoader().load(options?.url || ''); //首先，获取到材质贴图纹理
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: {
        value: 1,
        type: "f"
      },
      //iResolution: { value: new THREE.Vector2(2560.0, 1440.0) },//分辨率
      iMouse: { value: new THREE.Vector2(200.0, 1200.0) },
      u_opacity: {
        value: 0.9,
        type: "f"
      },
    },
    // side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}

// 扫描材质 圆的扩散扫描材质
export const getScanMaterial = (options?: { side?: object, transparent?: boolean, color?: THREE.Color, repeat?: number, thickness?: number, speed?: number, opacity?: number, depthWrite?: boolean, depthTest?: boolean }) => {
  const tubeShader = {
    vertexshader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
        `,
    fragmentshader: `
        varying vec2 vUv;
        uniform float opacity;
        uniform vec3 color;
        uniform float time;
        uniform float speed;
        uniform float repeat;
        uniform float thickness;
        void main() {
          float sp = 1.0/(repeat*2.0);
          float dis = distance(vUv,vec2(0.5,0.5)) - 0.1*time*speed;
          float dis2 = distance(vUv,vec2(0.5,0.5));
          float m = mod(dis, sp);
          float a = step(m, sp*thickness); //用于分段,值为0或1
          gl_FragColor = vec4(color, opacity * a * (0.5 - dis2));
        }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: options?.color || new THREE.Color(0x00ffff),
        type: "v3"
      },
      time: {
        value: 1,
        type: "f"
      },
      repeat: {
        value: options?.repeat || 3,
        type: "f"
      },
      thickness: {
        value: options?.thickness || 0.5,
        type: "f"
      },
      speed: {
        value: options?.speed || 1.0,
        type: "f"
      },
      opacity: {
        value: options?.opacity || 1.0,
        type: "f"
      },
    },
    side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader, // 片元着色器
    depthWrite: options?.depthWrite || true,
    depthTest: options?.depthTest || true,
  })
  return material
}
// 太极图
export const getTaiJiMaterial = (options?: { side?: object, transparent?: boolean, color?: THREE.Color, repeat?: number, thickness?: number, speed?: number, opacity?: number }) => {
  const tubeShader = {
    vertexshader: `
    varying vec3 v_pos;
    varying vec2 vUv;
    uniform float time;
    uniform float speed;
    void main() {
      vUv = uv;
      v_pos = position;
      //绕Y轴旋转的旋转矩阵
      float angle = -time * speed;
      //绕X轴
      // mat3 rotationMatrix = mat3(
      //   1.0,0.0,0.0,
      //   0.0,cos(angle), -sin(angle),
      //   0.0,sin(angle), cos(angle)
      // );
      //绕Y轴
      // mat3 rotationMatrix = mat3(
      //   cos(angle), 0.0, -sin(angle),
      //            0, 1.0, 0,
      //   -sin(angle),0.0, cos(angle)
      // );
      //绕Z轴
      mat3 rotationMatrix = mat3(
        cos(angle), -sin(angle),0.0,
        sin(angle), cos(angle), 0.0,
        0.0,0.0, 1.0
      );
      vec3 rotatedPosition = rotationMatrix * position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( rotatedPosition, 1.0 );
    }
        `,
    fragmentshader: `
    varying vec3 v_pos;
    varying vec2 vUv;
    void main() {
      float minR = 0.06;
      if(vUv.y>0.5){
        float dis1 = distance(vUv,vec2(0.5,0.75));
        if((vUv.x>0.5 || dis1<0.25) && dis1 > minR){
              gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
        }else{
              gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );
        }
      }else{
        float dis2 = distance(vUv,vec2(0.5,0.25));
        if((vUv.x<0.5 || dis2<0.25) && dis2 > minR){
              gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );
        }else{
              gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
        }
      }
    }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: options?.color || new THREE.Color(0x00ffff),
        type: "v3"
      },
      time: {
        value: 1,
        type: "f"
      },
      speed: {
        value: options?.speed || 3.0,
        type: "f"
      },
      opacity: {
        value: options?.opacity || 1.0,
        type: "f"
      },
    },
    side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}

// 棋盘格
export const getChessboardMaterial = (options?: { side?: object, transparent?: boolean, color?: THREE.Color, repeat?: number, thickness?: number, speed?: number, opacity?: number }) => {
  const tubeShader = {
    vertexshader: `
    varying vec3 v_pos;
    varying vec2 vUv;
    uniform float time;
    uniform float speed;
    void main() {
      vUv = uv;
      v_pos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( v_pos, 1.0 );
    }
  `,
    fragmentshader: `
    varying vec3 v_pos;
    varying vec2 vUv;
    uniform float time;
    void main() {
      float sp = 1.0/5.0;
      float m = mod(vUv.x, sp); //返回余数
      float a = step(m, sp*0.5); //用于分段,值为0或1
      float a2 = step(mod(vUv.y, sp),sp*0.5);
      if(a > 0.0 && a2 < 1.0 || a<1.0 && a2> 0.0){
        gl_FragColor = vec4( 1.0, 1.0, 1.0 - sin(time), 1.0 );
      } else {
        gl_FragColor = vec4( 0.0, 0.0, cos(time), 1.0 );
      }
    }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: options?.color || new THREE.Color(0x00ffff),
        type: "v3"
      },
      time: {
        value: 1,
        type: "f"
      },
      speed: {
        value: options?.speed || 3.0,
        type: "f"
      },
      opacity: {
        value: options?.opacity || 1.0,
        type: "f"
      },
    },
    side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}
// 流动材质 圆柱圆锥沿Y轴的流动材质
export const getFlowMaterialByY = (options?: { side?: object, transparent?: boolean, height: number, color?: THREE.Color, repeat?: number, thickness?: number, speed?: number, opacity?: number }) => {
  const tubeShader = {
    vertexshader: `
      varying vec2 vUv;
      varying vec3 modelPos;
      void main() {
        modelPos = position;
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
      `,
    fragmentshader: `
      varying vec2 vUv;
      varying vec3 modelPos;
      uniform float opacity;
      uniform vec3 color;
      uniform float time;
      uniform float speed;
      uniform float repeat;
      uniform float thickness;
      uniform float height; //传入物体高度
      void main() {
        float sp = 1.0/repeat;
        float dis = fract((modelPos.y/ height + 0.5) - 0.5*time*speed); // modelPos.y 从 -0.5height 到 0.5height
        float m = mod(dis, sp); //返回余数
        float a = step(m, sp*thickness); //用于分段,值为0或1
        gl_FragColor = vec4(color,opacity*(1.0 - (modelPos.y/height + 0.5))*a);
      }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: options?.color || new THREE.Color(0x00ffff),
        type: "v3"
      },
      time: {
        value: 1,
        type: "f"
      },
      repeat: {
        value: options?.repeat || 6,
        type: "f"
      },
      thickness: {
        value: options?.thickness || 0.5,
        type: "f"
      },
      speed: {
        value: options?.speed || 1.0,
        type: "f"
      },
      opacity: {
        value: options?.opacity || 1.0,
        type: "f"
      },
      height: { //物体高度
        value: options?.height || 8.0,
        type: "f"
      }
    },
    side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}

// 扫描材质 圆的旋转扫描材质
export const getRotateScanMaterial = (options?: { side?: object, transparent?: boolean, color?: THREE.Color, speed?: number, opacity?: number }) => {
  //常用矩阵
  //modelMatrix模型矩阵
  //modelViewMatrix模型视图矩阵
  //projectionMatrix投影矩阵
  //normalMatrix正规矩阵
  const angleFuc = `
  float angleFuc(float x,float y) { //计算此位置的角度的弧度值
    if(x>0.0){
      if(y<0.0){
        return atan(y/x) + 2.0*PI;
      }
      if(y>0.0){
        return atan(y/x);
      }
    }else{
      if(x<0.0){
        return atan(y/x)+PI;
      }else{
        if(y>0.0){
          return PI/2.0;
        }else{
          if(y<0.0){
            return -PI/2.0;
          }else{
            return 0.0;
          }
        }
      }
    }
  }
  `
  const tubeShader = {
    vertexshader: `
      varying vec2 vUv;
      varying vec2 vUv2;
      varying vec3 modelPos;
      uniform float time;
      uniform float speed;
      uniform float PI;
      `+ angleFuc + `
      //degrees 弧度转角度
      float computeX(float angle){ //angle旋转角度
        return sqrt((vUv.x-0.5)*(vUv.x-0.5) + (vUv.y-0.5)*(vUv.y-0.5)) * cos(radians(angle + degrees(angleFuc(vUv.x-0.5,vUv.y-0.5))  ));
      }
      float computeY(float angle){
        return sqrt((vUv.x-0.5)*(vUv.x-0.5) + (vUv.y-0.5)*(vUv.y-0.5)) * sin(radians(angle + degrees(angleFuc(vUv.x-0.5,vUv.y-0.5))  ));
      }
      void main() {
        float angle = fract(-speed*time)*360.0;//旋转的角度
        modelPos = position;
        vUv = uv; //记录初始位置,然后计算出旋转后的位置,初始位置保持不变,通过旋转角度计算旋转后的位置
        vUv2 = uv;
        // modelPos.z += 5.0;
        vUv2.x = 0.5 + computeX(angle); //旋转后的位置x
        vUv2.y = 0.5 + computeY(angle); //旋转后的位置y
        vec4 mvPosition = modelViewMatrix * vec4(modelPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
      `,
    fragmentshader: `
      varying vec2 vUv2;
      uniform float opacity;
      uniform vec3 color;
      uniform float PI;
      `+ angleFuc + `
      void main() {
        float e = angleFuc(vUv2.x-0.5,vUv2.y-0.5)/PI/2.0; //结果在0到1之间 //计算旋转的弧度(0-2PI)
        gl_FragColor = vec4(color, e * opacity);
      }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: options?.color || new THREE.Color(0x00ffff),
        type: "v3"
      },
      time: {
        value: 1,
        type: "f"
      },
      speed: {
        value: options?.speed || 1.0,
        type: "f"
      },
      opacity: {
        value: options?.opacity || 0.9,
        type: "f"
      },
      PI: {
        value: Math.PI,
        type: "f"
      },
    },
    side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader, // 片元着色器
    depthWrite: false, // 渲染此材质是否对深度缓冲区有任何影响。默认为true,为了不遮挡后面的模型，这里设置为false
    depthTest: false, //是否在渲染此材质时启用深度测试。默认为 true
  })
  return material
}

// 立体旋转扫描材质 圆柱绕Y轴的旋转扫描材质
export const getRotateMaterialByY = (options?: { side?: object, transparent?: boolean, color?: THREE.Color, speed?: number, opacity?: number }) => {
  //常用矩阵
  //modelMatrix模型矩阵
  //modelViewMatrix模型视图矩阵
  //projectionMatrix投影矩阵
  //normalMatrix正规矩阵
  const angleFuc = `
  float angleFuc(float x,float y) { //计算此位置的角度的弧度值
    if(x>0.0){
      if(y<0.0){
        return atan(y/x) + 2.0*PI;
      }
      if(y>0.0){
        return atan(y/x);
      }
    }else{
      if(x<0.0){
        return atan(y/x)+PI;
      }else{
        if(y>0.0){
          return PI/2.0;
        }else{
          if(y<0.0){
            return -PI/2.0;
          }else{
            return 0.0;
          }
        }
      }
    }
  }
  `
  const tubeShader = {
    vertexshader: `
      varying vec2 vUv;
      varying vec2 vUv2;
      varying vec3 modelPos;
      varying vec3 modelPos2;
      uniform float time;
      uniform float speed;
      uniform float PI;
      `+ angleFuc + `
      //degrees 弧度转角度
      float computeX(float angle){ //angle旋转角度
        return sqrt((modelPos.x-0.5)*(modelPos.x-0.5) + (modelPos.z-0.5)*(modelPos.z-0.5)) * cos(radians(angle + degrees(angleFuc(modelPos.x-0.5,modelPos.z-0.5))  ));
      }
      float computeY(float angle){
        return sqrt((modelPos.x-0.5)*(modelPos.x-0.5) + (modelPos.z-0.5)*(modelPos.z-0.5)) * sin(radians(angle + degrees(angleFuc(modelPos.x-0.5,modelPos.z-0.5))  ));
      }
      void main() {
        float angle = fract(-speed*time)*360.0;//旋转的角度
        modelPos = position;
        modelPos2 = position;//记录初始位置,然后计算出旋转后的位置,初始位置保持不变,通过旋转角度计算旋转后的位置
        // modelPos.z += 5.0;
        modelPos2.x = 0.5 + computeX(angle); //旋转后的位置x
        modelPos2.z = 0.5 + computeY(angle); //旋转后的位置z
        vec4 mvPosition = modelViewMatrix * vec4(modelPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
      `,
    fragmentshader: `
      varying vec3 modelPos2;
      uniform float opacity;
      uniform vec3 color;
      uniform float PI;
      `+ angleFuc + `
      void main() {
        float e = angleFuc(modelPos2.x-0.5,modelPos2.z-0.5)/PI/2.0; //结果在0到1之间 //计算旋转的弧度(0-2PI)
        gl_FragColor = vec4(color, e * opacity);
      }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: options?.color || new THREE.Color(0x00ffff),
        type: "v3"
      },
      time: {
        value: 1,
        type: "f"
      },
      speed: {
        value: options?.speed || 1.0,
        type: "f"
      },
      opacity: {
        value: options?.opacity || 0.4,
        type: "f"
      },
      PI: {
        value: Math.PI,
        type: "f"
      },
    },
    side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}

// 立体旋转扫描材质 圆柱绕Y轴的旋转扫描材质
export const getRotateMaterialByY2 = (options?: { side?: object, transparent?: boolean, color?: THREE.Color, speed?: number, opacity?: number }) => {
  //常用矩阵
  const angleFuc = `
  float angleFuc(float x,float y) { //计算此位置的角度的弧度值
    if(x>0.0){
      if(y<0.0){
        return atan(y/x) + 2.0*PI;
      }
      if(y>0.0){
        return atan(y/x);
      }
    }else{
      if(x<0.0){
        return atan(y/x)+PI;
      }else{
        if(y>0.0){
          return PI/2.0;
        }else{
          if(y<0.0){
            return -PI/2.0;
          }else{
            return 0.0;
          }
        }
      }
    }
  }
  `
  const tubeShader = {
    vertexshader: `
      varying vec2 vUv;
      varying vec2 vUv2;
      varying vec3 modelPos;
      varying vec3 modelPos2;
      uniform float time;
      uniform float speed;
      uniform float PI;
      varying float angle;
      `+ angleFuc + `
      //degrees 弧度转角度
      float computeX(float angle){ //angle旋转角度
        return sqrt((modelPos.x)*(modelPos.x) + (modelPos.z)*(modelPos.z)) * cos(radians(angle + degrees(angleFuc(modelPos.x,modelPos.z))  ));
      }
      float computeY(float angle){
        return sqrt((modelPos.x)*(modelPos.x) + (modelPos.z)*(modelPos.z)) * sin(radians(angle + degrees(angleFuc(modelPos.x,modelPos.z))  ));
      }
      void main() {
        vUv = uv;
        angle = fract(-speed*time)*360.0;//旋转的角度
        modelPos = position;
        modelPos2 = position;//记录初始位置,然后计算出旋转后的位置,初始位置保持不变,通过旋转角度计算旋转后的位置
        // modelPos.z += 5.0;
        modelPos2.x = computeX(angle); //旋转后的位置x
        modelPos2.z = computeY(angle); //旋转后的位置z
        vec4 mvPosition = modelViewMatrix * vec4(modelPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
      `,
    fragmentshader: `
      varying vec3 modelPos2;
      varying vec2 vUv;
      uniform float opacity;
      uniform vec3 color;
      uniform float PI;
      uniform float time;
      varying float angle;
      `+ angleFuc + `
      void main() {
        float e = angleFuc(modelPos2.x,modelPos2.z)/PI/2.0; //结果在0到1之间 //计算旋转的弧度(0-2PI)
        bool b = bool(sin(e) - mod(time*4.0-modelPos2.y,8.0));
        gl_FragColor = vec4(color, sin(e) - mod(time*4.0-modelPos2.y,4.0));
      }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: options?.color || new THREE.Color(0x00ffff),
        type: "v3"
      },
      time: {
        value: 1,
        type: "f"
      },
      speed: {
        value: options?.speed || 1.0,
        type: "f"
      },
      opacity: {
        value: options?.opacity || 0.4,
        type: "f"
      },
      PI: {
        value: Math.PI,
        type: "f"
      },
    },
    side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}
//流动线材质
export const attackLineMaterial = () => {
  //正在攻击中材质
  const tubeShader = {
    vertexshader: `
      uniform float time;
      varying vec2 vUv;
      uniform vec3 color;
      uniform float u_opacity;
      void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
      }
      `,
    fragmentshader: `
  varying vec2 vUv;
      uniform float u_opacity;
      uniform vec3 color;
      uniform float isTexture;
      uniform float time;
      uniform float speed;
      uniform float repeatX;
      void main() {
          vec4 u_color = vec4(color,u_opacity);
          gl_FragColor =  vec4(color,fract(vUv.x * repeatX - time*speed) * u_opacity * step(0.5,fract(vUv.x * repeatX - time*speed)));
      }`,
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: new THREE.Color(0x00ffff),
        type: 'v3',
      },
      time: {
        value: 0,
        type: 'f',
      },
      repeatX: {
        value: 5,
        type: 'f',
      },
      speed: {
        value: 1.0,
        type: 'f',
      },
      u_opacity: {
        value: 0.8,
        type: 'f',
      },
    },
    side: THREE.DoubleSide,
    transparent: true,
    vertexShader: tubeShader.vertexshader,
    fragmentShader: tubeShader.fragmentshader,
  })
  return material
}

// 屏闪材质，随时间变化循环屏闪
// options?:{side?: object, transparent?: boolean,color?: THREE.Color,speed?: number, opacity?: number}
export const getFlashMaterial = (options?: { side?: object, transparent?: boolean, color?: THREE.Color, speed?: number, opacity?: number }) => {
  const tubeShader = {
    vertexshader: `
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
      }
      `,
    fragmentshader: `
      uniform float opacity;
      uniform vec3 color;
      uniform float time;
      uniform float speed;
      void main() {
        float a = (sin(5.0 * time * speed) + 1.0)/2.0;
        gl_FragColor = vec4(color, a * opacity);
      }`,
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: options?.color || new THREE.Color(0x00ffff),
        type: 'v3',
      },
      time: {
        value: 1,
        type: 'f',
      },
      speed: {
        value: options?.speed || 1.0,
        type: 'f',
      },
      opacity: {
        value: options?.opacity || 0.3,
        type: 'f',
      },
    },
    // side: options?.side || THREE.DoubleSide, // side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true, // 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader, // 片元着色器
  })
  return material
}

// 浮动旋转材质，随时间变化循环浮动旋转
// options?:{side?: object, transparent?: boolean,color?: THREE.Color,speed?: number, opacity?: number}
export const getUpDownRotateMaterial = (options?: { side?: object, transparent?: boolean, color?: THREE.Color, speed?: number, opacity?: number, bool?: boolean }) => {
  const angleFuc = `
  float angleFuc(float x,float y) { //计算此位置的角度的弧度值
    if(x>0.0){
      if(y<0.0){
        return atan(y/x) + 2.0*PI;
      }
      if(y>0.0){
        return atan(y/x);
      }
    }else{
      if(x<0.0){
        return atan(y/x)+PI;
      }else{
        if(y>0.0){
          return PI/2.0;
        }else{
          if(y<0.0){
            return -PI/2.0;
          }else{
            return 0.0;
          }
        }
      }
    }
  }
  `
  const tubeShader = {
    vertexshader: `
      uniform float time;
      uniform float PI;
      uniform float speed;
      varying vec3 modelPos;
      varying vec3 modelPos2;
      `+ angleFuc + `
      float computeX(float angle){ //angle旋转角度
        return sqrt((modelPos.x)*(modelPos.x) + (modelPos.z)*(modelPos.z)) * cos(radians(angle + degrees(angleFuc(modelPos.x,modelPos.z))  ));
      }
      float computeY(float angle){
        return sqrt((modelPos.x)*(modelPos.x) + (modelPos.z)*(modelPos.z)) * sin(radians(angle + degrees(angleFuc(modelPos.x,modelPos.z))  ));
      }
      void main() {
        float angle = fract(-speed*time*0.2)*360.0;//旋转的角度
        modelPos = position;
        modelPos2 = position;
        modelPos2.y += sin(time*5.0 - PI);
        modelPos2.x = computeX(angle); //旋转后的位置x
        modelPos2.z = computeY(angle); //旋转后的位置z
        vec4 mvPosition = modelViewMatrix * vec4(modelPos2, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
      `,
    fragmentshader: `
      uniform float opacity;
      uniform vec3 color;
      uniform float time;
      uniform float speed;
      uniform bool b;
      void main() {
        float a = (sin(5.0 * time * speed) + 1.5)/2.0;
        gl_FragColor = b ? vec4(color, a * opacity) : vec4(color, opacity);
      }`,
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: options?.color || new THREE.Color(0x00ffff),
        type: 'v3',
      },
      time: {
        value: 1,
        type: 'f',
      },
      speed: {
        value: options?.speed || 1,
        type: 'f',
      },
      opacity: {
        value: options?.opacity || 0.3,
        type: 'f',
      },
      bool: {
        value: options?.bool || true,
        type: 'b',
      },
      PI: {
        value: Math.PI,
        type: "f"
      },
    },
    // wireframe: true,
    side: options?.side || THREE.DoubleSide, // side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true, // 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader, // 片元着色器
  })
  return material
}
// 立体旋转扫描材质 圆柱绕中心轴的旋转 垂直间隔栅格
export const getRotateMaterialByY3 = (options?: { side?: object, transparent?: boolean, color?: THREE.Color, speed?: number, opacity?: number, edge?: number }) => {
  const angleFuc = `
  float angleFuc(float x,float y) { //计算此位置的角度的弧度值
    if(x>0.0){
      if(y<0.0){
        return atan(y/x) + 2.0*PI;
      }
      if(y>0.0){
        return atan(y/x);
      }
    }else{
      if(x<0.0){
        return atan(y/x)+PI;
      }else{
        if(y>0.0){
          return PI/2.0;
        }else{
          if(y<0.0){
            return -PI/2.0;
          }else{
            return 0.0;
          }
        }
      }
    }
  }
  `
  const tubeShader = {
    vertexshader: `
      varying vec2 vUv;
      varying vec2 vUv2;
      varying vec3 modelPos;
      varying vec3 modelPos2;
      uniform float time;
      uniform float speed;
      uniform float PI;
      `+ angleFuc + `
      //degrees 弧度转角度
      float computeX(float angle){ //angle旋转角度
        return sqrt((modelPos.x)*(modelPos.x) + (modelPos.z)*(modelPos.z)) * cos(radians(angle + degrees(angleFuc(modelPos.x,modelPos.z))));
      }
      float computeY(float angle){
        return sqrt((modelPos.x)*(modelPos.x) + (modelPos.z)*(modelPos.z)) * sin(radians(angle + degrees(angleFuc(modelPos.x,modelPos.z))));
      }
      void main() {
        float angle = fract(-speed*time*0.5)*360.0;//旋转的角度
        modelPos = position;
        modelPos2 = position;//记录初始位置,然后计算出旋转后的位置,初始位置保持不变,通过旋转角度计算旋转后的位置
        modelPos2.x = computeX(angle); //旋转后的位置x
        modelPos2.z = computeY(angle); //旋转后的位置z
        vec4 mvPosition = modelViewMatrix * vec4(modelPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
      `,
    fragmentshader: `
      varying vec3 modelPos2;
      uniform float opacity;
      uniform float edge;
      uniform vec3 color;
      uniform float PI;
      `+ angleFuc + `
      void main() {
        float e = angleFuc(modelPos2.x,modelPos2.z)/PI/2.0; //结果在0到1之间 //计算旋转的弧度(0-2PI)
        gl_FragColor = vec4(color, step(mod(e, 1.0/edge), 0.5/edge) * opacity);
      }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: options?.color || new THREE.Color(0x00ffff),
        type: "v3"
      },
      time: {
        value: 1,
        type: "f"
      },
      speed: {
        value: options?.speed || 1.0,
        type: "f"
      },
      opacity: {
        value: options?.opacity || 0.4,
        type: "f"
      },
      PI: {
        value: Math.PI,
        type: "f"
      },
      edge: {
        value: options?.edge || 4.0,
        type: "f"
      }
    },
    side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}

export const getBatteryMaterial = () => {
  const tubeShader = {
    vertexshader: `
      varying vec2 vUv;
      varying vec2 vUv2;
      varying vec3 modelPos;
      uniform float time;
      uniform float speed;
      uniform float PI;
      void main() {
        modelPos = position;
        vec4 mvPosition = modelViewMatrix * vec4(modelPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
      `,
    fragmentshader: `
      uniform float opacity;
      uniform vec3 color;
      uniform float PI;
      varying vec3 modelPos;
      void main() {
          gl_FragColor = vec4(color, 1.0 * opacity * (1.0 - (modelPos.y + 2.0)/4.0));
      }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: {
        value: new THREE.Color(0xff0000),
        type: "v3"
      },
      time: {
        value: 1,
        type: "f"
      },
      speed: {
        value: 1.0,
        type: "f"
      },
      opacity: {
        value: 0.2,
        type: "f"
      },
      PI: {
        value: Math.PI,
        type: "f"
      },
    },
    side: THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}

// 材质
export const getSunMaterial = (options?: { url1?:string,url2?:string, side?: object, transparent?: boolean, height?: number, color?: THREE.Color, repeat?: number, thickness?: number, speed?: number, opacity?: number }) => {
  const tubeShader = {
    vertexshader: `
      uniform vec2 uvScale;
			varying vec2 vUv;

			void main()
			{

				vUv = uvScale * uv;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_Position = projectionMatrix * mvPosition;

			}
      `,
    fragmentshader: `
    uniform float time;

    uniform float fogDensity;
    uniform vec3 fogColor;

    uniform sampler2D texture1;
    uniform sampler2D texture2;

    varying vec2 vUv;

    void main( void ) {

      vec2 position = - 1.0 + 2.0 * vUv;

      vec4 noise = texture2D( texture1, vUv );
      vec2 T1 = vUv + vec2( 1.5, - 1.5 ) * time * 0.02;
      vec2 T2 = vUv + vec2( - 0.5, 2.0 ) * time * 0.01;

      T1.x += noise.x * 2.0;
      T1.y += noise.y * 2.0;
      T2.x -= noise.y * 0.2;
      T2.y += noise.z * 0.2;

      float p = texture2D( texture1, T1 * 2.0 ).a;

      vec4 color = texture2D( texture2, T2 * 2.0 );
      vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );

      if( temp.r > 1.0 ) { temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }
      if( temp.g > 1.0 ) { temp.rb += temp.g - 1.0; }
      if( temp.b > 1.0 ) { temp.rg += temp.b - 1.0; }

      gl_FragColor = temp;

      float depth = gl_FragCoord.z / gl_FragCoord.w;
      const float LOG2 = 1.442695;
      float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
      fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );

      gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

    }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      'fogDensity': { value: 0.45 },
      'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },//雾色
      'time': { value: 1.0 },
      'uvScale': { value: new THREE.Vector2( 3.0, 1.0 ) },
      'texture1': { value: new THREE.TextureLoader().load(options?.url1 || '') },
      'texture2': { value: new THREE.TextureLoader().load(options?.url2 || '') }

    },
    side: options?.side || THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: options?.transparent || true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}

// 测试材质
export const getTestMaterial = () => {
  const tubeShader = {
    vertexshader: `
			varying vec2 vUv;
			void main()
			{
				vUv = uv;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_Position = projectionMatrix * mvPosition;
			}
      `,
    fragmentshader: `
    uniform float time;
    varying vec2 vUv;
    void main( void ) {
      // Normalized pixel coordinates (from 0 to 1)
      vec3 rayPosition = vec3(0.0,0.0,0.0);
      vec3 rayTarget = vec3(vUv*2.0 - 1.0,fract(time*0.4));
      vec3 rayDir = normalize(rayTarget - rayPosition);
      // Output to screen
      gl_FragColor = vec4(rayDir, 1.0);
    }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      'time': { value: 1.0 },
    },
    side: THREE.DoubleSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}

// 球体护盾特效
export const getShieldMaterial = () => {
  const tubeShader = {
    vertexshader: `
			varying vec2 vUv;
      varying float vIntensity;
      varying float alpha;
			void main()
			{
				vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position,1.0); //通过模型矩阵将位置转世界坐标
        vec3 worldNormal = normalize(modelMatrix * vec4(normal,0.0)).xyz; //通过模型矩阵将法线向量转世界坐标,再归一化

        vec3 dirToCamera = normalize(cameraPosition - worldPosition.xyz);
        vIntensity = 1.0 - dot(worldNormal, dirToCamera);//dot()点积
        alpha = 1.0 - dot(worldNormal, dirToCamera);
        vIntensity = pow(vIntensity, 1.0);
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}
      `,
    fragmentshader: `
    uniform float time;
    varying vec2 vUv;
    varying float vIntensity;
    varying float alpha;
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    // First corner
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
    // Other corners
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      //  x0 = x0 - 0. + 0.0 * C
      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1. + 3.0 * C.xxx;
    // Permutations
      i = mod(i, 289.0 );
      vec4 p = permute( permute( permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    // Gradients
    // ( N*N points uniformly over a square, mapped onto an octahedron.)
      float n_ = 1.0/7.0; // N=7
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
    //Normalise gradients
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
    // Mix final noise value
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3) ) );
    }
    void main( void ) {
      // vec2 nuv = vUv;
      vec2 uv = vUv;
      uv.y += time * 0.3;
    float scale = .2;
    float rate = 5.0;
    float t = time/rate;
    float result = 0.0;
    //octaves
    for (float i = 0.0; i < 5.0; i++){
    	result += snoise(vec3((abs(uv.x - 0.5)*2.0)/scale, (uv.y)/scale, t*2.0))/pow(2.0, i);
        scale /= 2.0;
    }
    result = (result + 1.0)/4.0;
    result += .5;
    result = pow(result, 2.0);
    float g = pow(result, 4.0);
    gl_FragColor = vec4(0, g, result, vIntensity);
    }`
  }
  const material = new THREE.ShaderMaterial({
    uniforms: {
      'time': { value: 1.0 },
    },
    side: THREE.FrontSide,// side属性的默认值是前面THREE.FrontSide，. 其他值：后面THREE.BackSide 或 双面THREE.DoubleSide.
    transparent: true,// 是否透明
    vertexShader: tubeShader.vertexshader, // 顶点着色器
    fragmentShader: tubeShader.fragmentshader // 片元着色器
  })
  return material
}