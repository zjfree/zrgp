// 2021-010-14 by zjfree
// 工具类
class ZTool{
	static strInfo = '';
    static strInfoTimer = null;
    static strInfoLastTime = 0;
    static fpsList = [];
    static strInfoEl = '#divInfo';
	static rand(min1, max, dec=0) {
		let val = min1 + Math.random() * (max - min1);
		return ZTool.round(val, dec);
	}
	static randColor(alpha, ext){
		ext = ext||'50%,50%';
		if (alpha)
		{
			return 'hsla(' + this.rand(0, 360) + ',' + ext + ',' + (this.rand(0, 100) / 100) + ')';
		}
		else
		{
			return 'hsl(' + this.rand(0, 360) + ',' + ext + ')';
		}
	}
	static showInfo(str, ms){
        ms = ms||0;
        if (ms > 0)
        {
            if (Date.now() - this.strInfoLastTime < ms)
            {
                return;
            }
        }
        else
        {
            this.strInfoLastTime = Date.now();
        }
		if (!this.strInfoTimer)
		{
			this.strInfoTimer = window.setInterval(function(){
				if (ZTool.strInfo == '') return;
				$(ZTool.strInfoEl).html(ZTool.strInfo);
				ZTool.strInfo = '';
			}, 100);
		}

		this.strInfo = str;
    }
    static fps()
	{
		let now = Date.now();
		this.fpsList.push(now);
		while (now - this.fpsList[0] > 1000)
		{
			this.fpsList.shift();
		}
		this.showInfo('FPS: ' + this.fpsList.length, 3000);
    }
    static formatDate(d){
        d = d || new Date();
    
        let f = (v) => ('0' + v).substr(-2);
        return d.getFullYear() + '-'
            + f(d.getMonth() + 1) + '-'
            + f(d.getDate()) + ' '
            + f(d.getHours()) + ':'
            + f(d.getMinutes()) + ':'
            + f(d.getSeconds());
    }

    static deg2rad(deg)
    {
        return deg * Math.PI / 180;
    }

	static arrayMax(list, key)
	{
		if (!list || list.length == 0)
		{
			return null;
		}

		let max = list[0][key];
		for (let i=1; i<list.length; i++)
		{
			max = Math.max(list[i][key], max);
		}

		return max;
	}
	
	static arrayMin(list, key)
	{
		if (!list || list.length == 0)
		{
			return null;
		}

		let min = list[0][key];
		for (let i=1; i<list.length; i++)
		{
			min = Math.min(list[i][key], min);
		}

		return min;
	}

	static limit(val, min, max, dec=-1)
	{
		val = Math.max(val, min);
		val = Math.min(val, max);

		if (dec >= 0)
		{
			val = ZTool.round(val);
		}

		return val;
	}

	static round(val, dec=0)
	{
		return Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
	}

	static inArray(search, array)
	{
		for(var i in array){
			if(array[i]==search){
				return true;
			}
		}
		return false;
	}

	static htmlDecode(str)
	{
		let temp = document.createElement("div");
		temp.innerHTML = str;
		
		return temp.innerText;
	}
}