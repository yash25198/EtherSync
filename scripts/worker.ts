import { ethers } from "hardhat";
import { serialize } from "@ethersproject/transactions/";
import { UnsignedTransaction } from "@ethersproject/transactions";
import { Block, JsonRpcProvider } from "ethers";

class Worker {
    public chainId: number;
    public mainnetProvider: JsonRpcProvider;
    constructor(mainnetProvider: JsonRpcProvider, chainId: number) {
        this.mainnetProvider = mainnetProvider;
        this.chainId = chainId;
    }

    // This function will start the sync for the block
    async start(blockNumber: number) {
        let block = (await this.mainnetProvider.getBlock(
            blockNumber,
            true
        )) as Block;
        //set timetamp to current block
        await ethers.provider.send("evm_setNextBlockTimestamp", [
            block.timestamp,
        ]);
        await ethers.provider.send("evm_setAutomine", [false]);
        for (let index = 0; index < block.transactions.length; index++) {
            let sourceTx = block.getPrefetchedTransaction(index);
            process.stdout.cursorTo(0);
            process.stdout.write(
                `Block: ${blockNumber} | tx ${index + 1}/${
                    block?.prefetchedTransactions.length
                }`
            );

            let localTx = {
                to: sourceTx.to,
                nonce: sourceTx.nonce,

                gasLimit: sourceTx.gasLimit,
                gasPrice: sourceTx.gasPrice,

                data: sourceTx.data,
                value: sourceTx.value,
                chainId: this.chainId,

                type: sourceTx.type,
            } as UnsignedTransaction;

            if (sourceTx.accessList) {
                localTx.accessList = sourceTx.accessList;
            }

            if (sourceTx.type == 2) {
                localTx.maxPriorityFeePerGas =
                    sourceTx.maxPriorityFeePerGas?.toString();
                localTx.maxFeePerGas = sourceTx.maxFeePerGas?.toString();
                localTx.gasPrice = sourceTx.maxFeePerGas?.toString();
            }

            let rawTx = serialize(localTx, sourceTx.signature);

            try {
                await this.sendTransation(rawTx);
            } catch (e) {
                console.log(`Failed transaction: ${sourceTx.hash}`);
            }
        }
        await ethers.provider.send("evm_mine", []);
        await ethers.provider.send("evm_setAutomine", [true]);
    }
    private sendTransation(raw: string) {
        return new Promise((resolve, reject) => {
            ethers.provider
                .send("eth_sendRawTransaction", [raw])
                .then((txHash: string) => {
                    resolve(txHash);
                })
                .catch((e: any) => {
                    reject(e);
                });
        });
    }
}

async function main() {
    const mainnetProvider = new ethers.JsonRpcProvider(
        process.env["FORKING_URL"]
    );
    const forkingBlock = parseInt(
        process.env["FORKING_BLOCK_NUMBER"] as string,
        10
    );
    const chainID = await mainnetProvider.send("eth_chainId", []);
    const worker = new Worker(mainnetProvider, Number(chainID));
    await worker.start(forkingBlock + 2);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
