import Cesium from "@/utils/importCesium";
const dataSource = new Cesium.CustomDataSource('myEntity');
const myEntityCollection = dataSource.entities;
/*
 * @Description: 飞线效果（参考开源代码）
 * @Version: 1.0
 * @Author: Julian
 * @Date: 2022-03-05 16:13:21
 * @LastEditors: Julian
 * @LastEditTime: 2022-03-05 17:39:38
 */
class LineFlowMaterialProperty {
    constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this._percent = undefined;
        this._gradient = undefined;
        this.color = options.color || new Cesium.Color(1.0, 1.0, 1.0, 0.5);
        this.speed = options.speed || 2.0;
        this.percent = options.percent || 0.05;
        this.gradient = options.gradient || 0.01;
    }

    get isConstant() {
        return false;
    }

    get definitionChanged() {
        return this._definitionChanged;
    }

    getType(time) {
        return Cesium.Material.LineFlowMaterialType;
    }

    getValue(time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 5.0, result.speed);
        result.percent = Cesium.Property.getValueOrDefault(this._percent, time, 0.1, result.percent);
        result.gradient = Cesium.Property.getValueOrDefault(this._gradient, time, 0.01, result.gradient);
        return result
    }

    equals(other) {
        return (this === other ||
            (other instanceof LineFlowMaterialProperty &&
                Cesium.Property.equals(this._color, other._color) &&
                Cesium.Property.equals(this._speed, other._speed) &&
                Cesium.Property.equals(this._percent, other._percent) &&
                Cesium.Property.equals(this._gradient, other._gradient))
        )
    }
}

Object.defineProperties(LineFlowMaterialProperty.prototype, {
    color: Cesium.createPropertyDescriptor('color'),
    speed: Cesium.createPropertyDescriptor('speed'),
    percent: Cesium.createPropertyDescriptor('percent'),
    gradient: Cesium.createPropertyDescriptor('gradient'),
})

Cesium.LineFlowMaterialProperty = LineFlowMaterialProperty;
Cesium.Material.LineFlowMaterialProperty = 'LineFlowMaterialProperty';
Cesium.Material.LineFlowMaterialType = 'LineFlowMaterialType';
Cesium.Material.LineFlowMaterialSource =
    `
    uniform vec4 color;
    uniform float speed;
    uniform float percent;
    uniform float gradient;
    
    czm_material czm_getMaterial(czm_materialInput materialInput){
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      float t =fract(czm_frameNumber * speed / 1000.0);
      t *= (1.0 + percent);
      float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
      alpha += gradient;
      material.diffuse = color.rgb;
      material.alpha = alpha;
      return material;
    }
    `

Cesium.Material._materialCache.addMaterial(Cesium.Material.LineFlowMaterialType, {
    fabric: {
        type: Cesium.Material.LineFlowMaterialType,
        uniforms: {
            color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
            speed: 10.0,
            percent: 0.05,
            gradient: 0.01
        },
        source: Cesium.Material.LineFlowMaterialSource
    },
    translucent: function (material) {
        return true;
    }
})

/**
 * @description: 产生随机点
 * @param {*} position：中心点坐标
 * @param {*} num：随机点数量
 * @return {*}
 */
function generateRandomPosition(position, num) {
    let list = []
    for (let i = 0; i < num; i++) {
        // random产生的随机数范围是0-1，需要加上正负模拟
        let lon = position[0] + Math.random() * 0.02 * (i % 2 == 0 ? 1 : -1);
        let lat = position[1] + Math.random() * 0.02 * (i % 2 == 0 ? 1 : -1);
        list.push([lon, lat])
    }
    return list
}
// 随机竖直飞线
/**
 * @description: 竖直随机飞线初始化
 * @param {*} _viewer
 * @param {*} _center ：中心点
 * @param {*} _num ：数量
 * @return {*}
 */
export function lineFlowInit(_viewer, _center, _num) {
    let num = _num > 300 ? 300 : _num;
    let _positions = generateRandomPosition(_center, num);
    _positions.forEach(item => {
        // 经纬度
        let start_lon = item[0];
        let start_lat = item[1];
        let height = 1000 * Math.random() + 5000;
        let startPoint = new Cesium.Cartesian3.fromDegrees(start_lon, start_lat, height);
        // 随机高度
        let endPoint = new Cesium.Cartesian3.fromDegrees(start_lon, start_lat, 0);
        let linePositions = [];
        linePositions.push(startPoint);
        linePositions.push(endPoint);
        _viewer.entities.add({
            polyline: {
                positions: linePositions,
                material: new Cesium.LineFlowMaterialProperty({
                    color: new Cesium.Color(1.0, 1.0, 1.0, 0.2),
                    speed: 15 * Math.random(),
                    percent: 0.005,
                    gradient: 0.01
                })
            }
        })
        // let entity = new Cesium.Entity({
        //     // id: "rain",
        //     polyline: {
        //         positions: linePositions,
        //         material: new Cesium.LineFlowMaterialProperty({
        //             color: new Cesium.Color(1.0, 1.0, 1.0, 0.8),
        //             speed: 15 * Math.random(),
        //             percent: 0.1,
        //             gradient: 0.01
        //         })
        //     }
        // });
        // myEntityCollection.add(new Cesium.Entity(entity));
        // _viewer.dataSources.add(dataSource)
        _viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(_center[0], _center[1], 20000),
            duration: 1.6,
        })
    })
}
export function removeRainEntity(viewer) {
    viewer.entities.removeAll()
}