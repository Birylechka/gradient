let colorObject = {
	gradientType: null,
	gradientRotation: null,
	colorPoints: [],
	xpPoints: []
}

let currentOpacity = 1;

function getOffset(e) {
	return {
		x: typeof e.offsetX != 'undefined' ? e.offsetX : e.layerX,
		y: typeof e.offsetY != 'undefined' ? e.offsetY : e.layerY
	}
}

function vectorIntersection(a, b) {
	return ((b.x - a.x) * b.vy - (b.y - a.y) * b.vx) / (b.vy * a.vx - b.vx * a.vy);
}

function rgb2hsv(r, g, b){
    r /= 255;
    g /= 255;
    b /= 255;

    var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);
    var h, s, v = max;
    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; 
    }
	else {
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {h: h, s: s, v: v };
}

function hsv2rgb(h, s, v){
    var r, g, b;
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255)};
}


function drawSlider(ctx, x, y, w, h) {
	var gr = ctx.createLinearGradient(0, 0, 0, h - 1);

	var colors = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'];
	for (var i = 0; i < colors.length; i++) {
		gr.addColorStop(i / (colors.length - 1), colors[i]);
	}

	ctx.fillStyle = gr;
	ctx.fillRect(x, y, w, h);
}

function drawPicker(ctx, x, y, w, h) {
	var gr = ctx.createLinearGradient(0, h, w, h);

	gr.addColorStop(0, '#FFFFFF');
	gr.addColorStop(1, 'rgba(255, 154, 129, 0)');

	ctx.fillStyle = gr;
	ctx.fillRect(x, y, w, h);

	var gr = ctx.createLinearGradient(0, h, 0, 0);

	gr.addColorStop(0, '#000000');
	gr.addColorStop(1, 'rgba(204, 154, 129, 0)');

	ctx.fillStyle = gr;
	ctx.fillRect(x, y, w, h);
	
}

var pickerSetColor, pickerAddCallback, pickerAddCallback2;
var colorPoints = []; 
var currentPoint = 0;


