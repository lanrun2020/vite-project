import Mock from 'mockjs'

import anSystem from './modules/an-system'

const mocks = [ ...anSystem]
mocks.forEach(({url,type,response})=>{
  Mock.mock(new RegExp(url),type,response)
})
