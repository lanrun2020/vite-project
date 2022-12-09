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
        gl_FragColor = texture2D(u_map,vUv);
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

// 扫描材质 圆的扩散扫描材质
export const getScanMaterial = (options?:{side?: object, transparent?: boolean,color?: THREE.Color,repeat?:number,thickness?: number,speed?: number, opacity?: number}) => {
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
export const getFlowMaterialByY = (options?:{side?: object, transparent?: boolean,height:number, color?: THREE.Color,repeat?:number,thickness?: number,speed?: number, opacity?: number}) => {
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
export const getRotateScanMaterial = (options?:{side?: object, transparent?: boolean,color?: THREE.Color,speed?: number, opacity?: number}) => {
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
export const getRotateMaterialByY = (options?:{side?: object, transparent?: boolean,color?: THREE.Color,speed?: number, opacity?: number}) => {
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
export const getFlashMaterial = (options?:{side?: object, transparent?: boolean,color?: THREE.Color,speed?: number, opacity?: number}) => {
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