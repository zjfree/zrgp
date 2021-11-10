// 2021-10-15 by zjfree
// 图表工具
class ZChart {
	static TweenSleep = 1000;

    static init()
    {
		let tweenAnimate = function(t){
			requestAnimationFrame(tweenAnimate);
			if (window.TWEEN && !document.hidden)
			{
				TWEEN.update();
			}
		};
        requestAnimationFrame(tweenAnimate);

		$('.zchart').each(function(){
			let str = $(this).html().trim();
			if (str == '') return;
			let option = null;
			try {
				option = JSON.parse(str);
			} catch (err) {
				console.error('JSON解析失败：' + err + "\r\n" + str);
				
				let draw = new ZDraw($(this));
				draw.text({x:10, y:25}, 'ERROR:JSON解析失败').fillText('#f00');
				return;
			}
				
			switch (option.type)
			{
				case 'pie':
					ZChart.drawPie(option, this);
					break;
				case 'ring':
					ZChart.drawRing(option, this);
					break;
				case 'line':
					ZChart.drawLine(option, this);
					break;
				case 'bar':
					ZChart.drawBar(option, this);
					break;
				case 'hbar':
					ZChart.drawHbar(option, this);
					break;
				case 'tag_val':
					ZChart.drawTagVal(option, this);
					break;
				case 'tag':
					ZChart.drawTag(option, this);
					break;
				case 'gauge':
					ZChart.drawGauge(option, this);
					break;
				case 'num':
					ZChart.drawNum(option, this);
					break;
				case 'progress':
					ZChart.drawProgress(option, this);
					break;
				case 'level':
					ZChart.drawLevel(option, this);
					break;
				case 'monitor':
					ZChart.drawMonitor(option, this);
					break;
				case 'radar':
					ZChart.drawRadar(option, this);
					break;
				case 'time':
					ZChart.drawTime(option, this);
					break;
				case 'grid':
					ZChart.drawGrid(option, this);
					break;
				case 'image':
					ZChart.drawImage(option, this);
					break;
				case 'map':
					ZChart.drawMap(option, this);
					break;
				case 'map_tile':
					ZChart.drawMapTile(option, this);
					break;
			}
		});
    }

	static getColorHsl(color, add = 0)
	{
		if (!window.net || !window.net.brehaut || !window.net.brehaut.Color)
		{
			return color;
		}

		let cc = net.brehaut.Color(color);
		let h = cc.getHue();
		let s = cc.getSaturation();
		let l = cc.getLightness();

		l += add / 100;
		l = ZTool.limit(l, 0, 100);
		
		return 'hsl(' + h + ',' + (s*100) + '%,' + (l*100) + '%)';
	}

	static getColorLight(color)
	{
		if (!window.net || !window.net.brehaut || !window.net.brehaut.Color)
		{
			return 0;
		}

		let cc = net.brehaut.Color(color);
		return cc.getLuminance();
	}
	
	static tweenVal(option, _el, fn)
	{
		let draw = new ZDraw($(_el));
		if (!window.TWEEN)
		{
			console.error('not find TWEEN, URL:https://lib.baomitu.com/tween.js/2/Tween.min.js');
			fn(draw, option);
			return draw;
		}
		
		let tween = new TWEEN.Tween(option);
        tween.onUpdate(function () {
            fn(draw, option);
        });

		$(_el).bind('setVal', function(ev, val, color=null){
			if (color)
			{
				option.color = color;
			}
			option.target_val = val;
			tween.to({val:val}, ZChart.TweenSleep);
			tween.stop();
			tween.start();
		});

		option.target_val = option.val;
		option.val = 0;

		tween.to({val:option.target_val}, ZChart.TweenSleep);
		tween.start();

		return draw;
	}

	static defColor(index)
	{
		index = Math.round(index);
		index = Math.max(0, index);
		let colorList = [
			'#1F00C4',
			'#F56100',
			'#A7DD00',
			'#8100C4',
			'#F59200',
			'#02C400',
			'#D0007B',
			'#F5C300',
			'#0097C4',
			'#F40001',
			'#F5F400',
			'#0053C4',
		];

		return colorList[index % colorList.length];
	}

	static drawPie(option, _el)
	{
		let draw = new ZDraw($(_el));
		let center = new ZPoint(draw.width/2, draw.height/2);
		let radius = Math.min(draw.width - 10, draw.height - 10) / 2 * 0.9;
		
		if (option.val || option.val === 0)
		{
			draw.circle(center, radius).fill(option.back_color || 'rgba(0,0,0,0.3)');

			let color = draw.getRadialColor(option.color, center, radius);
			draw.pie(center, radius, -90, option.val - 90).fill(color);
		}
		else if (option.list)
		{
			let sum = 0;
			for (let k in option.list)
			{
				sum += option.list[k].val;
			}

			let deg = 0;
			for (let k in option.list)
			{
				let r = option.list[k];
				if (r.val <= 0)
				{
					continue;
				}

				let color = draw.getRadialColor(r.color || ZChart.defColor(k), center, radius);
				let deg1 = deg + (r.val / sum * 360);
				draw.pie(center, radius, deg-90, deg1-90).fill(color);
				deg = deg1;
			}

			// 绘制文字
			if (!option.font_color)
			{
				return;
			}

			let font = option.font || '14px Arial';
			deg = 0;
			for (let k in option.list)
			{
				let r = option.list[k];
				if (r.val <= 0)
				{
					continue;
				}

				let deg1 = deg + (r.val / sum * 360);
				let degCenter = (deg + deg1) / 2;
				let p = center.goDeg(degCenter-90, radius*0.7);

				draw.text({x:p.x, y:p.y+5}, r.val, 'center', font).fillText(option.font_color);

				deg = deg1;
			}
		}
	}
	
	static drawRing(option, _el)
	{
		ZChart.tweenVal(option, _el, ZChart.drawRingDo);
	}

	static drawRingDo(draw, option)
	{
		draw.clear();
		let center = new ZPoint(draw.width/2, draw.height/2);
		let radius = Math.min(draw.width - 10, draw.height - 10) / 2 * 0.9;

		let w = radius * 0.2;
		if (option.size)
		{
			if (option.size > w)
			{
				radius -= (option.size - w) / 2;
			}
			
			w = option.size;
		}

		let deg = option.val / (option.max || 100) * 360;
		let color = draw.getLineColor(option.color || 'blue');		
		if (option.led)
		{
			if (option.led === true)
			{
				option.led = 36;
			}

			let step = 360 / option.led;
			let step_width = step - Math.max(1, Math.min(3, step*0.2));

			for (let d=0; d<360; d += step)
			{
				if (d < deg)
				{
					draw.arc(center, radius, d-90, d+step_width-90).stroke(color, w);
				}
				else
				{
					draw.arc(center, radius, d-90, d+step_width-90).stroke(option.back_color || 'gray', w);
				}
			}
		}
		else
		{
			draw.arc(center, radius, -90, deg-90).stroke(color, w);
			draw.arc(center, radius, deg-90, -90).stroke(option.back_color || 'gray', w);
		}

		// 绘制文字
		if (option.font || option.font_color || option.unit)
		{
			let font = option.font;
			if (!font)
			{
				let defaultFontSize = Math.round(radius / 2.5 * draw.ratio);
				font = "bold " + defaultFontSize + "px Arial";
			}
	
			let strVal = '' + ZTool.round(option.val, option.dec||0) + (option.unit||'');
			draw.text(center, strVal, 'center', font).fillText(option.font_color || '#000');
		}
	}

	static drawLine(option, _el)
	{
		if (!option.list || option.list.length == 0)
		{
			return;
		}

		let draw = new ZDraw($(_el));
		let max = option.max || Math.max(...option.list);
		let min = option.min || 0;

		option.color = draw.getLineColor(option.color || 'blue');
		option.size = option.size ?? 3;

		let padding = 10;
		let xStep = Math.round((draw.width - 2*padding) / (option.list.length-1));
		let list = [];
		for (let i=0; i<option.list.length; i++)
		{
			let val = option.list[i];
			val = Math.max(val, min);
			val = Math.min(val, max);
			let p1 = new ZPoint(padding + i*xStep, draw.height - padding - (val-min) / (max-min) * (draw.height - 2 * padding));
			list.push(p1);
		}

		if (option.fill_color)
		{
			option.fill_color = draw.getLineColor(option.fill_color);
			let list1 = list.slice();
			list1.unshift(new ZPoint(padding, draw.height-padding));
			list1.push(new ZPoint(padding + (option.list.length-1)*xStep, draw.height-padding));

			if (option.curve)
			{
				draw.lineCurve(list1).fill(option.fill_color);
			}
			else
			{
				draw.area(list1).fill(option.fill_color);
			}
		}

		if (option.size > 0)
		{
			if (option.curve)
			{
				draw.curve(list).stroke(option.color, option.size);
			}
			else
			{
				draw.lines(list).stroke(option.color, option.size);
			}
		}

		if (option.border_size)
		{
			draw.line({x:padding, y:0}, {x:padding, y:draw.height}).stroke(option.border_color||'gray', option.border_size);
			let y = draw.height - padding;
			draw.line({x:0, y:y}, {x:draw.width, y:y}).stroke(option.border_color||'gray', option.border_size);
		}

		if (option.point_size)
		{
			for (let k in list)
			{
				draw.circle(list[k], option.point_size).fill(option.point_color||'green');
			}
		}
	}
	
