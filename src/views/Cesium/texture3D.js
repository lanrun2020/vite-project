// / <reference path="../cesium-main/Source/Cesium.js"/>

import Cesium from '@/utils/importCesium'
function Texture3D(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

    Cesium.Check.defined("options.context", options.context);

    const context = options.context;
    let width = options.width;
    let height = options.height;
    let depth = options.depth;
    let source = options.source;

    const pixelFormat = Cesium.defaultValue(options.pixelFormat, Cesium.PixelFormat.RGBA);
    const pixelDatatype = Cesium.defaultValue(options.pixelDataType, Cesium.PixelDatatype.UNSIGNED_BYTE);
    const internalFormat = Cesium.PixelFormat.toInternalFormat(pixelFormat, pixelDatatype, context);

    if (!Cesium.defined(width) || !Cesium.defined(height) || !Cesium.defined(depth)) {
        throw new Cesium.DeveloperError(
            "options requires a source field to create an 3d texture. width or height or dimension fileds"
        )
    }

    Cesium.Check.typeOf.number.greaterThan("width", width, 0);

    if (width > Cesium.ContextLimits.maximumTextureSize) {
        throw new Cesium.DeveloperError(
            "width must be less than or equal to the maximum texture size"
        );
    }

    Cesium.Check.typeOf.number.greaterThan("height", height, 0);

    if (height > Cesium.ContextLimits.maximumTextureSize) {
        throw new Cesium.DeveloperError(
            "height must be less than or equal to the maximum texture size"
        );
    }

    Cesium.Check.typeOf.number.greaterThan("dimensions", depth, 0);

    if (depth > Cesium.ContextLimits.maximumTextureSize) {
        throw new Cesium.DeveloperError(
            "dimension must be less than or equal to the maximum texture size"
        );
    }

    if (!Cesium.PixelFormat.validate(pixelFormat)) {
        throw new Cesium.DeveloperError("Invalid options.pixelFormat.");
    }

    if (!Cesium.PixelDatatype.validate(pixelDatatype)) {
        throw new Cesium.DeveloperError("Invalid options.pixelDatatype.");
    }

    let initialized = true;
    const gl = context._gl;
    const textureTarget = gl.TEXTURE_3D;
    const texture = gl.createTexture();

    const lxs= gl.getParameter(gl.ACTIVE_TEXTURE);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(textureTarget, texture);
    let unpackAlignment = 4;
    if (Cesium.defined(source) && Cesium.defined(source.arrayBufferView)) {
        unpackAlignment = Cesium.PixelFormat.alignmentInBytes(pixelFormat, pixelDatatype, width);//??
    }

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, unpackAlignment);
    gl.pixelStorei(
        gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,
        gl.BROWSER_DEFAULT_WEBGL
    );

    if (Cesium.defined(source)) {
        if (Cesium.defined(source.arrayBufferView)) {
            let arrayBufferView = source.arrayBufferView;
            gl.texImage3D(
                textureTarget,
                0,
                internalFormat,
                width,
                height,
                depth,
                0,//border
                pixelFormat,
                Cesium.PixelDatatype.toWebGLConstant(pixelDatatype, context),
                arrayBufferView
            );
            initialized = true;
        }
    }
    gl.bindTexture(textureTarget, null);
    this._id = Cesium.createGuid();
    this._context = context;
    this._textureFilterAnisotropic = context._textureFilterAnisotropic;
    this._textureTarget = textureTarget;
    this._texture = texture;
    this._internalFormat = internalFormat;
    this._pixelFormat = pixelFormat;
    this._pixelDatatype = pixelDatatype;
    this._width = width;
    this._height = height;
    this._depth = depth;
    this._dimensions = new Cesium.Cartesian3(width, height, depth);
    this._hasMinmap = false;
    this._sizeInBytes = 4;
    this._preMultiplyAlpha = false;
    this._flipY = false;
    this._initialized = initialized;
    this._sampler = undefined;

    Cesium.defaultValue,
    this.sampler = Cesium.defined(options.sampler) ? options.sampler : new Cesium.Sampler();
}

// Creates a texture, and copies a subimage of the framebuffer to it.
Texture3D.fromFramebuffer = function (options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
    Cesium.Check.defined("options.context", options.context);

    const context = options.context;
    const gl = context._gl;

    const pixelFormat = Cesium.defaultValue(options.pixelFormat, Cesium.PixelFormat.RGB);
    const framebufferXOffset = Cesium.defaultValue(options.framebufferXOffset, 0);
    const framebufferYOffset = Cesium.defaultValue(options.framebufferYOffset, 0);
    const width = Cesium.defaultValue(options.width, gl.drawingBufferWidth);
    const height = Cesium.defaultValue(options.height, gl.drawingBufferHeight);
    const depth = Cesium.defaultValue(options.depth, 128);
    const framebuffer = options.framebuffer;

    const texture=new Texture3D({
        context:context,
        width:width,
        height:height,
        pixelFormat:pixelFormat,
        source:{
            framebuffer:Cesium.defined(framebuffer)?framebuffer:context.defaultFramebuffer,
            width:width,
            height:height,
            depth:depth,
        }
    });
    return texture;
};

Object.defineProperties(Texture3D.prototype,{
    id:{
        get:function(){
            return this._id;
        }
    },
    sampler:{
        get:function(){
            return this._sampler;
        },
        set:function(sampler){
            let minificationFilter=sampler.minificationFilter;
            let magnificationFilter=sampler.magnificationFilter;
            const context=this._context;
            const pixelFormat=this._pixelFormat;
            const pixelDatatype=this._pixelDatatype;

            const gl=context._gl;
            const target=this._textureTarget;

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(target,this._texture);
            // 3D 纹理不设置放大，缩小，重采样
            gl.texParameteri(target,gl.TEXTURE_MIN_FILTER,minificationFilter);
            gl.texParameteri(target,gl.TEXTURE_MAG_FILTER,magnificationFilter);
            gl.bindTexture(target,null);
            
            this._sampler=sampler;
        }
    },
    dimensions:{
        get:function(){
            return this._dimensions;
        }
    },
    width:{
        get:function(){
            return this._width;
        }
    },
    height:{
        get:function(){
            return this._height;
        }
    },
    depth:{
        get:function(){
            return this._depth;
        }
    },
    _target:{
        get:function(){
            return this._textureTarget;
        }
    }
});

Texture3D.prototype.isDestroyed=function(){
    return false;
}

Texture3D.prototype.destory=function(){
    this._context._gl.deleteTexture(this._texture);
    return Cesium.destroyObject(this);
};

export {Texture3D};