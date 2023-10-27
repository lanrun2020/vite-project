// 等高线
import Cesium from "@/utils/importCesium"
import * as turf from "@turf/turf"
const entity: Array<object> = []
let primitive: object
let primitives: any
export const addContourLine = (viewer: any, active: boolean) => {
  if (active) {
    if (entity?.length) return
      const terrainProvider = new Cesium.createWorldTerrain()
      const pos = []
      const extent = [106.64396446248583,30.077195435475748, 106.80509638145465, 30.209849307650593];
      const cellSide = 0.5;
      const options = {units: 'miles'};

      const grid = turf.pointGrid(extent, cellSide, options); //计算点网格
      console.log(grid);//经纬度
      grid.features.forEach((item) => {
        pos.push(Cesium.Cartographic.fromDegrees(item.geometry.coordinates[0], item.geometry.coordinates[1]))
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(...item.geometry.coordinates),
          point: {
            pixelSize: 10,
            color: Cesium.Color.YELLOW,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
        })
      })
      const promise = Cesium.sampleTerrain(terrainProvider, 11, pos);
      Promise.resolve(promise).then(function(updatedPositions) {
        //console.log(updatedPositions)//弧度加高度
        //转世界坐标
        const arr = updatedPositions.map((item) => {
          //item
          const cartesian3 = new Cesium.Cartesian3();
          Cesium.Ellipsoid.WGS84.cartographicToCartesian(
            item,
            cartesian3
          );
          return cartesian3 //笛卡尔世界坐标集合
        })
      })
      // const primitiveShader = viewer.scene.primitives.add(
      //   new CustomPrimitive(position)
      // );
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(106.70296568464478, 30.209849307650593, 3000.0),
          duration: 1.6
        });
  } else {
    if (primitives) {
      primitives.removeAll()
    }
  }
}

class CustomPrimitive {
  private show
  private drawCommand: any
  private faceResolution
  private cartographicPosition: any
  private modelMatrix: any
  private halfWidthMeters: any
  private boundingSphere: any
  private time: any
  constructor(cartographicPosition: any) {
    this.show = true;

    // This is initialized in the first call of update()
    // so we don't need a context
    this.drawCommand = undefined;

    // number of faces wide. There are resolution + 1 vertices.
    this.faceResolution = 10;

    // Compute a model matrix that puts the surface at a specific point on
    // the globe.
    // 计算一个模型矩阵，将表面放在地球上的一个特定点上
    this.cartographicPosition = cartographicPosition;
    const cartesianPosition = Cesium.Cartographic.toCartesian(
      cartographicPosition,
      Cesium.Ellipsoid.WGS84,
      new Cesium.Cartesian3()
    );
    this.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
      cartesianPosition,
      Cesium.Ellipsoid.WGS84,
      new Cesium.Matrix4()
    );

    this.halfWidthMeters = 10000;
    this.boundingSphere = new Cesium.BoundingSphere(
      cartesianPosition,
      this.halfWidthMeters * Math.SQRT2
    );

    this.time = undefined;
  }
  //会一直回调,直到销毁
  update(frameState: { context: any; commandList: any[]; }) {
    if (!this.show) {
      return;
    }

    // Rendering resources are initialized in the first update() call
    // so we have access to the rendering context
    if (!Cesium.defined(this.drawCommand)) {
      initialize(this, frameState.context);
    }

    frameState.commandList.push(this.drawCommand);
  }
  isDestroyed(){
    return this.show
  }
  destroy(){
    this.show = false
  }
}

/**
 * generate a quad that's subdivided into faceResolution x faceResolution quads.
 * The vertices will be adjusted in the vertex shader.
 * 生成一个细分为facerresolution x facerresolution的四边形
 * 顶点将在顶点着色器中进行调整
 * 返回每个点位的位置数据
 */
const generateVertices = (faceResolution: number, halfWidthMeters: number) => {
  // faceResolution 分辨率 10 ,halfWidthMeters 10000米
  const vertexResolution = faceResolution + 1;
  const vertexCount = vertexResolution * vertexResolution;
  const componentsPerVertex = 3;
  const vertices = new Float32Array(vertexCount * componentsPerVertex);
  for (let i = 0; i < vertexResolution; i++) {
    for (let j = 0; j < vertexResolution; j++) {
      const u = i / (vertexResolution - 1);
      const v = j / (vertexResolution - 1);
      const index = i * vertexResolution + j;
      const x = halfWidthMeters * (2 * u - 1);
      const y = halfWidthMeters * (2 * v - 1);
      const z = 0;

      vertices[index * componentsPerVertex] = x;
      vertices[index * componentsPerVertex + 1] = y;
      vertices[index * componentsPerVertex + 2] = z;
    }
  }
  return vertices;
}

/**
 * Tessellate a big square region into faceResolution x faceResolution quads
 * 将一个大的正方形区域镶嵌为facerresolution x facerresolution四边形，返回点位下标集合
 */
const generateIndices = (faceResolution: number) => {
  const indicesPerQuad = 6;
  const indexCount = faceResolution * faceResolution * indicesPerQuad;
  const indices = new Uint16Array(indexCount);

  const vertexResolution = faceResolution + 1;

  let quadIndex = 0;
  for (let i = 0; i < faceResolution; i++) {
    for (let j = 0; j < faceResolution; j++) {
      const a = i * vertexResolution + j;
      const b = i * vertexResolution + (j + 1);
      const c = (i + 1) * vertexResolution + (j + 1);
      const d = (i + 1) * vertexResolution + j;

      indices[quadIndex * indicesPerQuad] = a;
      indices[quadIndex * indicesPerQuad + 1] = b;
      indices[quadIndex * indicesPerQuad + 2] = c;
      indices[quadIndex * indicesPerQuad + 3] = c;
      indices[quadIndex * indicesPerQuad + 4] = d;
      indices[quadIndex * indicesPerQuad + 5] = a;
      quadIndex++;
    }
  }
  //[0,1,12,  12,11,0]是第一个格子的两个三角形点位下标集合
  //一共100个格子，即600个点的下标集合

  return indices;
}