	static drawBar(option, _el)
	{
		if (!option.list || option.list.length == 0)
		{
			return;
		}

		let draw = new ZDraw($(_el));
		
		option.show ??= 'rect';

		let max = option.max || ZTool.arrayMax(option.list, 'val');
		let color = draw.getLineColor(option.color || '#00f|#aaf|90');
		let padding = 5;
		let xStep = Math.round((draw.width - 2*padding) / option.list.length);
		let barSize = option.size || Math.min(xStep-padding, 30);
		xStep = (draw.width - 2*padding - barSize * option.list.length);
		xStep = xStep / (option.list.length+1) + barSize/2;
		let yLine = draw.height - 30/draw.ratio;

		draw.line({x:padding, y:0}, {x:padding, y:draw.height}).stroke(option.border_color||'gray', option.border_size);
		let y = yLine;
		draw.line({x:0, y:y}, {x:draw.width, y:y}).stroke(option.border_color||'gray', option.border_size||1);
		
		for (let i=0; i<option.list.length; i++)
		{
			let r = option.list[i];
			
			let h = r.val / max * (yLine - padding - 20/draw.ratio);
			let centerX = 2*padding + xStep*(i+1) + (barSize/2)*i;

			let barColor = r.color || color;
			if (option.show != 'rect' && typeof(barColor) != 'string')
			{
				option.show = 'rect';
			}

			let p = new ZPoint(centerX - barSize / 2, yLine - h);
			let p1 = null;
			switch (option.show)
			{
				case 'rect':
					draw.rect(p, barSize, h).fill(barColor);
					break;
				case '3d_rect':
					let deg1 = 20;
					let l1 = barSize / 2 / Math.cos(deg1/180*Math.PI);

					let rectPath1 = new Path2D();
					rectPath1.moveTo(p.x, p.y);
					p1 = p.goDeg(deg1, l1);
					rectPath1.lineTo(p1.x, p1.y);
					p1.addY(h);
					rectPath1.lineTo(p1.x, p1.y);
					p1 = p1.goDeg(180+deg1, l1);
					rectPath1.lineTo(p1.x, p1.y);
					rectPath1.closePath();
					draw.fill(barColor, rectPath1);
					
					let rectPath2 = new Path2D();
					p1 = p.goDeg(0, barSize);
					rectPath2.moveTo(p1.x, p1.y);
					p1 = p1.goDeg(180-deg1, l1);
					rectPath2.lineTo(p1.x, p1.y);
					p1.addY(h);
					rectPath2.lineTo(p1.x, p1.y);
					p1 = p1.goDeg(-deg1, l1);
					rectPath2.lineTo(p1.x, p1.y);
					rectPath2.closePath();
					draw.fill(ZChart.getColorHsl(barColor, -10), rectPath2);
					
					let rectPath3 = new Path2D();
					rectPath3.moveTo(p.x, p.y);
					p1 = p.goDeg(deg1, l1);
					rectPath3.lineTo(p1.x, p1.y);
					p1 = p1.goDeg(-deg1, l1);
					rectPath3.lineTo(p1.x, p1.y);
					p1 = p1.goDeg(deg1+180, l1);
					rectPath3.lineTo(p1.x, p1.y);
					rectPath3.closePath();
					draw.fill(ZChart.getColorHsl(barColor, -15), rectPath3);
					
					break;
				case '3d_circle':
					let pcenter = p.goDeg(0, barSize/2);
					let color2 = ZChart.getColorHsl(barColor, -15);
					let color3 = draw.getLineColor(barColor + '|' + color2, pcenter, barSize/2);

					draw.rect(p, barSize, h).fill(color3);
					draw.ellipse(pcenter, barSize/2, barSize*0.15).fill(color2);
					pcenter.addY(h);
					draw.ellipse(pcenter, barSize/2, barSize*0.15).fill(color3);
					break;
			}
		}

		// 写字
		let font = option.font || '14px Arial';
		let fontColor = option.font_color || '#333';
		
		for (let i=0; i<option.list.length; i++)
		{
			let r = option.list[i];
			let h = r.val / max * (yLine - padding - 20/draw.ratio);
			let centerX = 2*padding + xStep*(i+1) + (barSize/2)*i;
			let centerY = yLine - h;

			if (option.show != 'rect')
			{
				centerY -= barSize*0.08;
			}

			draw.text({x:centerX, y:centerY-padding}, r.val, 'center,', font).fillText(fontColor);

			centerY = draw.height - padding;
			draw.text({x:centerX, y:centerY}, r.name, 'center,', font).fillText(fontColor);
		}

	}
	
	static drawHbar(option, _el)
	{
		if (!option.list || option.list.length == 0)
		{
			return;
		}

		option.padding = option.padding || 5;
		option.line_height = option.line_height || 30;

		let speed = option.speed || 3;
		let sleep = option.sleep || 100;
		let sleepStart = 0;
		let start = 0;
		let h = option.padding*2 + option.line_height*option.list.length;
		let bo = true;
		let draw = new ZDraw($(_el), function(index){
			if (h < draw.height) return;
			if (index - sleepStart < sleep) return;
			if (index % speed != 0) return;
			if (bo)
			{
				start--;
				if (draw.height - start > h)
				{
					sleepStart = index;
					bo = false;
				}
			}
			else
			{
				start++;
				if (start > 0)
				{
					sleepStart = index;
					bo = true;
				}
			}

			draw.clear();
			ZChart.drawHbarDo(draw, option, start);
		});
		ZChart.drawHbarDo(draw, option, start);
	}

	static drawHbarDo(draw, option, start)
	{
		let max = option.max || ZTool.arrayMax(option.list, 'val');
		let color = draw.getLineColor(option.color || '#99f|#00f');
		let padding = option.padding;
		let lineHeight = option.line_height;
		let left = option.left || 50;
		let right = option.right || 0;
		
		for (let i=0; i<option.list.length; i++)
		{
			let r = option.list[i];
			let y = start + padding + i*lineHeight;
			let w = draw.width - padding * 2 - left - right;

			if (y+lineHeight+padding < 0)
			{
				continue;
			}
			if (y > draw.height)
			{
				break;
			}

			if (option.back_color !== false && option.back_color !== null)
			{
				draw.rect({x:left + padding, y:y}, w, lineHeight - padding).fill(option.back_color || 'rgba(100,100,100,0.2)');
			}

			w = Math.max(r.val / max * w, 1);
			draw.rect({x:left + padding, y:y}, w, lineHeight - padding).fill(r.color || color);

			// 绘制名称
			let font = option.font || "14px Arial";
			let fontColor = option.font_color || '#333';
			let fontY = start + padding/2 + (i+0.5)*lineHeight;
			
			draw.text({x:left, y:fontY}, r.name, 'right,middle', font).fillText(fontColor);
			
			if (option.right <= 0)
			{
				return;
			}

			draw.text({x:left + w + 2*padding, y:fontY}, r.val, 'left,middle', font).fillText(fontColor);
		}
	}

	static drawTagVal(option, _el)
	{
		let draw = new ZDraw($(_el));

		let padding = option.padding || 5;
		let size = option.size || 25;
		let colorH = option.color_h || 250;
		let min = option.min || 0;
		let max = option.max || Math.max(...option.list);
		
		let font = option.font || "14px Arial";

		let x = padding;
		let y = padding;
		for (let i=0; i<option.list.length; i++)
		{
			let val = option.list[i];
			let l = Math.round(30 + (val - min) / (max - min) * 70);
			let color = 'hsl(' + colorH + ',100%,' + l + '%)';
			if (val < min)
			{
				color = '#f00';
			}
			
			draw.rect({x:x, y:y}, size, size, option.r||0).fill(color);
			draw.stroke(option.border_color||'gray', option.border||1);

			if (val >= min)
			{
				let light = ZChart.getColorLight(color);
				let fontColor = light < 0.5 ? '#fff' : '#000';
				draw.text({x:x+0.5*size, y:y+0.5*size}, val, 'center').fillText(fontColor);
			}

			x += size + padding;
			if (x + size + padding > draw.width)
			{
				x = padding;
				y += size + padding;
			}
		}
	}
	
