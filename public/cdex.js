window.socket = io()

document.addEventListener("DOMContentLoaded", () => new CadavreExquis)

class CadavreExquis {
	
	constructor() {
		this.part = "tete"
		this.paint = document.getElementById('canvas')
		this.context = this.paint.getContext('2d')
		this.rect = this.paint.getBoundingClientRect()
		this.hint()
		this.loadTemplate()
		this.listeners();
	}

	hint() {
		let msg = "Vous dessinez actiellement la " + this.part
		var pe = document.querySelector("#hint");
		pe.innerHTML = msg;
	}

	loadTemplate() {
		this.erase()
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
		console.log("prout")
		window.socket.emit('save', {
			img: this.paint.toDataURL(), 
			part: this.part
		})
		this.erase();
	}

	switch(e) {
		this.part = e.getAttribute("data-part")
		this.hint()
		this.erase();
		this.loadTemplate();
	}

	buildCadavre(data) {
		document.querySelector("#result").innerHTML = "";
		var image1 = document.createElement("img");
		var image2 = document.createElement("img");
		var image3 = document.createElement("img");
		image1.src = data.part1[0].image;
		image2.src = data.part2[0].image;
		image3.src = data.part3[0].image;
		document.querySelector("#result").appendChild(image1)
		document.querySelector("#result").appendChild(image2)
		document.querySelector("#result").appendChild(image3)

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
	}

}