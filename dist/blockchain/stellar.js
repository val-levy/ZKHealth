"use strict";
// This file contains the logic for interacting with the Stellar blockchain. 
// It exports functions for creating transactions, querying the blockchain, 
// and handling Stellar-specific operations.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionHistory = exports.getAccountDetails = exports.createTransaction = void 0;
const stellar_sdk_1 = require("stellar-sdk");
const server = new stellar_sdk_1.Server('https://horizon-testnet.stellar.org');
const createTransaction = (sourceSecretKey, destinationPublicKey, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const sourceKeypair = stellar_sdk_1.Keypair.fromSecret(sourceSecretKey);
    const account = yield server.loadAccount(sourceKeypair.publicKey());
    const transaction = new stellar_sdk_1.TransactionBuilder(account, {
        fee: yield server.fetchBaseFee(),
        networkPassphrase: stellar_sdk_1.Networks.TESTNET,
    })
        .addOperation(stellar_sdk_1.Operation.payment({
        destination: destinationPublicKey,
        asset: Asset.native(),
        amount: amount,
    }))
        .setTimeout(30)
        .build();
    transaction.sign(sourceKeypair);
    const result = yield server.submitTransaction(transaction);
    return result;
});
exports.createTransaction = createTransaction;
const getAccountDetails = (publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield server.loadAccount(publicKey);
    return account;
});
exports.getAccountDetails = getAccountDetails;
const getTransactionHistory = (publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield server.transactions().forAccount(publicKey).call();
    return transactions.records;
});
exports.getTransactionHistory = getTransactionHistory;
