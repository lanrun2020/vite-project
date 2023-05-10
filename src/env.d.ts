/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
// declare module '*.js' {

//   export default EchartsLayers
// }
declare module 'three'
declare module 'dagre-d3'
declare module 'leader-line';
declare interface Window {
  Cesium: any,
  Viewer: any
}