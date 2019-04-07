const express = require('express');
const bodyParser = require('body-parser');
const ethutils = require('./ethutils');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const port = config.serverPort;

app.post('/execute_exchange', async (req, res) => {
    const tradeData = req.body;
    console.log('request is: ', tradeData);

    try {
        const result = await ethutils.executeExchange(tradeData);
        console.log('send result is: ', result);
        res.json({message: 'ok'})
    } catch(ex) {
        console.log('error on processing request', ex)
        res.status(500).json({message: "could not execute req, check server logs"});
    }
})

app.listen(port, () => console.log('server is listening on ' + port))