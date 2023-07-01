# EtherSyncurai 

Syncs the Ethereum mainnet to a local hardhat node for fast querying and regtest development.
 ## Setup

 env file
 ```
 FORKING_URL=/** mainnet rpc url **/
 FORKING_BLOCK_NUMBER=/** block number to fork from ,empty -> latest**/
 ```

## Usage

# terminal 1
```shell
npx hardhat node
```
# terminal 2
```shell
npx hardhat run scripts/worker.ts
```

## TODO
- [ ] timestamp of block => currenly all transactions done to contracts using block.timestamp fail
- [ ] bundle transactions into same block as mainnet => currently transactions are mined 1 per block