	static drawTag(option, _el)
	{
		let padding = option.padding || 5;
		let size = option.size || 25;
		let font = option.font || "14px Arial";
		
		let blinkList = [];
		let draw = new ZDraw($(_el), function(index){
			if (index % 10 != 0) return;
			let i = index / 10 % 5;
			let pp = padding / 2;
			
			if (i==1)
			{
				for (let k in blinkList)
				{
					let r = blinkList[k];
					draw.ctx.clearRect(r.p.x-pp, r.p.y-pp, r.w + pp*2, r.size + pp*2);
					draw.ctx.globalAlpha=0.3;
					draw.rect(r.p, r.w, r.size, r.r).fill(r.color);
					draw.stroke(r.border_color, r.border);
					draw.text(r.fp, r.name, 'center', r.font).fillText(r.fontColor);
					draw.ctx.globalAlpha=1;
				}
			}
			else if (i==2)
			{
				for (let k in blinkList)
				{
					let r = blinkList[k];
					draw.rect(r.p, r.w, r.size, r.r).fill(r.color);
					draw.stroke(r.border_color, r.border);
					draw.text(r.fp, r.name, 'center', r.font).fillText(r.fontColor);
				}
			}
		});

        draw.ctx.font = font;

		let x = padding;
		let y = padding;
		for (let i=0; i<option.list.length; i++)
		{
			let r = option.list[i];
			let w = draw.ctx.measureText(r.name).width + 2 * padding;
			let color = draw.getLineColor(r.color||'#000', new ZPoint(x+w/2, y+size/2), w/2);
			let light = ZChart.getColorLight(color);
			let fontColor = light < 0.5 ? '#fff' : '#000';

			let item = {
				p:{x:x, y:y},
				w:w,
				size:size,
				r:option.r||0,
				color:color,
				border_color:option.border_color||'gray',
				border:option.border||1,
				fp:{x:x+0.5*w, y:y+0.5*size},
				name:r.name,
				fontColor:fontColor,
				font:font,
			};

			draw.rect(item.p, w, size, item.r).fill(color);
			draw.stroke(item.border_color, item.border);
			draw.text(item.fp, r.name, 'center', font).fillText(fontColor);

			if (r.blink)
			{
				blinkList.push(item);
			}
			
			x += w + padding;
			if (x + w + padding > draw.width)
			{
				x = padding;
				y += size + padding;
			}
		}
	}

	static drawGauge(option, _el)
	{
		ZChart.tweenVal(option, _el, ZChart.drawGaugeDo);
	}

	static drawGaugeDo(draw, option)
	{
		draw.clear();
		let center = new ZPoint(draw.width/2, draw.height*0.65);
		let radius = Math.min(draw.width/2, draw.height/2) * 1.1;

		option.size = option.size || (radius * 0.1);
		option.color = draw.getLineColor(option.color || '#f00');
		option._pointer = option.pointer || option.color;
		option.pointer_len = option.pointer_len || 0.9;
		option.back_color = option.back_color || '#eee';
		option.min = option.min || 0;
		option.max = option.max || 100;

		let getDeg = function(val){
			let deg = (val - option.min) / (option.max - option.min);
			deg = degBegin + deg * (degEnd - degBegin);
			deg = Math.max(deg, degBegin);
			deg = Math.min(deg, degEnd);

			return deg;
		};

		let degBegin = -200, degEnd = 20;
		let deg = getDeg(option.val);

		// 画圆弧
		if (option.led)
		{
			if (option.led === true)
			{
				option.led = 40;
			}

			let ledStep = (degEnd - degBegin) / option.led;
			let d = degBegin - ledStep * 0.3;
			for (let i=0; i<=option.led; i++)
			{
				if (d < deg)
				{
					draw.arc(center, radius, d, d+ledStep*0.8).stroke(option.color, option.size);
				}
				else
				{
					draw.arc(center, radius, d, d+ledStep*0.8).stroke(option.back_color, option.size);
				}

				d += ledStep;
			}
		}
		else if (option.range_list)
		{
			for (let k in option.range_list)
			{
				let r = option.range_list[k];
				let color = draw.getLineColor(r.color);
				draw.arc(center, radius, getDeg(r.min), getDeg(r.max)).stroke(color, option.size);
			}
		}
		else
		{
			draw.arc(center, radius, degBegin, degEnd).stroke(option.back_color, option.size);
			draw.arc(center, radius, degBegin, deg).stroke(option.color, option.size);
		}


		// 画刻度
		if (option.split_count)
		{
			option.split_color = option.split_color || '#000';
			let splitCount = option.split_count;
			let degStep = (degEnd - degBegin) / splitCount;
			let d = degBegin;
			for (let i=0; i<=splitCount; i++)
			{
				if (i%5 == 0)
				{
					draw.arc(center, radius*0.9, d-0.5, d+0.5).stroke(option.split_color, radius*0.07);
					let splitVal = Math.round(option.min + (d - degBegin) / (degEnd - degBegin) * (option.max - option.min));
					draw.fillText(center.goDeg(d, radius*0.75).goDeg(90, 14/2/draw.ratio), splitVal, option.split_color, 'center');
				}
				else
				{
					draw.arc(center, radius*0.92, d-0.3, d+0.3).stroke(option.split_color, radius*0.03);
				}
				d += degStep;
			}
		}

		// 画值
		let fontSize = Math.round(radius * 0.35);
		let fontColor = option.font_color || option.color;
		let strVal = ZTool.round(option.val, option.dec||0) + (option.unit||'');
		draw.text(center.goDeg(90, radius*0.35), strVal, 'center', 'bold ' + fontSize + 'px Arial').fillText(fontColor);
		if (option.name)
		{
			fontSize = Math.round(radius * 0.2);
			draw.text(center.goDeg(-90, radius*0.4), option.name, 'center', fontSize + 'px Arial').fillText(fontColor);
		}

		// 画指针
		draw.ctx.globalAlpha = 0.8;
		let pList = [];
		switch (option.pointer_type || 1)
		{
			case 1:
				pList.push(center.goDeg(deg-90, radius * 0.05));
				pList.push(center.goDeg(deg+90, radius * 0.05));
				pList.push(center.goDeg(deg, radius * option.pointer_len));
				draw.area(pList).stroke('#fff', 2).fill(option._pointer);
				draw.line(center.goDeg(deg-180, radius * 0.15), center).stroke(option._pointer, radius * 0.05);
				break;
			case 2:
				draw.line(center.goDeg(deg-180, radius * 0.15), center.goDeg(deg, radius * (option.pointer_len-0.1))).stroke(option._pointer, radius * 0.03);
				break;
			case 3:
				pList.push(center.goDeg(deg-180, radius * 0.15));
				pList.push(center.goDeg(deg-90, radius * 0.05));
				pList.push(center.goDeg(deg, radius * option.pointer_len));
				pList.push(center.goDeg(deg+90, radius * 0.05));
				draw.area(pList).stroke('#fff', 2).fill(option._pointer);
				break;
		}

		draw.circle(center, radius * 0.08).fill(option._pointer);
		draw.circle(center, radius * 0.03).fill('#fff');
		draw.ctx.globalAlpha = 1;
	}
	
	static drawNum(option, _el)
	{
		ZChart.tweenVal(option, _el, ZChart.drawNumDo);
	}

	static drawNumDo(draw, option)
	{
		let val = Math.round(option.val);
		if (option.val == option._val) return;
		option._val = val;

		draw.clear();

		option.padding = option.padding || 5;
		option.val_padding = option.val_padding || 0;
		option.val_count = option.val_count || 5;

		option.color = draw.getLineColor(option.color||'#00f');
		option.back_color = draw.getLineColor(option.back_color||'#fff');

		let strVal = ('' + option._val).padStart(option.val_count, '0');

		let size = (draw.width - 2*option.padding - (option.val_count-1)*option.val_padding) / option.val_count;
		let fontSize = Math.round(size*1.3);
		let font = 'bold ' + fontSize + 'px Arial';
		let h = size*1.4;

		let rainbow_list = [];
		if (option.rainbow)
		{
			rainbow_list = option.rainbow.split(/,/ig);
		}

		let x = option.padding;
		for (let i=0; i<option.val_count; i++)
		{
			draw.rect({x:x, y:option.padding}, size, h, option.r||0).fill(option.back_color);
			if (option.border)
			{
				draw.stroke(option.border_color||'#000', option.border);
			}

			draw.text({x:x+size/2, y:option.padding+h/2+fontSize*0.1}, strVal[i], 'center', font);
			draw.fillText(option.color);
			
			x += size + option.val_padding;
		}
	}

	static drawProgress(option, _el)
	{
		ZChart.tweenVal(option, _el, ZChart.drawProgressDo);
	}

