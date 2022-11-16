import echarts from '@/utils/importEcharts'
import Cesium from "@/utils/importCesium"

class RegisterCoordinateSystem {
    dimensions = ["lng", "lat"]
    radians = Cesium.Math.toRadians(80)
    constructor(glMap, api) {
        this._GLMap = glMap;
        this._api = api;
        this._mapOffset = [0, 0];
        this.dimensions = ['lng', 'lat'];
    }

    setMapOffset (mapOffset) {
        this._mapOffset = mapOffset;
    }

    getMap () {
        return this._GLMap;
    }

    fixLat (lat) {
        return lat >= 90 ? 89.99999999999999 : lat <= -90 ? -89.99999999999999 : lat
    }

    dataToPoint (coords) {
        coords[1] = this.fixLat(coords[1]);
        let position = Cesium.Cartesian3.fromDegrees(coords[0], coords[1]);
        if (!position) {
            return [];
        }
        let coordinates = this._GLMap.cartesianToCanvasCoordinates(position);
        if (!coordinates) {
            return [];
        }
        if (this._GLMap.mode === Cesium.SceneMode.SCENE3D) {
            const pointA = position // 需要判断的当前点位置
            const pointB = this._GLMap.camera.position // 相机位置
            const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA); // 已点A为坐标原点建立坐标系，此坐标系相切于地球表面
            const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
            const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
            const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
            // 向量AB(即A点指向相机的方向)在参考坐标系中的值，若z小于0,说明相机在切面下方,此时相机应当看不见A点,则将A点位置返回空[],
            if (direction.z<0) return []; // 可以试着修改这个判断条件（-1~1），当小于-0.5时，点的位置在地球背侧时，依然能在界面看见这个点，显然不符合逻辑
        }
        const point = [coordinates.x - this._mapOffset[0], coordinates.y - this._mapOffset[1]]
        return point
    }

    pointToData (pixel) {
        let mapOffset = this._mapOffset,
            coords = this._bmap.project([pixel[0] + pixel[0], pixel[1] + pixel[1]]);
        const position = [coords.lng, coords.lat];
        return position;
    }

    getViewRect () {
        let api = this._api;
        return new echarts.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight())
    }

    getRoamTransform () {
        return echarts.matrix.create();
    }

    create (echartModel, api) {
        this._api = api;
        let registerCoordinateSystem;
        echartModel.eachComponent("GLMap", function (seriesModel) {
            let painter = api.getZr().painter;
            if (painter) {
                try {
                    let glMap = echarts.glMap;
                    registerCoordinateSystem = new RegisterCoordinateSystem(glMap, api);
                    registerCoordinateSystem.setMapOffset(seriesModel.__mapOffset || [0, 0]);
                    seriesModel.coordinateSystem = registerCoordinateSystem;
                } catch (error) {
                    console.log(error);
                }
            }
        })
        echartModel.eachSeries(function (series) {
            "GLMap" === series.get("coordinateSystem") && (series.coordinateSystem = registerCoordinateSystem);
        })
    }
}

export default class EchartsLayer {
    constructor(viewer, option) {
        this._viewer = viewer;
        this._isRegistered = false;
        this._chartLayer = this._createLayerContainer();
        this.option = option;
        this._chartLayer.setOption(option);
        this.resizeFuc = null
        this.resize()
    }

    _createLayerContainer () {
        var scene = this._viewer.scene;
        var container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0px';
        container.style.left = '0px';
        container.style.right = '0px';
        container.style.bottom = '0px';
        container.style.width = scene.canvas.width + "px";
        container.style.height = scene.canvas.height + "px";
        container.style.pointerEvents = "none";
        this._viewer.container.appendChild(container);
        this._echartsContainer = container;
        if(!echarts.glMap){
            echarts.glMap = scene;
            this._register();
        }
        return echarts.init(container);
    }
    _register () {
        if (this._isRegistered) return;
        echarts.registerCoordinateSystem("GLMap", new RegisterCoordinateSystem(echarts.glMap));
        echarts.registerAction({
            type: "GLMapRoam",
            event: "GLMapRoam",
            update: "updateLayout"
            // eslint-disable-next-line @typescript-eslint/no-empty-function
        }, function (e, t) { });
        echarts.extendComponentModel({
            type: "GLMap",
            getBMap: function () {
                return this.__GLMap
            },
            defaultOption: {
                roam: !1
            }
        });
        echarts.extendComponentView({
            type: "GLMap",
            init: function (echartModel, api) {
                this.api = api, echarts.glMap.postRender.addEventListener(this.moveHandler, this);
            },
            moveHandler: function (e, t) {
                this.api.dispatchAction({
                    type: "GLMapRoam"
                })
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            render: function (e, t, i) { },
            dispose: function () {
                echarts.glMap.postRender.removeEventListener(this.moveHandler, this);
            }
        })
        this._isRegistered = true;
    }

    dispose () {
        this._echartsContainer && (this._viewer.container.removeChild(this._echartsContainer), this._echartsContainer = null);
        this._chartLayer && (this._chartLayer.dispose(), this._chartLayer = null);
        this._isRegistered = false;
    }

    destroy () {
        window.removeEventListener('resize', this.resizeFuc)
        this.dispose();
    }

    updateEchartsLayer (option) {
        this._chartLayer && this._chartLayer.setOption(option);
    }

    getMap () {
        return this._viewer;
    }

    getEchartsLayer () {
        return this._chartLayer;
    }

    show () {
        this._echartsContainer && (this._echartsContainer.style.visibility = "visible");
    }

    hide () {
        this._echartsContainer && (this._echartsContainer.style.visibility = "hidden");
    }
    resize () {
        const me = this;
        window.addEventListener('resize', this.resizeFuc = () => {
            const scene = me._viewer.scene;
            me._echartsContainer.style.width = scene.canvas.style.width;
            me._echartsContainer.style.height = scene.canvas.style.height;
            me._chartLayer.resize();
        })
    }
}
