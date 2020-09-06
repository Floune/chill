require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 8000
const connexion = require('./connexion')
const axios = require("axios")
const bodyParser = require('body-parser');
const path = require('path')
var http = require('http').createServer(app);

var io = require('socket.io')(http);


app.use(express.json());
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/shuffle', async (req, res) => {
	const part1 = fetchParts(1)
	const part2 = fetchParts(2)
	const part3 = fetchParts(3)
	res.json({
		part1: part1,
		part2: part2,
		part3: part3,
	})
})

app.post('/newdrawing', (req, res) => {
	saveDrawing(req);
})

app.get('/fetch', (req, res) => {
	const response = connexion.query("SELECT * FROM images");
	res.send(response);
})

app.post('/delete', (req, res) => {
	res.send(deleteImage(req.body.id))
})


function saveDrawing(req) {
	connexion.query("INSERT INTO images (image, part ) VALUES ( ?, ?)", [req.body.img, req.body.part], function(error, results, fields) {
		if (error) throw error;
		console.log(results);
	})
}


function fetchParts(part) {
	const response = connexion.query('SELECT image, part FROM images WHERE part = ? ORDER BY RAND() LIMIT 1', [part]);
	return response;
}

function deleteImage(id) {
	const response = connexion.query('DELETE FROM images WHERE id = ?', [id.id]);
	return response;
}


http.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

io.on('connection', (socket) => {
	console.log('a user connected');

	socket.on('shuffle', () => {
		//fetch data url
		axios.get(`http://localhost:${port}/shuffle`).then(response => {
			io.emit("shuffle", response.data)
		}).catch(e => {
			console.log(e.response)
		})
	})

	socket.on("save", (data) => {
		let part = "";
		if (data.part === "tete") { part = 1}
			if (data.part === "corps") { part = 2}
				if (data.part === "jambes") { part = 3}

					axios.post(`http://localhost:${port}/newdrawing`, {
						part: part,
						img: data.img
					}).then(res => {
						console.log(response)
					}).catch(e => {
						console.log(e)
					})
				})

	socket.on("fetch", () => {
		console.log(process.env.SERVER)
		axios.get(`http://localhost:${port}/fetch`).then(response => {
			io.emit("fetch", response.data)
		}).catch(e => {
			console.log("prout")
		})
	})

	socket.on("delete", id => {
		axios.post(`http://${process.env.SERVER}:${port}/delete`, {id: id})
	})


});