	static drawProgressDo(draw, option)
	{
		draw.clear();

		option.color = draw.getLineColor(option.color||'#00f|#66f');
		let backColor = option.back_color||'#ccc';
		let padding = option.padding || 5;
		let valp = option.val_padding || 0;
		let radius = option.r || 0;
		let w = draw.width - padding * 2;
		let h = draw.height - padding * 2;
		let val = ZTool.limit(option.val, 0, 100);

		let p = new ZPoint(padding, padding);
		if (option.led)
		{
			option.led_padding = option.led_padding || 3;
			if (option.led === true)
			{
				option.led = 20;
			}

			let ledSize = 0;
			if (option.border)
			{
				ledSize = (w - (option.led + 1) * option.led_padding) / option.led;
				draw.rect(p, w, h, radius).stroke(option.border_color||'#000', option.border);
				p = new ZPoint(padding + option.led_padding, padding + option.led_padding);
				h = draw.height - padding * 2 - option.led_padding * 2;
			}
			else
			{
				ledSize = (w - (option.led - 1) * option.led_padding) / option.led;
			}

			for (let i=0; i<option.led; i++)
			{
				if (i <= Math.round(val / 100 * option.led))
				{
					draw.rect(p, ledSize, h, radius).fill(option.color);
				}
				else
				{
					draw.rect(p, ledSize, h, radius).fill(backColor);
				}

				p.addX(ledSize+option.led_padding);
			}
		}
		else
		{
			draw.rect(p, w, h, radius).fill(backColor);
			if (option.border)
			{
				draw.rect(p, w, h, radius).stroke(option.border_color||'#000', option.border);
			}

			if (valp)
			{
				draw.rect(p.add({x:valp, y:valp}), val / 100 * (w-2*valp), h-2*valp, radius).fill(option.color);
			}
			else
			{
				draw.rect(p, val / 100 * w, h, radius).fill(option.color);
			}
		}
	}
	
	static drawLevel(option, _el)
	{
		ZChart.tweenVal(option, _el, ZChart.drawLevelDo);
	}

	static drawLevelDo(draw, option)
	{
		draw.clear();
		option._color = option.color;
		let colorArr = (option.color||'#00f|#aaf|90').split(/\|/ig);
		if (colorArr.length == 1)
		{
			option.top_color = option._color = colorArr[0];
		}
		else
		{
			let center = new ZPoint(draw.width/2, draw.height/2);
			option.top_color = colorArr[0];
			option._color = draw.getLineColor(colorArr, center, draw.height/2);
		}

		let max = option.max || 100;
		let backColor = option.back_color || '#ddd';
		let borderColor = option.border_color || '#999';
		let border = option.border || 1;
		let padding = option.padding || 5;
		let h = draw.height - 2 * padding;
		let w = Math.min(h, draw.width - 2 * padding);
		let center = new ZPoint(draw.width/2, draw.height/2);
		let val = ZTool.limit(option.val, 0, max);
		let rh = w * 0.1, rw = w * 0.5;
		let lh = h - rh * 2;

		draw.ellipse({x:center.x, y:draw.height-padding-rh}, rw, rh).fill(option._color).stroke(borderColor, border);

		let hh = val / max * lh;
		let x = center.x-rw;
		let y = padding + rh + (lh - hh);
		
		draw.rect({x:x, y:y}, w, hh).fill(option._color);
		draw.ellipse({x:center.x, y:y}, rw, rh).fill(option.top_color).stroke('#fff', border);
		draw.ellipse({x:center.x, y:padding+rh}, rw, rh).fill(backColor).stroke(borderColor, border);
		
		draw.line({x:center.x-rw, y:center.y-h/2+rh}, {x:center.x-rw, y:draw.height-padding-rh}).stroke(borderColor, border);
		draw.line({x:center.x+rw, y:center.y-h/2+rh}, {x:center.x+rw, y:draw.height-padding-rh}).stroke(borderColor, border);

		if (option.name)
		{
			draw.shadow('#fff', 5);
			draw.text({x:center.x, y:padding+rh}, option.name, 'center', Math.max(14, Math.round(w*0.1)) + 'px Arial').fillText('#000');
		}

		draw.shadow('#000', 0);
		let fontSize = Math.round(w*0.3);
		let font = fontSize + 'px Arial';
		let strVal = ZTool.round(val, option.dec||0) + (option.unit||'');
		draw.text({x:center.x, y:draw.height-padding-rh}, strVal, 'center,bottom', font).strokeText('#000', 4).fillText('#fff');
	}

	static drawMonitor(option, _el)
	{
		let draw = new ZDraw($(_el));

		let optionDefault = {
			"color":"#666",
			"line_width":1,
			"fill_color":"#00f|#aaf|90",
			"list":[],
			"grid":"20,10",
			"grid_color":"rgba(0,0,0,0.2)",
			"min":0,
			"max":100
		};

		option = $.extend(optionDefault, option);
		option._index = 0;
		option.fill_color = draw.getLineColor(option.fill_color);

		let arr = option.grid.split(/,/ig);
		if (arr.length>1)
		{
			option.grid_x = Math.round(draw.width / parseInt(arr[0]));
			option.grid_y = Math.round(draw.height / parseInt(arr[1]));
		}
		else
		{
			option.grid_x = Math.round(draw.width / parseInt(option.grid));
			option.grid_y = Math.round(draw.height / parseInt(option.grid));
		}

		let getVal = function(val){
			val = ZTool.limit(val, option.min, option.max);
			let maxH = Math.round(draw.height);
			val = (option.max - val) / (option.max - option.min) * maxH;
			return Math.min(val, maxH-1);
		};

		option._text = '';
		option._list = [];
		for (let k in option.list)
		{
			option._text = option.list[k];
			option._list.push(getVal(option.list[k]));
		}

		
		$(_el).bind('addVal', function(ev, val){
			option._text = val;
			option._list.push(getVal(val));
			ZChart.drawMonitorDo(draw, option);
		});

		ZChart.drawMonitorDo(draw, option);
	}

	static drawMonitorDo(draw, option)
	{
		draw.clear();
		
		let maxW = Math.floor(draw.width);
		if (option._list.length > maxW)
		{
			option._index += option._list.length - maxW;

			option._list = option._list.slice(-1*maxW);
		}
		
		for (let x=-option._index % option.grid_x; x<draw.width; x+=option.grid_x)
		{
			draw.line({x:x, y:0}, {x:x, y:draw.height}).stroke(option.grid_color, 0.5);
		}

		for (let y=draw.height; y>0; y-=option.grid_y)
		{
			draw.line({x:0, y:y}, {x:draw.width, y:y}).stroke(option.grid_color, 0.5);
		}

		let lineList = [];
		for (let i=0; i<option._list.length; i++)
		{
			lineList.push({x:i, y:option._list[i]});
		}

		if (lineList.length > 2)
		{
			if (option.fill_color != '' && option.fill_color != 'none' && option.fill_color != 'null')
			{
				let last = lineList[lineList.length-1];
				lineList.push({x:last.x, y:draw.height});
				
				let first = lineList[0];
				lineList.unshift({x:first.x, y:draw.height});
	
				draw.area(lineList).fill(option.fill_color);
	
				lineList.pop();
				lineList.shift();
			}

			if (option.line_width > 0)
			{
				draw.lines(lineList).stroke(option.color, option.line_width);
			}
		}

		if (option.font_color)
		{
			let light = ZChart.getColorLight(option.font_color);
			let fontBorderColor = light < 0.5 ? '#fff' : '#000';

			let fontSize = Math.round(draw.height * 0.2);
			draw.text({x:draw.width - 10, y:10}, option._text, 'right,top', fontSize);
			draw.strokeText(fontBorderColor, 2).fillText(option.font_color);
		}
	}

	static drawRadar(option, _el)
	{
		let draw = new ZDraw($(_el));

		option.show = option.show || 'regular';
		option.border = option.border || 1;
		option.border_color = option.border_color || '#ddd';
		option.max = option.max || 100;
		option.line_width = option.line_width ?? 1;
		option.fill_color = draw.getRadialColor(option.fill_color||'rgba(0,0,255,0.5)');
		option.back_color = draw.getRadialColor(option.back_color||'');

		let center = new ZPoint(draw.width/2, draw.height/2);
		let radius = Math.min(draw.width, draw.height) / 2 - 20;

		if (option.show == 'regular')
		{
			draw.regular(center, radius, option.list.length);
			if (option.back_color)
			{
				draw.fill(option.back_color);
			}
			draw.stroke(option.border_color, option.border);
			draw.regular(center, radius * 0.75, option.list.length).stroke(option.border_color, option.border);
			draw.regular(center, radius * 0.5, option.list.length).stroke(option.border_color, option.border);
			draw.regular(center, radius * 0.25, option.list.length).stroke(option.border_color, option.border);
		}
		else if (option.show == 'circle')
		{
			draw.circle(center, radius);
			if (option.back_color)
			{
				draw.fill(option.back_color);
			}
			draw.stroke(option.border_color, option.border);
			draw.circle(center, radius * 0.75).stroke(option.border_color, option.border);
			draw.circle(center, radius * 0.5).stroke(option.border_color, option.border);
			draw.circle(center, radius * 0.25).stroke(option.border_color, option.border);
		}

		let list = [];
        let degStep = 360 / option.list.length;
        let deg = -90;
        for (let i=0; i<option.list.length; i++)
        {
			let r = option.list[i];
            let p1 = center.goDeg(deg, radius);
			draw.line(center, p1).stroke(option.border_color, option.border);

			let deg1 = Math.abs(Math.abs(deg+90) % 360 - 180);
			if (deg1 > 30 && deg1 < 150)
			{
				p1 = center.goDeg(deg, radius + 20);
			}
			else
			{
				p1 = center.goDeg(deg, radius + 10);
			}
			draw.text(p1, r.name, 'center,center').fillText(option.font_color||'#666');

			p1 = center.goDeg(deg, radius * (r.val / option.max));
			list.push(p1);

            deg += degStep;
        }

		draw.area(list).fill(option.fill_color);
		if (option.line_width > 0)
		{
			draw.stroke(option.line_color||'#00f', option.line_width);
			for (let k in list)
			{
				draw.circle(list[k], option.line_width*2).fill(option.line_color||'#00f');
			}
		}
	}
	