function initPicker() {
	var pickerEnd = 210;
	var sliderStart = 215;
	var opacityStart = 240;
	var slotNumber = 9;

	var el = document.getElementById('cp_gradients');
	var ctx = el.getContext('2d');

	var elo = document.getElementById('cp_opacity_top');
	var ctxo = elo.getContext('2d');

	var slider = document.getElementById('cp_slider');
	var opacity = document.getElementById('cp_opacity');
	var picker = document.getElementById('cp_picker');

	document.getElementById("colorR").addEventListener("input", changePickerColor);
	document.getElementById("colorG").addEventListener("input", changePickerColor);
	document.getElementById("colorB").addEventListener("input", changePickerColor);
	document.getElementById("angular").addEventListener("input", changePickerAngular);
	document.getElementById("grad-gropdown").addEventListener("input", testColor);


	var pos;
	var callbacks = [];
	var slots = {};
	var curSlot;
	var pointClicked;
	
	drawSlider(ctx, sliderStart, 0, (el.width - sliderStart), el.height);
	drawPicker(ctx, 0, 0, pickerEnd, el.height);
	
	
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(pickerEnd, 0, (sliderStart - pickerEnd), el.height);
	ctx.fillRect(opacityStart-5, 0, 5, el.height);

	slider.style.width = (el.width - sliderStart-5) + 'px';
	slider.style.left = (sliderStart - 1) + 'px';

	opacity.style.width = (elo.width) + 'px';
	opacity.style.left = (opacityStart - 1) + 'px';

var slotChange = function (e) {
	var id = e.target.id;
	document.getElementById(curSlot).className = 'cp_slot';
	curSlot = id;
	e.target.className = 'cp_slot cp_slot_selected';
	setColor(slots[curSlot].r, slots[curSlot].g, slots[curSlot].b);
}
for (var i = 0; i < slotNumber; i++) {
	var slot = document.createElement('div');
	slot.className = 'cp_slot';
	slot.id = 'cp_slot_' + i;
	slot.addEventListener('click', slotChange);
	document.getElementById('cp_slots').appendChild(slot);
	slots[slot.id] = {r: 0, g: 0, b: 0};
}
curSlot = 'cp_slot_0';
document.getElementById(curSlot).className = 'cp_slot cp_slot_selected';

var addCallback = function (f) {
	callbacks.push(f);
}
pickerAddCallback = addCallback;



document.getElementById("comp-panel").onmousedown = function (e) {
	var pointId = Date.now().toString() + Math.round(Math.random()*100000).toString();

	if (document.getElementById('point_'+currentPoint)!==null) {
	document.getElementById('point_'+currentPoint).style.backgroundColor = null;
    }
	
	if ((e.target.className == "point")||(e.target.className == "point_st") ) {
		currentPoint = e.target.id.replace('point_', "");
		document.getElementById('point_'+currentPoint).style.backgroundColor = "white";

		document.getElementById('point_'+currentPoint).addEventListener('click', pointChange);
	
		return;
	}
	else {
		currentPoint = pointId;
		
	}
	
	var pointp = document.createElement('div');
	pointp.className = 'point';
	pointp.id = 'point_'+ pointId;
	var offset = document.querySelector('#comp-panel').getBoundingClientRect();
	document.getElementById('comp-panel').appendChild(pointp);
	pointp.style.left = Math.round(e.pageX - offset.left-7)+ "px";
	
	xp = (Math.round(e.pageX - offset.left-7));
		
	var size = document.getElementById('cp_gradients').height;
	var s = (parseFloat(picker.style.left) + 1) / (size - 1);
	var v = 1 - (parseFloat(picker.style.top) + 1) / (size - 1);
	var h = parseFloat(slider.style.top) / (size - 1);
	var color = hsv2rgb(h, s, v);
	asd = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + currentOpacity + ')';
	insertColorPoints(pointId, xp, asd);
	console.log(colorPoints);
	pointd();
	deletePoint();
	drawGradient();
	colorObjectEn();
	


}

function pointChange() {

	const pointWithId = colorPoints.find(point => point.pointId===currentPoint);
	const colorIndex = pointWithId.color;

	if(colorIndex!=="rgba(255, 0, 0, 1)"){
	const rgbaValues = colorIndex.match(/(\d+),(\d+),(\d+),\d+(\.\d+)?/);

   	const r = parseInt(rgbaValues[1], 10);
   	const g = parseInt(rgbaValues[2], 10);
   	const b = parseInt(rgbaValues[3], 10);

	setColor(`${r}`, `${g}`, `${b}`);
	}
	else {
		setColor(255, 0, 0);
	}
}	



colorPoints.splice(0, 0, {pointId: "0", xp: 0, color: "rgba(0, 0, 0, 1)"});
colorPoints.splice(colorPoints.length-1, 0, {pointId: "1", xp: 260, color: "rgba(255, 0, 0, 1)"});



document.getElementById("comp-panel").onmouseout = function (e) {
	pointClicked = false;
	return false;
}



function insertColorPoints(pointId, xp, asd) {
	var count = 0;
	colorPoints.forEach(function(item, index) {
		if (xp > item.xp) {
			count++;
		}
	});
	colorPoints.splice(count, 0, {pointId: pointId, xp: xp, color: asd});
}

function drawGradient() {
	var sltr = document.getElementById('slider-track');
	var ctxst = sltr.getContext('2d');
	var slt = ctxst.createLinearGradient(0, 0, sltr.width, 0);

	colorPoints.forEach(function(item, index) {
		slt.addColorStop(item.xp/sltr.width, item.color);
	});
	ctxst.fillStyle = slt;
	ctxst.fillRect(0, 0, sltr.width, sltr.height);
	
}
var drawOpacityColor = function(e) {
	
	var size = document.getElementById('cp_gradients').height; 
	var s = (parseFloat(picker.style.left) + 1) / (size - 1);
	var v = 1 - (parseFloat(picker.style.top) + 1) / (size - 1);
	var h = parseFloat(slider.style.top) / (size - 1);
	var color = hsv2rgb(h, s, v);

	var asd = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + 1 + ')';

	if (asd!=='rgba(NaN,NaN,NaN,1)') {
	var col1 = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + 1 + ')';
    var col2 = 'rgba(' + 255 + ', ' + 255 + ', ' + 255 + ', ' + 1 + ')';
	var op = ctxo.createLinearGradient(0, 0, 0, elo.height);
	op.addColorStop(0, col1);
	op.addColorStop(1, col2);
	ctxo.fillStyle = op;
	ctxo.fillRect(0, 0, elo.width, elo.height);}
	elo.style.opacity = "0.92";

	colorObjectEn();
	
}


var updateColor = function (e) {
	var size = document.getElementById('cp_gradients').height; 
	var s = (parseFloat(picker.style.left) + 1) / (size - 1);
	var v = 1 - (parseFloat(picker.style.top) + 1) / (size - 1);
	var h = parseFloat(slider.style.top) / (size - 1);
	var color = hsv2rgb(h, s, v);

	slots[curSlot] = color;
	document.getElementById(curSlot).style.backgroundColor = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + 1 + ')';

	for (var i = 0; i < callbacks.length; i++) {
		callbacks[i](color.r, color.g, color.b);
	}
	

	var asd = 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + currentOpacity + ')';
	var point = document.getElementById('point_'+currentPoint);

	if (asd!=='rgba(NaN,NaN,NaN,1)') {
		colorPoints.forEach(function(item, index) {
		if ((point.id == "point_" + item.pointId)&&(point.id!==null)) {
			colorPoints[index].color = asd;
			return false;
		}
	});
	}
drawGradient();

colorObjectEn();


}


function colorObjectEn(ang) {

var divElementHeight = document.getElementById('test2').clientHeight;

colorPoints.forEach(function(item, index) {
	colorObject.colorPoints[index]=colorPoints[index].color;
	colorObject.xpPoints[index]=divElementHeight-((colorPoints[index].xp/260)*divElementHeight);//!!!!!!!!!!!!!!!!!!!!!

});
colorObject.gradientType=document.getElementById("grad-gropdown").value;
if (ang!=undefined) {
colorObject.gradientRotation=ang;}
else {
	colorObject.gradientRotation=document.getElementById("angular").value;
}

testColor();
}

function changePickerAngular() {
	var ang = parseInt(document.getElementById('angular').value);
	colorObjectEn(ang);
	
}


function deletePoint(e) {

var point = document.getElementById('point_'+currentPoint);
 
colorPoints.forEach(function(item, pointId, xp) {
if ((point.id === "point_" + item.pointId)) {

	document.addEventListener('keydown', function(e) {

	var point = document.getElementById('point_'+currentPoint);
	e.preventDefault();
    if ((e.key === "Delete")&&(point!==null)&&(point.id!=="point_1")&&(point.id!=="point_0")){
		var index = colorPoints.map(function(o) { return o.pointId; }).indexOf(currentPoint);
		colorPoints.splice(index, 1);
		point.remove();
		currentPoint = pointId;
		pointClicked = false;
		drawGradient();
		colorObjectEn();
		
		return;
    }
});
	
return;
}});
}


function pointd() {
	var point = document.getElementById('point_'+currentPoint);
	
		var dx = 0;
		point.onmousedown = function (e) { 
			e.preventDefault();
			var x = e.pageX;
			var xb = point.offsetLeft;
			dx = xb - x;
			pointClicked = true;

			point.onmousemove = function (e) {
				e.preventDefault();
				if (pointClicked==true) {
				var x = e.pageX; 
				var new_x = dx + x;
				if (new_x<=246 && new_x>1) {
				point.style.left = new_x + "px";

				colorPoints.forEach(function(item, index) {
					if (point.id == "point_" + item.pointId) {
						colorPoints[index].xp = new_x;
						return false;
					}
				});
				drawGradient();
				colorObjectEn();	
				
				}
				else {
					return false;
				}
				
		}}
	}	
			
		point.onmouseup = function (e) { 
			pointClicked = false;
			
			return false;
			
	}

}



var setColor = function (r, g, b) {
	var c = rgb2hsv(r, g, b);
	var size = document.getElementById('cp_gradients').height;
	pickerSet(c.s * (size - 1), (1 - c.v) * (size - 1));
	sliderSet(c.h * (size - 1));
}
pickerSetColor = setColor;


var pickerSet = function (x, y) {
	picker.style.top = (y - 1) + 'px';
	picker.style.left = (x - 1) + 'px';
	updateColor();
	drawOpacityColor();

}


var pickerMove = function (e) {
	var coords = getOffset(e);
	if ((e.target.id == 'cp_gradients') && (coords.x < pickerEnd)) {
		pickerSet(coords.x, coords.y);
	} else {
		if (e.target.id == 'cp_picker')
			return;

		var size = document.getElementById('cp_gradients').height;
		var walls = [
			{ x: 0, y: 0, vx: size - 1, vy: 0},
			{ x: 0, y: 0, vx: 0, vy: size - 1},
			{ x: 0, y: size - 1, vx: size - 1, vy: 0},
			{ x: size - 1, y: 0, vx: 0, vy: size - 1},
		];
		var vector = {
			x: size / 2, y: size / 2
		}; 
		vector.vx = (e.pageX - pos.x) - vector.x;
		vector.vy = (e.pageY - pos.y) - vector.y;

		for (var i = 0; i < walls.length; i++) {
			var t = [vectorIntersection(vector, walls[i]), vectorIntersection(walls[i], vector)];
			if ((t[0] >= 0) && (t[0] <= 1) && (t[1] >= 0) && (t[1] <= 1)) {
				pickerSet(Math.round(vector.x + t[0] * vector.vx), Math.round(vector.y + t[0] * vector.vy));
				break;
			}
		}
	}
};

var sliderSet = function (y) {
	slider.style.top = y + 'px';
	var color = ctx.getImageData(sliderStart + 1, y, 1, 1).data;
	el.style.background = 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ',' + 1 + ')';
	updateColor();
	drawOpacityColor();
	
}

var sliderMove = function (e) {
	var coords = getOffset(e);
	if ((e.target.id == 'cp_gradients') && ((coords.x >= sliderStart)&&(coords.x<opacityStart))) {
		sliderSet(coords.y);
	} else {
		if (e.target.id == 'cp_slider')
			return;

		var size = document.getElementById('cp_gradients').height;
		var sliderWidth = opacityStart-sliderStart;
		var walls = [
			{ x: 0, y: 0, vx: sliderWidth - 1, vy: 0},
			{ x: 0, y: 0, vx: 0, vy: size - 1},
			{ x: 0, y: size - 1, vx: sliderWidth - 1, vy: 0},
			{ x: sliderWidth - 1, y: 0, vx: 0, vy: size - 1},
		];
		var vector = {
			x: sliderWidth / 2,
			y: size / 2
		};
		vector.vx = (e.pageX - pos.x - sliderStart-(e.pageX - pos.x - opacityStart)) - vector.x;
		vector.vy = (e.pageY - pos.y) - vector.y;

		for (var i = 0; i < walls.length; i++) {
			var t = [vectorIntersection(vector, walls[i]), vectorIntersection(walls[i], vector)];
			if ((t[0] > 0) && (t[0] < 1) && (t[1] > 0) && (t[1] < 1)) {
				sliderSet(Math.round(vector.y + t[0] * vector.vy));
				break;
			}
		}
	}

};

var opacitySet = function (y) {
	opacity.style.top = y + 'px';
	currentOpacity = 1-Math.round(y*100/210)/100;
	updateColor();

}
var opacityMove = function (e) {
	var coords = getOffset(e);
	if ((e.target.id == 'cp_opacity_top')) {
		opacitySet(coords.y);
	} else {
		if (e.target.id == 'cp_opacity')
			return;
	}
}


el.addEventListener('mousedown', function (e) {
	e.preventDefault();
	var coords = getOffset(e);
	pos = {
		x: e.pageX - coords.x,
		y: e.pageY - coords.y
	};

	if (coords.x < pickerEnd) {
		document.addEventListener('mousemove', pickerMove); //убр документ
		pickerMove(e);
	} else if ((coords.x >= sliderStart)) {
		document.addEventListener('mousemove', sliderMove); //убр документ
		sliderMove(e);
	}

	
});


elo.addEventListener('mousedown', function (e) {
	e.preventDefault();
	var coords = getOffset(e);
	pos = {
		x: e.pageX - coords.x,
		y: e.pageY - coords.y
	};
	document.addEventListener('mousemove', opacityMove); //убр документ
	opacityMove(e);
});

	document.addEventListener('mouseup', function () { //убр документ
	document.removeEventListener('mousemove', pickerMove); //убр документ
	document.removeEventListener('mousemove', sliderMove);//убр документ
	document.removeEventListener('mousemove', opacityMove); //убр документ
	
	});
	
}

