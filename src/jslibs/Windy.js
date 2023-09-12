/****
*风场类
****/
import { mat3 } from 'gl-matrix'
var CanvasWindy = function (json,params) {
    //风场json数据
    this.windData = json;
    //可配置参数
    this.viewer = params.viewer;
    this.canvas = params.canvas;
    this.extent = params.extent || [];//风场绘制时的地图范围，范围不应该大于风场数据的范围，顺序：west/east/south/north，有正负区分，如：[110,120,30,36]
    //通过方法getContext()获取WebGL上下文
    this.gl = params.canvas.getContext('webgl', { alpha: true});
    this.gl.viewport(0, 0, params.canvasWidth, params.canvasHeight);
    // this.canvasContext = params.canvas.getContext("2d");//canvas上下文
    //顶点着色器源码
    const vertexShaderSource = `
            attribute vec4 aPos; //需要用户传入的顶点位置
            uniform mat3 aMatrix;
            varying vec4 v_color;
            void main() {
            //aPos.z从起点0至终点为1
            v_color = vec4(0.0,aPos.z,0.0,0.0);
            gl_Position = vec4( vec3(aPos.xy, 0.0) * aMatrix, 1.0);
            }
            `;
    // 片元着色器
    const fragShaderSource = `
        precision mediump float;
        uniform vec3 uColor;
        varying vec4 v_color;
        varying float alpha;
                void main() {
                    /*
                    内置变量gl_FragCoord表示WebGL在canvas画布上渲染的所有片元或者说像素的坐标,
                    坐标原点是canvas画布的左下角, x轴水平向右, y竖直向下, gl_FragCoord坐标的单位是像素,
                    gl_FragCoord的值是vec2(x,y),通过gl_FragCoord.x、gl_FragCoord.y方式可以分别访问片元坐标的纵横坐标
                    */
                    gl_FragColor = vec4(v_color.xyz,0.0);
                }
            `;
    //初始化着色器
    this.program = this._initShader(vertexShaderSource, fragShaderSource);
    this.aPosAttLocation = this.gl.getAttribLocation(this.program, "aPos"); // 获得变量位置
    const matrixUniformLocation = this.gl.getUniformLocation(this.program, "aMatrix")
    const rotationMatrix = mat3.fromRotation(mat3.create(), 0)
    this.gl.uniformMatrix3fv(matrixUniformLocation, false, rotationMatrix)
    this.aPosAttBuffer = this.gl.createBuffer(); // 创建缓冲
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.aPosAttBuffer); // 绑定缓冲到指定类型
    this.uColorLocation = this.gl.getUniformLocation(this.program, "uColor");
    this.gl.uniform3f(this.uColorLocation, 1.0, 0.0, 0.0);
    this.gl.clearColor(0, 0, 0, 0.0)//将透明色设置为黑色，完全不透明
    // 清空画布
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);//使用指定的透明颜色清除颜色缓冲
    const lines = []
    lines.push(0,0,0,1.0,500,500,1.0,0.0)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lines), this.gl.DYNAMIC_DRAW);
    this.gl.vertexAttribPointer(this.aPosAttLocation, 4, this.gl.FLOAT, false, 0, 0);
    //vertexAttribPointer --------->index, size, type, normalized, stride, offset
    //index顶点属性的索引，与顶点着色器中的attribute关键字关联
    //size指定每个顶点属性的分量数量,可以是1,2,3,4
    //type分量类型
    //normalized是否归一化
    //stride相邻两个顶点属性之间的字节跨度
    //offset指定这个属性的第一个分量在顶点数据缓冲区中的起始偏移量，以字节为单位
    this.gl.enableVertexAttribArray(this.aPosAttLocation);// 启用数据
    this.gl.uniform3f(this.uColorLocation, 0.0, 0.0, 1.0);
    // this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.drawArrays(this.gl.LINES, 0, lines.length/4);
    this.gl.flush();
    // ---------------------------------------------------------------
    this.canvasWidth = params.canvasWidth || 300;//画板宽度
    this.canvasHeight = params.canvasHeight || 180;//画板高度
    this.speedRate = params.speedRate || 100;//风前进速率，意思是将当前风场横向纵向分成100份，再乘以风速就能得到移动位置，无论地图缩放到哪一级别都是一样的速度，可以用该数值控制线流动的快慢，值越大，越慢，
    this.particlesNumber = params.particlesNumber || 20000;//初始粒子总数，根据实际需要进行调节
    this.maxAge = params.maxAge || 20;//每个粒子的最大生存周期
    this.frameTime = 1000/(params.frameRate || 10);//每秒刷新次数，因为requestAnimationFrame固定每秒60次的渲染，所以如果不想这么快，就把该数值调小一些
    this.color = params.color || '#ffffff';//线颜色，提供几个示例颜色['#14208e','#3ac32b','#e0761a']
    this.lineWidth = params.lineWidth || 1;//线宽度
    //内置参数
    this.initExtent = [];//风场初始范围
    this.calc_speedRate = [0,0];//根据speedRate参数计算经纬度步进长度
    this.windField = null;
    this.particles = [];
    this.animateFrame = null;//requestAnimationFrame事件句柄，用来清除操作
    this.isdistory = false;//是否销毁，进行删除操作
    this._init();
};
CanvasWindy.prototype = {
    constructor: CanvasWindy,
    //声明初始化着色器函数
    _initShader: function (vertexShaderSource, fragmentShaderSource) {
        //创建顶点着色器对象
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        //创建片元着色器对象
        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        //引入顶点、片元着色器源代码
        this.gl.shaderSource(vertexShader, vertexShaderSource);
        this.gl.shaderSource(fragmentShader, fragmentShaderSource);
        //编译顶点、片元着色器
        this.gl.compileShader(vertexShader);
        this.gl.compileShader(fragmentShader);
        let success = this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS);
        if (!success) {
            throw "colud not compile vertex shader:" + this.gl.getShaderInfoLog(vertexShader);
        }
        success = this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS);
        if (!success) {
            throw "colud not compile vertex shader:" + this.gl.getShaderInfoLog(fragmentShader);
        }

        //创建程序对象program
        const program = this.gl.createProgram();
        //附着顶点着色器和片元着色器到program
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        //链接program
        this.gl.linkProgram(program);
        success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (!success) {
            throw "colud not link shader: " + this.gl.getProgramInfoLog(program);
        }
        // 已经链接成程序，可以删除着色器
        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);
        //使用program
        this.gl.useProgram(program);
        //返回程序program对象
        return program;
    },
    _init: function () {
        var self = this;
        // 创建风场网格
        this.windField = this.createField();
        this.initExtent = [this.windField.west-180,this.windField.east-180,this.windField.south,this.windField.north];
        //如果风场创建时，传入的参数有extent，就根据给定的extent，让随机生成的粒子落在extent范围内
        if(this.extent.length!=0){
            this.extent = [
                Math.max(this.initExtent[0],this.extent[0]),
                Math.min(this.initExtent[1],this.extent[1]),
                Math.max(this.initExtent[2],this.extent[2]),
                Math.min(this.initExtent[3],this.extent[3])
            ];
        }
        this._calcStep();
        // 创建风场粒子
        for (var i = 0; i < this.particlesNumber; i++) {
            this.particles.push(this.randomParticle(new CanvasParticle(),true));
        }
        this.gl.clearColor(0, 0, 0, 0.0)//将透明色设置为黑色，完全不透明
        // 清空画布
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);//使用指定的透明颜色清除颜色缓冲
        this.animate();

        var then = Date.now();
        (function frame() {
            if(!self.isdistory){
                self.animateFrame = requestAnimationFrame(frame);
                var now = Date.now();
                var delta = now - then;
                if (delta > self.frameTime) {
                    then = now - delta % self.frameTime;
                    self.animate();
                }
            }else{
                self.removeLines();
            }
        })();
    },
    //计算经纬度步进长度
    _calcStep:function(){
        var isextent = (this.extent.length!=0);
        var calcExtent = isextent?this.extent:this.initExtent;
        var calcSpeed = this.speedRate;
        this.calc_speedRate = [(calcExtent[1]-calcExtent[0])/calcSpeed,(calcExtent[3]-calcExtent[2])/calcSpeed];
    },
    //根据现有参数重新生成风场
    redraw:function(){
        window.cancelAnimationFrame(this.animateFrame);
        this.particles = [];
        this._init();
    },
    createField: function () {
        var data = this._parseWindJson();
        return new CanvasWindField(data);
    },
    animate: function () {
        var self = this
        if (self.particles.length <= 0) this.removeLines();
        self._drawLines();
    },
    //粒子是否在地图范围内
    isInExtent:function(lng,lat){
        var calcExtent = this.initExtent;
        if((lng>=calcExtent[0] && lng<=calcExtent[1]) && (lat>=calcExtent[2] && lat<=calcExtent[3])) return true;
        return false;
    },
    _resize:function(){
        this.canvasWidth = this.viewer.canvas.width;
        this.canvasHeight = this.viewer.canvas.height;
        this.gl.viewport(0, 0, this.viewer.canvas.width, this.viewer.canvas.height);
    },
    _parseWindJson: function () {
        var uComponent = null,
            vComponent = null,
            header = null;
        this.windData.forEach(function (record) {
            var type = record.header.parameterCategory + "," + record.header.parameterNumber;
            switch (type) {
                case "2,2":
                    uComponent = record['data'];
                    header = record['header'];
                    break;
                case "2,3":
                    vComponent = record['data'];
                    break;
                default:
                    break;
            }
        });
        return {
            header: header,
            uComponent: uComponent,
            vComponent: vComponent
        };
    },
    removeLines: function () {
        window.cancelAnimationFrame(this.animateFrame);
        this.isdistory = true;
    },
    //根据经纬度，算出棋盘格位置
    _togrid: function (lng,lat) {
        var field = this.windField;
        var x = (lng-this.initExtent[0])/(this.initExtent[1]-this.initExtent[0])*(field.cols-1);
        var y = (this.initExtent[3]-lat)/(this.initExtent[3]-this.initExtent[2])*(field.rows-1);
        return [x,y];
    },
    _drawLines: function () {
        var self = this;
        var particles = this.particles;
        const lines = []
        particles.forEach(function (particle) {
            particle.num += 0.05
            if (particle.age > 0) {
                if (particle.num > particle.age - 1){
                    particle.num = -1
                }
                const t = particle.num
                let start = t
                let end = t + 0.5
                if (start< 0) start = 0
                if (end <0) end = 0
                if (start >= particle.age - 1) start = particle.age - 1
                if (end >= particle.age - 1) {
                    self.randomParticle(particle);
                }
                if (particle.spline){
                    let sp,ep
                    try{
                        sp = particle.spline.evaluate(start)
                        ep = particle.spline.evaluate(end)
                        const pointA = ep // 需要判断的当前点位置
                        const pointB = self.viewer.camera.position // 相机位置
                        const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA); // 已点A为坐标原点建立坐标系，此坐标系相切于地球表面
                        const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
                        const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
                        const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
                        if (self.viewer.scene.mode === 3) { //三维展示时
                            if (direction.z < 0) {//地球背侧
                                self.randomParticle(particle);
                            } else {
                                const p1 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(self.viewer.scene, sp); // 笛卡尔世界坐标 转 屏幕坐标
                                const p2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(self.viewer.scene, ep); // 笛卡尔世界坐标 转 屏幕坐标
                                if (p1 && p2){
                                    const {x,y} = p1
                                    const {x:x2,y:y2} = p2
                                    const xw = x / (self.canvasWidth/2) - 1
                                    const xw2 = x2 / (self.canvasWidth/2) - 1
                                    const yw = 1 - y / (self.canvasHeight/2)
                                    const yw2 = 1 - y2 / (self.canvasHeight/2)
                                    if ([xw,yw].findIndex((item) => item>1||item<-1)>-1){
                                        self.randomParticle(particle);
                                    } else {
                                        lines.push(xw,yw,0.0,1.0,xw2,yw2,1.0,0.0)//第三个属性当作透明度
                                    }
                                }
                            }
                        }
                    }catch(e){
                        // console.log(e);
                        self.randomParticle(particle);
                    }
                }
            }else{
                self.randomParticle(particle);
            }
        });
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lines), this.gl.DYNAMIC_DRAW);
        this.gl.vertexAttribPointer(this.aPosAttLocation, 4, this.gl.FLOAT, false, 0, 0);
        // //vertexAttribPointer --------->index, size, type, normalized, stride, offset
        // //index顶点属性的索引，与顶点着色器中的attribute关键字关联
        // //size指定每个顶点属性的分量数量,可以是1,2,3,4
        // //type分量类型
        // //normalized是否归一化
        // //stride相邻两个顶点属性之间的字节跨度
        // //offset指定这个属性的第一个分量在顶点数据缓冲区中的起始偏移量，以字节为单位
        this.gl.enableVertexAttribArray(this.aPosAttLocation);// 启用数据
        this.gl.uniform3f(this.uColorLocation, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawArrays(this.gl.LINES, 0, lines.length/4);
        this.gl.flush();
    },
    //随机数生成器（小数）
    fRandomByfloat:function(under, over){
       return under+Math.random()*(over-under);
    },
    //随机数生成器（整数）
    fRandomBy:function(under, over){
       switch(arguments.length){
         case 1: return parseInt(Math.random()*under+1);
         case 2: return parseInt(Math.random()*(over-under+1) + under);
         default: return 0;
       }
    },
    //根据当前风场extent随机生成粒子
    randomParticle: function (particle, init = false) {
        var safe = 30,x=-1, y=-1,lng=null,lat=null;
        var hasextent = this.extent.length!=0;
        var calc_extent = hasextent?this.extent:this.initExtent;
        do {
            try{
                if(hasextent){
                    var pos_x = this.fRandomBy(0,this.canvasWidth);
                    var pos_y = this.fRandomBy(0,this.canvasHeight);
                    var cartesian = this.viewer.camera.pickEllipsoid(new Cesium.Cartesian2(pos_x, pos_y), this.viewer.scene.globe.ellipsoid);
                    var cartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                    if(cartographic){
                        //将弧度转为度的十进制度表示
                        lng = Cesium.Math.toDegrees(cartographic.longitude);
                        lat = Cesium.Math.toDegrees(cartographic.latitude);
                    }
                }else{
                    lng = this.fRandomByfloat(calc_extent[0],calc_extent[1]);
                    lat = this.fRandomByfloat(calc_extent[2],calc_extent[3]);
                }
            }catch(e){
               console.log(e);
            }
            if(lng){
                var gridpos = this._togrid(lng,lat);
                x = gridpos[0];
                y = gridpos[1];
            }
        } while (this.windField.getIn(x, y)[2] <= 0 && safe++ < 30);
        var field = this.windField;
        var uv = field.getIn(x, y);
        var nextLng = lng +  this.calc_speedRate[0] * uv[0];
        var nextLat = lat +  this.calc_speedRate[1] * uv[1];
        particle.lng = lng;
        particle.lat = lat;
        particle.x = x;
        particle.y = y;
        particle.tlng = nextLng;
        particle.tlat = nextLat;
        particle.speed = uv[2];
        particle.age = 30;//每一次生成都不一样
        particle.num = init ? Math.random()*30 : -0.5;
        const times = []
        const points = []
        for(let i =0; i<particle.age;i++){
            const pos = Cesium.Cartesian3.fromDegrees(particle.lng, particle.lat,0);
            if(pos){
                times.push(i)
                points.push(pos)
            }
            const x = particle.x,
                y = particle.y,
                tlng = particle.tlng,
                tlat = particle.tlat;
            const gridpos = this._togrid(tlng,tlat);
            const tx = gridpos[0];
            const ty = gridpos[1];
            if (!this.isInExtent(tlng,tlat)) {
                particle.age = 0;
            } else {
                const uv = this.windField.getIn(tx, ty);
                const nextLng = tlng +  this.calc_speedRate[0] * uv[0];
                const nextLat = tlat +  this.calc_speedRate[1] * uv[1];
                particle.lng = tlng;
                particle.lat = tlat;
                particle.x = tx;
                particle.y = ty;
                particle.tlng = nextLng;
                particle.tlat = nextLat;
            }
        }
        if (points.length>1){
            const spline = new Cesium.CatmullRomSpline({
                // 立方样条曲线
                times, // 曲线变化参数，严格递增，times.length必须等于points.length,最后一个值,与下面的evaluate()的参数相关（参数区间在0~1）
                points, // 控制点,points.length必须 ≥ 2
            });
            particle.spline = spline
            particle.age = points.length
        }
        return particle;
    }
};


