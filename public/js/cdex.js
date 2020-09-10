window.socket = io()

document.addEventListener("DOMContentLoaded", () => new CadavreExquis)

class CadavreExquis {
	
	constructor() {
		this.part = "tete"
		this.paint = document.getElementById('canvas')
		this.context = this.paint.getContext('2d')
		this.rect = this.paint.getBoundingClientRect()
		this.hint()
		this.erase()
		this.shuffle()
		this.loadTemplate()
		this.listeners();
	}

	hint() {
		let msg = "partie: " + this.part
		var pe = document.querySelector(`[data-part="${this.part}"]`);
		const parts = [...document.querySelectorAll(`[data-part]`)]
		parts.map(p => p.classList.remove('active'))
		pe.classList.add('active')
	}

	loadTemplate() {
		var imageObj = new Image();
		imageObj.src = templates[this.part];
		imageObj.onload = () => {
			this.context.drawImage(imageObj, 0, 0);
		};

	}

	erase() {
		this.context.clearRect(0, 0, this.paint.width, this.paint.height)
		this.context.fillStyle = "white"
		this.context.fillRect(0, 0, this.paint.width, this.paint.height)
		this.loadTemplate()
	}

	bindClickEvent(e) {
		const action = e.currentTarget.getAttribute("data-action")
		if (typeof this[action] === "function") {
			this[action](e.currentTarget)
		}
	}

	shuffle() {
		window.socket.emit('shuffle')
	}

	save() {
		if (templates[this.part] === this.paint.toDataURL()) {
			alert('pas de dessin vide')
			return false;
		}
		window.socket.emit('save', {
			img: this.paint.toDataURL(), 
			part: this.part
		})
		this.erase();
	}

	switch(e) {
		const part = e.getAttribute("data-part")
		this.part = part
		this.hint()
		this.erase();
		this.loadTemplate();
	}

	fetchSingle(e) {
		window.socket.emit("fetchSingle", {part: e.getAttribute("data-part")})
	}

	buildCadavre(data) {
		document.querySelector("#result").innerHTML = "";
		var image1 = document.createElement("img");
		var image2 = document.createElement("img");
		var image3 = document.createElement("img");
		
		image1.setAttribute("data-part", "tete")
		image2.setAttribute("data-part", "corps")
		image3.setAttribute("data-part", "jambes")

		image1.classList.add("img-clickable")
		image2.classList.add("img-clickable")
		image3.classList.add("img-clickable")

		image1.classList.add("single-tete")
		image2.classList.add("single-corps")
		image3.classList.add("single-jambes")
		
		image1.src = data.part1[0].image;
		image2.src = data.part2[0].image;
		image3.src = data.part3[0].image;
		
		image1.style.width = "373px"
		image1.style.height = "280px"
		image2.style.width = "373px"
		image2.style.height = "280px"
		image3.style.width = "373px"
		image3.style.height = "280px"
		
		document.querySelector("#result").appendChild(image1)
		document.querySelector("#result").appendChild(image2)
		document.querySelector("#result").appendChild(image3)
	}

	buildPart(src, part) {
		document.querySelector(".single-" + part).src = src
	}

	listeners() {
		const actions = [...document.querySelectorAll("[data-action]")]
		actions.forEach(elem => {
			elem.addEventListener("click" , e => {
				this.bindClickEvent(e)
			})
		})

		window.socket.on("shuffle", (data) => {
			this.buildCadavre(data)
		})

		window.socket.on("fetchSingle", (data) => {
			this.buildPart(data.image.img[0].image, data.part)
		})

		document.addEventListener("keyup", e => {
			if (e.keyCode === 32) {
				this.shuffle()
			}
		})

		document.querySelector("#result").addEventListener("click", (e) => {
			this.fetchSingle(e.target)
		})
	}

}