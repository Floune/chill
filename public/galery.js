window.socket = io()
window.socket.on("fetch", (data) => {
	generateGalerie(data)
})

function generateGalerie(images) {
	images.forEach(img => {
		const template = `<div class="image-container relative">
		<img class="mehdi" src="${img.image}"/>
		<button class="btn-delete bg-red-800 p-4 rounded-full absolute" data-id-image="${img.id}">delete</button>
		</div>`;
		document.querySelector("#galerie").insertAdjacentHTML("afterbegin",template)
		
	})
	const allButtonDelete = document.querySelectorAll(".btn-delete")

	allButtonDelete.forEach(button => {
		button.addEventListener("click", function(e) {
			deleteImage(e.target.getAttribute("data-id-image"))
			window.location.reload()
		});	
	})

}

function deleteImage(id) {
	console.log(id);
	window.socket.emit("delete", {id: id})
}

