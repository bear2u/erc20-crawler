'use strict'

const db = require('./models/mongodb')
const q = require('./queues')
const web3 = require('./models/blockchain/chain')

let sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

async function process() {
    for (let i = 5168958; i < 5995800  ; i++) {
        if (i !== 5168958 && i !== 5169011 && i !== 5169173 && i < 5175169) {
            continue
        }
        if (i % 10 === 0) {
            console.log('Sleep 10 seconds')
            await sleep(10000)
        }

        let block = await web3.eth.getBlock(i);
        await new db.Block({
            hash: block.hash,
            blockNumber: block.number,
            transactionCount: block.transactions.length,
            parentHash: block.parentHash,
            timestamp: block.timestamp
        }).save()

        console.log("Process block number: " + i);
        let listTransactions = await block.transactions
        if (listTransactions != null && block != null) {
            await q.create('newTransaction', {transactions: listTransactions.toString(), blockNumber: block.number})
                .priority('normal').removeOnComplete(true).save()
        }
    }
}

process()