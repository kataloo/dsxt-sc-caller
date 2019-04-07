const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const Web3 = require('web3');
const web3 = new Web3(
    new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/7a414e1bbb7342c9b50fcf879e0c7f54'),
);

const contractAddress = '';
const abi = require('./abi').abi;
console.log("abi is", abi)

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const port = config.serverPort;
const rinkebyChainId = 4;

const contract = new web3.eth.Contract(abi, config.contractAddress);

const runContractFunction = async (data) => {
    const account = getAccount();

    const rawTransaction = {
        from: account.address,
        to: contractAddress,
        value: '0x0',
        data: data,
        chainId: rinkebyChainId
    }
    if(speedUp) {
        rawTransaction.gasPrice = await getSpeedUpGasPrice();
    }
    const estimateGas = await web3.eth.estimateGas(rawTransaction);
    rawTransaction.gas = estimateGas;

    const signedTx = await web3.eth.accounts.signTransaction(rawTransaction, config.privateKey)
    const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    console.log('send tx result: ' + JSON.stringify(result))
    return result;
}

const getData = () => {
    return contract.methods.exchange().encodeABI();
}

app.post('/execute_exchange', async (req, res) => {
    const request = req.body;
    console.log('request is: ', request);

    try {
        const result = await runContractFunction(getData());
        console.log('send result is: ', result);
        res.json({message: 'ok'})
    } catch(ex) {
        console.log('error on processing request', ex)
        res.status(500).json({message: "could not execute req, check server logs"});
    }
})

app.listen(port, () => console.log('server is listening on ' + port))