const initialize = (primitive: any, context: any) => {
  // context绘制的上下文
  // Inteference patterns made by two plane waves crossing each
  // other at an angle. The color is based on the height.
  const vertexShader = `
    attribute vec3 a_position;
    varying vec3 v_position;
    uniform float u_time;
    varying float v_h;
    void main()
    {
        vec2 k = vec2(0.0004, 0.0001);
        vec2 k2 = vec2(0.0001, 0.0004);
        float z = 0.0;
        z += 1000.0 * sin(czm_pi * dot(a_position.xy, k) * 0.5 - 0.002 * u_time);
        z += 1000.0 * sin(czm_pi * dot(a_position.xy, k2) * 0.5 - 0.002 * u_time);
        v_position = a_position;
        v_h = z/4000.0 + 0.5;
        gl_Position = czm_modelViewProjection * vec4(a_position.xy, z, 1.0);
    }
    `;

  const fragmentShader = `
    varying vec3 v_position;
    uniform float u_time;
    varying float v_h;
    void main()
    {
        vec2 k = vec2(0.0004, 0.0001);
        vec2 k2 = vec2(0.0001, 0.0004);
        float z = 0.0;
        z += sin(2.0 * czm_pi * dot(v_position.xy, k) - 0.002 * u_time);
        z += sin(2.0 * czm_pi * dot(v_position.xy, k2) - 0.002 * u_time);
        // divide by 2 to keep in the range [-1, 1]
        z *= 0.5;
        // signed -> unsigned
        z = 0.5 + 0.5 * z;
        vec3 color = vec3(0.0,1.0,0.0);
        color = mix(vec3(0.0,1.0,0.0),vec3(1.0,0.0,0.0),v_h);
        gl_FragColor = vec4(color, v_h);

    }
    `;

  const renderState = Cesium.RenderState.fromCache({
    depthTest: {
      enabled: true,
    },
  });

  const shaderProgram = Cesium.ShaderProgram.fromCache({
    context: context,
    vertexShaderSource: vertexShader,
    fragmentShaderSource: fragmentShader,
    attributeLocations: {},
  });

  const positionTypedArray = generateVertices(
    primitive.faceResolution,
    primitive.halfWidthMeters
  );//[10000,10000 ~ -10000,-10000之间的点]
  const positionVertexBuffer = Cesium.Buffer.createVertexBuffer({
    context: context,
    typedArray: positionTypedArray,//[10000,10000 ~ -10000,-10000之间的点]
    usage: Cesium.BufferUsage.STATIC_DRAW,
  });

  const positionAttribute = {
    vertexBuffer: positionVertexBuffer,//顶点缓存
    componentsPerAttribute: 3, //每个组包含属性个数，即一个点组的属性数据包含3个数据
    componentDatatype: Cesium.ComponentDatatype.fromTypedArray(
      positionTypedArray//[10000,10000 ~ -10000,-10000之间的点]长度共363
    ),//数据类型
  };

  const indexCount = primitive.faceResolution * primitive.faceResolution * 6; //600
  const indexTypedArray = generateIndices(primitive.faceResolution);
  const indexBuffer = Cesium.Buffer.createIndexBuffer({
    context: context,
    typedArray: indexTypedArray,
    indexDatatype: Cesium.ComponentDatatype.fromTypedArray(
      indexTypedArray
    ),
    usage: Cesium.BufferUsage.STATIC_DRAW,
  });

  const vertexArray = new Cesium.VertexArray({
    context: context,
    attributes: [positionAttribute],
    indexBuffer: indexBuffer,
  });

  primitive.time = performance.now();
  const uniformMap = {
    u_time: function () {
      const now = performance.now();
      return now - primitive.time;
      //return 1.0;
    },
  };

  //Represents a command to the renderer for drawing
  //表示对渲染器进行绘图的命令
  const drawCommand = new Cesium.DrawCommand({
    boundingVolume: primitive.boundingSphere,
    //几何体在世界空间中的边界体积。这用于筛选和截锥体选择。
    //为了获得最佳渲染性能，请使用尽可能小的边界体积。
    //虽然未定义是允许的，但总是尝试提供一个边界体积，以允许为场景计算尽可能紧密的近平面和远平面，并最小化所需的截锥体数量。
    //modelMatrix,这里可以传一个空间变换，那么使用的位置数据会根据这个进行变换，如果没有定义，则认为是世界坐标
    //modelMatrix: primitive.modelMatrix, // 从模型空间中的几何图形到世界空间中的变换。如果未定义，则假定几何体在世界空间中定义。
    pass: Cesium.Pass.TRANSLUCENT, //渲染通道 OPAQUE不透明, OVERLAY覆盖, TRANSLUCENT半透明
    shaderProgram: shaderProgram, //着色器程序
    renderState: renderState, //渲染状态
    vertexArray: vertexArray, //顶点数组121 11×11
    count: indexCount, //顶点数组中要绘制的顶点数，一个正方形网格是两个三角形构成的，一共包含了6个点，100个网格就是600个点位
    primitiveType: Cesium.PrimitiveType.TRIANGLES,//顶点数组中的几何类型(TRIANGLES 将一系列点绘制成三角形)
    uniformMap: uniformMap, //一个对象，其函数的名称与着色器程序中的制服相匹配，并返回值来设置这些制服
  });
  primitive.drawCommand = drawCommand;//绘制命令
}