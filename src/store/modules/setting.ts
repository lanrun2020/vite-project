export default {
  state:{
    // baseURL:'http://192.168.0.21:10000/api',
    baseURL:'http://127.0.0.1:4523/mock/857149',
  },
  getters:{
    baseURL:(state:any)=>state.baseURL
  }
}