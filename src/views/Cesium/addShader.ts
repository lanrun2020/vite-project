// 着色器
import Cesium from "@/utils/importCesium"
// let entities: Array<any> = []
let primitiveShader
export const addShader = (viewer: any, active: boolean) => {
  if (active) {
    const lng = 110
    const lat = 32
    const position = new Cesium.Cartographic.fromCartesian( Cesium.Cartesian3.fromDegrees(lng, lat, 2000));
    if(primitiveShader){
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, 50000),
      });
      return
    }
    primitiveShader = viewer.scene.primitives.add(
      new CustomPrimitive(position)
    );
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, 50000),
      // duration: 0.1,
    });
  } else {
    if (primitiveShader){
      primitiveShader.destroy()
      viewer.scene.primitives.remove(primitiveShader)
    }
    primitiveShader = null
  }
}
/**
 * Simple example of writing a Primitive from scratch. This
 * primitive displays a procedurally-generated surface at a given
 * position on the globe.
 */
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
    this.faceResolution = 200;

    // Compute a model matrix that puts the surface at a specific point on
    // the globe.
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
 */
const generateVertices = (faceResolution: number, halfWidthMeters: number) => {
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

  return indices;
}

const scratchColor = new Cesium.Color();
/**
 * Generate a 1D texture for the color palette
 */
const generateTexture = (context: any) => {
  const width = 256;
  const textureTypedArray = new Uint8Array(width * 4);
  for (let i = 0; i < width; i++) {
    const bucket32 = 32 * Math.floor(i / 32);
    const bucket4 = 4 * Math.floor(i / 4);
    const color = Cesium.Color.fromHsl(
      bucket32 / width,
      bucket32 / width,
      (255 - bucket4) / width,
      1.0,
      scratchColor
    );
    textureTypedArray[4 * i] = 255 * color.red;
    textureTypedArray[4 * i + 1] = 255 * color.green;
    textureTypedArray[4 * i + 2] = 255 * color.blue;
    textureTypedArray[4 * i + 3] = 255 * color.alpha;
  }

  return new Cesium.Texture({
    context: context,
    pixelFormat: Cesium.PixelFormat.RGBA,
    pixelDataType: Cesium.ComponentDatatype.fromTypedArray(
      textureTypedArray
    ),
    source: {
      width: width,
      height: 1,
      arrayBufferView: textureTypedArray,
    },
    flipY: false,
    sampler: new Cesium.Sampler({
      minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
      magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST,
    }),
  });
}

const initialize = (primitive: any, context: any) => {
  // Inteference patterns made by two plane waves crossing each
  // other at an angle. The color is based on the height.
  const vertexShader = `
    attribute vec3 a_position;
    varying vec3 v_position;
    uniform float u_time;
    void main()
    {
        vec2 k = vec2(0.0004, 0.0001);
        vec2 k2 = vec2(0.0001, 0.0004);
        float z = 0.0;
        z += 1000.0 * sin(czm_pi * dot(a_position.xy, k) * 0.5 - 0.002 * u_time);
        z += 1000.0 * sin(czm_pi * dot(a_position.xy, k2) * 0.5 - 0.002 * u_time);
        v_position = a_position;
        gl_Position = czm_modelViewProjection * vec4(a_position.xy, z, 1.0);
    }
    `;

  const fragmentShader = `
    varying vec3 v_position;
    uniform float u_time;
    uniform sampler2D u_texture;
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
        gl_FragColor = texture2D(u_texture, vec2(z, 0.1));
    }
    `;

  const positionLocation = 0;
  const attributeLocations = {
    a_position: positionLocation,
  };

  const renderState = Cesium.RenderState.fromCache({
    depthTest: {
      enabled: true,
    },
  });

  const shaderProgram = Cesium.ShaderProgram.fromCache({
    context: context,
    vertexShaderSource: vertexShader,
    fragmentShaderSource: fragmentShader,
    attributeLocations: attributeLocations,
  });

  const positionTypedArray = generateVertices(
    primitive.faceResolution,
    primitive.halfWidthMeters
  );
  const positionVertexBuffer = Cesium.Buffer.createVertexBuffer({
    context: context,
    typedArray: positionTypedArray,
    usage: Cesium.BufferUsage.STATIC_DRAW,
  });

  const positionAttribute = {
    index: positionLocation,
    vertexBuffer: positionVertexBuffer,
    componentsPerAttribute: 3,
    componentDatatype: Cesium.ComponentDatatype.fromTypedArray(
      positionTypedArray
    ),
  };

  const indexCount =
    primitive.faceResolution * primitive.faceResolution * 6;
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

  const texture = generateTexture(context);

  primitive.time = performance.now();
  const uniformMap = {
    u_time: function () {
      const now = performance.now();
      return now - primitive.time;
    },
    u_texture: function () {
      return texture;
    },
  };

  const drawCommand = new Cesium.DrawCommand({
    boundingVolume: primitive.boundingSphere,
    modelMatrix: primitive.modelMatrix,
    pass: Cesium.Pass.OPAQUE,
    shaderProgram: shaderProgram,
    renderState: renderState,
    vertexArray: vertexArray,
    count: indexCount,
    primitiveType: Cesium.PrimitiveType.TRIANGLES,
    uniformMap: uniformMap,
  });
  primitive.drawCommand = drawCommand;
}



