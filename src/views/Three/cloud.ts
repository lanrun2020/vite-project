import * as T from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ImprovedNoise } from 'three/examples/jsm//math/ImprovedNoise.js';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js'
const THREE = T
let that: cloudScene
let mesh
export default class cloudScene {
  private dom!: HTMLElement
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls: OrbitControls
  private requestId: number
  private cube!: THREE.Mesh
  constructor(dom: HTMLElement) {
    that = this
    this.dom = dom
    this.init()
  }

  // 初始化
  async init() {
    // 第一步新建一个场景
    this.setScene();
    this.setRenderer();
    this.setCamera();
    this.setLight();
    this.setControls();
    this.addCloud();
    window.addEventListener('resize', this.onWindowResize);
    this.animate();
  }

  // 设置场景
  setScene() {
    this.scene = new THREE.Scene();
    // Grid 添加网格辅助对象
    const helper = new THREE.GridHelper(100, 30, 0x303030, 0x303030); //长度1000 划分为50份
    // this.scene.add(helper);
    // 辅助三维坐标系
    const axesHelper = new THREE.AxesHelper(500);
    // this.scene.add(axesHelper)
  }

  // 设置渲染器
  setRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.renderer.setClearColor(0x041336);
    this.dom.appendChild(this.renderer.domElement);
  }

  // 设置透视相机
  setCamera() {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(75, this.dom.offsetWidth / this.dom.offsetHeight, 0.01, 1000);
    this.camera.position.set(0, 1, 1)
  }

  // 设置光源
  setLight() {
    if (this.scene) {
      // 环境光
      const ambient = new THREE.AmbientLight(0xbbbbbb);
      this.scene.add(ambient);
      const directionalLight = new THREE.DirectionalLight(0x666666);
      directionalLight.position.set(10, -50, 300);
      this.scene.add(directionalLight);
    }
  }

  // 设置控制器
  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement) //轨道控制器
    this.controls.update();
    this.controls.enableDamping = true; // 阻尼（惯性）是否启用
    this.controls.dampingFactor = 0.05; // 阻尼系数
    this.controls.screenSpacePanning = false; //定义平移时如何平移相机的位置。如果为 true，则相机在屏幕空间中平移。否则，相机会在与相机向上方向正交的平面中平移。OrbitControls 默认为 true；MapControls 为 false。
    // controls.minDistance = 50; //移动最小距离
    this.controls.maxDistance = 1500; //移动最大距离
    this.controls.maxPolarAngle = Math.PI; //垂直轨道多远，上限。范围为 0 到 Math.PI 弧度，默认为 Math.PI
  }

  // 渲染
  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // 动画
  animate() {
    this.requestId = requestAnimationFrame(() => this.animate());
    this.controls.update()
    // 设置画布的大小
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    mesh.material.uniforms.cameraPos.value.copy(this.camera.position);
    mesh.rotation.y = - performance.now() / 7500;
    mesh.material.uniforms.frame.value++;
    this.render();
    // if(this.cube){
    //   const position = this.cube.position.clone()
    //   this.camera.lookAt(position)
    //   this.controls.target = position
    // }
  }

  // 监听窗口变化，重新设置画布大小
  onWindowResize() {
    if (that.dom && that.dom.offsetWidth) {
      that.camera.aspect = that.dom.offsetWidth / that.dom.offsetHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(that.dom.offsetWidth, that.dom.offsetHeight);
    }
  }

  // 停止渲染
  stop() {
    window.removeEventListener('resize', this.onWindowResize)
    cancelAnimationFrame(this.requestId)
  }

  addCloud() {
    //创建立体云
    const size = 128;
    const data = new Uint8Array(size * size * size);

    let i = 0;
    const scale = 0.05;
    const perlin = new ImprovedNoise();
    const vector = new THREE.Vector3();

    for (let z = 0; z < size; z++) {

      for (let y = 0; y < size; y++) {

        for (let x = 0; x < size; x++) {

          const d = 1.0 - vector.set(x, y, z).subScalar(size / 2).divideScalar(size).length();
          data[i] = (size + size * perlin.noise(x * scale / 1.5, y * scale, z * scale / 1.5)) * d * d;
          i++;

        }

      }

    }
    

    const texture = new THREE.Data3DTexture(data, size, size, size);
    texture.format = THREE.RedFormat;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.unpackAlignment = 1;
    texture.needsUpdate = true;
    const vertexShader = /* glsl */`
      in vec3 position;

      uniform mat4 modelMatrix;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform vec3 cameraPos;

      out vec3 vOrigin;
      out vec3 vDirection;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        //相机观察点
        vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;//inverse函数求取矩阵的逆
        /*
        在Three.js的着色器中,inverse(modelMatrix) * vec4(cameraPosition, 1.0)是用来将摄像机位置从世界坐标系转换到模型本地坐标系。
        让我们详细解释一下其中的步骤：
        modelMatrix是模型矩阵,它定义了模型的位置、旋转和缩放等变换信息。
        cameraPosition是摄像机的位置向量,在世界坐标系下表示。
        vec4(cameraPosition, 1.0)将摄像机位置向量扩展为齐次坐标形式,其中w分量设置为1.0。
        inverse(modelMatrix)计算模型矩阵的逆矩阵，这样就可以将坐标从模型本地坐标系转换回世界坐标系。
        inverse(modelMatrix) * vec4(cameraPosition, 1.0)将摄像机位置向量从世界坐标系转换为模型本地坐标系。
        通过执行上述操作，我们可以在着色器中获得相对于模型的相机位置，以便进行后续的计算和渲染。
        */
        vDirection = position - vOrigin; //得到观察方向

        //计算顶点着色器中顶点的位置
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = /* glsl */`
    //precision 关键字用于指定变量的精度级别。它可以是 highp高精度、mediump中精度或 lowp低精度。
    precision highp float;
    precision highp sampler3D;
    
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    in vec3 vOrigin;
    in vec3 vDirection;

    out vec4 color;

    uniform vec3 base;
    uniform sampler3D map;

    uniform float threshold;
    uniform float range;
    uniform float opacity;
    uniform float steps;
    uniform float frame;

    uint wang_hash(uint seed)
    {
        seed = (seed ^ 61u) ^ (seed >> 16u);
        seed *= 9u;
        seed = seed ^ (seed >> 4u);
        seed *= 0x27d4eb2du;
        seed = seed ^ (seed >> 15u);
        return seed;
    }

    //随机数
    float randomFloat(inout uint seed)
    {
        return float(wang_hash(seed)) / 4294967296.;
    }

    vec2 hitBox( vec3 orig, vec3 dir ) { //orig相机位置, dir观察方向单位向量(经过了归一化)
      const vec3 box_min = vec3( -0.5 );
      const vec3 box_max = vec3( 0.5 );
      vec3 inv_dir = 1.0 / dir; 
      vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
      vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
      vec3 tmin = min( tmin_tmp, tmax_tmp );
      vec3 tmax = max( tmin_tmp, tmax_tmp );
      float t0 = max( tmin.x, max( tmin.y, tmin.z ) ); //最小值中的最大值
      float t1 = min( tmax.x, min( tmax.y, tmax.z ) ); //最大值中的最小值
      return vec2( t0, t1 ); //大部分是t0<t1
    }

    float sample1( vec3 p ) {
      return texture( map, p ).r; //传入vec3坐标点p,通过texture纹理函数获取map中对应位置的深度值
    }

    float shading( vec3 coord ) {
      float step = 0.01;
      return sample1( coord + vec3( - step ) ) - sample1( coord + vec3( step ) );
    }

    vec4 linearToSRGB( in vec4 value ) {
      return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
    }

    void main(){
      vec3 rayDir = normalize( vDirection ); //各顶点到相机方向, 即观察方向
      vec2 bounds = hitBox( vOrigin, rayDir );//vOrigin相机位置
      //bounds : (min,max)
      if ( bounds.x > bounds.y ) discard;

      bounds.x = max( bounds.x, 0.0 );

      vec3 p = vOrigin + bounds.x * rayDir;
      vec3 inc = 1.0 / abs( rayDir );
      float delta = min( inc.x, min( inc.y, inc.z ) );
      delta /= steps;

      uint seed = uint( gl_FragCoord.x ) * uint( 1973 ) + uint( gl_FragCoord.y ) * uint( 19277 ) + uint( frame ) * uint( 26699 );
      vec3 size = vec3( textureSize( map, 0 ) ); //textureSize纹理尺寸
      float randNum = randomFloat( seed ) * 2.0 - 1.0;
      p += rayDir * randNum * ( 1.0 / size );

      vec4 ac = vec4( base, 0.0 );

      for ( float t = bounds.x; t < bounds.y; t += delta ) {

        float d = sample1( p + 0.5 );

        d = smoothstep( threshold - range, threshold + range, d ) * opacity;

        float col = shading( p + 0.5 ) * 3.0 + ( ( p.x + p.y ) * 0.25 ) + 0.2;

        ac.rgb += ( 1.0 - ac.a ) * d * col;

        ac.a += ( 1.0 - ac.a ) * d;

        if ( ac.a >= 0.95 ) break;

        p += rayDir * delta;

      }

      // color = linearToSRGB( ac );//线性划分
      color = ac;

      if ( color.a == 0.0 ) discard;

    }
  `;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: {
        base: { value: new THREE.Color(0x798aa0) },
        map: { value: texture },
        threshold: { value: 0.25 },
        cameraPos: { value: new THREE.Vector3() },
        opacity: { value: 0.25 },
        range: { value: 0.1 },
        steps: { value: 100 },
        frame: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
      transparent: true
    });

    mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    const parameters = {
      threshold: 0.25,
      opacity: 0.25,
      range: 0.1,
      steps: 100
    };

    function update() {

      material.uniforms.threshold.value = parameters.threshold;
      material.uniforms.opacity.value = parameters.opacity;
      material.uniforms.range.value = parameters.range;
      material.uniforms.steps.value = parameters.steps;

    }

    const gui = new GUI();
    this.dom.appendChild(gui.domElement)
    gui.domElement.style.position = 'absolute'
    gui.domElement.style.right = '0px'
    gui.add(parameters, 'threshold', 0, 1, 0.01).name('阈值').onChange(update);
    gui.add(parameters, 'opacity', 0, 1, 0.01).name('不透明度').onChange(update);
    gui.add(parameters, 'range', 0, 1, 0.01).name('范围').onChange(update);
    gui.add(parameters, 'steps', 0, 200, 1).name('分段').onChange(update);

  }
}
