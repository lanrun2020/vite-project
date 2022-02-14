export default {
  state:{
    baseUrl:'http://192.168.0.21:10000/api',
  },
  getters:{
    baseUrl:(state:any)=>state.baseUrl
  }
}