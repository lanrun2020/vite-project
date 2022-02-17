import Mock from 'mockjs'
import anSystem from './modules/an-system'

const mocks = [...anSystem]
const paramObj = (url: any) => {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace('/\+/g', ' ') +
    '"}'
  )
}

const XHR2RequestWrap = (response: any) => {
  return (options: any) => {
    let result
    if (response instanceof Function) {
      const { body, url } = options
      result = response({ body: JSON.parse(body), query: paramObj(url) })
    } else {
      result = response
    }
    return Mock.mock(result)
  }
}
//重写mock的send方法
// @ts-ignore
Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send 
// @ts-ignore
Mock.XHR.prototype.send = function() {
  if (this.custom.xhr) {
    this.custom.xhr.withCredentials = this.withCredentials || false
    if (this.responseType) {
      this.custom.xhr.responseType = this.responseType
    }
  }
  this.proxy_send(...arguments)
}

Mock.setup({
  timeout:1000
  // timeout: '200-600' //表示响应时间介于 200 和 600 毫秒之间。默认值是'10-100'。
})
mocks.forEach(({ url, type, response }) => {
  Mock.mock(new RegExp(url), type, XHR2RequestWrap(response))
})