	static drawTime(option, _el)
	{
		let draw = new ZDraw($(_el));

		option.top ??= 5;
		option.left ??= 50;
		option.right ??= 15;
		option.bottom ??= 30;
		option.border ??= 1;
		option.border_color ??= '#999';
		option.line_height ??= 20;
		option.back_color ??= 'rgba(0,0,0,0.1)';

		let p1 = new ZPoint(option.left, option.top);
		let p2 = new ZPoint(option.left, draw.height - option.bottom);

		draw.line(p1, p2).stroke(option.border_color, option.border);
		
		p1 = new ZPoint(option.left, draw.height - option.bottom);
		p2 = new ZPoint(draw.width - option.right, draw.height - option.bottom);

		draw.line(p1, p2).stroke(option.border_color, option.border);

		let parseDT = function(str, start=''){
			if (str.indexOf(':') === -1)
			{
				str += ' 00:00:00';
			}

			if (start != '' && str.indexOf('-') === -1)
			{
				str = start + ' ' + str;
			}

			return new Date(str + ' GMT+0000');
		};

		function getDay(d){
			d = d || new Date();
		
			let f = (v) => ('0' + v).substr(-2);
			return d.getFullYear() + '-'
				+ f(d.getMonth() + 1) + '-'
				+ f(d.getDate());
		}

		let dtBegin = parseDT(option.min);
		let dtEnd = parseDT(option.max);
		let dtStart = getDay(dtBegin);

		let dtMin = Math.round(dtBegin.getTime() / 1000);
		let dtMax = Math.round(dtEnd.getTime() / 1000);

		let getX = function(s){
			return (s - dtMin) / (dtMax - dtMin) * (draw.width - option.left - option.right) + option.left;
		};

		let step = 600; // 10分钟
		let dtDiff = dtMax - dtMin;
		if (dtDiff <= 24*3600)
		{
			step = 600;
		}
		else if (dtDiff <= 10*24*3600)
		{
			step = 3600;
		}
		else
		{
			step = 24*3600;
		}

		let start = Math.ceil(dtMin / step) * step;
		let x = 0, str = '', lastX = 0;
		for (let i=start; i<=dtMax; i+=step)
		{
			x = getX(i);
			p1 = new ZPoint(x, draw.height - option.bottom);
			str = '';

			if (i%(24*3600) == 0)
			{
				// 天
				p2 = new ZPoint(x, draw.height - option.bottom + 10);
				str = (new Date(i*1000)).getUTCDate();
				if (dtDiff > 31*24*3600)
				{
					if (str == 1)
					{
						p1 = new ZPoint(x, option.top);
						p2 = new ZPoint(x, draw.height - option.bottom + 13);
						str = ((new Date(i*1000)).getMonth() + 1) + '月';
						lastX = x;
					}
					else if (x-lastX > 20 && str != 30 & str != 31)
					{
						lastX = x;
					}
					else
					{
						str = '';
					}
				}
				else if (x-lastX > 20)
				{
					p1 = new ZPoint(x, option.top);
					str = ((new Date(i*1000)).getUTCMonth() + 1) + '-' + str;
					lastX = x;
				}
				else
				{
					str = '';
				}
			}
			else if (i%3600 == 0)
			{
				// 小时
				p1 = new ZPoint(x, option.top);
				p2 = new ZPoint(x, draw.height - option.bottom + 8);
				str = (new Date(i*1000)).getUTCHours();
			}
			else if (i%1800 == 0)
			{
				// 半小时
				p2 = new ZPoint(x, draw.height - option.bottom + 6);
			}
			else
			{
				// 10分钟
				p2 = new ZPoint(x, draw.height - option.bottom + 4);
			}
			
			draw.line(p1, p2).stroke(option.border_color, 1);
			if (str != '')
			{
				draw.text(p2.addY(10), str, 'center,center').fillText(option.border_color);
			}
		}

		let rectList = [];

		let y = draw.height - option.bottom - 3;
		for (let i=0; i<option.list.length; i++)
		{
			let r = option.list[i];
			p1 = new ZPoint(option.left - 2, y - option.line_height / 2);

			draw.text(p1, r.name, 'right,center').fillText(option.border_color);

			let y1 = y - option.line_height / 2 - option.line_height * 0.3;
			let rectH = option.line_height * 0.6;
			if (option.back_color)
			{
				p1 = new ZPoint(option.left + option.border, y1);
				draw.rect(p1, draw.width - option.left - option.right, rectH).fill(option.back_color);
			}

			for (let k in r.list)
			{
				let rr = r.list[k];
				let dt1 = parseDT(rr.dt1, dtStart);
				let dt2 = parseDT(rr.dt2, dtStart);

				p1 = new ZPoint(getX(dt1.getTime()/1000), y1);
				let rectW = Math.max(getX(dt2.getTime()/1000) - p1.x, 1);
				draw.rect(p1, rectW, rectH).fill(rr.color||r.color||ZChart.defColor(i));

				rectList.push({
					p:p1,
					w:rectW,
					h:rectH,
					item:rr,
					name:r.name,
				});
			}
			
			y -= option.line_height;
		}

		draw.saveCache('img');

		let curRectIndex = -1;
		$(_el).mousemove(function(ev){
            ev.preventDefault();
            let p = draw.getPoint(ev.offsetX, ev.offsetY);
			let rectIndex = -1;
			for (let k in rectList)
			{
				let r = rectList[k];
				draw.ctx.beginPath();
				draw.ctx.rect(r.p.x, r.p.y, r.w, r.h);
				if (draw.ctx.isPointInPath(p.x, p.y))
				{
					rectIndex = k;
					break;
				}
			}

			if (rectIndex == curRectIndex)
			{
				return;
			}

			curRectIndex = rectIndex;
			draw.loadCache('img');

			if (rectIndex != -1)
			{
				let curRect = rectList[rectIndex];
				draw.rect(curRect.p, curRect.w, curRect.h).stroke('#000');

				let str1 = curRect.item.dt1 + '~' + curRect.item.dt2;
				let str2 = curRect.item.text;

				let rect = {x:curRect.p.x, y:curRect.p.y, w:curRect.w, h:curRect.h};
				ZChart.rectTooltip(draw, rect, [str1, str2], '#000', 'left');
			}
		});
	}
	
	static pointTooltip(draw, p, strList, color='#000', align='center')
	{
		let rect = {x:p.x, y:p.y, w:0, h:0};
		return ZChart.rectTooltip(draw, rect, strList, color, align);
	}

	static rectTooltip(draw, rect, strList, color='#000', align='center')
	{
		let light = ZChart.getColorLight(color);
		let fontColor = light < 0.5 ? '#fff' : '#000';

		let strW = 0;
		let strH = 0;

		for (let k in strList)
		{
			strW = Math.max(draw.text({x:0,y:0}, strList[k]).measureText(), strW);
		}

		strW += 10;

		let fontHeight = 14 / draw.ratio * 2;
		strH = fontHeight * strList.length + 5;
		
		draw.ctx.globalAlpha = 0.7;

		let strX = rect.x + rect.w/2 - strW/2;
		let strX1 = strX;
		strX = Math.max(1, strX);
		strX = Math.min(draw.width - strW - 1, strX);

		let xOffset = strX1-strX;

		let strY = rect.y - strH - 5;
		let tip = 'bottom';
		if (strY < -5)
		{
			strY = rect.y + rect.h + 5;
			tip = 'top';
		}

		draw.tooltip({x:strX, y:strY}, strW, strH, 5, tip, 5, xOffset).fill(color);
		draw.stroke(fontColor, 1);

		draw.ctx.globalAlpha = 1;

		for (let k in strList)
		{
			let y = strY+5+fontHeight/2+k*fontHeight*0.9;
			switch (align)
			{
				case 'center':
					draw.text({x:strX + strW/2, y:y}, strList[k], align).fillText(fontColor);
					break;
				case 'left':
					draw.text({x:strX + 5, y:y}, strList[k], 'left,center').fillText(fontColor);
					break;
				case 'right':
					draw.text({x:strX + strW - 5, y:y}, strList[k], 'right,center').fillText(fontColor);
					break;
			}
		}
	}

