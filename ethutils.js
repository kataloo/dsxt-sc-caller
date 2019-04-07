const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const Web3 = require('web3');
const web3 = new Web3(
    new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/7a414e1bbb7342c9b50fcf879e0c7f54'),
);

const rinkebyChainId = 4;

const abi = require('./abi').abi;
const contract = new web3.eth.Contract(abi, config.contractAddress);

const privateKeyToAccount = pk => {
    return web3.eth.accounts.privateKeyToAccount('0x' + pk);
}

const account = privateKeyToAccount(config.privateKey);

const runContractFunction = async (data) => {
    console.log('calling from account address:', account.address)

    const nonce = await web3.eth.getTransactionCount(account.address);
    console.log('nonce is: ', nonce);
    const rawTransaction = {
        from: account.address,
        to: config.contractAddress,
        value: '0x0',
        data: data,
        chainId: rinkebyChainId,
        nonce: nonce
    }
    const estimateGas = await web3.eth.estimateGas(rawTransaction);
    rawTransaction.gas = estimateGas;

    console.log('calculated estimate gas')

    const signedTx = await web3.eth.accounts.signTransaction(rawTransaction, config.privateKey)
    const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    console.log('send tx result: ' + JSON.stringify(result))
    return result;
}

const getData = (trade) => {

    const sellerSignature = trade.sellerOrder.signature;
    const buyerSignature = trade.buyerOrder.signature;
    const sellerAddress = trade.sellerOrder.address;
    const buyerAddress = trade.buyerOrder.address;
    const sellerRate = trade.sellerOrder.rate;
    const buyerRate = trade.buyerOrder.rate;
    const sellerNonce = trade.sellerOrder.nonce;
    const buyerNonce = trade.buyerOrder.nonce;
    const sellerValue = trade.sellerOrder.value;
    const buyerValue = trade.buyerOrder.value;
    const tradePrice = trade.tradePrice;

    return contract.methods.exchange(
        sellerSignature,
        buyerSignature,
        sellerAddress,
        buyerAddress,
        [
            sellerNonce, 
            sellerValue,
            sellerRate, 
            buyerNonce,
            buyerValue,
            buyerRate,
            tradePrice
        ]
    ).encodeABI();
}

const executeExchange = async (trade) => {
    const callData = getData(trade);
    console.log('calldata is: ', callData);
    return runContractFunction(getData(trade));
}

module.exports = {
    executeExchange

}