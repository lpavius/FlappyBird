const cvs = document.getElementById("bird");
/** Pour retourner les methodes et le proprietes
* qui nous autoriserons a dessiner dans le canvas.*/
const ctx = cvs.getContext("2d");
let frames = 0;

/* Pour charger l'image */
const sprite = new Image();
sprite.src = "images/sprite.png";

// Game State
const state = {
	current: 0,
	getReady: 0,
	game: 1,
	over: 2
}

// Controler le jeu
cvs.addEventListener("click", function(evt) {
	switch(state.current) {
		case state.getReady:
			state.current = state.game;
			break;
		case state.game:
			bird.flap();
			break;
		case state.over:
			state.current = state.getReady;
			break;
	}
})

/* Background Object*/
const bg = {
	sX: 0, //position x image
	sY: 0, //position y image 
	w: 275, // width de l'image source
	h: 226, // height de l'image source
	x: 0, //position destination x du canvas 
	y: cvs.height - 226, //position destination y du canvas

	draw: function() {
		ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
		ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
	}
}

// Foreground Object
const fg = {
	sX: 276, //position x image
	sY: 0, //position y image 
	w: 224, // width de l'image source
	h: 112, // height de l'image source
	x: 0, //position destination x du canvas 
	y: cvs.height - 112, //position destination y du canvas

	dx: 2,

	draw: function() {
		ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
		ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
	},

	update: function() {
		if(state.current === state.game) {
			this.x = (this.x - this.dx) % (this.w/2);
		}
	}
}

// Bird Object
const bird = {
	animation: [
		{sX: 276 , sY: 112},
		{sX: 276 , sY: 139},
		{sX: 276, sY: 164}
	],
	x: 50,
	y: 150,
	w: 34,
	h: 26,

	speed: 0,
	gravity: 0.25,
	jump: 4.6,
	radius: 12,
	frame: 0,

	draw: function() {
		let bird = this.animation[this.frame]

		ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, this.x - this.w/2, this.y - this.h/2, this.w, this.h);
	},

	flap: function() {
		this.speed = -this.jump;
	},

	update: function() {
		// Si le jeux est en Get Ready state, l'oiseau doit voler lentement
		this.period = state.current === state.getReady ? 10 : 5;
		// On incremente la variable frame de 1, chaque pèriode
		this.frame += (frames % this.period === 0) ? 1 : 0;
		// La variable frame va de 0 à 4 et alors encore à 0
		this.frame %= this.animation.length;

		if(state.current === state.getReady) {
			this.y = 150 + 5*Math.cos(frames/10);
		} else {
			this.speed += this.gravity;
			this.y += this.speed;
			console.log(this.y);
			if(this.y + this.h/2 >= cvs.height - fg.h) {
				this.y = cvs.height - fg.h - this.h/2;
				this.frame = 2;
				if(state.current === state.game) {
					state.current = state.over;
				}
			}
		}

	}
}

// Pipes
const pipes = {
	position: [],
	bottom: {sX: 502, sY: 0},
	top: {sX: 553, sY: 0},
	w: 53,
	h: 400,
	gap: 85,
	maxPos: -150,
	dx: 2,

	draw: function() {
		for(let i = 0; i < this.position.length; i++) {
			let p = this.position[i];

			let topYPos = p.y;
			let bottomYPos = p.y + this.gap + this.h;
			// Top pipe
			ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);
			// Bottom pipe
			ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
		}
	},

	update: function() {
		if(state.current !== state.game)
			return;

		if(frames % 100 === 0) {
			this.position.push({x: cvs.width,
								y: this.maxPos * (Math.random() + 1)});
		}
		for(let i = 0; i < this.position.length; i++) {
			let p = this.position[i];

			p.x -= this.dx;
			let bottomPipeYPos = p.x + this.h + this.gap;

			// Collision
			// Top Pipe
			if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x - this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y - this.h) {
				state.current = state.over;
			}
			// Si le pipe va au-dela du canvas, on le retire du tableau
			if(p.x + this.w <= 0) {
				this.position.shift();
				// score.value += 1;
			}
		}
	}
}


// objet Départ
const getReady = {
	sX: 0, //position x image
	sY: 228, //position y image 
	w: 173, // width de l'image source
	h: 152, // height de l'image source
	x: cvs.width/2 - 173/2, //position destination x du canvas 
	y: 80, //position destination y du canvas

	draw: function() {
		if (state.current === state.getReady) {
			ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
		}	
	}
}

// Game Over
const gameOver = {
	sX: 175, //position x image
	sY: 228, //position y image 
	w: 225, // width de l'image source
	h: 202, // height de l'image source
	x: cvs.width/2 - 225/2, //position destination x du canvas 
	y: 90, //position destination y du canvas

	draw: function() {
		if(state.current === state.over) {
			ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
		}	
	}
}

/* Gère tous les dessins du canvas */
function draw() {
	ctx.fillStyle = "#70c5ce";
	ctx.fillRect(0, 0, cvs.width, cvs.height);

	bg.draw();
	pipes.draw();
	fg.draw();
	bird.draw();
	getReady.draw();
	gameOver.draw();

}

function update() {
	bird.update();
	fg.update();
	pipes.update();
}

/* pour mettre a jour le jeux à chaque seconde*/
function loop(){
	update();//met a jour le jeux comme la position des images
	draw();
	frames++;
	requestAnimationFrame(loop);
}

loop();
