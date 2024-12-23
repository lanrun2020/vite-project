import * as THREE from "three";

const flyShader = {
    vertexshader: `
        uniform float size;
        uniform float time;
        uniform float u_len;
        attribute float u_index;
        varying float u_opacitys;
        void main() {
            if( u_index < time + u_len && u_index > time){
                float u_scale = 1.0 - (time + u_len - u_index) /u_len;
                u_opacitys = u_scale;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = size * u_scale * 1900.0 / (-mvPosition.z);
            }
        }
        `,
    fragmentshader: `
        uniform sampler2D u_map;
        uniform float u_opacity;
        uniform vec3 color;
        uniform float isTexture;
        varying float u_opacitys;
        void main() {
            vec4 u_color = vec4(color,u_opacity * u_opacitys);
            if( isTexture != 0.0 ){
                gl_FragColor = u_color * texture2D(u_map, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));
            }else{
                gl_FragColor = u_color;
            }
        }`
}
export class InitFlyLine {
    private flyId = 0
    private texture = 0.0
    private color = "rgba(255,255,255,1)"
    private flyArr:Array<any> = []
    private baicSpeed = 1
    constructor(options?: { texture:any }){
    this.texture = 0.0;
      if (options?.texture && !options?.texture.isTexture) {
          this.texture = new THREE.TextureLoader().load(options?.texture)
      }
    }
    /**
     * [addFly description]
     *
     * @param   {String}  opt.color  [颜色_透明度]
     * @param   {Array}   opt.curve  [线的节点]
     * @param   {Number}  opt.width  [宽度]
     * @param   {Number}  opt.length [长度]
     * @param   {Number}  opt.speed  [速度]
     * @param   {Number}  opt.repeat [重复次数]
     * @return  {Mesh}               [return 图层]
     */
     addFly({
        color = "rgba(255,255,255,1)",
        curve = [],
        width = 10,
        length = 10,
        speed = 1,
        repeat = 1,
        texture = null,
        // callback: Function
        }) {
        const colorArr = this.getColorArr(color);
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: {
                    value: colorArr[0],
                    type: "v3"
                },
                size: {
                    value: width,
                    type: "f"
                },
                u_map: {
                    value: texture ? texture : this.texture,
                    type: "t2"
                },
                u_len: {
                    value: length,
                    type: "f"
                },
                u_opacity: {
                    value: colorArr[1],
                    type: "f"
                },
                time: {
                    value: -length,
                    type: "f"
                },
                isTexture: {
                    value: 1,
                    type: "f"
                }
            },
            transparent: true,
            depthTest: false,
            vertexShader: flyShader.vertexshader,
            fragmentShader: flyShader.fragmentshader
        });
        const position:Array<any> = []
        const u_index:Array<number> = []
        curve.forEach(function (elem:{x:number,y:number,z:number}, index:number) {
            position.push(elem.x, elem.y, elem.z);
            u_index.push(index);
        })
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
        geometry.setAttribute("u_index", new THREE.Float32BufferAttribute(u_index, 1));
        const mesh = new THREE.Points(geometry, material);
        mesh.name = "fly";
        mesh._flyId = this.flyId;
        mesh._speed = speed;
        mesh._repeat = repeat;
        mesh._been = 0;
        mesh._total = curve.length;
        // mesh._callback = callback;
        this.flyId++;
        this.flyArr.push(mesh);
        return mesh
    }
    getColorArr(str:string) {
        if (Array.isArray(str)) return str; //error
        const _arr = [];
        str = str + '';
        str = str.toLowerCase().replace(/\s/g, "");
        // eslint-disable-next-line no-useless-escape
        if (/^((?:rgba)?)\(\s*([^\)]*)/.test(str)) {
            const arr:any = str.replace(/rgba\(|\)/gi, '').split(',');
            const hex = [
                pad2(Math.round(arr[0] * 1 || 0).toString(16)),
                pad2(Math.round(arr[1] * 1 || 0).toString(16)),
                pad2(Math.round(arr[2] * 1 || 0).toString(16))
            ];
            _arr[0] = this.setColor('#' + hex.join(""));
            _arr[1] = Math.max(0, Math.min(1, (arr[3] * 1 || 0)));
        } else if ('transparent' === str) {
            _arr[0] = this.setColor();
            _arr[1] = 0;
        } else {
            _arr[0] = this.setColor(str);
            _arr[1] = 1;
        }

        function pad2(c:String) {
            return c.length == 1 ? '0' + c : '' + c;
        }
        return _arr;
    }
       /**
     * [remove 删除]
     * @param   {Object}  mesh  [当前飞线]
     */
        remove(mesh:any) {
            mesh.material.dispose();
            mesh.geometry.dispose();
            this.flyArr = this.flyArr.filter(elem => elem._flyId != mesh._flyId);
            mesh.parent.remove(mesh);
            mesh = null;
        }
    animation(delta = 0.015) {
        if (delta > 0.2) return;
        this.flyArr.forEach(elem => {
            if (!elem.parent) return;
            if (elem._been > elem._repeat) {
                elem.visible = false;
                if (typeof elem._callback === 'function') {
                    elem._callback(elem);
                }
                this.remove(elem)
            } else {
                const uniforms = elem.material.uniforms;
                //完结一次
                if (uniforms.time.value < elem._total) {
                    uniforms.time.value += delta * (this.baicSpeed / delta) * elem._speed;
                } else {
                    elem._been += 1;
                    uniforms.time.value = -uniforms.u_len.value;
                }
            }
        })
    }
    setColor(c?:string) {
        return new THREE.Color(c);
    }
}