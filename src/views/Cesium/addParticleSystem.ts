// 粒子系统 烟花
import Cesium from "@/utils/importCesium"
let ParticleSystems: Array<typeof Cesium.ParticleSystem> = []
let particleCanvas

const getImage = () => {
  if (!Cesium.defined(particleCanvas)) {
    particleCanvas = document.createElement("canvas");
    particleCanvas.width = 20;
    particleCanvas.height = 20;
    const context2D = particleCanvas.getContext("2d");
    context2D.beginPath();
    context2D.arc(8, 8, 8, 0, Cesium.Math.TWO_PI, true);
    context2D.closePath();
    context2D.fillStyle = "rgb(255, 255, 255)";
    context2D.fill();
  }
  return particleCanvas;
}

const createFirework = (viewer, color, bursts, position) => {
  const ParticleSystem = viewer.scene.primitives.add(
    new Cesium.ParticleSystem({
      image: getImage(),
      startColor: color,
      endColor: color.withAlpha(0.0),
      startScale: 1.0,
      endScale: 0.0,
      particleLife: 2.0,
      speed: 500.0,
      imageSize: new Cesium.Cartesian2(10,10),
      emissionRate: 0,
      emitter: new Cesium.SphereEmitter(0.1),
      bursts: bursts,
      lifetime: 10.0,
      modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
    })
  );
  ParticleSystems.push(ParticleSystem)
}

export const addParticleSystem = (viewer: any, active: boolean) => {
  if (active) {
    if (ParticleSystems?.length) {
      return
    }
    ParticleSystems = []
    const burstSize = 400.0;
    const lifetime = 10.0;
    const numberOfFireworks = 10.0;

    const colorOptions = [
      {
        minimumRed: 0.75,
        green: 0.0,
        minimumBlue: 0.8,
        alpha: 1.0,
      },
      {
        red: 0.0,
        minimumGreen: 0.75,
        minimumBlue: 0.8,
        alpha: 1.0,
      },
      {
        red: 0.0,
        green: 0.0,
        minimumBlue: 0.8,
        alpha: 1.0,
      },
      {
        minimumRed: 0.75,
        minimumGreen: 0.75,
        blue: 0.0,
        alpha: 1.0,
      },
    ];

    for (let i = 0; i < numberOfFireworks; ++i) {
      const color = Cesium.Color.fromRandom(
        colorOptions[i % colorOptions.length]
      );
      const x = Cesium.Math.randomBetween(0, 1) * 0.01;
      const y = Cesium.Math.randomBetween(0, 1) * 0.01;
      const z = Cesium.Math.randomBetween(0, 1) * 0.01;
      const bursts = [];
      for (let j = 0; j < 3; ++j) {
        bursts.push(
          new Cesium.ParticleBurst({
            time: Cesium.Math.nextRandomNumber() * lifetime,
            minimum: burstSize,
            maximum: burstSize,
          })
        );
      }
      const position = Cesium.Cartesian3.fromDegrees(110+x,35+y,1000+z)
      createFirework(viewer, color, bursts, position);
    }

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(110, 35, 3000.0),
      duration: 1.6
    });
  } else {
    if (ParticleSystems?.length) {
      ParticleSystems.forEach((item) => {
        viewer.scene.primitives.remove(item)
      })
      ParticleSystems = []
    }
  }
}