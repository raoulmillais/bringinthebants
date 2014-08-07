// $(function(){
console.log("sup");
	var mediaElement;
	var playing = false;
	var playedOnce = false;

	MediaElement('cats', {
		//pluginPath: '/static/mediaelement/',
                pluginPath: '/lib/',
		success: function(me) {
console.log("loaded");
			mediaElement = me;
console.log(me);
			console.log(me.play());
			me.addEventListener('timeupdate', function(time) {
				if (me.currentTime > 29 && playing == false){
					// Trigger start
					playing = true;
				}
				else if (me.currentTime < 30 && playing == true) {
					playing = false;
					playedOnce = true;
					$("myCanvas").css("background-color","#fff");
				}
				else if (playing == false)
					$("myCanvas").css("background-color","#fff");
			});
		}
	});

	var cats = [];
	var possibleCats = ["cat1", "cat2", "cat3"];

	var BackgroundManager = Base.extend({
		initialize: function() {
			this.stateTime = 0;
console.log("backgroundmanager initied");
		},
		update: function(delta) {
console.log("backgroundmanager update");
			this.stateTime += delta;
			if (this.stateTime > 0.1) {
				var hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
				$("#myCanvas").css("background-color",hue);
				this.stateTime = 0;
			}
		}
	});

	var Cat = Base.extend({
		initialize: function(stageWidth, stageHeight, time, rotateFactor) {
console.log("cat initied");
			var p1 = new Point(0, stageHeight);
			var p2 = new Point(time/2, 0);
			var p3 = new Point(time, stageHeight);
			// Create the
			this.a = (p3.x * (-p1.y + p2.y) + p2.x * (p1.y - p3.y) + p1.x * (-p2.y + p3.y)) / ((p1.x - p2.x) * (p1.x - p3.x) * (p2.x - p3.x));
			this.b = (p3.x * p3.x * (p1.y - p2.y) + p1.x * p1.x * (p2.y - p3.y) + p2.x + p2.x * (-p1.y + p3.y)) / ((p1.x - p2.x) * (p1.x - p3.x) * (p2.x - p3.x));
			this.c = (p3.x * ( p2.x * (p2.x - p3.x) * p1.y + p1.x * (-p1.x + p3.x) * p2.y) + p1.x * (p1.x - p2.x) * p2.x * p3.y) / ((p1.x - p2.x) * (p1.x - p3.x) * (p2.x - p3.x));
			this.rotateFactor = rotateFactor;
			this.endX = stageWidth / 2;
			var catId = possibleCats[Math.floor(Math.random()*possibleCats.length)];
			this.cat = new Raster(catId);
			this.cat.position = p1;
			this.stateTime = 0;
			this.totalTime = time;
			this.endPoint = p3;
			this.isAlive = true;
		},
		update: function(delta) {
console.log("cat update");
			if (this.isAlive) {
				this.stateTime += delta;

				this.cat.position.y = this.a * this.stateTime * this.stateTime + this.b * this.stateTime + this.c;

				this.cat.position.x = this.stateTime/this.totalTime * this.endX;

				this.cat.rotate(delta * this.rotateFactor);

				if (this.stateTime > this.totalTime + 1) {
					this.cat.remove();
					this.isAlive = false;
				}
			}
		}
	});

	var TextManager = Base.extend({
		initialize: function() {
			this.stateTime = 0;
			this.text = new PointText(view.center);
			this.text.paragraphStyle.justification = 'center';
			this.text.characterStyle.fontSize = 15;
			this.text.characterStyle.font = 'monospace';
			this.text.fillColor = 'black';
		},
		update: function(delta, playing) {
			this.stateTime += delta;
			if (!playing) {
				if (playedOnce)
					this.text.content = "Please wait, reloading more bants";
				else
					this.text.content = "Please wait, loading bants";
				if (Math.floor(this.stateTime % 1.5) == 0) {
					// this.text.content = "Please wait, loading cats";
					this.text.characterStyle.fontSize = 15;
				}
				else {
					// this.text.content = "P l e a s e   w a i t ,   l o a d i n g   c a t s";
					this.text.characterStyle.fontSize = 17;
				}
			}
			else {
				this.text.content = "";
			}
		}
	});

	var CatEmitter = Base.extend({
		initialize: function(rate) {
			this.rate = rate;
			this.lastEmit = 0;
			this.stateTime = 0;
		},
		update: function(delta) {
			this.stateTime += delta;
			if (this.lastEmit + this.rate < this.stateTime) {
				// Emit a cat
				var randomX = (Math.random() * view.size.width / 1) - (view.size.width / 1 / 2);
				var randomY = (Math.random() * view.size.height / 1) - (view.size.height / 1 / 2);
				var randomRotate = Math.random() * 200 - 100;
				cats.push(new Cat(view.size.width + randomX, view.size.height + randomY, 2, randomRotate));
				this.lastEmit = this.stateTime;
			}
		},
		clear: function() {
			var i;
			for (i = 0; i < cats.length; i++) {
				cats[i].remove();
			}
		}
	});

	var catEmitter = new CatEmitter(0.15);
	var backgroundManager = new BackgroundManager();
	var textManager = new TextManager();

	function onFrame(event) {
		if (playing)
		{
			backgroundManager.update(event.delta);
			catEmitter.update(event.delta);
			// Clean up dead cats
			for (var i = 0; i < cats.length; i++) {
				if (cats[i].isAlive == false) {
					cats.splice(i, 1);
				}
				else {
					cats[i].update(event.delta);
				}
			}
		}
		else {// Clean up dead cats
			for (var i = 0; i < cats.length; i++) {
				if (cats[i].isAlive == false) {
					cats.splice(i, 1);
				}
				else {
					cats[i].update(event.delta);
				}
			}
		}
		textManager.update(event.delta, playing);
	}
// });
