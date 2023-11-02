// 等高线
import Cesium from "@/utils/importCesium"
import * as turf from "@turf/turf"
const entity: Array<object> = []
let primitive: object
let primitives: any
const scratchPickRay = new Cesium.Ray()
const scratchPickCartesian = new Cesium.Cartesian3();
export const addContourLine = (viewer: any, active: boolean) => {
  viewer.extend(Cesium.viewerCesiumInspectorMixin);
  if (active) {
    viewer.scene.globe._surface.tileProvider._debug.wireframe = true
    if (entity?.length) return
    const selectTile = (e) => {
      let selectedTile;
      const ellipsoid = viewer.scene.globe.ellipsoid;
      const ray = viewer.scene.camera.getPickRay(e.position, scratchPickRay);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene, scratchPickCartesian);
      if (Cesium.defined(cartesian)) {
        const cartographic = ellipsoid.cartesianToCartographic(cartesian);
        const tilesRendered =
        viewer.scene.globe._surface.tileProvider._tilesToRenderByTextureCount;
        for (
          let textureCount = 0;
          !selectedTile && textureCount < tilesRendered.length;
          ++textureCount
        ) {
          const tilesRenderedByTextureCount = tilesRendered[textureCount];
          if (!Cesium.defined(tilesRenderedByTextureCount)) {
            continue;
          }
          for (
            let tileIndex = 0;
            !selectedTile && tileIndex < tilesRenderedByTextureCount.length;
            ++tileIndex
          ) {
            const tile = tilesRenderedByTextureCount[tileIndex];
            if (Cesium.Rectangle.contains(tile.rectangle, cartographic)) {
              selectedTile = tile;
            }
          }
        }
      }
      console.log(selectedTile);
      const mesh = selectedTile.data.mesh
      if(!mesh) return
      const primitiveShader = viewer.scene.primitives.add(
        new CustomPrimitive(mesh.vertices, mesh.boundingSphere3D, mesh.indices, mesh.stride, mesh.center, viewer)
      );
      const boundingSphere = primitiveShader.boundingSphere;
      // 将相机定位和视野范围应用于相机
      viewer.camera.flyToBoundingSphere(boundingSphere)
    }
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(selectTile , Cesium.ScreenSpaceEventType.LEFT_CLICK);
      const terrainProvider = new Cesium.createWorldTerrain()
      const pos = []
      const extent = [106.64396446248583,30.077195435475748, 106.80509638145465, 30.209849307650593];
      const cellSide = 0.5;
      const options = {units: 'miles'};
      const grid = turf.pointGrid(extent, cellSide, options); //计算点网格
      grid.features.forEach((item) => {
        pos.push(Cesium.Cartographic.fromDegrees(item.geometry.coordinates[0], item.geometry.coordinates[1]))
        // viewer.entities.add({
        //   position: Cesium.Cartesian3.fromDegrees(...item.geometry.coordinates),
        //   point: {
        //     pixelSize: 10,
        //     color: Cesium.Color.YELLOW,
        //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        //   },
        // })
      })
      const promise = Cesium.sampleTerrain(terrainProvider, 11, pos);
      let arr = []
      Promise.resolve(promise).then(function(updatedPositions) {
        const terrainDataPromise = terrainProvider.requestTileGeometry(3263,680,11);
        console.log(Cesium);
        terrainDataPromise.then((res) => {
          // const primitiveShader = viewer.scene.primitives.add(
          //   new CustomPrimitive(res._quantizedVertices, res._boundingSphere, res._indices)
          // );
          // const boundingSphere = primitiveShader.boundingSphere;
          // // 将相机定位和视野范围应用于相机
          // viewer.camera.flyToBoundingSphere(boundingSphere)
        })
        //转世界坐标
        arr = updatedPositions.map((item) => {
          //item
          const cartesian3 = new Cesium.Cartesian3();
          Cesium.Ellipsoid.WGS84.cartographicToCartesian(
            item,
            cartesian3
          );
          return cartesian3 //笛卡尔世界坐标集合
        })
      })
        // viewer.camera.flyTo({
        //   destination: Cesium.Cartesian3.fromDegrees(106.70296568464478, 30.209849307650593, 3000.0),
        //   duration: 1.6
        // });
  } else {
    if (primitives) {
      primitives.removeAll()
    }
  }
}

class CustomPrimitive {
  private show
  private drawCommand: any
  private boundingSphere: any
  private vertices: any
  private indices: any
  private time: any
  private stride: number
  private modelMatrix: any
  constructor(vertices: any, boundingSphere: any, indices:any, stride:number, center:any, viewer:any) {
    this.show = true;
    this.vertices = vertices
    this.indices = indices
    this.boundingSphere = boundingSphere
    this.stride = stride
    this.drawCommand = undefined;
    this.time = undefined;
     // 计算一个模型矩阵，将表面放在地球上的一个特定点上
     viewer.entities.add({
      position: center,
      point: {
        pixelSize: 10,
        color: Cesium.Color.YELLOW,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })
    //通过中心点笛卡尔世界坐标计算出平移矩阵
    this.modelMatrix = Cesium.Matrix4.fromTranslation(center, new Cesium.Matrix4())
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
        v_position = a_position;
        gl_Position = czm_modelViewProjection * vec4(a_position.xy,a_position.z-1000.0, 1.0);
    }
    `;

  const fragmentShader = `
    varying vec3 v_position;
    uniform float u_time;
    void main()
    {
        vec3 color = vec3(0.0,1.0,0.0);
        gl_FragColor = vec4(1.0,0.0,0.0, 1.0);
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
  const componentsLength = primitive.stride
  const vertices = new Float32Array(primitive.vertices.length/componentsLength * 3);
  primitive.vertices.forEach((item,index) => {
    if(index%componentsLength === 0){
        const j = index/componentsLength
        vertices[j*3] = primitive.vertices[index]
        vertices[j*3+1] = primitive.vertices[index+1]
        vertices[j*3+2] = primitive.vertices[index+2]
    }
  })
  const positionTypedArray = vertices;//[10000,10000 ~ -10000,-10000之间的点]
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

  const indexTypedArray = primitive.indices;
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
    modelMatrix: primitive.modelMatrix, // 从模型空间中的几何图形到世界空间中的变换。如果未定义，则假定几何体在世界空间中定义。
    pass: Cesium.Pass.TRANSLUCENT, //渲染通道 OPAQUE不透明, OVERLAY覆盖, 半透明
    shaderProgram: shaderProgram, //着色器程序
    renderState: renderState, //渲染状态
    vertexArray: vertexArray, //顶点数组121 11×11
    count: primitive.indices.length, //顶点数组中要绘制的顶点数，一个正方形网格是两个三角形构成的，一共包含了6个点，100个网格就是600个点位
    primitiveType: Cesium.PrimitiveType.TRIANGLES,//顶点数组中的几何类型(TRIANGLES 将一系列点绘制成三角形)
    uniformMap: uniformMap, //一个对象，其函数的名称与着色器程序中的制服相匹配，并返回值来设置这些制服
  });
  primitive.drawCommand = drawCommand;//绘制命令
}