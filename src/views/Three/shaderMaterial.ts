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
    void main() {
      vp = position;
      vUv = uv;
      float dis = vUv.x;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      modelPosition.z += sin(modelPosition.x * repeat / 2.0  - 2.0*time) * 1.2 * dis; //保证起始位置不动,越往后,摆动弧度越大
      modelPosition.y += sin(modelPosition.x * repeat  - 2.0*time) * 0.5 * dis - 1.5*dis*dis;
      gl_Position = projectionMatrix * viewMatrix  * modelPosition;
    }
        `,
    fragmentshader: `
    varying vec2 vUv;
    uniform sampler2D u_map;
    uniform float u_opacity;
    uniform float time;
    void main() {
        vec2 vUv2 = vUv;
        // vUv2.x = fract(vUv.x - time);
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
#define EPSILON_NRM (0.1 / iResolution.x)

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
    uniform vec2 iResolution;
    // 鼠标位置
    uniform vec2 iMouse;
    varying vec2 vUv;
    `+ methods + `
    void main() {
      vec2 uv = gl_FragCoord.xy / iResolution.xy;
      uv = uv * 2.0 - 1.0;
      uv.x *= iResolution.x / iResolution.y;
      float time2 = time * 0.3 + iMouse.x*0.01;
      // ray
      vec3 ang = vec3(0.0, 0.0, 1.0);
      vec3 ori = vec3(0.0,3.5,time2*5.0);
      vec3 dir = normalize(vec3(uv.xy,-2.0));
      dir.z += length(uv) * 0.15;
      dir = normalize(dir) * fromEuler(ang);
      // tracing
      vec3 p;
      heightMapTracing(ori,dir,p);
      vec3 dist = p - ori;
      vec3 n = getNormal(p, dot(dist,dist) * EPSILON_NRM);
      vec3 light = normalize(vec3(0.0,1.0,0.8));
      // color
      vec3 color = mix(
          getSkyColor(dir),
          getSeaColor(p,n,light,dir,dist),
          pow(smoothstep(0.0,-0.05,dir.y),0.3));
      // post
      gl_FragColor = vec4(pow(color,vec3(0.75)), 0.5);
    }`
  }
  // const texture = new THREE.TextureLoader().load(options?.url || ''); //首先，获取到材质贴图纹理
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: {
        value: 1,
        type: "f"
      },
      iResolution: { value: new THREE.Vector2(1500.0, 1500.0) },
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
export const getScanMaterial = (options?: { side?: object, transparent?: boolean, color?: THREE.Color, repeat?: number, thickness?: number, speed?: number, opacity?: number }) => {
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
  const eagleFuc = `
  float eagleFuc(float x,float y) { //计算此位置的角度的弧度值
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
      `+ eagleFuc + `
      //degrees 弧度转角度
      float computeX(float eagle){ //eagle旋转角度
        return sqrt((vUv.x-0.5)*(vUv.x-0.5) + (vUv.y-0.5)*(vUv.y-0.5)) * cos(radians(eagle + degrees(eagleFuc(vUv.x-0.5,vUv.y-0.5))  ));
      }
      float computeY(float eagle){
        return sqrt((vUv.x-0.5)*(vUv.x-0.5) + (vUv.y-0.5)*(vUv.y-0.5)) * sin(radians(eagle + degrees(eagleFuc(vUv.x-0.5,vUv.y-0.5))  ));
      }
      void main() {
        float eagle = fract(-speed*time)*360.0;//旋转的角度
        modelPos = position;
        vUv = uv; //记录初始位置,然后计算出旋转后的位置,初始位置保持不变,通过旋转角度计算旋转后的位置
        vUv2 = uv;
        // modelPos.z += 5.0;
        vUv2.x = 0.5 + computeX(eagle); //旋转后的位置x
        vUv2.y = 0.5 + computeY(eagle); //旋转后的位置y
        vec4 mvPosition = modelViewMatrix * vec4(modelPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
      `,
    fragmentshader: `
      varying vec2 vUv2;
      uniform float opacity;
      uniform vec3 color;
      uniform float PI;
      `+ eagleFuc + `
      void main() {
        float e = eagleFuc(vUv2.x-0.5,vUv2.y-0.5)/PI/2.0; //结果在0到1之间 //计算旋转的弧度(0-2PI)
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
    fragmentShader: tubeShader.fragmentshader // 片元着色器
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
  const eagleFuc = `
  float eagleFuc(float x,float y) { //计算此位置的角度的弧度值
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
      `+ eagleFuc + `
      //degrees 弧度转角度
      float computeX(float eagle){ //eagle旋转角度
        return sqrt((modelPos.x-0.5)*(modelPos.x-0.5) + (modelPos.z-0.5)*(modelPos.z-0.5)) * cos(radians(eagle + degrees(eagleFuc(modelPos.x-0.5,modelPos.z-0.5))  ));
      }
      float computeY(float eagle){
        return sqrt((modelPos.x-0.5)*(modelPos.x-0.5) + (modelPos.z-0.5)*(modelPos.z-0.5)) * sin(radians(eagle + degrees(eagleFuc(modelPos.x-0.5,modelPos.z-0.5))  ));
      }
      void main() {
        float eagle = fract(-speed*time)*360.0;//旋转的角度
        modelPos = position;
        modelPos2 = position;//记录初始位置,然后计算出旋转后的位置,初始位置保持不变,通过旋转角度计算旋转后的位置
        // modelPos.z += 5.0;
        modelPos2.x = 0.5 + computeX(eagle); //旋转后的位置x
        modelPos2.z = 0.5 + computeY(eagle); //旋转后的位置z
        vec4 mvPosition = modelViewMatrix * vec4(modelPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
      `,
    fragmentshader: `
      varying vec3 modelPos2;
      uniform float opacity;
      uniform vec3 color;
      uniform float PI;
      `+ eagleFuc + `
      void main() {
        float e = eagleFuc(modelPos2.x-0.5,modelPos2.z-0.5)/PI/2.0; //结果在0到1之间 //计算旋转的弧度(0-2PI)
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
  const eagleFuc = `
  float eagleFuc(float x,float y) { //计算此位置的角度的弧度值
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
      varying float eagle;
      `+ eagleFuc + `
      //degrees 弧度转角度
      float computeX(float eagle){ //eagle旋转角度
        return sqrt((modelPos.x)*(modelPos.x) + (modelPos.z)*(modelPos.z)) * cos(radians(eagle + degrees(eagleFuc(modelPos.x,modelPos.z))  ));
      }
      float computeY(float eagle){
        return sqrt((modelPos.x)*(modelPos.x) + (modelPos.z)*(modelPos.z)) * sin(radians(eagle + degrees(eagleFuc(modelPos.x,modelPos.z))  ));
      }
      void main() {
        vUv = uv;
        eagle = fract(-speed*time)*360.0;//旋转的角度
        modelPos = position;
        modelPos2 = position;//记录初始位置,然后计算出旋转后的位置,初始位置保持不变,通过旋转角度计算旋转后的位置
        // modelPos.z += 5.0;
        modelPos2.x = computeX(eagle); //旋转后的位置x
        modelPos2.z = computeY(eagle); //旋转后的位置z
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
      varying float eagle;
      `+ eagleFuc + `
      void main() {
        float e = eagleFuc(modelPos2.x,modelPos2.z)/PI/2.0; //结果在0到1之间 //计算旋转的弧度(0-2PI)
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
  const eagleFuc = `
  float eagleFuc(float x,float y) { //计算此位置的角度的弧度值
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
      `+ eagleFuc + `
      float computeX(float eagle){ //eagle旋转角度
        return sqrt((modelPos.x)*(modelPos.x) + (modelPos.z)*(modelPos.z)) * cos(radians(eagle + degrees(eagleFuc(modelPos.x,modelPos.z))  ));
      }
      float computeY(float eagle){
        return sqrt((modelPos.x)*(modelPos.x) + (modelPos.z)*(modelPos.z)) * sin(radians(eagle + degrees(eagleFuc(modelPos.x,modelPos.z))  ));
      }
      void main() {
        float eagle = fract(-speed*time*0.2)*360.0;//旋转的角度
        modelPos = position;
        modelPos2 = position;
        modelPos2.y += sin(time*5.0 - PI);
        modelPos2.x = computeX(eagle); //旋转后的位置x
        modelPos2.z = computeY(eagle); //旋转后的位置z
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
  const eagleFuc = `
  float eagleFuc(float x,float y) { //计算此位置的角度的弧度值
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
      `+ eagleFuc + `
      //degrees 弧度转角度
      float computeX(float eagle){ //eagle旋转角度
        return sqrt((modelPos.x-0.5)*(modelPos.x-0.5) + (modelPos.z-0.5)*(modelPos.z-0.5)) * cos(radians(eagle + degrees(eagleFuc(modelPos.x-0.5,modelPos.z-0.5))  ));
      }
      float computeY(float eagle){
        return sqrt((modelPos.x-0.5)*(modelPos.x-0.5) + (modelPos.z-0.5)*(modelPos.z-0.5)) * sin(radians(eagle + degrees(eagleFuc(modelPos.x-0.5,modelPos.z-0.5))  ));
      }
      void main() {
        float eagle = fract(-speed*time*0.5)*360.0;//旋转的角度
        modelPos = position;
        modelPos2 = position;//记录初始位置,然后计算出旋转后的位置,初始位置保持不变,通过旋转角度计算旋转后的位置
        // modelPos.z += 5.0;
        modelPos2.x = 0.5 + computeX(eagle); //旋转后的位置x
        modelPos2.z = 0.5 + computeY(eagle); //旋转后的位置z
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
      `+ eagleFuc + `
      void main() {
        float e = eagleFuc(modelPos2.x-0.5,modelPos2.z-0.5)/PI/2.0; //结果在0到1之间 //计算旋转的弧度(0-2PI)
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