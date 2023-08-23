export function colorGradient(colorArr: Array<string>, percent:number) {
  const n = colorArr.length
  if (/#/.test(colorArr[0])) { //'#00ff00'格式的颜色
    if (n === 1) return colorArr[0]
    let index = Math.floor(percent*(n-1))
    let step = percent - index/(n-1)
    if(step === 0 && index===n-1){
      step = 1
      index = index-1
    } else {
      step = step*(n-1)
    }
    const colora = colorArr[index].split('#')[1]
    const colora1 = parseInt('0x'+colora.slice(0,2));
    const colora2 = parseInt('0x'+colora.slice(2,4));
    const colora3 = parseInt('0x'+colora.slice(4,6));
    const colorb = colorArr[index+1].split('#')[1]
    const colorb1 = parseInt('0x'+colorb.slice(0,2));
    const colorb2 = parseInt('0x'+colorb.slice(2,4));
    const colorb3 = parseInt('0x'+colorb.slice(4,6));
    const colorc1 = ('0000'+Math.floor(colora1+(colorb1-colora1)*step).toString(16)).slice(-2);
    const colorc2 = ('0000'+Math.floor(colora2+(colorb2-colora2)*step).toString(16)).slice(-2);
    const colorc3 = ('0000'+Math.floor(colora3+(colorb3-colora3)*step).toString(16)).slice(-2);
    return '#' + colorc1 + colorc2 + colorc3
  }
}