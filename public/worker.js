// self.addEventListener('message',(e) => {
//   //接收来自主线程发送过来的数据
//   let timeList = e.data.timeList;
//   let ctime = e.data.ctime
//   const index = timeList.findIndex((t) => {
//     return t > ctime
//   })
//   self.postMessage(4)
// })