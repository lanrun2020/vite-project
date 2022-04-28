// 点聚合
import Cesium from "@/utils/importCesium"

let datasource: any = ''
export const addClustering = (viewer: any, active: boolean) => {
  if (active) {
    const czml2: Array<any> = Array(500).fill(null).map((any, i) => {
      return {
        id: "point" + i,
        position: {
          cartographicDegrees: [100 + (Math.random() * 20), 25 + (Math.random() * 15), 10000],
        },
        point: {
          color: {
            rgba: [Math.random() * 255, Math.random() * 255, Math.random() * 255, 255],
          },
          outlineColor: {
            rgba: [0, 255, 0, 255],
          },
          outlineWidth: 1,
          pixelSize: 10,
        },
      }
    })
    czml2.unshift(
      {
        id: "document",
        name: "CZML Point",
        version: "1.0",
      },
    )
    viewer.scene.globe.depthTestAgainstTerrain = false;
    datasource = Cesium.CzmlDataSource.load(czml2)
    const dataSourcePromise = viewer.dataSources.add(datasource);
    viewer.zoomTo(datasource);

    dataSourcePromise.then(function (dataSource: any) {
      const pixelRange = 15; // 聚合的像素范围
      const minimumClusterSize = 3; // 点聚合的最小个数
      const enabled = true; // 是否开启点聚合

      dataSource.clustering.enabled = enabled;
      dataSource.clustering.pixelRange = pixelRange;
      dataSource.clustering.minimumClusterSize = minimumClusterSize;

      let removeListener: any

      const pinBuilder = new Cesium.PinBuilder();
      const pin50 = pinBuilder
        .fromText("50+", Cesium.Color.RED, 48)
        .toDataURL();
      const pin40 = pinBuilder
        .fromText("40+", Cesium.Color.ORANGE, 48)
        .toDataURL();
      const pin30 = pinBuilder
        .fromText("30+", Cesium.Color.YELLOW, 48)
        .toDataURL();
      const pin20 = pinBuilder
        .fromText("20+", Cesium.Color.GREEN, 48)
        .toDataURL();
      const pin10 = pinBuilder
        .fromText("10+", Cesium.Color.BLUE, 48)
        .toDataURL();

      const singleDigitPins = new Array(8);
      for (let i = 0; i < singleDigitPins.length; ++i) {
        singleDigitPins[i] = pinBuilder
          .fromText(`${i + 2}`, Cesium.Color.VIOLET, 48)
          .toDataURL();
      }

      function customStyle() {
        if (Cesium.defined(removeListener)) {
          removeListener();
          removeListener = undefined;
        } else {
          removeListener = dataSource.clustering.clusterEvent.addEventListener(
            function (clusteredEntities: any, cluster: any) {
              cluster.label.show = false;
              cluster.billboard.show = true;
              cluster.billboard.id = cluster.label.id;
              cluster.billboard.verticalOrigin =
                Cesium.VerticalOrigin.BOTTOM;
              const pinBuilder = new Cesium.PinBuilder();
              const pinNum = pinBuilder
                .fromText(clusteredEntities.length, Cesium.Color.ORANGE, 40)
                .toDataURL();
              cluster.billboard.image = pinNum;
              // if (clusteredEntities.length >= 50) {
              //   cluster.billboard.image = pin50;
              // } else if (clusteredEntities.length >= 40) {
              //   cluster.billboard.image = pin40;
              // } else if (clusteredEntities.length >= 30) {
              //   cluster.billboard.image = pin30;
              // } else if (clusteredEntities.length >= 20) {
              //   cluster.billboard.image = pin20;
              // } else if (clusteredEntities.length >= 10) {
              //   cluster.billboard.image = pin10;
              // } else {
              //   cluster.billboard.image =
              //     singleDigitPins[clusteredEntities.length - 2];
              // }
            }
          );
        }

        // force a re-cluster with the new styling
        const pixelRange = dataSource.clustering.pixelRange;
        dataSource.clustering.pixelRange = 0;
        dataSource.clustering.pixelRange = pixelRange;
      }

      // start with custom style
      customStyle();

      const viewModel = {
        pixelRange: pixelRange,
        minimumClusterSize: minimumClusterSize,
      };
      Cesium.knockout.track(viewModel);

      const toolbar = document.getElementById("toolbar");
      Cesium.knockout.applyBindings(viewModel, toolbar);

      function subscribeParameter(name: string) {
        Cesium.knockout
          .getObservable(viewModel, name)
          .subscribe(function (newValue: any) {
            dataSource.clustering[name] = newValue;
          });
      }
      subscribeParameter("pixelRange");
      subscribeParameter("minimumClusterSize");
    })
  } else {
    viewer.dataSources.removeAll()
  }

}