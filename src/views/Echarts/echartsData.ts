const option = {
  // title: {
  //   text: 'Population Density of Hong Kong （2011）',
  //   subtext: 'Data from Wikipedia',
  //   sublink:
  //     'http://zh.wikipedia.org/wiki/%E9%A6%99%E6%B8%AF%E8%A1%8C%E6%94%BF%E5%8D%80%E5%8A%83#cite_note-12'
  // },
  tooltip: {
    trigger: 'item',
    // formatter: '{b}<br/>{c} (p / km2)'
  },
  toolbox: {
    show: true,
    orient: 'vertical',
    left: 'right',
    top: 'center',
    feature: {
      dataView: { readOnly: false },
      restore: {},
      saveAsImage: {}
    }
  },
  visualMap: {
    min: 800,
    max: 50000,
    text: ['High', 'Low'],
    realtime: false,
    calculable: true,
    inRange: {
      color: ['lightskyblue', 'yellow', 'orangered']
    }
  },
  series: [
    {
      name: '人口密度',
      type: 'map',
      map: 'chinaMap',
      label: {
        show: false
      },
      data: [
        { name: '北京市', value: 20057.34 },
      ],
      // 自定义名称映射
      nameMap: {
      }
    }
  ]
}

export { option }