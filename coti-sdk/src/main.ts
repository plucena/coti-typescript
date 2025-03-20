import {
    buildInputText,
    buildStringInputText,
    decryptString,
    decryptUint,
    generateRSAKeyPair,
    recoverUserKey,
    sign
} from "@coti-io/coti-sdk-typescript"
import { Contract, JsonRpcProvider, keccak256, Wallet, Provider } from "ethers"
import * as dotenv from "dotenv"
import fs from "fs"

dotenv.config()

const RPC_URL = 'https://testnet.coti.io/rpc'
const ONBOARD_CONTRACT_ADDRESS = '0x60eA13A5f263f77f7a2832cfEeF1729B1688477c'
const ONBOARD_CONTRACT_ABI = [
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
]
const CONTRACT_ADDRESS = '0xc0ffee254729296a45a3885639AC7E10F9d54979'
const FUNCTION_SELECTOR = '0x11223344'

async function onboard(wallet: Wallet) {
    const accountOnboardContract = new Contract(ONBOARD_CONTRACT_ADDRESS, JSON.stringify(ONBOARD_CONTRACT_ABI), wallet)

    const rsaKeyPair = generateRSAKeyPair()

    const signedEK = sign(keccak256(rsaKeyPair.publicKey), wallet.privateKey)

    const receipt = await (await accountOnboardContract.onboardAccount(rsaKeyPair.publicKey, signedEK, {gasLimit: 15000000})).wait()

    const decodedLog = accountOnboardContract.interface.parseLog(receipt.logs[0])

    return recoverUserKey(rsaKeyPair.privateKey, decodedLog!.args.userKey1.substring(2), decodedLog!.args.userKey2.substring(2))
}

function encryptDecryptUint(plaintext: bigint, wallet: Wallet, userKey: string) {
    console.log(`Encrypting uint: ${plaintext}`)

    const inputText = buildInputText(
        plaintext,
        { wallet, userKey },
        CONTRACT_ADDRESS,
        FUNCTION_SELECTOR
    )

    console.log(`Encrypted value: ${inputText.ciphertext} \n`)
    console.log(`Decrypting uint: ${inputText.ciphertext}`)

    const clearText = decryptUint(inputText.ciphertext, userKey)

    console.log(`Decrypted value: ${clearText} \n`)

    if (clearText !== plaintext) {
        throw new Error("Decrypted number does not match plaintext")
    }
}

function encryptDecryptString(plaintext: string, wallet: Wallet, userKey: string) {
    console.log(`Encrypting string: ${plaintext}`)

    const inputText = buildStringInputText(
        plaintext,
        { wallet, userKey },
        CONTRACT_ADDRESS,
        FUNCTION_SELECTOR
    )

    console.log(`Encrypted value: ${inputText.ciphertext.value} \n`)
    console.log(`Decrypting string: ${inputText.ciphertext.value}`)

    const clearText = decryptString(inputText.ciphertext, userKey)

    console.log(`Decrypted value: ${clearText} \n`)

    if (clearText !== plaintext) {
        throw new Error("Decrypted number does not match plaintext")
    }
}


async function main() {
    const provider = new JsonRpcProvider(RPC_URL)
    //const wallet = new Wallet(process.env.PRIVATE_KEY!, provider)

    if (!process.env.SIGNING_KEY) 
        throw new Error("SIGNING_KEY not found in environment variables")
    const wallet = new Wallet(process.env.SIGNING_KEY, provider)


    //const userKey = await onboard(wallet)
    const userKey = process.env.USER_KEY!
  
    if (!userKey) {
        throw new Error("USER_KEY is not found or is null in environment variables");
    }
  
    encryptDecryptUint(BigInt(123), wallet, userKey)
    encryptDecryptString("Hello World! I am a garbled message on COTI", wallet, userKey)
}

main()