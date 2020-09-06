document.addEventListener('DOMContentLoaded', () => new PainterBite)

class PainterBite {
	
	constructor() {
		this.shape = "trait"
		this.isFilling = false
		this.isDrawing = false
		this.lineWidth = 3
		this.x = 0
		this.y = 0
		this.paint = document.getElementById('canvas')
		this.context = this.paint.getContext('2d')
		this.color = "black"
		this.rect = this.paint.getBoundingClientRect()
		this.erase()
		this.listeners()
	}


	drawLine(drawInfos) {
		this.context.beginPath()
		this.context.strokeStyle = drawInfos.color
		this.context.lineWidth = drawInfos.width
		this.putShape(drawInfos)
		this.context.stroke()
		this.context.closePath()
	}

	putShape(drawInfos) {
		if (drawInfos.shape === "rond") {
			this.context.arc(drawInfos.x1, drawInfos.y1, 7.5, 0, Math.PI * 2, false)
			this.context.fillStyle = this.color
			this.context.fill()
		}
		if (drawInfos.shape === "trait") {
			this.context.moveTo(drawInfos.x1, drawInfos.y1)
			this.context.lineTo(drawInfos.x2, drawInfos.y2)
		}
		if (drawInfos.shape === "triangle") {
			this.context.moveTo(drawInfos.x1, drawInfos.y1)
			this.context.lineTo(drawInfos.x1 + 10, drawInfos.y1 + 20)
			this.context.lineTo(drawInfos.x1 + 20, drawInfos.y1)
			this.context.lineTo(drawInfos.x1, drawInfos.y1)
		}
	}

	erase() {
		this.context.clearRect(0, 0, this.paint.width, this.paint.height)
		this.context.fillStyle = "white"
		this.context.fillRect(0, 0, this.paint.width, this.paint.height)
	}


	setColor(e)  {
		this.color = e.getAttribute("data-color")
	}

	startDrawing(e) {
		this.x = e.clientX - this.rect.left
		this.y = e.clientY - this.rect.top
		this.isDrawing = true;
	}

	stopDrawing(e) {
		if (this.isDrawing) {
			this.x = 0
			this.y = 0
			this.isDrawing = false
		}
	}


	handleMove(e) {
		var drawInfos = {
			x1: this.x,
			y1: this.y,
			x2: e.clientX - this.rect.left,
			y2: e.clientY - this.rect.top,
			color: this.color,
			width: this.lineWidth,
			shape: this.shape,
		}
		if (this.isDrawing) {
			this.drawLine(drawInfos);
			this.x = e.clientX - this.rect.left;
			this.y = e.clientY - this.rect.top;
		}
	}

	setShape(e) {
		this.shape = e.getAttribute("data-shape")
	}

	startFill(e) {
		this.isFilling = true;
		this.paint.style.cursor = "crosshair"
	}

	fill(e) {
		this.context.fillStyle = this.color
		this.context.fillFlood(e.clientX - this.rect.left, e.clientY - this.rect.top)
		this.isFilling = false;
		this.paint.style.cursor = "pointer"
	}

	bindClickButtons(e) {
		const action = e.currentTarget.getAttribute("data-action")
		if (typeof this[action] === "function") {
			this[action](e.currentTarget)
		}
	}

	checkInCanvas(e) {
		return e.clientX - this.rect.left >= 1 && e.clientY - this.rect.top >= 1 && e.clientX - this.rect.left <= this.paint.width && e.clientY - this.rect.top <= this.paint.height
	}


	listeners() {

		const actions = [...document.querySelectorAll("[data-action]")]

		actions.forEach(elem => {
			elem.addEventListener("click", e => {
				this.bindClickButtons(e)
			})
		})

		this.paint.addEventListener('mousedown', e => {
			if (this.isFilling) {
				this.fill(e)
			} else {
				this.startDrawing(e)
			}
		});

		this.paint.addEventListener('mousemove', e => {
			this.handleMove(e)
		});

		this.paint.addEventListener('mouseup', e => {
			this.handleMove(e)
			this.stopDrawing(e)
		});

	}

}