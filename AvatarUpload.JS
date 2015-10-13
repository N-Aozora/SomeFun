//JavaScript

function getFileImg(fileBtn,viewbox){
	var fileBtn=document.getElementById(fileBtn);
	var viewbox=document.getElementById(viewbox);
	var Img;	//存放载入的图片
	var canvas;
	var ctx;
	var centerPoint={x:null,y:null};	//画布中心点
	var r=null;		//编辑区域半径
	//编辑区域4个边角点坐标
	var cornerpoint={leftTop:{x:null,y:null},rightTop:{x:null,y:null},leftBottom:{x:null,y:null},rightBottom:{x:null,y:null}};	

	fileBtn.onchange=function(e){
		var e=e||window.event;
		processFiles(this.files);
	}

	viewbox.ondragenter=function(e){
		var e=e||window.event;
		e.stopPropagation();
		e.preventDefault();
	}
	viewbox.ondragover=function(e){
		var e=e||window.event;
		e.stopPropagation();
		e.preventDefault();
	}
	viewbox.ondrop=function(e){
		var e=e||window.event;
		e.stopPropagation();
		e.preventDefault();
		processFiles(e.dataTransfer.files);
	}

	function processFiles(files){
		var file=files[0];
		var reader=new FileReader();
		reader.onload=function(e){
			var e=e||window.event;
			Img=new Image();
			Img.src=e.target.result;
			Img.onload=function(){
				createCanvas(Img)
			}
		}
		reader.readAsDataURL(file);
	}

	//创建canvas
	function createCanvas(Img){
		if(!viewbox.getElementsByTagName("canvas")[0]){
			canvas=document.createElement("canvas");
			ctx=canvas.getContext("2d");
			viewbox.appendChild(canvas);
		}
		setCanvas(Img.width,Img.height);
		centerPoint.x=canvas.width/2;
		centerPoint.y=canvas.height/2;
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.drawImage(Img,0,0,canvas.width,canvas.height);
		mask();
		fillOuterContour();
		fillOuterPoint();
		fillClipArcImg(centerPoint.x,centerPoint.y,r);
		fillDashed(centerPoint.x-r,centerPoint.y-r/3,centerPoint.x+r,centerPoint.y-r/3,3,1);
		fillDashed(centerPoint.x-r,centerPoint.y+r/3,centerPoint.x+r,centerPoint.y+r/3,3,1);
		fillDashed(centerPoint.x-r/3,centerPoint.y-r,centerPoint.x-r/3,centerPoint.y+r,3,1);
		fillDashed(centerPoint.x+r/3,centerPoint.y-r,centerPoint.x+r/3,centerPoint.y+r,3,1);
		fillArcDashed(centerPoint.x,centerPoint.y,r,3,1);
	}

	//根据图片设置canvas和宽高和垂直居中
	function setCanvas(imgWidth,imgHeight){
		var max=Math.max(imgWidth,imgHeight);
		var boxW=parseInt(getStyle(viewbox,"width"));
		var boxH=parseInt(getStyle(viewbox,"height"));	
		if(max==imgWidth){
			canvas.width=max<boxW?max:boxW;
			canvas.height=imgHeight/(max/canvas.width);
		}else{
			canvas.height=max<boxH?max:boxH;
			canvas.width=imgWidth/(max/canvas.height);
		}
		viewbox.style.position="relative";
		canvas.style.position="absolute";
		canvas.style.top="50%";
		canvas.style.marginTop=-canvas.height/2+"px";
		canvas.style.left="50%";
		canvas.style.marginLeft=-canvas.width/2+"px";
	}

	//获取最终应用在元素身上的样式
	function getStyle(element,cssName){
		return window.getComputedStyle?getComputedStyle(element)[cssName]:element.currentStyle[cssName];
	}

	//绘制编辑区域外轮廓
	function fillOuterContour(){
		r=Math.round(Math.min(canvas.width,canvas.height)*8/10/2);		//初始半径为canvas最小边的80%的一半
		var x=centerPoint.x;	//中心点x坐标
		var y=centerPoint.y;	//中心点y坐标
		cornerpoint.leftTop.x=x-r;
		cornerpoint.leftTop.y=y-r;
		cornerpoint.rightTop.x=x+r;
		cornerpoint.rightTop.y=y-r;
		cornerpoint.leftBottom.x=x-r;
		cornerpoint.leftBottom.y=y+r;
		cornerpoint.rightBottom.x=x+r;
		cornerpoint.rightBottom.y=y+r;
		ctx.lineWidth=1;
		ctx.strokeStyle="#0A7CCA";
		ctx.strokeRect(cornerpoint.leftTop.x,cornerpoint.leftTop.y,cornerpoint.rightBottom.x-cornerpoint.leftTop.x,cornerpoint.rightBottom.y-cornerpoint.leftTop.y)
	}

	//绘制编辑区域边角点
	function fillOuterPoint(){
		var _x=0;
		var _y=0;
		for(var i in cornerpoint){
			if(cornerpoint.hasOwnProperty(i)){
				switch(i){
					case "leftTop" :
						_x=cornerpoint[i].x+r;
						_y=cornerpoint[i].y;
						break;
					case "rightTop" :
						_y=cornerpoint[i].y+r;
						_x=cornerpoint[i].x;
						break;
					case "leftBottom" :
						_y=cornerpoint[i].y-r;
						_x=cornerpoint[i].x
						break;
					case "rightBottom" :
						_x=cornerpoint[i].x-r;
						_y=cornerpoint[i].y;
						break;
				}
				ctx.fillStyle="#0A7CCA";
				ctx.fillRect(cornerpoint[i].x-2,cornerpoint[i].y-2,4,4);
				ctx.fillRect(_x-2,_y-2,4,4);
			}
		}
	}

	//绘制虚线
	function fillDashed(x1,y1,x2,y2,spaceWidth,lineWidth){
		ctx.strokeStyle="#ffffff";
		ctx.lineWidth=lineWidth;
		var _x=x2-x1;
		var _y=y2-y1;
		var n=Math.floor(Math.sqrt(_x*_x+_y*_y)/spaceWidth);
		for(var i=0;i<n;i++){
			if(i%2!=0){
				ctx.beginPath();
				ctx.moveTo(x1+i*(_x/n),y1+i*(_y/n));
				ctx.lineTo(x1+(i+1)*(_x/n),y1+(i+1)*(_y/n));
				ctx.stroke();
				ctx.closePath();
			}
		}
	}

	//绘制圆形虚线
	function fillArcDashed(x,y,r,spaceWidth,lineWidth){
		var n=2*r*Math.PI/spaceWidth;
		ctx.lineWidth=lineWidth;
		for(var i=0;i<n;i++){
			if(i%2!=0){
				ctx.beginPath();
				ctx.arc(x,y,r,i/n*2*Math.PI,(i+1)/n*2*Math.PI);
				ctx.stroke();
				ctx.closePath();
			}
		}
	}

	//绘制遮罩阴影层
	function mask(){
		ctx.save();
		ctx.fillStyle="#000";
		ctx.globalAlpha=0.4;
		ctx.fillRect(0,0,canvas.width,canvas.height)
		ctx.restore();
	}

	//因为覆盖了一层半透明遮罩，用剪切区域重新绘制图形将中间的圆形区域露出来
	function fillClipArcImg(x,y,r){
		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle="transparent";
		ctx.arc(x,y,r,0,2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		ctx.clip();
		ctx.drawImage(Img,0,0,canvas.width,canvas.height);
		ctx.restore();
	}
}

