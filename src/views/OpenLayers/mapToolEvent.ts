import { Stroke, Style, Circle, Fill, Text } from "ol/style";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource, XYZ } from "ol/source";
import Translate from "ol/interaction/Translate"; //移动交互
import { unByKey } from "ol/Observable"; //用于清除事件
import Point from "ol/geom/Point.js";
import LineString from "ol/geom/LineString";
import {
  Draw,
  Modify,
  Select,
  DragBox,
  Snap,
  Pointer as PointerInteraction,
  defaults as defaultInteractions,
} from "ol/interaction.js";
//地图工具事件
export class mapToolEvent {
  private map = null
  private pointerMoveEvent = null
  private selectInteraction = null
  private translateInteraction = null

  private drawPolygon = null
  private drawLineString = null
  private drawPoint = null

  private modifyInteraction = null
  private lastFeature = null
  private selectFeature = null
  private lastStyle = null
  private drawSource = null
  private drawLayers = null
  private handleLastSet = [] //保存用户操作记录,用于操作步骤的前进与回退
  private handleNestSet = [] //保存用户操作记录,用于操作步骤的前进与回退
  constructor(map) {
    this.map = map
  }
  //初始化
  init() {
    //添加图层(用于保存新增的元素)
    this.drawSource = new VectorSource();
    this.drawLayers = new VectorLayer({
      source: this.drawSource,
      style: {
        "fill-color": "rgba(255, 255, 255, 0.2)",
        "stroke-color": "#ffcc33",
        "stroke-width": 2,
        "circle-radius": 7,
        "circle-fill-color": "#ffcc33",
      },
    });
    this.map.addLayer(this.drawLayers);

    //绘制多边形
    this.drawPolygon = new Draw({
      source: this.drawSource, //绑定绘制的图层源，绘制结束后会添加到此图层
      type: 'Polygon',
    });
    this.map.addInteraction(this.drawPolygon);
    this.drawPolygon.setActive(false)

    //绘制线
    this.drawLineString = new Draw({
      source: this.drawSource, //绑定绘制的图层源，绘制结束后会添加到此图层
      type: 'LineString',
    });
    this.drawLineString.on("drawend", (e) => {
      //绘制结束，将新增的feature保存到操作记录
      this.handleLastSet.push({
        type: 'draw',
        target: e.feature
      })
    })
    this.map.addInteraction(this.drawLineString);
    this.drawLineString.setActive(false)

    //绘制点
    this.drawPoint = new Draw({
      source: this.drawSource, //绑定绘制的图层源，绘制结束后会添加到此图层
      type: 'Point',
    });
    this.map.addInteraction(this.drawPoint);
    this.drawPoint.setActive(false)

    //修改交互
    this.modifyInteraction = new Modify({ source: this.drawSource });
    let lastGeometry = null
    this.modifyInteraction.on("modifystart", (e) => {
      //获取被编辑的要素，保存要素的几何数据
      lastGeometry = e.features.getArray()[0].getGeometry().clone()
    });
    this.modifyInteraction.on("modifyend", (e) => {
      //获取被编辑的要素，保存要素的几何数据
      this.handleLastSet.push({
        type: 'edit',
        lastGeometry: lastGeometry,
        nextGeometry: e.features.getArray()[0].getGeometry().clone(),
        target: e.features.getArray()[0]
      })
    });
    this.map.addInteraction(this.modifyInteraction);
    this.modifyInteraction.setActive(false)

    //选择交互
    this.selectInteraction = new Select({
      style: this.selectStyleFuc, //设置选中时的样式
      hitTolerance: 5
    });
    this.selectInteraction.on("select", (event) => {
      // this.resetLastFeature()
      const selectedFeatures = event.target.getFeatures();
      selectedFeatures.forEach((feature) => {

        // this.lastStyle = feature.getStyle()
        this.selectFeature = feature
        // console.log(feature.getGeometry());
        if (feature.getGeometry() instanceof Point) {
          // console.log("点");
        }
        if (feature.getGeometry() instanceof LineString) {
          // console.log("线");
          // console.log(feature.getGeometry());
          // console.log(feature.getGeometry().getCoordinates()[0]);
        }
      });
    });

    //移动交互
    this.translateInteraction = new Translate({
      hitTolerance: 5
    });
    let origonGeometry
    // 可以监听一下拖动开始和结束的事件，拖动后的经纬度可以从e里面获取
    this.translateInteraction.on('translatestart', (e) => {
      // console.log("开始移动", e);
      // this.resetLastFeature()
      this.selectFeature = e.features.getArray()[0]
      this.selectFeature.setStyle(this.selectStyleFuc(this.selectFeature))
      origonGeometry = e.features.getArray()[0].getGeometry().clone()
    })
    this.translateInteraction.on('translateend', (e) => {
      // console.log("结束移动", e);
      this.handleLastSet.push({
        type: 'move',
        lastGeometry: origonGeometry, //记录移动前geometry
        nextGeometry: e.features.getArray()[0].getGeometry().clone(), //记录移动后geometry
        target: e.features.getArray()[0]
      })
    })
    this.map.addInteraction(this.selectInteraction);
    this.map.addInteraction(this.translateInteraction);
    this.selectInteraction.setActive(false)
    this.translateInteraction.setActive(false)
  }
  //设置选中时点、线等要素的样式
  selectStyleFuc(feature) {
    const type = feature.getGeometry().getType()
    if (type === 'Point') {
      return new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({
            color: '#0096ff',
          }),
        })
      })
    }
    if (type === 'LineString') {
      return new Style({
        stroke: new Stroke({
          color: '#0096ff',
          width: 1.5
        })
      })
    }
  }
  //监听选择事件
  handleEelect(active = true) {
    if (!active) { //移除选择监听
      this.translateInteraction.setActive(false)
      this.selectInteraction.setActive(false)
      this.handlePointerMove()
      return
    }
    unByKey(this.pointerMoveEvent)
    if (this.selectInteraction) {
      this.translateInteraction.setActive(true)
      this.selectInteraction.setActive(true)
      return
    }
  }
  resetLastFeature() {
    if (this.lastFeature && this.lastStyle) {
      this.lastFeature.setStyle(this.lastStyle)
      this.lastFeature = null
    }
  }
  //监听鼠标移动事件
  handlePointerMove() {
    // this.selectInteraction && this.map.removeInteraction(this.selectInteraction);
    this.pointerMoveEvent = this.map.on('pointermove', (e) => {
      // const type = this.map.hasFeatureAtPixel(e.pixel) ? 'pointer' : ''
      this.map.getViewport().style.cursor = ''
      this.resetLastFeature()
      //forEachFeatureAtPixel命中检测
      this.map.forEachFeatureAtPixel(e.pixel, (feature) => {
        this.lastStyle = feature.getStyle()
        this.lastFeature = feature
        this.map.getViewport().style.cursor = 'pointer'
        // this.map.getTargetElement().style.cursor = 'pointer'
          feature.setStyle(new Style({
            image: new Circle({
              radius: 10,
              fill: new Fill({
                color: '#009688',
              }),
            }),
            stroke: new Stroke({
              color: '#009688',
              width: 1.5
            })
          }))
          return true
      },
      {
        hitTolerance: 5
      }
      )
    })
  }
  //监听点击事件
  handleClick() {
    this.map.on('click', (e) => {
      this.map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
        const type = feature.getGeometry().getType()
        if (type === 'Point') {
          feature.setStyle(new Style({
            image: new Circle({
              radius: 10,
              fill: new Fill({
                color: '#00ff00',
              }),
            })
          }))
        }
      })
    })
  }
  //删除选中的要素
  handleDelete() {
    if (this.selectFeature) {
      const source = this.map.getLayers().getArray().map(layer => layer.getSource()).find(
        source => source.getFeatureById && source.getFeatureById(this.selectFeature.getId())
      );
      if (source) {
        source.removeFeature(this.selectFeature)
        this.handleLastSet.push({
          type: 'delete',
          source,
          target: this.selectFeature
        })
        // console.log('删除',this.lastFeature.getId());
        this.selectFeature = null
      }
    }
  }
  //移除监听事件
  unbindDarwEvent() {
    // 清除绘制
    // this.drawInteraction && this.drawInteraction.setActive(false)
  }
  //绘制点、线、面
  handleDraw(type) {
    // 先清除
    // this.unbindDarwEvent();
    // 再添加
    if (type === 'LineString') {
      this.drawLineString.setActive(true)
    }
    this.modifyInteraction.setActive(true)
    // this.snap = new Snap({ source: this.drawSource });
    // this.map.addInteraction(this.snap);
    // this.bindDrawEvent();
  }
  bindDrawEvent() {
    this.drawLineString.on("drawstart", (e) => {
      console.log("开始绘制", e.feature);
      // this.copyFeature = null;
      // this.currentFeature = e.feature
      // this.visible.value = true;
      // this.visData.value = e.feature.get("attr");
    });

    this.drawLineString.on("drawend", (e) => {
      console.log("绘制结束", e.feature);
      // if (this.visible.value) {
      //   this.setActive(false);
      // }
      // this.currentFeature = e.feature
      // this.visible.value = false
    });
  }
  //返回上一步
  handleLast() {
    if (!this.handleLastSet.length) return
    const handle = this.handleLastSet.pop()
    this.handleNestSet.push(handle) //记录用户的回退操作，用于点击'重复上一步'时进行反回退
    switch (handle.type) {
      case 'delete':
        handle.source.addFeature(handle.target)
        break;
      case 'move':
        handle.target.setGeometry(handle.lastGeometry)
        break;
      case 'draw': //绘制，则删除绘制的元素
        this.drawSource.removeFeature(handle.target)
        break;
      case 'edit':
        handle.target.setGeometry(handle.lastGeometry)
        break;
      default:
        break;
    }
  }
  //重复上一步(必须是通过上一步的回退生成)
  handleNext() {
    if (!this.handleNestSet.length) return
    const handle = this.handleNestSet.pop()
    this.handleLastSet.push(handle) //记录用户的回退操作，用于点击'上一步'时进行撤销操作
    switch (handle.type) {
      case 'delete': //重新删除
        handle.source.removeFeature(handle.target)
        break;
      case 'move': //重新移动
        handle.target.setGeometry(handle.nextGeometry)
        break;
      case 'draw': //重新绘制
        this.drawSource.addFeature(handle.target)
        break;
      case 'edit': //重新移动
        handle.target.setGeometry(handle.nextGeometry)
        break;
      default:
        break;
    }
  }
}