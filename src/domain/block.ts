import * as sha256 from "sha256";

export type TransactionDTO = {
    id: string;
    from: string;
    to: string;
    amount: number;
};

export interface IBlock {
    blockId: string | number;
    nodeId: string;
    time: number;
    transaction: TransactionDTO;
    lastHash: string;
    nonce: number;
    hashPrefix: string;
    terminate: boolean;
    currentHash: string;
}
export interface BlockDTO {
    blockId: string | number;
    nodeId: string;
    time: number;
    transaction: TransactionDTO;
    lastHash: string;
    nonce: number;
    hashPrefix: string;
    terminate: boolean;
    currentHash: string;
}

export class Block implements IBlock {
    blockId: string | number;
    nodeId: string;
    time: number;
    transaction: TransactionDTO;
    lastHash: string;
    nonce: number = 0;
    hashPrefix: string = "0";
    terminate: boolean;
    currentHash = "";

    constructor(
        time: number,
        lastHash: string,
        transaction: TransactionDTO,
        nodeId: string,
        blockId: string | number
    ) {
        this.nodeId = nodeId;
        this.time = time;
        this.transaction = transaction;
        this.lastHash = lastHash;
        this.terminate = false;
        this.blockId = blockId;
    }

    terminateMining() {
        this.terminate = true;
    }

    addLastHash(lastHash: string) {
        this.lastHash = lastHash;
    }

    createHash() {
        const value = `${this.nonce}${this.lastHash}${
            this.time
        }${JSON.stringify(this.transaction)}`;

        return sha256(value);
    }

    /**
     * using an interval to simulate the mining process
     * because the mining process is a CPU intensive task and
     * all the node always runs on the same thread
     */
    mine() {
        this.currentHash = this.createHash();

        return new Promise((resolve, reject) => {
            const currInterval = setInterval(
                () => {
                    if (this.terminate) {
                        clearInterval(currInterval);
                        console.log(
                            `Node ${this.nodeId} rejected block ${this.blockId} ...`
                        );
                        reject();
                    } else if (this.currentHash.startsWith(this.hashPrefix)) {
                        console.log(
                            `Node ${this.nodeId} resolved block ${this.blockId} ...`
                        );
                        clearInterval(currInterval);
                        resolve(this);
                    } else {
                        this.nonce++;
                        this.currentHash = this.createHash();
                        //reject();
                    }
                },
                Math.floor(Math.random() * 1000)
            );
        });
    }

    mineOld() {
        let hash = this.createHash();
        while (!hash.startsWith(this.hashPrefix)) {
            this.nonce++;
            hash = this.createHash();
        }
    }

    toJSON() {
        return {
            blockId: this.blockId,
            nodeId: this.nodeId,
            time: this.time,
            transaction: this.transaction,
            lastHash: this.lastHash,
            nonce: this.nonce,
            hashPrefix: this.hashPrefix,
            currentHash: this.currentHash
        } as BlockDTO;
    }
}
