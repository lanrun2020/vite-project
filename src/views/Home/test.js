myChart.dispatchAction({
  type:'takeGlobalCursor',
  key:'brush',
  brushOption:{
    brushType:'lineX', //设置为false，则框选工具按钮为不选中状态
    brushMode:'single',
  }
})