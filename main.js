const express = require('express');
const bodyParser = require('body-parser');
const anyDb = require('./anyDB');

let client;
const init = async () => {
    try {
        client = await anyDb();
        return;
    }
    catch(err) {
        console.log(err);
    }
};

const app = express();

app.use(bodyParser.json());

app.post('/query', async (req, res, next) => {
    try {
        const body = req.body;
        const result = await client.query(body.query);
        res.json(result);
    }
    catch(err) {
        console.log(err);
    }
});

app.listen(1345, async () => {
    await init();
    console.log('Started Listening on 1345');
});
