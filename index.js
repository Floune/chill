require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 8000
const connexion = require('./connexion')
const bodyParser = require('body-parser');
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
	res.send('cadavre exquis')
})

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
	connexion.query("SELECT  FROM images WHERE 1", [req.body.img], function(error, results, fields);
	res.send(response);
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
