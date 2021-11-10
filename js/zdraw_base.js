
// 向量计算
class ZVector{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize () {
        let inv = 1 / this.length();
        return new ZVector(this.x * inv, this.y * inv);
    }
    add (v) {
        return new ZVector(this.x + v.x, this.y + v.y);
    }
    multiply (f) {
        return new ZVector(this.x * f, this.y * f);
    }
    dot (v) {
        return this.x * v.x + this.y * v.y;
    }
    angle (v) {
        return Math.acos(this.dot(v) / (this.length() *v.length())) * 180 / Math.PI;
    }
}

// 点
class ZPoint{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return '' + this.x + ',' + this.y;
    }

    // 获取中心点
    pointCenter(p) {
        let p1 = {
            x: (this.x + p.x) / 2,
            y: (this.y + p.y) / 2,
        };

        return p1;
    }

    // 在指定角度移动距离
    goDeg(deg, len) {
        deg = ZTool.deg2rad(deg);
        let x = this.x + Math.cos(deg) * len;
        let y = this.y + Math.sin(deg) * len;

        return new ZPoint(x, y);
    }

    // 两点间距离
    getDist(p) {
        let c1 = this.x - p.x;
        let c2 = this.y - p.y;
        let len = Math.sqrt(c1 * c1 + c2 * c2);

        return len;
    }

    // 两点间角度
    getDeg(p) {
        let deg = Math.atan2(p.y - this.y, p.x - this.x) / (Math.PI / 180);

        return deg;
    }

    // 增加
    add(p) {
        this.x += p.x;
        this.y += p.y;

        return this;
    }

    // 增加
    addX(x) {
        this.x += x;
        return this;
    }

    // 增加
    addY(y) {
        this.y += y;
        return this;
    }

    // 获取椭圆点位置
    getEllipsePoint(a, b, deg, rotate = 0)
    {
        let rad = ZTool.deg2rad(deg);
        let x = this.x + a * Math.cos(rad);
        let y = this.y + b * Math.sin(rad);

        let p1 = {x:x, y:y};

        if (rotate != 0)
        {
            p1 = rotatePoint(p1, rotate);
        }

        return p1;
    }

    // 旋转指定点
    rotatePoint(p1, deg)
    {
        let rad = ZTool.deg2rad(deg);
        let x = (p1.x-this.x)*Math.cos(rad)-(p1.y-this.y)*Math.sin(rad)+this.x;
        let y = (p1.y-this.y)*Math.cos(rad)+(p1.x-this.x)*Math.sin(rad)+this.y;

        return {x:x, y:y};
    }

    static getCurveControlPoint(path) {

        let rt = 0.2;
        let i = 0, count = path.length - 2;
        let arr = [];
        for (; i < count; i++) {
            let a = path[i], b = path[i + 1], c = path[i + 2];
            let v1 = new ZVector(a.x - b.x, a.y - b.y);
            let v2 = new ZVector(c.x - b.x, c.y - b.y);
            let v1Len = v1.length(), v2Len = v2.length();
            let centerV = v1.normalize().add(v2.normalize()).normalize();

            let ncp1 = new ZVector(centerV.y, centerV.x * -1);
            let ncp2 = new ZVector(centerV.y * -1, centerV.x);
            if (ncp1.angle(v1) < 90) {
                let p1 = ncp1.multiply(v1Len * rt).add(b);
                let p2 = ncp2.multiply(v2Len * rt).add(b);
                arr.push(p1, p2)
            } else {
                let p1 = ncp1.multiply(v2Len * rt).add(b);
                let p2 = ncp2.multiply(v1Len * rt).add(b);

                arr.push(p2, p1)
            }
        }

        return arr;
    }
}
