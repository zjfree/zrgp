
// 绘图类
class ZDraw{
    width = 0;
    height = 0;
    size = 1;
    ctx = null;
    index = 0;
    isPlay = true;
    call_fn = null;
    ratio = 1;
    renderStartTime = Date.now();
    el = null;
    textObj = null;
    imgCache = {};
    constructor (el, fn) {
        this.el = el;
        this.call_fn = fn;
        this.ratio = window.devicePixelRatio;
        this.width = el.width() * this.ratio;
        this.height = el.height() * this.ratio;
        this.size = Math.min(this.width, this.height) / 100;
        el.prop('width', this.width);
        el.prop('height', this.height);
        this.ctx = el[0].getContext("2d");

        this.clear();
        let _this = this;
        window.requestAnimationFrame(function () {
            _this.render();
        });

        return this;
    }
    stop () {
        this.isPlay = false;
    }
    play () {
        this.isPlay = true;
    }
    render () {
        let _this = this;
        if (!this.isPlay || document.hidden) {
            window.requestAnimationFrame(function () {
                _this.render();
            });

            return;
        }

        this.index++;
        if (this.call_fn) {
            this.call_fn(this.index, Date.now() - this.renderStartTime);
        }

        window.requestAnimationFrame(function () {
            _this.render();
        });
    }
    clear (color=null) {
        this.ctx.shadowBlur = 0;
        let s = Math.max(this.width, this.height) * 2;
        if (color)
        {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(-s, -s, s * 2, s * 2);
        }
        else
        {
            this.ctx.clearRect(-s, -s, s * 2, s * 2);
        }
    }
    circle (p, r) {
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
        this.ctx.closePath();

        return this;
    }
    ellipse (p, r1, r2, deg=0) {
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.ellipse(p.x, p.y, r1, r2, deg, 0, 2 * Math.PI);
        this.ctx.closePath();

        return this;
    }
    pie (p, r, deg1, deg2) {
        this.ctx.shadowBlur = 0;
        deg1 = ZTool.deg2rad(deg1 % 360);
        deg2 = ZTool.deg2rad(deg2 % 360);
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.arc(p.x, p.y, r, deg1, deg2);
        
        return this;
    }
    arc (p, r, deg1, deg2) {
        this.ctx.shadowBlur = 0;
        deg1 = ZTool.deg2rad(deg1 % 360);
        deg2 = ZTool.deg2rad(deg2 % 360);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, r, deg1, deg2);
        
