"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWallet = getWallet;
var coti_sdk_typescript_1 = require("@coti-io/coti-sdk-typescript");
var ethers_1 = require("ethers");
var dotenv = require("dotenv");
dotenv.config();
var RPC_URL = 'https://testnet.coti.io/rpc';
var ONBOARD_CONTRACT_ADDRESS = '0x60eA13A5f263f77f7a2832cfEeF1729B1688477c';
var ONBOARD_CONTRACT_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "userKey1",
                "type": "bytes"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "userKey2",
                "type": "bytes"
            }
        ],
        "name": "AccountOnboarded",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "publicKey",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "signedEK",
                "type": "bytes"
            }
        ],
        "name": "onboardAccount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
var CONTRACT_ADDRESS = '0xc0ffee254729296a45a3885639AC7E10F9d54979';
var FUNCTION_SELECTOR = '0x11223344';
function onboard(wallet) {
    return __awaiter(this, void 0, void 0, function () {
        var accountOnboardContract, rsaKeyPair, signedEK, receipt, decodedLog;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountOnboardContract = new ethers_1.Contract(ONBOARD_CONTRACT_ADDRESS, JSON.stringify(ONBOARD_CONTRACT_ABI), wallet);
                    rsaKeyPair = (0, coti_sdk_typescript_1.generateRSAKeyPair)();
                    signedEK = (0, coti_sdk_typescript_1.sign)((0, ethers_1.keccak256)(rsaKeyPair.publicKey), wallet.privateKey);
                    return [4 /*yield*/, accountOnboardContract.onboardAccount(rsaKeyPair.publicKey, signedEK, { gasLimit: 15000000 })];
                case 1: return [4 /*yield*/, (_a.sent()).wait()];
                case 2:
                    receipt = _a.sent();
                    decodedLog = accountOnboardContract.interface.parseLog(receipt.logs[0]);
                    return [2 /*return*/, (0, coti_sdk_typescript_1.recoverUserKey)(rsaKeyPair.privateKey, decodedLog.args.userKey1.substring(2), decodedLog.args.userKey2.substring(2))];
            }
        });
    });
}
function encryptDecryptUint(plaintext, wallet, userKey) {
    console.log("Encrypting uint: ".concat(plaintext));
    var inputText = (0, coti_sdk_typescript_1.buildInputText)(plaintext, { wallet: wallet, userKey: userKey }, CONTRACT_ADDRESS, FUNCTION_SELECTOR);
    console.log("Encrypted value: ".concat(inputText.ciphertext, " \n"));
    console.log("Decrypting uint: ".concat(inputText.ciphertext));
    var clearText = (0, coti_sdk_typescript_1.decryptUint)(inputText.ciphertext, userKey);
    console.log("Decrypted value: ".concat(clearText, " \n"));
    if (clearText !== plaintext) {
        throw new Error("Decrypted number does not match plaintext");
    }
}
function encryptDecryptString(plaintext, wallet, userKey) {
    console.log("Encrypting string: ".concat(plaintext));
    var inputText = (0, coti_sdk_typescript_1.buildStringInputText)(plaintext, { wallet: wallet, userKey: userKey }, CONTRACT_ADDRESS, FUNCTION_SELECTOR);
    console.log("Encrypted value: ".concat(inputText.ciphertext.value, " \n"));
    console.log("Decrypting string: ".concat(inputText.ciphertext.value));
    var clearText = (0, coti_sdk_typescript_1.decryptString)(inputText.ciphertext, userKey);
    console.log("Decrypted value: ".concat(clearText, " \n"));
    if (clearText !== plaintext) {
        throw new Error("Decrypted number does not match plaintext");
    }
}
function getWallet(provider) {
    if (!process.env.SIGNING_KEY) {
        throw new Error("SIGNING_KEY not found in environment variables");
    }
    return new ethers_1.Wallet(process.env.SIGNING_KEY, provider);
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, wallet, userKey;
        return __generator(this, function (_a) {
            provider = new ethers_1.JsonRpcProvider(RPC_URL);
            wallet = getWallet(provider);
            userKey = process.env.USER_KEY;
            console.log(userKey);
            //await onboard(wallet)
            encryptDecryptUint(BigInt(123), wallet, userKey);
            encryptDecryptString("Hello World! I am a garbled message on COTI", wallet, userKey);
            return [2 /*return*/];
        });
    });
}
main();
