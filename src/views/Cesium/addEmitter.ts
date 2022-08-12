import Cesium from '@/utils/importCesium'
// 创建粒子发射系统
const fireadd = (
  lng: number,
  lat: number,
  height: number,
  color: any,
  emitter: any,
  viewer: any,
) => {
  // 获取事件触发所在的  html Canvas容器
  const firedata = new Cesium.ParticleSystem({
    startColor: color.withAlpha(1),
    endColor: Cesium.Color.WHITE.withAlpha(0.0),
    startScale: 2,
    endScale: 3,
    // 设定粒子寿命可能持续时间的最小限值(以秒为单位)，在此限值之上将随机选择粒子的实际寿命。
    // minimumParticleLife: 10,
    // maximumParticleLife: 14,
    particleLife: 14, // 粒子生命持续时间
    // minimumSpeed: 10000,
    // maximumSpeed: 50000,
    speed: 50000, // 粒子发射速度（米/秒）
    imageSize: new Cesium.Cartesian2(10, 10),
    emissionRate: 1000, // 每秒发射粒子数量
    lifetime: 1, // 粒子系统发射粒子的时间（秒）（粒子系统发射周期）
    loop: true, // 是否循环爆发
    mass: 1,
    emitter: emitter, // 发射器
    // emitter: new Cesium.CircleEmitter(10000), //圆形发射器，粒子具有沿Z向量移动的速度
    // emitter: new Cesium.ConeEmitter(170), //圆锥发射器，参数为圆锥角，以弧度为单位
    // emitter: new Cesium.BoxEmitter(Cesium.Cartesian3(100000, 100000, 1000)), //盒子发射器，参数盒子宽、高、深
    // emitter: new Cesium.SphereEmitter(1), //球形发射器，参数为球半径
    updateCallback: (particle: any) => {
      if (particle.age <= particle.life * 0.6) {
        // 生命前0.6
        const s = 0.994;
        particle.velocity = new Cesium.Cartesian3(
          particle.velocity.x * s,
          particle.velocity.y * s,
          particle.velocity.z * s
        ); // 让粒子速度衰减，可以自行定义衰减方法
      } else {
        // let { x, y, z } = Cesium.Cartesian3.fromDegrees(lng, lat, height)
        const { x, y, z } = particle.position;
        const n = 170;
        particle.velocity = new Cesium.Cartesian3(-x / n, -y / n, -z / n); // 速度向量改变（改变粒子运动方向），向原点（地球球心）运动
      }
    },
    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(lng, lat, height)
    ), // 从模型转化成世界坐标
    // emitterModelMatrix: Cesium.Matrix4(),
  });
  viewer.scene.primitives.add(firedata);
  // Cesium.scene.primitives.remove(firedata) //清除发射系统firedata
};