	static drawGrid(option, _el)
	{
		let draw = new ZDraw($(_el));

		let optionDefault = {
			"xmin":null,
			"xmax":null,
			"ymin":null,
			"ymax":null,
			"xstep":1,
			"ystep":1,
			"min":0,
			"max":100,
			"color":"@hsl",
			"show":"rect",
			"center":null,
			"size":20,
		}
		
		option = $.extend(optionDefault, option);
		if (option.xmin==null || option.xmax==null)
		{
			let xlist = [];
			for (let k in option.list)
			{
				xlist.push(option.list[k][0]);
			}
			if (option.xmin==null)
			{
				option.xmin = Math.min(...xlist);
			}
			if (option.xmax==null)
			{
				option.xmax = Math.max(...xlist);
			}
			xlist = null;
		}

		if (option.ymin==null || option.ymax==null)
		{
			let ylist = [];
			for (let k in option.list)
			{
				ylist.push(option.list[k][1]);
			}
			if (option.ymin==null)
			{
				option.ymin = Math.min(...ylist);
			}
			if (option.ymax==null)
			{
				option.ymax = Math.max(...ylist);
			}
			ylist = null;
		}

		if (option.center == null)
		{
			option.center = [
				option.xmin+(option.xmax-option.xmin)/2, 
				option.ymin+(option.ymax-option.ymin)/2,
			]
		}

		option.cx = draw.width/2;
		option.cy = draw.height/2;

		ZChart.drawGridDo(draw, option);
		
		$(_el)[0].onmousewheel = function(ev, delta){
            ev.preventDefault();
			let p = draw.getPoint(ev.offsetX, ev.offsetY);
			p.x = option.cx - p.x;
			p.y = option.cy - p.y;
			if (ev.wheelDelta > 0)
			{
				if (option.size > 100) return;
				option.size *= 1.1;
				option.cx += p.x * 1.1 - p.x;
				option.cy += p.y * 1.1 - p.y;
			}
			else
			{
				if (option.size <= 3) return;
				option.size /= 1.1;
				option.cx += p.x / 1.1 - p.x;
				option.cy += p.y / 1.1 - p.y;
			}
			ZChart.drawGridDo(draw, option);
			ZChart.drawGridText(draw, option);
		};
		
		option.movePoint = null;
		option.isMove = false;
		$(_el).mousedown(function(ev){
			option.isMove = true;
			option.moveMouseStart = draw.getPoint(ev.offsetX, ev.offsetY);
			option.movePointStart = {x:option.cx, y:option.cy};
		});
		$(_el).mouseup(function(ev){
			option.isMove = false;
		});
		$(_el).mouseleave(function(ev){
			option.isMove = false;
		});
		$(_el).mousemove(function(ev){
			let p = draw.getPoint(ev.offsetX, ev.offsetY);
			option.movePoint = p;
			if (option.isMove)
			{
				option.cx = option.movePointStart.x + (p.x - option.moveMouseStart.x);
				option.cy = option.movePointStart.y + (p.y - option.moveMouseStart.y);
				ZChart.drawGridDo(draw, option);
			}
			else
			{
				draw.clear();
				draw.loadCache('img');
			}

			ZChart.drawGridText(draw, option);
		});
		
		$(_el).bind('setVal', function(ev, list){
			option.list = list;
			ZChart.drawGridDo(draw, option);
			ZChart.drawGridText(draw, option);
		});
	}

	static drawGridText(draw, option)
	{
		if (!option.movePoint)
		{
			return;
		}

		let vx = (option.movePoint.x - option.cx) / (option.xstep * option.size) + option.center[0];
		let vy = -((option.movePoint.y - option.cy) / (option.xstep * option.size)) + option.center[1];
		vx = Math.round(vx);
		vy = Math.round(vy);

		let str = '' + vx + ',' + vy;
		let val = '?';
		for (let k in option.list)
		{
			let r = option.list[k];
			if (r[0] == vx && r[1] == vy)
			{
				val = r[2];
				let size = option.size * 0.8;
				let half = size / 2;
				let x = option.cx + (r[0] - option.center[0]) * option.xstep * option.size;
				let y = option.cy - (r[1] - option.center[1]) * option.ystep * option.size;
				draw.rect({x:x-half, y:y-half}, size, size).stroke('#000');
				break;
			}
		}
		str += '=' + val;

		draw.text({x:draw.width - 5, y:5}, str, 'right,top', 'bolder 16px Arial').strokeText('#fff', 3).fillText('#000');
	}

	static drawGridDo(draw, option)
	{
		//console.time('draw');
		draw.clear();

		let size = option.size * 0.8;
		let half = size / 2;
		for (let k in option.list)
		{
			let r = option.list[k];

			let x = option.cx + (r[0] - option.center[0]) * option.xstep * option.size;
			let y = option.cy - (r[1] - option.center[1]) * option.ystep * option.size;

			if (x < -half || x > draw.width + half)
			{
				continue;
			}
			if (y < -half || y > draw.height + half)
			{
				continue;
			}

			let color = option.color;
			let colorRate = 0.1 + (r[2] - option.min) / (option.max - option.min) * 0.9;
			colorRate = ZTool.limit(colorRate, 0, 1);
			if (option.color != '@hsl')
			{
				draw.ctx.globalAlpha = colorRate;
			}
			else
			{
				color = 'hsl(' + Math.round(300*colorRate) + ',100%,35%)';
			}

			switch (option.show)
			{
				case 'rect':
					draw.rect({x:x-half, y:y-half}, size, size).fill(color);
					break;
				case 'circle':
					draw.circle({x:x, y:y}, half).fill(color);
					break;
			}
		}

		draw.ctx.globalAlpha = 1;
		draw.saveCache('img');

		//console.timeEnd('draw');
	}
	
	static drawImage(option, _el)
	{
		let draw = new ZDraw($(_el));

		option.zoom ??= 1;
		if (option.center)
		{
			let arr = option.center.split(/,/ig);
			option.cx = draw.width * parseFloat(arr[0]) / 100;
			option.cy = draw.width * parseFloat(arr[1]) / 100;
		}
		else
		{
			option.cx = draw.width/2;
			option.cy = draw.height/2;
		}

		draw.text({x:10, y:20}, '加载中...').fillText('#000');
		let load = 0;
		for (let k in option.list)
		{
			let r = option.list[k];
			r.zoom ??= 1;
			r.x ??= 0;
			r.y ??= 0;

			let img = new Image();
			// img.setAttribute('crossOrigin', 'anonymous');
			img.onload = function(){
				r.width = img.width;
				r.height = img.height;
				load++;
				if (load == option.list.length)
				{
					option.ready = true;
					ZChart.drawImageDo(draw, option);
				}
			};
			img.onerror = function(){
				draw.clear();
				draw.text({x:10, y:20}, '图片加载失败：' + img.src).fillText('#f00');
			};

			img.src = r.url;
			r.img = img;
		}

		$(_el)[0].onmousewheel = function(ev, delta){
            ev.preventDefault();
			let p = draw.getPoint(ev.offsetX, ev.offsetY);
			p.x = option.cx - p.x;
			p.y = option.cy - p.y;
			if (ev.wheelDelta > 0)
			{
				if (option.zoom > 10) return;
				option.zoom *= 1.1;
				option.cx += p.x * 1.1 - p.x;
				option.cy += p.y * 1.1 - p.y;
			}
			else
			{
				if (option.zoom < 0.01) return;
				option.zoom /= 1.1;
				option.cx += p.x / 1.1 - p.x;
				option.cy += p.y / 1.1 - p.y;
			}
			ZChart.drawImageDo(draw, option);
		};

		option.isMove = false;
		$(_el).mousedown(function(ev){
			option.isMove = true;
			option.moveMouseStart = draw.getPoint(ev.offsetX, ev.offsetY);
			option.movePointStart = {x:option.cx, y:option.cy};
		});
		$(_el).mouseup(function(ev){
			option.isMove = false;
		});
		$(_el).mouseleave(function(ev){
			option.isMove = false;
		});
		$(_el).mousemove(function(ev){
			if(!option.isMove) return;
			let p = draw.getPoint(ev.offsetX, ev.offsetY);
			option.cx = option.movePointStart.x + (p.x - option.moveMouseStart.x);
			option.cy = option.movePointStart.y + (p.y - option.moveMouseStart.y);
			ZChart.drawImageDo(draw, option);
		});
		
		if (window.TWEEN)
		{
			let tween = new TWEEN.Tween(option);
			tween.onUpdate(function () {
				ZChart.drawImageDo(draw, option);
			});
	
			$(_el).bind('fly', function(ev, cx, cy, zoom=1){
				cx = -cx * zoom + draw.width/2;
				cy = -cy * zoom + draw.height/2;
				tween.to({cx:cx, cy:cy, zoom:zoom}, ZChart.TweenSleep);
				tween.stop();
				tween.start();
			});
		}
	}
	
	static drawImageDo(draw, option)
	{
		if (!option.ready) return;

		draw.clear();

		for (let k in option.list)
		{
			let r = option.list[k];
			let zoom = r.zoom * option.zoom;

			let w = r.width * zoom;
			let h = r.height * zoom;
			let x = option.cx + r.x * option.zoom - w/2;
			let y = option.cy + r.y * option.zoom - h/2;

			draw.ctx.drawImage(r.img,0,0,r.width,r.height,x,y,w,h);
		}
		
		for (let k in (option.point||[]))
		{
			let r = option.point[k];
			let x = option.cx + r.x * option.zoom;
			let y = option.cy + r.y * option.zoom;
			let size = Math.max((r.size||3) * option.zoom, 1);

			draw.circle({x:x,y:y}, size).fill(r.color||'#f00').stroke('#000', 0.5);
		}
	}
	
