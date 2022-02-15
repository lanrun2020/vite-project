export default {
  state:{
    baseURL:'http://192.168.0.21:10000/api',
  },
  getters:{
    baseURL:(state:any)=>state.baseURL
  }
}