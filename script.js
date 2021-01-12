const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const FRAMERATE = 144;
const FRAMETIME = 1000 / FRAMERATE;

const CIRCLE_COLORS = [
	"#3C5764", "#E45F5F",
	"#4ECDC4", "#45B7AF",
	"#B2DA59", "#C7F464",
];
const PLAYER_COLOR = "#FFFFFF";
const BACKGROUND_COLOR = "#EAEAEA";

const SPEED = 1;

class Drawable {
	static default() {
		return new Drawable(
			random(0, canvas.clientWidth),
			random(0, canvas.clientHeight),
			random(5, 50),
			random(0, 2 * Math.PI),
			CIRCLE_COLORS[ random(0, CIRCLE_COLORS.length) ],
		);
	}

	static offScreen() {
		return new Drawable(
			random(0, 100) >= 50
				? random(-100, -50)
				: random(canvas.clientWidth + 50, canvas.clientWidth + 100),
			random(-100, canvas.clientHeight + 100),
			random(5, 50),
			random(0, 2 * Math.PI),
			CIRCLE_COLORS[ random(0, CIRCLE_COLORS.length) ],
		);
	}

	static player() {
		return new Drawable(
			canvas.clientWidth / 2,
			canvas.clientHeight / 2,
			10,
			0,
			PLAYER_COLOR,
			true,
			false,
		);
	}

	constructor(x, y, r, d, color, shadow = false, movement = true) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.vx = SPEED * Math.cos(d);
		this.vy = SPEED * Math.sin(d);
		if (!movement) {
			this.vx = 0;
			this.vy = 0;
		}
		this.color = color;
		this.shadow = shadow;
	}

	render() {
		ctx.save();
		ctx.beginPath();
		if (this.shadow) {
			ctx.shadowOffsetX = 2;
			ctx.shadowOffsetX = 2;
			ctx.shadowColor = "#CCC";
			ctx.shadowBlur = 1;
		}
		ctx.fillStyle = this.color;
		ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.restore();
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
	player.r = 10;
	canvas.style.cursor = 'auto';
}

function drawBackground() {
	ctx.fillStyle = BACKGROUND_COLOR;
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
	switch (state) {
		case 'playing':
			ctx.save();
			ctx.fillStyle = "#FFFFFF";
			ctx.textAlign = "right";
			ctx.textBaseline = "top";
			ctx.font = "bold 128px Arial";
			ctx.shadowOffsetX = 2;
			ctx.shadowOffsetX = 2;
			ctx.shadowColor = "#CCC";
			ctx.shadowBlur = 1;
			ctx.fillText(player.r - 10, canvas.clientWidth - 24, 24);
			ctx.restore();
			break;

		case 'stopped':
			ctx.save();
			ctx.fillStyle = "#FFFFFF";
			ctx.textAlign = "center";
			ctx.font = "96px Clicker Script";
			ctx.shadowOffsetX = 2;
			ctx.shadowOffsetX = 2;
			ctx.shadowColor = "#CCC";
			ctx.shadowBlur = 1;
			ctx.fillText("Click to start", canvas.clientWidth / 2, canvas.clientHeight / 2);
			ctx.restore();
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
					player.r++;
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

canvas.addEventListener('mousedown', () => {
	if (state === "stopped") state = "playing";
	canvas.style.cursor = 'none';
});

reset();
main();