        return this;
    }
    line (p1, p2) {
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        
        return this;
    }
    lines (list) {
        if (!list || list.length < 2)
        {
            return this;
        }

        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(list[0].x, list[0].y);
        for (let i=1; i<list.length; i++)
        {
            this.ctx.lineTo(list[i].x, list[i].y);
        }

        return this;
    }
    curve (list) {
        if (!list || list.length < 2)
        {
            return;
        }

        this.ctx.shadowBlur = 0;
        let cps = ZPoint.getCurveControlPoint(list);
        let len = list.length;

        this.ctx.beginPath();
        this.ctx.moveTo(list[0].x, list[0].y);
        this.ctx.bezierCurveTo(list[0].x, list[0].y, cps[0].x, cps[0].y, list[1].x, list[1].y);

        let j = 1, count = len-2;
        for (; j < count; j++) {
            this.ctx.lineTo(list[j].x, list[j].y);
            this.ctx.bezierCurveTo(cps[j * 2 - 1].x, cps[j * 2 - 1].y, cps[j*2].x, cps[j*2].y, list[j + 1].x, list[j + 1].y);
        }

        let cpLen = cps.length;
        this.ctx.lineTo(list[len - 2].x, list[len - 2].y);
        this.ctx.bezierCurveTo(cps[cpLen - 1].x, cps[cpLen - 1].y, list[len - 1].x, list[len - 1].y, list[len - 1].x, list[len - 1].y);

        return this;
    }
    lineCurve (list) {
        if (!list || list.length < 5)
        {
            return;
        }

        this.ctx.shadowBlur = 0;
        let pBegin = list[0];
        let pEnd = list[list.length-1];

        list = list.slice(1, -1);

        let cps = ZPoint.getCurveControlPoint(list);

        let len = list.length;

        this.ctx.beginPath();
        this.ctx.moveTo(pBegin.x, pBegin.y);
        this.ctx.lineTo(list[0].x, list[0].y);
        this.ctx.bezierCurveTo(list[0].x, list[0].y, cps[0].x, cps[0].y, list[1].x, list[1].y);

        let j = 1, count = len-2;
        for (; j < count; j++) {
            this.ctx.lineTo(list[j].x, list[j].y);
            this.ctx.bezierCurveTo(cps[j * 2 - 1].x, cps[j * 2 - 1].y, cps[j*2].x, cps[j*2].y, list[j + 1].x, list[j + 1].y);
        }

        let cpLen = cps.length;
        this.ctx.lineTo(list[len - 2].x, list[len - 2].y);
        this.ctx.bezierCurveTo(cps[cpLen - 1].x, cps[cpLen - 1].y, list[len - 1].x, list[len - 1].y, list[len - 1].x, list[len - 1].y);
        this.ctx.lineTo(pEnd.x, pEnd.y);
        this.ctx.closePath();

        return this;
    }
    area (list) {
        if (!list || list.length < 3)
        {
            return;
        }

        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(list[0].x, list[0].y);
        for (let i=1; i<list.length; i++)
        {
            this.ctx.lineTo(list[i].x, list[i].y);
        }
        this.ctx.closePath();

        return this;
    }

    text (p, str, align='left', font='14px Arial', maxWidth=null)
    {
        let fontSize = parseInt(font);
        if (fontSize != font)
        {
            fontSize = parseInt(font.replace(/[^0-9]/ig,""));
        }
        else
        {
            font = fontSize + 'px Arial';
        }

        let xAlign = 'left';
        let yAlign = 'alphabetic';
        let alignList = align.split(/,/ig);
        if (alignList.length == 2)
        {
            xAlign = alignList[0];
            yAlign = alignList[1] || 'alphabetic';
        }
        else if (align == 'center')
        {
            xAlign = 'center';
            yAlign = 'center';
        }
        else
        {
            xAlign = align;
        }
        if (yAlign == 'center')
        {
            yAlign = 'middle';
        }
        if (yAlign == 'default' || yAlign == 'base')
        {
            yAlign = 'alphabetic';
        }

        this.ctx.font = font;
        this.ctx.textAlign = xAlign;
        this.ctx.textBaseline = yAlign;

        this.textObj = {
            p:p,
            text:str,
            font:font,
            fontSize:fontSize,
            xAlign:xAlign,
            yAlign:yAlign,
            maxWidth:maxWidth,
        };

        return this;
    }

    measureText ()
    {
        if (this.textObj == null)
        {
            return null;
        }

        return this.ctx.measureText(this.textObj.text).width;
    }
    
    fillText (fillStyle='#000') 
    {
        if (this.textObj == null)
        {
            return null;
        }

        if (this.textObj.fontSize<=0) return;

        this.ctx.fillStyle = fillStyle;
        if (this.textObj.maxWidth === null)
        {
            this.ctx.fillText(this.textObj.text, this.textObj.p.x, this.textObj.p.y);
        }
        else
        {
            this.ctx.fillText(this.textObj.text, this.textObj.p.x, this.textObj.p.y, this.textObj.maxWidth);
        }

        return this;
    }
    
    strokeText (lineStyle='#000', lineWidth=1)
    {
        if (this.textObj == null)
        {
            return null;
        }

        if (lineWidth<=0) return;
        if (this.textObj.fontSize<=0) return;

        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = lineStyle;

        if (this.textObj.maxWidth === null)
        {
            this.ctx.strokeText(this.textObj.text, this.textObj.p.x, this.textObj.p.y);
        }
        else
        {
            this.ctx.strokeText(this.textObj.text, this.textObj.p.x, this.textObj.p.y, this.textObj.maxWidth);
        }

        return this;
    }

    randPoint (){
        let p = new ZPoint(ZTool.rand(0, this.width), ZTool.rand(0, this.height));
        return p;
    }
    getPoint (x, y){
        let p = new ZPoint(x * this.ratio, y * this.ratio);
        
        return p;
    }
    mouseDown (fn){
        let _this = this;
        this.el.mousedown(function(e) {
            let p = _this.getPoint(e.offsetX, e.offsetY);
            fn(p, e);
        });
    }
    mouseUp (fn){
        let _this = this;
        this.el.mouseup(function(e) {
            let p = _this.getPoint(e.offsetX, e.offsetY);
            fn(p, e);
        });
    }
    mouseDownMove (fn){
        let _this = this;
        this.el.mousemove(function(e) {
            if (e.buttons != 1 && e.buttons != 2) return;
            e.preventDefault();
            let p = _this.getPoint(e.offsetX, e.offsetY);
            fn(p, e);
        });
        this.el.bind('touchmove', function(e) {
            e.preventDefault();
            let p = _this.getPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
            fn(p, e);
        });
    }

    fill (fillStyle='#000', path=null){
        this.ctx.fillStyle = fillStyle;
        path ? this.ctx.fill(path) : this.ctx.fill();
        
        return this;
    }

    stroke (lineStyle='#000', lineWidth=1, path=null){
        if (lineWidth<=0) return;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = lineStyle;
        path ? this.ctx.stroke(path) : this.ctx.stroke();

        return this;
    }

    shadow (color='#000', blur=10, offsetX=0, offsetY=0)
    {
        this.ctx.shadowBlur = blur;
        this.ctx.shadowOffsetX = offsetX;
        this.ctx.shadowOffsetY = offsetY;
        this.ctx.shadowColor = color;

        return this;
    }

    rect (p, w, h, r=0){
        this.ctx.shadowBlur = 0;

        if (r==0)
        {
            this.ctx.beginPath();
            this.ctx.rect(p.x, p.y, w, h);
            return this;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);

        this.ctx.beginPath();

        //从右下角顺时针绘制，弧度从0到1/2PI  
        this.ctx.arc(w - r, h - r, r, 0, Math.PI / 2);

        //矩形下边线  
        this.ctx.lineTo(r, h);

        //左下角圆弧，弧度从1/2PI到PI  
        this.ctx.arc(r, h - r, r, Math.PI / 2, Math.PI);

        //矩形左边线  
        this.ctx.lineTo(0, r);

        //左上角圆弧，弧度从PI到3/2PI  
        this.ctx.arc(r, r, r, Math.PI, Math.PI * 3 / 2);

        //上边线  
        this.ctx.lineTo(w - r, 0);

        //右上角圆弧  
        this.ctx.arc(w - r, r, r, Math.PI * 3 / 2, Math.PI * 2);

        //右边线  
        this.ctx.lineTo(w, h - r);

        this.ctx.closePath();
        this.ctx.restore();

        return this;
    }

    tooltip (p, w, h, r=0, tip='bottom', tipSize=5, xOffset=0){
        this.ctx.shadowBlur = 0;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);

        this.ctx.beginPath();

        //从右下角顺时针绘制，弧度从0到1/2PI  
        this.ctx.arc(w - r, h - r, r, 0, Math.PI / 2);

        //矩形下边线  
        if (tip=='bottom')
        {
            this.ctx.lineTo(w/2+xOffset+tipSize, h);
            this.ctx.lineTo(w/2+xOffset, h+5);
            this.ctx.lineTo(w/2+xOffset-tipSize, h);
        }
        this.ctx.lineTo(r, h);

        //左下角圆弧，弧度从1/2PI到PI  
        this.ctx.arc(r, h - r, r, Math.PI / 2, Math.PI);

        //矩形左边线  
        if (tip=='left')
        {
            this.ctx.lineTo(0+xOffset, h/2+tipSize);
            this.ctx.lineTo(0+xOffset-tipSize, h/2);
            this.ctx.lineTo(0+xOffset, h/2-tipSize);
        }
        this.ctx.lineTo(0, r);

        //左上角圆弧，弧度从PI到3/2PI  
        this.ctx.arc(r, r, r, Math.PI, Math.PI * 3 / 2);

        //上边线  
        if (tip=='top')
        {
            this.ctx.lineTo(w/2+xOffset-tipSize, 0);
            this.ctx.lineTo(w/2+xOffset, -tipSize);
            this.ctx.lineTo(w/2+xOffset+tipSize, 0);
        }
        this.ctx.lineTo(w - r, 0);

        //右上角圆弧  
        this.ctx.arc(w - r, r, r, Math.PI * 3 / 2, Math.PI * 2);

        //右边线  
        if (tip=='right')
        {
            this.ctx.lineTo(w+xOffset, h/2-tipSize);
            this.ctx.lineTo(w+xOffset+tipSize, h/2);
            this.ctx.lineTo(w+xOffset, h/2+tipSize);
        }
        this.ctx.lineTo(w, h - r);

        this.ctx.closePath();
        this.ctx.restore();

        return this;
    }

    regular (p, r, count, deg=0)
    {
        if (count < 3) return;
        deg -= 90;
        this.ctx.shadowBlur = 0;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);

        let center = new ZPoint(0, 0);
        let degStep = 360 / count;
        
        this.ctx.beginPath();
        for (let i=0; i<count; i++)
        {
            let p1 = center.goDeg(deg, r);
            if (i==0)
            {
                this.ctx.moveTo(p1.x, p1.y);
            }
            else
            {
                this.ctx.lineTo(p1.x, p1.y);
            }

            deg += degStep;
        }
        
        this.ctx.closePath();

        this.ctx.restore();

        return this;
    }
    
    star (p, count, r1, r2=null, deg=0)
    {
        if (count < 3) return;

        deg -= 90;
        this.ctx.shadowBlur = 0;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);

        let center = new ZPoint(0, 0);
        let degStep = 360 / count / 2;
        if (r2 === null)
        {
            r2 = Math.cos(ZTool.deg2rad(degStep))*r1 / 2;
        }
        
        this.ctx.beginPath();
        for (let i=0; i<count*2; i++)
        {
            let p1 = center.goDeg(deg, i%2==0?r1:r2);
            if (i==0)
            {
                this.ctx.moveTo(p1.x, p1.y);
            }
            else
            {
                this.ctx.lineTo(p1.x, p1.y);
            }

            deg += degStep;
        }
        
        this.ctx.closePath();

        this.ctx.restore();

        return this;
    }
    
	getRadialColor (color, center=null, r=null)
	{
        if (color instanceof CanvasGradient)
        {
            return color;
        }

        if (color == '' || color == null)
        {
            return color;
        }

        let arr = [];
        if (typeof(color)=='string')
        {
            arr = color.split(/\|/ig);
        }
        else
        {
            arr = color;
        }

        if (arr.length == 1)
        {
            return arr[0];
        }

        center = center || new ZPoint(this.width/2, this.height/2);
        r = r || Math.min(this.width/2, this.height/2);

		let grd = this.ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, r);
		for (let k in arr)
		{
			grd.addColorStop(k/(arr.length - 1), arr[k]);
		}

		return grd;
	}
	
	getLineColor (color, center = null, len = null)
	{
        let deg = 0;
        if (color instanceof CanvasGradient)
        {
            return color;
        }

        if (color == '' || color == null)
        {
            return color;
        }

        let arr = [];
        if (typeof(color)=='string')
        {
            arr = color.split(/\|/ig);
        }
        else
        {
            arr = color;
        }

        if (arr.length == 1)
        {
            return arr[0];
        }

        let last = arr[arr.length-1];
        if (last == parseFloat(last))
        {
            deg = parseFloat(last);
            arr.pop();
        }

		center = center || new ZPoint(this.width/2, this.height/2);
        if (len === null)
        {
            len = Math.min(this.width/2, this.height/2);
            if (deg == 0 || deg == 180 || deg == -180)
            {
                len = this.width/2;
            }
            else if (deg == 90 || deg == 270 || deg == -90)
            {
                len = this.height/2;
            }
        }
		let p1 = center.goDeg(deg+180, len);
		let p2 = center.goDeg(deg, len);

		let grd = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
		for (let k in arr)
		{
			grd.addColorStop(k/(arr.length - 1), arr[k]);
		}

		return grd;
	}

    saveCache(key)
    {
        let img = new Image();
    　　img.src = this.el[0].toDataURL();
        this.imgCache[key] = img;
    }

    loadCache(key, x=0, y=0)
    {
        if (!this.imgCache[key])
        {
            return;
        }

        this.clear();
        this.ctx.drawImage(this.imgCache[key], x, y);
    }
};