	static drawMap(option, _el)
	{
		let draw = new ZDraw($(_el), typeof(option.hover_border_color) == 'string' ? null : function(index){
			// 蚂蚁线移动
			if (!option._ready) return;
			if (!option._curHover) return;
			if (index % 5 != 0) return;

			if (option._curHover.tag)
			{
				draw.fill(option._curHover.tag.color, option._curHover.drawPath);
			}
			else
			{
				draw.fill(option.hover_color, option._curHover.drawPath);
			}

			let dash = option.hover_border_dash;
			option._curHover.dashOffset += 1;
			draw.ctx.lineDashOffset = option._curHover.dashOffset;
			draw.ctx.setLineDash([dash, dash]);
			draw.stroke(option.hover_border_color[0], 1, option._curHover.drawPath);
			draw.ctx.lineDashOffset = option._curHover.dashOffset + dash;
			draw.ctx.setLineDash([dash, dash]);
			draw.stroke(option.hover_border_color[1], 1, option._curHover.drawPath);

			draw.ctx.setLineDash([]);
			if (option._curHover.properties.center && option.hover_point_color)
			{
				let p2 = option.getXY(option._curHover.properties.center);
				draw.circle(p2, 3).stroke(option.hover_point_color, 2);
			}
			
			if (option.name_color && option._curHover.properties.name)
			{
				let p3 = option.getXY(option._curHover.properties.centroid||option._curHover.properties.center);
				draw.text(p3, option._curHover.properties.name, 'center,center').fillText(option.name_color);
			}
		});

		option._ready = false;
		option._curHover = null;

		option.zoom ??= 0;
		option.list ??= [];
		option.back_color ??= '#ddd';
		option.border_color ??= '#999';
		option.point_color ??= '#666';
		option.name_color ??= '#000';

		option.hover_color ??= '#00f|#0f0';
		option.hover_border_color ??= ['#fff', '#000'];
		option.hover_point_color ??= '#f00';
		option.hover_border_dash ??= 10;

		option.hover_color = draw.getLineColor(option.hover_color);
		
		draw.text({x:10, y:20}, '加载中...').fillText('#000');
		$.getJSON(option.geojson,function(result){
			option.geo_data = result;

			let _mapCenter = null, _zoom = null;
			[_mapCenter, _zoom] = ZChart.drawMapCenter(draw, option.geo_data.features);
			if (option.zoom == 0)
			{
				option.zoom = _zoom;
			}

			//console.log(_mapCenter, _zoom);

			// 中心：center  质心：centroid
			option._mapCenter = option.center;
			if (!option._mapCenter)
			{
				if (option.geo_data.features.length == 1)
				{
					option._mapCenter = option.geo_data.features[0].properties.centroid;
				}
				else
				{
					option._mapCenter = _mapCenter;
				}
			}
			option._mapCenter = {x:option._mapCenter[0], y:option._mapCenter[1]};

			option._xyRate = Math.cos(ZTool.deg2rad(option._mapCenter.y));
			option._center = new ZPoint(draw.width/2, draw.height/2);

			option.getXY = function(xy){
				let x = xy[0] - this._mapCenter.x;
				let y = xy[1] - this._mapCenter.y;

				x = this._center.x + x * this.zoom;
				y = this._center.y + y * -this.zoom / this._xyRate;

				return {x:x,y:y};
			};

			option._ready = true;

			// console.log(option);

			ZChart.drawMapPath(draw, option);
			ZChart.drawMapDo(draw, option);
		});

		$(_el).mousemove(function(e){
			e.preventDefault();
			if (!option._ready) return;

			let curHover = null;
			for (let k in option.geo_data.features)
			{
				let r = option.geo_data.features[k];

				let point = draw.getPoint(e.offsetX, e.offsetY);
				let bo = draw.ctx.isPointInPath(r.drawPath, point.x, point.y);

				if (bo)
				{
					curHover = r;
					break;
				}
			}

			if (curHover == option._curHover)
			{
				return;
			}

			option._curHover = curHover;
			ZChart.drawMapDo(draw, option);
		});
	}

	static drawMapCenter(draw, list)
	{
		let bo = true;
		let xmin, xmax, ymin, ymax;
		for (let k0 in list)
		{
			let r0 = list[k0];
			
			let zlist = r0.geometry.coordinates;
			if (r0.geometry.type == 'Polygon')
			{
				zlist = [zlist];
			}

			for (let k1 in zlist)
			{
				let r1 = zlist[k1];
				for (let k2 in r1[0])
				{
					let r2 = r1[0][k2];
					if (bo)
					{
						bo = false;
						xmin = xmax = r2[0];
						ymin = ymax = r2[1];
						continue;
					}

					xmin = Math.min(xmin, r2[0]);
					xmax = Math.max(xmax, r2[0]);
					
					ymin = Math.min(ymin, r2[1]);
					ymax = Math.max(ymax, r2[1]);
				}
			}
		}

		let x = xmin + (xmax - xmin) / 2;
		let y = ymin + (ymax - ymin) / 2;
		let zoom = 1;

		if (draw.width / draw.height > (xmax - xmin) / (ymax - ymin))
		{
			zoom = draw.height * 0.8 / (ymax - ymin);
		}
		else
		{
			zoom = draw.width * 0.8 / (xmax - xmin);
		}

		return [[x,y], zoom];
	}

	static drawMapPath(draw, option)
	{
		if (!option._ready) return;

		for (let k0 in option.geo_data.features)
		{
			let mainPath = new Path2D();
			let r0 = option.geo_data.features[k0];
			if (r0.geometry.type == 'Polygon')
			{
				r0.geometry.coordinates = [r0.geometry.coordinates];
			}

			let miny = draw.height;
			r0.tooltipPosition = null;
			for (let k1 in r0.geometry.coordinates)
			{
				let bo = true;
				let r1 = r0.geometry.coordinates[k1];
				for (let k2 in r1[0])
				{
					let r2 = option.getXY(r1[0][k2]);
					if (r2.y < miny)
					{
						r0.tooltipPosition = r2;
						miny = r2.y;
					}
					if (bo)
					{
						mainPath.moveTo(r2.x, r2.y);
					}
					else
					{
						mainPath.lineTo(r2.x, r2.y);
					}
					bo = false;
				}
				mainPath.closePath();
			}

			let tag = null;
			for (let k3 in option.list)
			{
				let r3 = option.list[k3];
				if (r3.name == r0.properties.name)
				{
					tag = r3;
					tag.color = draw.getLineColor(tag.color);
				}
			}
			r0.tag = tag;

			r0.dashOffset = 0;
			r0.id = k0;
			r0.drawPath = mainPath;
		}
	}
	
	static drawMapDo(draw, option)
	{
		if (!option._ready) return;

		draw.clear();
		draw.ctx.lineJoin = 'round';
		draw.ctx.setLineDash([]);

		for (let k in option.geo_data.features)
		{
			let r = option.geo_data.features[k];
			if (r.tag)
			{
				draw.fill(r.tag.color, r.drawPath);
			}
			else
			{
				draw.fill(option.back_color, r.drawPath);
			}
		}

		for (let k in option.geo_data.features)
		{
			let r = option.geo_data.features[k];

			draw.stroke(option.border_color, 1, r.drawPath);

			if (r.properties.center && option.point_color)
			{
				let p2 = option.getXY(r.properties.center);
				draw.circle(p2, 3).stroke(option.point_color, 2);
			}
		}
		
		for (let k in option.geo_data.features)
		{
			let r = option.geo_data.features[k];

			if (option.name_color && r.properties.name)
			{
				let p3 = option.getXY(r.properties.centroid||r.properties.center);
				draw.text(p3, r.properties.name, 'center,center').fillText(option.name_color);
			}
		}

		if (typeof(option.hover_border_color) == 'string')
		{
			if (option._curHover)
			{
				if (option._curHover.tag)
				{
					draw.fill(option._curHover.tag.color, option._curHover.drawPath);
				}
				else
				{
					draw.fill(option.hover_color, option._curHover.drawPath);
				}
				draw.stroke(option.hover_border_color, 1, option._curHover.drawPath);
				
				if (option._curHover.properties.center && option.hover_point_color)
				{
					let p2 = option.getXY(option._curHover.properties.center);
					draw.circle(p2, 3).stroke(option.hover_point_color, 2);
				}
			}
		}
		
		if (option._curHover)
		{
			if (option._curHover.tag && option._curHover.tag.tooltip)
			{
				let strList = option._curHover.tag.tooltip;
				if (typeof(strList) == 'string')
				{
					strList = [option._curHover.tag.tooltip];
				}
	
				ZChart.pointTooltip(draw, option._curHover.tooltipPosition, strList);
			}

			if (option.name_color && option._curHover.properties.name)
			{
				let p3 = option.getXY(option._curHover.properties.centroid||option._curHover.properties.center);
				draw.text(p3, option._curHover.properties.name, 'center,center').fillText(option.name_color);
			}
		}
	}
	
