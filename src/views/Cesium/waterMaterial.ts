//水面反射材质
import Cesium from '@/utils/importCesium'

const source = 
`
      // Thanks for the contribution Jonas\n\
      // http://29a.ch/2012/7/19/webgl-terrain-rendering-water-fog\n\
      \n\
      uniform sampler2D specularMap;\n\
      uniform sampler2D normalMap;\n\
      uniform vec4 baseWaterColor;\n\
      uniform vec4 blendColor;\n\
      uniform float frequency;\n\
      uniform float animationSpeed;\n\
      uniform float amplitude;\n\
      uniform float specularIntensity;\n\
      uniform float fadeFactor;\n\
      \n\
      czm_material czm_getMaterial(czm_materialInput materialInput)\n\
      {\n\
          czm_material material = czm_getDefaultMaterial(materialInput);\n\
      \n\
          float time = czm_frameNumber * animationSpeed;\n\
      \n\
          // fade is a function of the distance from the fragment and the frequency of the waves\n\
          float fade = max(1.0, (length(materialInput.positionToEyeEC) / 10000000000.0) * frequency * fadeFactor);\n\
      \n\
          float specularMapValue = texture2D(specularMap, materialInput.st).r;\n\
      \n\
          // note: not using directional motion at this time, just set the angle to 0.0;\n\
          vec4 noise = czm_getWaterNoise(normalMap, materialInput.st * frequency, time, 0.0);\n\
          vec3 normalTangentSpace = noise.xyz * vec3(1.0, 1.0, (1.0 / amplitude));\n\
      \n\
          // fade out the normal perturbation as we move further from the water surface\n\
          normalTangentSpace.xy /= fade;\n\
      \n\
          // attempt to fade out the normal perturbation as we approach non water areas (low specular map value)\n\
          normalTangentSpace = mix(vec3(0.0, 0.0, 50.0), normalTangentSpace, specularMapValue);\n\
      \n\
          normalTangentSpace = normalize(normalTangentSpace);\n\
      \n\
          // get ratios for alignment of the new normal vector with a vector perpendicular to the tangent plane\n\
          float tsPerturbationRatio = clamp(dot(normalTangentSpace, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);\n\
      \n\
          // fade out water effect as specular map value decreases\n\
          material.alpha = mix(blendColor.a, baseWaterColor.a, specularMapValue) * specularMapValue;\n\
      \n\
          // base color is a blend of the water and non-water color based on the value from the specular map\n\
          // may need a uniform blend factor to better control this\n\
          material.diffuse = mix(blendColor.rgb, baseWaterColor.rgb, specularMapValue);\n\
      \n\
          // diffuse highlights are based on how perturbed the normal is\n\
          material.diffuse += (0.1 * tsPerturbationRatio);\n\
      \n\
          material.diffuse = material.diffuse;\n\
      \n\
          material.normal = normalize(materialInput.tangentToEyeMatrix * normalTangentSpace);\n\
      \n\
          material.specular = specularIntensity;\n\
          material.shininess = 10.0;\n\
      \n\
          return material;\n\
      }\n\
`

const fabric = {
  uniforms: {
      // baseWaterColor: new Cesium.Color(64 / 255.0, 157 / 255.0, 253 / 255.0, 0.5),
      // blendColor: new Cesium.Color(0.0, 1.0, 0.699, 1.0),
      specularMap: 'czm_defaultImage',
      normalMap: 'czm_defaultImage',
      // frequency: 1000.0,
      // animationSpeed: 0.1,
      // amplitude: 10.0,
      // specularIntensity: 1.0,
      // fadeFactor: 1.0,
      baseWaterColor: new Cesium.Color(0.2, 0.3, 0.6, 1.0),
      blendColor: new Cesium.Color(0.0, 1.0, 0.699, 1.0),
      // specularMap: Material.DefaultImageId,
      // normalMap: Material.DefaultImageId,
      frequency: 1000.0, //频次
      animationSpeed: 0.1, //动画速度
      amplitude: 100.0, //振幅
      specularIntensity: 1.0, //镜面强度
      fadeFactor: 1.0,//衰减因子
  },
  source: source
}

export default class WaterMirrorMaterialsProperty {
  private material: any
  constructor(options?: { normalMap?: string, specularMap?:string, U?: object }) {
    this.material = new Cesium.Material({ fabric, translucent: false })
    this.material.uniforms.normalMap = options?.normalMap ?? 'czm_defaultImage'
    this.material.uniforms.specularMap = options?.specularMap ?? 'czm_defaultImage'
  }
  getMaterial() {
    return this.material
  }
}