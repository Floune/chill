require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 8000
const connexion = require('./connexion')
const bodyParser = require('body-parser');
const path = require('path')
var http = require('http').createServer(app);

var io = require('socket.io')(http);


app.use(express.json());
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: true }));
/*
app.get('/', (req, res) => {
	res.send('cadavre exquis')
})
//*/

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


app.listen(port, () => {
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

});