var picker;
var form;


function updateToolsPreview(e) {

	colorR.value = (parseInt(colorR.value) ? colorR.value : 0);
	colorG.value = (parseInt(colorG.value) ? colorG.value : 0);
	colorB.value = (parseInt(colorB.value) ? colorB.value : 0);

	if (e) {
		pickerSetColor(colorR.value, colorG.value, colorB.value);
	}
}


function pickerCallback(r, g, b) {
	if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
	colorR.value = r;
	colorG.value = g;
	colorB.value = b;
	updateToolsPreview();		
	}}
	
function changePickerColor() {
	var r = parseInt(document.getElementById('colorR').value);
	var g = parseInt(document.getElementById('colorG').value);
	var b = parseInt(document.getElementById('colorB').value);
	console.log("hello");
	if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
		var colorString = "rgba(" + r + ", " + g + ", " + b + ',' + currentOpacity + ")"; 
		pickerSetColor(r, g, b);
		console.log(colorString);
	} 
}

var grType=document.getElementById("grad-gropdown").value;

function testColor() {

	if (document.getElementById('grad-gropdown').value=="Linear") {
	var divElement = document.getElementById('test2');
	var angle = colorObject.gradientRotation;
	var color = colorObject.colorPoints;
	var stepDistance = colorObject.xpPoints;

	var list = [];
	for (var j = 0; j < color.length; j++) 
    	list.push({'colors': color[j], 'stepDistances': stepDistance[j]});

	list.sort(function(a, b) {
    	return ((a.stepDistances < b.stepDistances) ? -1 : ((a.stepDistances == b.stepDistances) ? 0 : 1));
	});

	for (var k = 0; k < list.length; k++) {
   		color[k] = list[k].colors;
    	stepDistance[k] = list[k].stepDistances;
	}
	
	if (color.length<=2) {
		var gradientValue = 'linear-gradient(' + angle + 'deg, ' + color + ')';
	}
	else {
		var gradientValue = 'linear-gradient(' + angle + 'deg';
		for (var i = 0; i < stepDistance.length; i++) {
			const colorStop = `${color[i]}  ${stepDistance[i]}px`;
			gradientValue += `, ${colorStop}`;

		  }

		  gradientValue += ')';
	}

	divElement.style.background = gradientValue;

	}
	else if (document.getElementById('grad-gropdown').value=="Radial") {
	var divElement = document.getElementById('test2');
	var color = colorObject.colorPoints;
	var gradientValue = 'radial-gradient('+ 'circle, ' + color + ')';
	divElement.style.background = gradientValue;
	}
	else if (document.getElementById('grad-gropdown').value=="Angular") {
		var divElement = document.getElementById('test2');
		var color = colorObject.colorPoints;
		var gradientValue = 'conic-gradient(' + color + ')';
		divElement.style.background = gradientValue;
		}
}