	static drawMapTile(option, _el)
	{
		let draw = new ZDraw($(_el));

		option.zoom ??= 10;
		option.center ??= [108,34];
		option.imgList = {};
		option.tile_url ??= 'http://b.tile.osm.org/{0}/{1}/{2}.png';
		option.clear ??= false;
		option.y_flip ??= false;

		option.tile_url = ZTool.htmlDecode(option.tile_url);

		// let tileUrlBase = 'http://b.tile.osm.org/{0}/{1}/{2}.png';
		// let tileUrlBase = 'https://rt0.map.gtimg.com/tile?z={0}&x={1}&y={2}&type=vector&styleid=0';
		// let tileUrlBase = 'https://p0.map.gtimg.com/sateTiles/{0}/{3}/{4}/{1}_{2}.jpg';


		ZChart.drawMapTileDo(draw, option);

		$(_el)[0].onmousewheel = function(ev, delta){
            ev.preventDefault();
			// let p = draw.getPoint(ev.offsetX, ev.offsetY);
			// p.x = option.cx - p.x;
			// p.y = option.cy - p.y;
			if (ev.wheelDelta > 0)
			{
				if (option.zoom >= 18) return;
				option.zoom *= 1.01;
			}
			else
			{
				if (option.zoom <= 1) return;
				option.zoom /= 1.01;
			}

			ZChart.drawMapTileDo(draw, option);
		};
		
		option.isMove = false;
		$(_el).mousedown(function(ev){
			
			let p = draw.getPoint(ev.offsetX, ev.offsetY);
			let gps = ZChart.drawMapTileP2Gps(draw, option, p);
			console.log(p, gps);

			let p1 = ZChart.drawMapTileGps2P(draw, option, gps);
			console.log(p1);

			if(option.isMove) return;
			option.isMove = true;
			option.moveMouseStart = p;
			draw.saveCache('img');
		});
		$(_el).mouseup(function(ev){
			if(!option.isMove) return;

			let p = draw.getPoint(ev.offsetX, ev.offsetY);
			let cx = option.tileCenter.x - (p.x - option.moveMouseStart.x) / option.tileSize;
			let cy = option.tileCenter.y - (p.y - option.moveMouseStart.y) / option.tileSize;
			option.center = ZChart.toLnglat([Math.floor(option.zoom), cx, cy]);
			ZChart.drawMapTileDo(draw, option);
			option.isMove = false;
		});
		$(_el).mouseleave(function(ev){
			option.isMove = false;
		});
		$(_el).mousemove(function(ev){
			
			if(!option.isMove) return;

			let p = draw.getPoint(ev.offsetX, ev.offsetY);
			draw.loadCache('img', p.x - option.moveMouseStart.x, p.y - option.moveMouseStart.y);
		});
		
		if (option.gps_json)
		{
			$.getJSON(option.gps_json, function(result){
				option.gps_json_list = result;
				ZChart.drawMapTileDo(draw, option);
			});
		}
	}

	static drawMapTileP2Gps(draw, option, p)
	{
		let cx = option.tileCenter.x + (p.x - draw.width/2) / option.tileSize;
		let cy = option.tileCenter.y + (p.y - draw.height/2) / option.tileSize;
		let tile1 = [Math.floor(option.zoom), cx, cy];
		let gps = ZChart.toLnglat(tile1);
		
		return gps;
	}

	static drawMapTileGps2P(draw, option, gps)
	{
		let tile = ZChart.toTile(Math.floor(option.zoom), gps);
		
		let x = draw.width/2 + (tile[1] - option.tileCenter.x) * option.tileSize;
		let y = (tile[2] - option.tileCenter.y) * option.tileSize + draw.height/2;

		return [x, y];
	}

	static drawMapTileDo(draw, option)
	{
		if (option.clear)
		{
			draw.clear();
		}

		let ruleRate = 40076000 / Math.pow(2, option.zoom - 1);
		
		let _xyRate = Math.cos(ZTool.deg2rad(option.center[1]));
		ruleRate = ZTool.round(ruleRate, 2);
		// console.log(ruleRate, ruleRate * _xyRate);

		let zoom = Math.floor(option.zoom);
		let tile = ZChart.toTile(zoom, option.center);
		option.tileCenter = {
			zoom:tile[0],
			x:tile[1],
			y:tile[2],
		}

		let tileSize = Math.round(256 * (option.zoom - zoom + 1));
		option.tileSize = tileSize;

		// console.log(tile, ZChart.toLnglat(tile));
		
		let offsetX = (tile[1] - Math.floor(tile[1])) * tileSize;
		let offsetY = (tile[2] - Math.floor(tile[2])) * tileSize;

		let falseFn = function(){return false};
		let emptyImageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
		for (let k in option.imgList)
		{
			if (!option.imgList[k])
			{
				continue;
			}
			
			option.imgList[k].onload = falseFn;
			option.imgList[k].onerror = falseFn;
			if (!option.imgList[k].complete) {
				option.imgList[k].src = emptyImageUrl;
			}
			option.imgList[k] = null;
		}

		let x2 = Math.floor(draw.width/2/tileSize)+2;
		let y2 = Math.floor(draw.height/2/tileSize)+2;

		let tileMax = Math.pow(2, tile[0]);

		for (let x=-x2; x<x2; x++)
		{
			for (let y=-y2; y<y2; y++)
			{
				let x1 = draw.width/2 + x*tileSize - offsetX;
				let y1 = draw.height/2 + y*tileSize - offsetY;
				if (x1 < -tileSize || x1>draw.width+tileSize)
				{
					continue;
				}
				if (y1 < -tileSize || y1>draw.height+tileSize)
				{
					continue;
				}

				let tileKey = zoom + ',' + (Math.floor(tile[1])+x) + ',' + (Math.floor(tile[2])+y);

				let img = new Image();
				img.setAttribute('crossOrigin', 'anonymous');
				img.onload = function(){
					if (option.imgList[tileKey])
					{
						draw.ctx.drawImage(img,0,0,img.width,img.height,x1,y1,tileSize,tileSize);
					}
					if (option.line_list)
					{
						draw.lines(option.line_list).stroke('#f00', 2);
					}
					option.imgList[tileKey] = null;
					img = null;
					
					// 钟楼
					let gps = [108.94233322112558, 34.26104025134683];
					let pXian = ZChart.drawMapTileGps2P(draw, option, gps);

					draw.circle({x:pXian[0], y:pXian[1]}, 3).stroke('#000', 2).fill('#f00');
				};
				img.onerror = function(){
					//draw.clear();
					option.imgList[tileKey] = null;
					img = null;
				};
		
				let tileUrl = option.tile_url.replace('{0}', Math.round(tile[0]));
				let tileX = Math.floor(tile[1])+x;
				tileX = (tileX + tileMax) % tileMax;
				let tileY = Math.floor(tile[2])+y;
			    tileY = (tileY + tileMax) % tileMax;

				if (tileX<0 || tileY<0)
				{
					continue;
				}

				if (option.y_flip)
				{
					tileY = tileMax - 1 - tileY;
				}

				tileUrl = tileUrl.replace('{1}', tileX);
				tileUrl = tileUrl.replace('{2}', tileY);
				tileUrl = tileUrl.replace('{3}', Math.floor(tileX / 16));
				tileUrl = tileUrl.replace('{4}', Math.floor(tileY / 16));
		
				img.src = tileUrl;
				option.imgList[tileKey] = img;
			}
		}

		if (option.gps_json_list)
		{
			let plist = [];
			for (let k in option.gps_json_list)
			{
				let p = ZChart.drawMapTileGps2P(draw, option, option.gps_json_list[k]);
				plist.push({x:p[0], y:p[1]});
			}

			option.line_list = plist;

			draw.ctx.lineJoin = 'round';
			draw.lines(plist).stroke('#f00', 2);
		}
	}

	//将tile(瓦片)坐标系转换为lnglat(地理)坐标系
	static toLnglat(tile)
	{
		let n = Math.pow(2, tile[0]);
		let lng = tile[1] / n * 360.0 - 180.0;
		let lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * tile[2] / n)));
		lat = lat * 180.0 / Math.PI;

		return [lng, lat];
	}

	//将lnglat地理坐标系转换为tile瓦片坐标系
	static toTile(zoom, lnglat)
	{
		let n = Math.pow(2, zoom);
		let tileX = ((lnglat[0] + 180) / 360) * n;
		let tileY = (1 - (Math.log(Math.tan(ZTool.deg2rad(lnglat[1])) + (1 / Math.cos(ZTool.deg2rad(lnglat[1])))) / Math.PI)) / 2 * n;

		return [zoom, tileX, tileY];
	}
}