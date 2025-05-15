// This file contains the logic for interacting with the Stellar blockchain. 
// It exports functions for creating transactions, querying the blockchain, 
// and handling Stellar-specific operations.

import { Server, TransactionBuilder, Networks, Keypair, Operation } from 'stellar-sdk';

const server = new Server('https://horizon-testnet.stellar.org');

export const createTransaction = async (sourceSecretKey: string, destinationPublicKey: string, amount: string) => {
    const sourceKeypair = Keypair.fromSecret(sourceSecretKey);
    const account = await server.loadAccount(sourceKeypair.publicKey());
    
    const transaction = new TransactionBuilder(account, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: Networks.TESTNET,
    })
    .addOperation(Operation.payment({
        destination: destinationPublicKey,
        asset: Asset.native(),
        amount: amount,
    }))
    .setTimeout(30)
    .build();

    transaction.sign(sourceKeypair);
    
    const result = await server.submitTransaction(transaction);
    return result;
};

export const getAccountDetails = async (publicKey: string) => {
    const account = await server.loadAccount(publicKey);
    return account;
};

export const getTransactionHistory = async (publicKey: string) => {
    const transactions = await server.transactions().forAccount(publicKey).call();
    return transactions.records;
};