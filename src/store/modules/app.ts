import { Canceler } from 'axios'
const getDefaultState = () => {
  return {
    token: '',
    cancelTokenArr: [] as Array<Canceler>
  }
}
export default {
  state: getDefaultState(),
  getters: {
    cancelTokenArr: (state: any) => state.cancelTokenArr,
    token: (state: any) => state.token
  },
  mutations: {
    PUSH_CANCEL: (state: any, payload: any) => {
      state.cancelTokenArr.push(payload.cancelToken)
    },
    CLEAR_CANCEL: (state: any) => {
      state.cancelTokenArr.forEach((item: Canceler) => {
        item('路由跳转取消')
      })
      state.cancelTokenArr = []
    },
    SET_TOKEN: (state: any, token: string) => {
      state.token = token
    }
  }
}