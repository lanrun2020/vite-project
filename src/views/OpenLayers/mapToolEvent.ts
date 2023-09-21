import { Stroke, Style, Circle, Fill, Text } from "ol/style";
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
  private lastFeature = null
  private lastStyle = null
  private selectStyleFuc = null
  private handleLastSet = [] //保存用户操作记录,用于操作步骤的前进与回退
  private handleNestSet = [] //保存用户操作记录,用于操作步骤的前进与回退
  constructor(map) {
    this.map = map
    //设置选中时点、线等要素的样式
    this.selectStyleFuc = (feature) => {
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
    this.selectInteraction = new Select({
      style: this.selectStyleFuc, //设置选中时的样式
      hitTolerance: 5
    });
    this.selectInteraction.on("select", (event) => {
      if (this.lastFeature && this.lastStyle) {
        this.lastFeature.setStyle(this.lastStyle)
      }
      const selectedFeatures = event.target.getFeatures();
      selectedFeatures.forEach((feature) => {
        this.lastFeature = feature
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
    this.translateInteraction = new Translate({
      hitTolerance: 5
    });
    // 可以监听一下拖动开始和结束的事件，拖动后的经纬度可以从e里面获取
    this.translateInteraction.on('translatestart', (e) => {
      console.log("开始移动", e);
      const features = e.features;
      // setCoordinates
    })
    this.translateInteraction.on('translateend', (e) => {
      console.log("结束移动", e);
      const features = e.features;
      this.handleLastSet.push({
        type: 'move',
        startPos: e.startCoordinate, //记录移动前位置
        endPos: e.coordinate, //记录移动后位置
        target: e.features.pop()
      })
    })
    this.map.value.addInteraction(this.selectInteraction);
    this.map.value.addInteraction(this.translateInteraction);
  }
  //监听鼠标移动事件
  handlePointerMove() {
    // this.selectInteraction && this.map.value.removeInteraction(this.selectInteraction);
    this.pointerMoveEvent = this.map.value.on('pointermove', (e) => {
      this.map.value.getTargetElement().style.cursor = ''
      if (this.lastFeature && this.lastStyle) {
        this.lastFeature.setStyle(this.lastStyle)
      }
      //forEachFeatureAtPixel命中检测
      this.map.value.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
        const type = feature.getGeometry().getType()
        this.lastStyle = feature.getStyle()
        this.lastFeature = feature
        this.map.value.getTargetElement().style.cursor = 'pointer'
        // const property = feature.getProperties()
        if (type === 'Point') {
          feature.setStyle(new Style({
            image: new Circle({
              radius: 10,
              fill: new Fill({
                color: '#009688',
              }),
            })
          }))
          return true
          // feature.setStyle(null) //设置隐藏元素(图层vector样式设置为null才行,否则是设置为默认样式)
        }
        if (type === 'LineString') {
          feature.setStyle(new Style({
            stroke: new Stroke({
              color: '#009688',
              width: 1.5
            })
          }))
          return true
        }
        // const coordinate = Extent.getCenter(feature.getGeometry().getExtent())
      },
        {
          hitTolerance: 5//检测范围，在鼠标距离此范围内可被检测
        })
    })
  }
  //监听点击事件
  handleClick() {
    this.map.value.on('click', (e) => {
      this.map.value.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
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
    if (this.lastFeature) {
      const source = this.map.value.getLayers().getArray().map(layer => layer.getSource()).find(
        source => source.getFeatureById && source.getFeatureById(this.lastFeature.getId())
      );
      if (source){
        source.removeFeature(this.lastFeature)
        this.handleLastSet.push({
          type: 'delete',
          source,
          target: this.lastFeature
        })
        // console.log('删除',this.lastFeature.getId());
        this.lastFeature = null
      }
    }
  }
  //返回上一步
  handleLast() {
    if(!this.handleLastSet.length) return
    const handle = this.handleLastSet.pop()
    console.log(handle);
    
    this.handleNestSet.push(handle) //记录用户的回退操作，用于点击'重复上一步'时进行反回退
    switch (handle.type) {
      case 'delete':
        handle.source.addFeature(handle.target)
        break;
      case 'move':
        handle.target.getGeometry().setCoordinates(handle.startPos)
        break;
      default:
        break;
    }
  }
  //重复上一步(必须是通过上一步的回退生成)
  handleNext() {
    if(!this.handleNestSet.length) return
    const handle = this.handleNestSet.pop()
    this.handleLastSet.push(handle) //记录用户的回退操作，用于点击'上一步'时进行撤销操作
    switch (handle.type) {
      case 'delete':
        handle.source.removeFeature(handle.target)
        break;
      case 'move':
        handle.target.getGeometry().setCoordinates(handle.endPos)
        break;
      default:
        break;
    }
  }
}