/****
*棋盘类
*根据风场数据生产风场棋盘网格
****/
var CanvasWindField = function (obj) {
    this.west = null;
    this.east = null;
    this.south = null;
    this.north = null;
    this.rows = null;
    this.cols = null;
    this.dx = null;
    this.dy = null;
    this.unit = null;
    this.date = null;

    this.grid = null;
    this._init(obj);
};
CanvasWindField.prototype = {
    constructor: CanvasWindField,
    _init: function (obj) {
        var header = obj.header,
            uComponent = obj['uComponent'],
            vComponent = obj['vComponent'];

        this.west = +header['lo1'];
        this.east = +header['lo2'];
        this.south = +header['la2'];
        this.north = +header['la1'];
        this.rows = +header['ny'];
        this.cols = +header['nx'];
        this.dx = +header['dx'];
        this.dy = +header['dy'];
        this.unit = header['parameterUnit'];
        this.date = header['refTime'];

        this.grid = [];
        var k = 0,
            rows = null,
            uv = null;
        for (var j = 0; j < this.rows; j++) {
            rows = [];
            for (var i = 0; i < this.cols; i++, k++) {
                uv = this._calcUV(uComponent[k], vComponent[k]);
                rows.push(uv);
            }
            this.grid.push(rows);
        }
    },
    _calcUV: function (u, v) {
        return [+u, +v, Math.sqrt(u * u + v * v)];
    },
    //二分差值算法计算给定节点的速度
    _bilinearInterpolation: function (x, y, g00, g10, g01, g11) {
        var rx = (1 - x);
        var ry = (1 - y);
        var a = rx * ry, b = x * ry, c = rx * y, d = x * y;
        var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
        var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
        return this._calcUV(u, v);
    },
    getIn: function (x, y) {
        if(x<0 || x>=359 || y>=180){
            return [0,0,0];
        }
        var x0 = Math.floor(x),
            y0 = Math.floor(y),
            x1, y1;
        if (x0 === x && y0 === y) return this.grid[y][x];

        x1 = x0 + 1;
        y1 = y0 + 1;

        var g00 = this.getIn(x0, y0),
            g10 = this.getIn(x1, y0),
            g01 = this.getIn(x0, y1),
            g11 = this.getIn(x1, y1);
        var result = null;
        try{
            result = this._bilinearInterpolation(x - x0, y - y0, g00, g10, g01, g11);
        }catch(e){
            console.log(x,y);
        }
        return result;
    },
    isInBound: function (x, y) {
        if ((x >= 0 && x < this.cols-1) && (y >= 0 && y < this.rows-1)) return true;
        return false;
    }
};


/****
*粒子对象
****/
var CanvasParticle = function () {
    this.lng = null;//粒子初始经度
    this.lat = null;//粒子初始纬度
    this.x = null;//粒子初始x位置(相对于棋盘网格，比如x方向有360个格，x取值就是0-360，这个是初始化时随机生成的)
    this.y = null;//粒子初始y位置(同上)
    this.tlng = null;//粒子下一步将要移动的经度，这个需要计算得来
    this.tlat = null;//粒子下一步将要移动的y纬度，这个需要计算得来
    this.age = null;//粒子生命周期计时器，每次-1
    this.speed = null;//粒子移动速度，可以根据速度渲染不同颜色
    this.spline = null;
    this.num = null;
};
export default CanvasWindy