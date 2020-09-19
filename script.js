const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const FRAMERATE = 60;
const FRAMETIME = 1000 / FRAMERATE;

class Drawable {
	static default() {
		return new Drawable(
			random(0, canvas.clientWidth),
			random(0, canvas.clientHeight),
			random(5, 50),
			random(0, 100) >= 50
				? random(-4, -1)
				: random(1, 4),
			random(0, 100) >= 50
				? random(-4, -1)
				: random(1, 4),
			"white"
		);
	}

	static offScreen() {
		return new Drawable(
			random(0, 100) >= 50
				? random(-100, -50)
				: random(canvas.clientWidth + 50, canvas.clientWidth + 100),
			random(-100, canvas.clientHeight + 100),
			random(5, 50),
			random(0, 100) >= 50
				? random(-4, -1)
				: random(1, 4),
			random(0, 100) >= 50
				? random(-4, -1)
				: random(1, 4),
			"white"
		);
	}

	static player() {
		return new Drawable(
			canvas.clientWidth / 2,
			canvas.clientHeight / 2,
			10,
			0,
			0,
			"blue"
		);
	}

	constructor(x, y, r, vx, vy, color) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.vx = vx;
		this.vy = vy;
		this.color = color;
	}

	render() {
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
		ctx.fill();
	}

	update() {
		this.x += this.vx;
		this.y += this.vy;
	}
}

let objects = [];
let player = Drawable.player();

const random = (min, max) => {
	return Math.floor(Math.random() * (max - min)) + min;
};

function reset() {
	objects = [];
	while (objects.length < 50) {
		objects.push(Drawable.default());
	}
}

function drawBackground() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}

function drawPlayer() {
	player.render();
}

function drawCircles() {
	objects.forEach((object) => object.render());
}

let dt = 0;

function update(delta) {
	dt += delta;
	while (dt > FRAMETIME) {
		if (state === "playing") updateCircles();
		updatePlayer();
		dt -= FRAMETIME;
	}
}

function updateCircles() {
	objects.forEach((object) => object.update());
	objects = objects.filter((object) => {
		if (object.x + object.r < -200) return false;
		else if (object.x - object.r > canvas.clientWidth + 200) return false;
		if (object.y + object.r < -200) return false;
		else if (object.y - object.r > canvas.clientHeight + 200) return false;
		return true;
	});
	while (objects.length < 50) {
		objects.push(Drawable.offScreen());
	}
}

let mouse = {
	x: canvas.clientWidth / 2,
	y: canvas.clientHeight / 2,
};

function updatePlayer() {
	player.x = mouse.x + player.r / 2;
	player.y = mouse.y + player.r / 2;
}

function draw() {
	drawBackground();
	drawCircles();
	drawPlayer();
	if (state === "stopped") {
		ctx.fillStyle = "blue";
		ctx.font = "60px Arial";
		ctx.fillText("Click to start", canvas.clientWidth / 2, canvas.clientHeight / 2);
	}
}

let previousTime = Date.now();
let state = "stopped";

function main() {
	const now = Date.now();
	const delta = now - previousTime;
	previousTime = now;
	update(delta);
	if (state === "playing") {
		objects = objects.filter((object) => {
			if (Math.sqrt((object.x - player.x) ** 2 + (object.y - player.y) ** 2) < player.r + object.r) {
				if (player.r > object.r) {
					player.r += 2;
					return false;
				}
				state = "stopped";
				reset();
			}
			return true;
		});
		if (state === "stopped") reset();
	}
	draw();
	requestAnimationFrame(main);
}

canvas.addEventListener('mousemove', (event) => {
	const rect = canvas.getBoundingClientRect();
	mouse = {
		x: event.offsetX - rect.left,
		y: event.offsetY - rect.top,
	};
});

canvas.addEventListener('mousedown', () => { if (state === "stopped") state = "playing"; });

reset();
main();
