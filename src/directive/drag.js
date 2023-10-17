const draggable = {
  inserted: function (el) {
    // el.style.cursor = 'move'（用来设置鼠标作用时的样式）
    el.onmousedown = function (e) {
    //这里是设置dom（只有鼠标在class为header的dom上时才可以拖动）
      if(e.target.className!='header'){  
        // el.style.cursor = 'default'  
        return document.onmousemove = document.onmouseup = null
      }
      // el.style.cursor = 'move'
      console.log(e)
      //获取当前鼠标在dom中的位置
      let disx = e.clientX - el.offsetLeft
      let disy = e.clientY - el.offsetTop
      document.onmousemove = function (e) {
      //获取移动后当前鼠标距离左边以及上边的距离
        let x = e.clientX - disx
        let y = e.clientY - disy
        //获取鼠标在左右、上下所能移动的最大距离
        let maxX = document.body.clientWidth - parseInt(window.getComputedStyle(el).width)
        let maxY = document.body.clientHeight - parseInt(window.getComputedStyle(el).height)
        if (x < 0) {
          x = 0
        } else if (x > maxX) {
          x = maxX
        }

        if (y < 0) {
          y = 0
        } else if (y > maxY) {
          y = maxY
        }

        el.style.left = x + 'px'
        el.style.top = y + 'px'
      }
      document.onmouseup = function () {
        document.onmousemove = document.onmouseup = null
      }
    }
  }
}
export default {
    install(Vue) {
      Vue.directive('drag', draggable)
    }
}