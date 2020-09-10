require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 8000
const favicon = require("serve-favicon")
const connexion = require('./connexion')
const axios = require("axios")
const bodyParser = require('body-parser')
const path = require('path')
var http = require('http').createServer(app);

var io = require('socket.io')(http);

app.use('/favicon.ico', express.static('favicon.ico'));
app.use(express.json())
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/shuffle', async (req, res) => {
	fetchParts(1, (part1) => {
		fetchParts(2, (part2) => {
			fetchParts(3, (part3) => {
				res.json({
					part1: part1,
					part2: part2,
					part3: part3,
				})
			})
		})
	})
	
})

app.post('/newdrawing', (req, res) => {
	saveDrawing(req)
})

app.get('/fetch', (req, res) => {
	connexion.query("SELECT * FROM images", (err, response, fields) => {
		console.log({err})
		res.send(response)
	});
})

app.post('/fetchSingle', async (req, res) => {
	fetchParts(req.body.part, (img) => {
		res.json({
			img
		})
	})
})

app.post('/delete', (req, res) => {
	deleteImage(req.body.id, (result) => {
		res.send(result)
	})
})

function saveDrawing(req) {
	connexion.query("INSERT INTO images (image, part ) VALUES ( ?, ?)", [req.body.img, req.body.part], function(error, results, fields) {
		if (error) throw error
		console.log(results)
	})
}


function fetchParts(part, cb) {
	connexion.query('SELECT image, part FROM images WHERE part = ? ORDER BY RAND() LIMIT 1', [part], (error, result, fields) => {
		if (error) throw error

		cb(result)
	})
}

function deleteImage(id, cb) {
	connexion.query('DELETE FROM images WHERE id = ?', [id.id], (error, resutl, fieds) => {
		if (error) throw error

		cb(resutl)
	})
}



http.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

io.on('connection', (socket) => {
	console.log('a user connected')

	socket.on('shuffle', () => {
		//fetch data url
		axios.get(`http://localhost:${port}/shuffle`).then(response => {
			socket.emit("shuffle", response.data)
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
		axios.get(`http://localhost:${port}/fetch`).then(response => {
			io.emit("fetch", response.data)
		}).catch(e => {
			console.log(e)
		})
	})

	socket.on("fetchSingle", (data) => {
		let part = "";
		if (data.part === "tete") { part = 1}
		if (data.part === "corps") { part = 2}
		if (data.part === "jambes") { part = 3}
		axios.post(`http://localhost:${port}/fetchsingle`, {
			part: part,
		}).then(response => {
			io.emit("fetchSingle", {
				image: response.data,
				part: data.part,
			})
		}).catch(e => {
			console.log(e)
		})
	})

	socket.on("delete", id => {
		axios.post(`http://localhost:${port}/delete`, {id: id})
	})
});