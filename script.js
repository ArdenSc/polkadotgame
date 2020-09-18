const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

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
		)
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
let player = undefined;

const random = (min, max) => {
	return Math.floor(Math.random() * (max - min)) + min;
}

function setup() {
	objects = []
	while (objects.length < 50) {
		objects.push(Drawable.default());
	}
	player = Drawable.player();
	requestAnimationFrame(draw);
}

function draw() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	objects.forEach((object) => object.update());
	objects = objects.filter((object) => {
		if (object.x + object.r < -200) return false;
		else if (object.x - object.r > canvas.clientWidth + 200) return false;
		if (object.y + object.r < -200) return false;
		else if (object.y - object.r > canvas.clientHeight+ 200) return false;
		return true;
	})
	objects = objects.filter((object) => {
		if (Math.sqrt((object.x - player.x) ** 2 + (object.y - player.y) ** 2) < player.r + object.r) {
			if (player.r > object.r) {
				player.r += 2;
				return false;
			}
		}
		return true;
	})
	while (objects.length < 50) {
		objects.push(Drawable.offScreen());
	}
	objects.forEach((object) => object.render());
	player.render();
	requestAnimationFrame(draw);
}

canvas.addEventListener('mousemove', (event) => {
	const mousePosition = ((event) => {
		const rect = canvas.getBoundingClientRect();
		return {
			x: event.offsetX - rect.left,
			y: event.offsetY - rect.top,
		}
	})(event);
	player.x = mousePosition.x + player.r / 2;
	player.y = mousePosition.y + player.r / 2;
});

setup();