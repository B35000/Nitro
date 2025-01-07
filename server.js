// Copyright (c) 2023 Bry Onyoni
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT
// SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
// OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
const { Web3 } = require('web3');
const express = require('express');
var CryptoJS = require("crypto-js");
const crypto = require('crypto'); 
const cors = require('cors');
const fs = require("fs");
var bigInt = require("big-integer");
var https = require('https');

const app = express();
app.use(cors());
app.use(express.json({ limit: "10gb" }));

//npm install express web3 crypto-js
//npm install pm2@latest -g
//npm install diskusage
//npm installl big-integer
//npm install crypto

//pm2 start server.js
//pm2 ls
//pm2 stop all | 0

//client-cert.pem  contract-listener  package-lock.json
//client-key.pem   hash_data          package.json
//client.csr

//or node server.js if youre debugging


/* data object containing all the E5 data. */
var data = {
  'key':'',
  'custom_gateway':'',
  'e':['E25',],
  'E25': {
    'addresses':['0xF3895fe95f423A4EBDdD16232274091a320c5284', '0x839C6155383D4a62E31d4d8B5a6c172E6B71979c', '0xD338118A55B5245b9C9F6d5f03BF9d9eA32c5850', '0xec24050b8E3d64c8be3cFE9a40A59060Cb35e57C', '0xFA85d977875092CA69d010d4EFAc5B0E333ce61E', '0x7dcc9570c2e6df2860a518eEE46fA90E13ef6276', '0x0Bb15F960Dbb856f3Eb33DaE6Cc57248a11a4728'],
    'web3':'https://etc.etcdesktop.com',
    'first_block':19151130, 'current_block':{}, 'iteration':400_000,
  },
  // 'file_data_capacity':0,
  'max_buyable_capacity':0,
  'price_per_megabyte':[],
  'target_account_e5':'',
  'target_storage_purchase_recipient_account':0,
  'last_checked_storage_block':0,
  'storage_data':{},
  'storage_boot_time':0,
  'metrics':{
    'total_files_stored':0,
    'total_space_utilized':0.0
  },
  'unlimited_basic_storage':false,
  'nitro_link_data':{},
}

const E5_CONTRACT_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        }
      ],
      "name": "e1",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "p2",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "p3",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        }
      ],
      "name": "e2",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        }
      ],
      "name": "e3",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "p2",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p8",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p9",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "p10",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p11",
          "type": "uint256"
        }
      ],
      "name": "e4",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "string",
          "name": "p2",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        }
      ],
      "name": "e5",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "p2",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        }
      ],
      "name": "e6",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "p1",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "p2",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address[7]",
          "name": "p5",
          "type": "address[7]"
        }
      ],
      "name": "e7",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[2]",
          "name": "p1",
          "type": "uint256[2]"
        },
        {
          "internalType": "address[][]",
          "name": "p2",
          "type": "address[][]"
        },
        {
          "internalType": "uint256[][][]",
          "name": "p3",
          "type": "uint256[][][]"
        },
        {
          "internalType": "string[][][]",
          "name": "p4",
          "type": "string[][][]"
        }
      ],
      "name": "e",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "p1",
          "type": "address"
        },
        {
          "internalType": "uint256[2]",
          "name": "p2",
          "type": "uint256[2]"
        }
      ],
      "name": "f145",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "v1",
          "type": "uint256"
        }
      ],
      "name": "f147",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[7]",
          "name": "p1",
          "type": "address[7]"
        },
        {
          "internalType": "uint256[][][]",
          "name": "p2",
          "type": "uint256[][][]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p3",
          "type": "uint256[][]"
        },
        {
          "internalType": "string[][]",
          "name": "p4",
          "type": "string[][]"
        },
        {
          "internalType": "uint256[]",
          "name": "p5",
          "type": "uint256[]"
        }
      ],
      "name": "f157",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "address[]",
          "name": "p2",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        }
      ],
      "name": "f167",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[7]",
          "name": "p1",
          "type": "address[7]"
        }
      ],
      "name": "f2023",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        }
      ],
      "name": "f206",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        }
      ],
      "name": "f280",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "v1",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        }
      ],
      "name": "f287",
      "outputs": [
        {
          "internalType": "uint256[4][]",
          "name": "v1",
          "type": "uint256[4][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        }
      ],
      "name": "f289",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "f5300g",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
];
const E52_CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "p1",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p8",
          "type": "uint256"
        }
      ],
      "name": "e1",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "p1",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "p4",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        }
      ],
      "name": "e2",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "string",
          "name": "p3",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        }
      ],
      "name": "e3",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "p4",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        }
      ],
      "name": "e4",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "p4",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        }
      ],
      "name": "e5",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        }
      ],
      "name": "f132",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "v1",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        }
      ],
      "name": "f133",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        }
      ],
      "name": "f134",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "v1",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        }
      ],
      "name": "f135",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        }
      ],
      "name": "f136",
      "outputs": [],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        }
      ],
      "name": "f137",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "v1",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "p2",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        }
      ],
      "name": "f138",
      "outputs": [],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[7]",
          "name": "p1",
          "type": "address[7]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p2",
          "type": "uint256[][]"
        },
        {
          "internalType": "string[][]",
          "name": "p3",
          "type": "string[][]"
        },
        {
          "internalType": "uint256[]",
          "name": "p4",
          "type": "uint256[]"
        }
      ],
      "name": "f158",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        }
      ],
      "name": "f171",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "p2",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        }
      ],
      "name": "f188",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        }
      ],
      "name": "f193",
      "outputs": [],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        }
      ],
      "name": "f211",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "sv1",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sv2",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv3",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[][]",
              "name": "sv4",
              "type": "uint256[][]"
            },
            {
              "internalType": "address[]",
              "name": "sv5",
              "type": "address[]"
            },
            {
              "internalType": "string[][]",
              "name": "sv6",
              "type": "string[][]"
            },
            {
              "internalType": "uint256",
              "name": "t",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv7",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv8",
              "type": "uint256"
            },
            {
              "internalType": "uint256[2]",
              "name": "sv9",
              "type": "uint256[2]"
            },
            {
              "internalType": "bool",
              "name": "sv10",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv11",
              "type": "uint256[]"
            }
          ],
          "internalType": "struct E3.TD",
          "name": "p1",
          "type": "tuple"
        }
      ],
      "name": "f217",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        }
      ],
      "name": "f244",
      "outputs": [],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        }
      ],
      "name": "f254",
      "outputs": [
        {
          "internalType": "bool[]",
          "name": "",
          "type": "bool[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p2",
          "type": "uint256[][]"
        }
      ],
      "name": "f255",
      "outputs": [
        {
          "internalType": "bool[][]",
          "name": "",
          "type": "bool[][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p2",
          "type": "uint256[][]"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        }
      ],
      "name": "f256",
      "outputs": [
        {
          "internalType": "uint256[][]",
          "name": "",
          "type": "uint256[][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "p2",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        }
      ],
      "name": "f257",
      "outputs": [],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][5][5]",
          "name": "p1",
          "type": "uint256[][5][5]"
        },
        {
          "internalType": "uint256[21]",
          "name": "p2",
          "type": "uint256[21]"
        }
      ],
      "name": "f275",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "p3",
          "type": "uint256[]"
        }
      ],
      "name": "f283",
      "outputs": [],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        }
      ],
      "name": "f69",
      "outputs": [],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        }
      ],
      "name": "f94",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
]
const F5_CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "p1",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        }
      ],
      "name": "e1",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        }
      ],
      "name": "e2",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        }
      ],
      "name": "e4",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        }
      ],
      "name": "e5",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address[7]",
          "name": "p1",
          "type": "address[7]"
        },
        {
          "internalType": "uint256[][][]",
          "name": "p2",
          "type": "uint256[][][]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p3",
          "type": "uint256[][]"
        },
        {
          "internalType": "string[][]",
          "name": "p4",
          "type": "string[][]"
        },
        {
          "internalType": "uint256[]",
          "name": "p5",
          "type": "uint256[]"
        }
      ],
      "name": "f159",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][]",
          "name": "p1",
          "type": "uint256[][]"
        }
      ],
      "name": "f168",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "sv1",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sv2",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv3",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[][]",
              "name": "sv4",
              "type": "uint256[][]"
            },
            {
              "internalType": "address[]",
              "name": "sv5",
              "type": "address[]"
            },
            {
              "internalType": "string[][]",
              "name": "sv6",
              "type": "string[][]"
            },
            {
              "internalType": "uint256",
              "name": "t",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv7",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv8",
              "type": "uint256"
            },
            {
              "internalType": "uint256[2]",
              "name": "sv9",
              "type": "uint256[2]"
            },
            {
              "internalType": "bool",
              "name": "sv10",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv11",
              "type": "uint256[]"
            }
          ],
          "internalType": "struct E3.TD",
          "name": "p1",
          "type": "tuple"
        }
      ],
      "name": "f172",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][5]",
          "name": "p1",
          "type": "uint256[][5]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        }
      ],
      "name": "f196",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "sv1",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sv2",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv3",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[][]",
              "name": "sv4",
              "type": "uint256[][]"
            },
            {
              "internalType": "address[]",
              "name": "sv5",
              "type": "address[]"
            },
            {
              "internalType": "string[][]",
              "name": "sv6",
              "type": "string[][]"
            },
            {
              "internalType": "uint256",
              "name": "t",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv7",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv8",
              "type": "uint256"
            },
            {
              "internalType": "uint256[2]",
              "name": "sv9",
              "type": "uint256[2]"
            },
            {
              "internalType": "bool",
              "name": "sv10",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv11",
              "type": "uint256[]"
            }
          ],
          "internalType": "struct E3.TD",
          "name": "p1",
          "type": "tuple"
        }
      ],
      "name": "f197",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p2",
          "type": "uint256[][]"
        }
      ],
      "name": "f229",
      "outputs": [
        {
          "internalType": "uint256[][]",
          "name": "v1",
          "type": "uint256[][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p2",
          "type": "uint256[][]"
        }
      ],
      "name": "f235",
      "outputs": [
        {
          "internalType": "uint256[][]",
          "name": "v1",
          "type": "uint256[][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][][]",
          "name": "v1",
          "type": "uint256[][][]"
        },
        {
          "internalType": "uint256[21]",
          "name": "p2",
          "type": "uint256[21]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p3",
          "type": "uint256[][]"
        }
      ],
      "name": "f263",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "f73",
      "outputs": [
        {
          "internalType": "uint256[][]",
          "name": "",
          "type": "uint256[][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        }
      ],
      "name": "f74",
      "outputs": [
        {
          "internalType": "uint256[][][]",
          "name": "",
          "type": "uint256[][][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
]
const G5_CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "p1",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        }
      ],
      "name": "e1",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        }
      ],
      "name": "e2",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        }
      ],
      "name": "f111",
      "outputs": [
        {
          "internalType": "uint256[][][]",
          "name": "",
          "type": "uint256[][][]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[7]",
          "name": "p1",
          "type": "address[7]"
        },
        {
          "internalType": "uint256[][][]",
          "name": "p2",
          "type": "uint256[][][]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p3",
          "type": "uint256[][]"
        }
      ],
      "name": "f160",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "sv1",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sv2",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv3",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[][]",
              "name": "sv4",
              "type": "uint256[][]"
            },
            {
              "internalType": "address[]",
              "name": "sv5",
              "type": "address[]"
            },
            {
              "internalType": "string[][]",
              "name": "sv6",
              "type": "string[][]"
            },
            {
              "internalType": "uint256",
              "name": "t",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv7",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv8",
              "type": "uint256"
            },
            {
              "internalType": "uint256[2]",
              "name": "sv9",
              "type": "uint256[2]"
            },
            {
              "internalType": "bool",
              "name": "sv10",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv11",
              "type": "uint256[]"
            }
          ],
          "internalType": "struct E3.TD",
          "name": "p1",
          "type": "tuple"
        }
      ],
      "name": "f174",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "internalType": "uint256[][]",
          "name": "p3",
          "type": "uint256[][]"
        },
        {
          "internalType": "uint256[][][2]",
          "name": "p4",
          "type": "uint256[][][2]"
        }
      ],
      "name": "f200",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][5]",
          "name": "p1",
          "type": "uint256[][5]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        }
      ],
      "name": "f238",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "p2",
          "type": "bool"
        }
      ],
      "name": "f77",
      "outputs": [
        {
          "internalType": "uint256[][]",
          "name": "",
          "type": "uint256[][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "bool",
          "name": "p2",
          "type": "bool"
        }
      ],
      "name": "f78",
      "outputs": [
        {
          "internalType": "uint256[][][]",
          "name": "",
          "type": "uint256[][][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "targets",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "p3",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        }
      ],
      "name": "f79",
      "outputs": [
        {
          "internalType": "uint256[][][]",
          "name": "",
          "type": "uint256[][][]"
        },
        {
          "internalType": "uint256[][4]",
          "name": "",
          "type": "uint256[][4]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
]
const G52_CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "p1",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        }
      ],
      "name": "archive",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        }
      ],
      "name": "e1",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        }
      ],
      "name": "e2",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        }
      ],
      "name": "e3",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address[7]",
          "name": "p1",
          "type": "address[7]"
        }
      ],
      "name": "f161",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "sv1",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sv2",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv3",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[][]",
              "name": "sv4",
              "type": "uint256[][]"
            },
            {
              "internalType": "address[]",
              "name": "sv5",
              "type": "address[]"
            },
            {
              "internalType": "string[][]",
              "name": "sv6",
              "type": "string[][]"
            },
            {
              "internalType": "uint256",
              "name": "t",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv7",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv8",
              "type": "uint256"
            },
            {
              "internalType": "uint256[2]",
              "name": "sv9",
              "type": "uint256[2]"
            },
            {
              "internalType": "bool",
              "name": "sv10",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv11",
              "type": "uint256[]"
            }
          ],
          "internalType": "struct E3.TD",
          "name": "p1",
          "type": "tuple"
        }
      ],
      "name": "f189",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "v3",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "p3",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        }
      ],
      "name": "f194",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[][][]",
          "name": "p2",
          "type": "uint256[][][]"
        },
        {
          "internalType": "uint256[][][2]",
          "name": "p3",
          "type": "uint256[][][2]"
        }
      ],
      "name": "f201",
      "outputs": [
        {
          "internalType": "uint256[21]",
          "name": "v2",
          "type": "uint256[21]"
        },
        {
          "internalType": "bool[3]",
          "name": "v3",
          "type": "bool[3]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p2",
          "type": "uint256[][]"
        }
      ],
      "name": "f237",
      "outputs": [
        {
          "internalType": "uint256[][]",
          "name": "v1",
          "type": "uint256[][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p2",
          "type": "uint256[][]"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        }
      ],
      "name": "f266",
      "outputs": [
        {
          "internalType": "uint256[][]",
          "name": "v1",
          "type": "uint256[][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
]
const H5_CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "p1",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p8",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p9",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p10",
          "type": "uint256"
        }
      ],
      "name": "e1",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        }
      ],
      "name": "e2",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        }
      ],
      "name": "e3",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address[7]",
          "name": "p1",
          "type": "address[7]"
        },
        {
          "internalType": "uint256[][][]",
          "name": "p2",
          "type": "uint256[][][]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p3",
          "type": "uint256[][]"
        }
      ],
      "name": "f162",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "sv1",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sv2",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv3",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[][]",
              "name": "sv4",
              "type": "uint256[][]"
            },
            {
              "internalType": "address[]",
              "name": "sv5",
              "type": "address[]"
            },
            {
              "internalType": "string[][]",
              "name": "sv6",
              "type": "string[][]"
            },
            {
              "internalType": "uint256",
              "name": "t",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv7",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv8",
              "type": "uint256"
            },
            {
              "internalType": "uint256[2]",
              "name": "sv9",
              "type": "uint256[2]"
            },
            {
              "internalType": "bool",
              "name": "sv10",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv11",
              "type": "uint256[]"
            }
          ],
          "internalType": "struct E3.TD",
          "name": "p1",
          "type": "tuple"
        }
      ],
      "name": "f176",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "sv1",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sv2",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv3",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[][]",
              "name": "sv4",
              "type": "uint256[][]"
            },
            {
              "internalType": "address[]",
              "name": "sv5",
              "type": "address[]"
            },
            {
              "internalType": "string[][]",
              "name": "sv6",
              "type": "string[][]"
            },
            {
              "internalType": "uint256",
              "name": "t",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv7",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv8",
              "type": "uint256"
            },
            {
              "internalType": "uint256[2]",
              "name": "sv9",
              "type": "uint256[2]"
            },
            {
              "internalType": "bool",
              "name": "sv10",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv11",
              "type": "uint256[]"
            }
          ],
          "internalType": "struct E3.TD",
          "name": "p1",
          "type": "tuple"
        }
      ],
      "name": "f179",
      "outputs": [
        {
          "internalType": "uint256[3]",
          "name": "v1",
          "type": "uint256[3]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][5]",
          "name": "p1",
          "type": "uint256[][5]"
        },
        {
          "internalType": "uint256[4]",
          "name": "p2",
          "type": "uint256[4]"
        },
        {
          "internalType": "bool",
          "name": "p3",
          "type": "bool"
        },
        {
          "internalType": "uint256[][2]",
          "name": "p4",
          "type": "uint256[][2]"
        }
      ],
      "name": "f180",
      "outputs": [
        {
          "internalType": "uint256[3]",
          "name": "v1",
          "type": "uint256[3]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][5]",
          "name": "p1",
          "type": "uint256[][5]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        }
      ],
      "name": "f198",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][6]",
          "name": "p1",
          "type": "uint256[][6]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        }
      ],
      "name": "f230",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "p2",
          "type": "uint256[]"
        }
      ],
      "name": "f241",
      "outputs": [
        {
          "internalType": "uint256[4][]",
          "name": "",
          "type": "uint256[4][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p2",
          "type": "uint256[][]"
        },
        {
          "internalType": "uint256[]",
          "name": "p3",
          "type": "uint256[]"
        }
      ],
      "name": "f245",
      "outputs": [
        {
          "internalType": "uint256[][]",
          "name": "v1",
          "type": "uint256[][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        }
      ],
      "name": "f247",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "v1",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "f258",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        }
      ],
      "name": "f286",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        }
      ],
      "name": "f85",
      "outputs": [
        {
          "internalType": "uint256[][]",
          "name": "",
          "type": "uint256[][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        }
      ],
      "name": "f86",
      "outputs": [
        {
          "internalType": "uint256[][][]",
          "name": "",
          "type": "uint256[][][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][][]",
          "name": "p1",
          "type": "uint256[][][]"
        }
      ],
      "name": "f88",
      "outputs": [
        {
          "internalType": "uint256[][][2]",
          "name": "",
          "type": "uint256[][][2]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
]
const H52_CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "p1",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        }
      ],
      "name": "e1",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        }
      ],
      "name": "e2",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p8",
          "type": "uint256"
        }
      ],
      "name": "e3",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "p4",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        }
      ],
      "name": "e5",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p1",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p7",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "p8",
          "type": "uint256"
        }
      ],
      "name": "power",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "p2",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "p3",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        }
      ],
      "name": "f140",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "v1",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "p3",
          "type": "uint256[]"
        }
      ],
      "name": "f140e",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "v1",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[7]",
          "name": "p1",
          "type": "address[7]"
        }
      ],
      "name": "f163",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][5]",
          "name": "p1",
          "type": "uint256[][5]"
        },
        {
          "internalType": "uint256[]",
          "name": "p2",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "internalType": "uint256[][][]",
          "name": "p4",
          "type": "uint256[][][]"
        },
        {
          "internalType": "bool",
          "name": "p5",
          "type": "bool"
        }
      ],
      "name": "f182",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][5]",
          "name": "p1",
          "type": "uint256[][5]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p3",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "p4",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "p5",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        }
      ],
      "name": "f184",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "sv1",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sv2",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv3",
              "type": "uint256[]"
            },
            {
              "internalType": "uint256[][]",
              "name": "sv4",
              "type": "uint256[][]"
            },
            {
              "internalType": "address[]",
              "name": "sv5",
              "type": "address[]"
            },
            {
              "internalType": "string[][]",
              "name": "sv6",
              "type": "string[][]"
            },
            {
              "internalType": "uint256",
              "name": "t",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv7",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sv8",
              "type": "uint256"
            },
            {
              "internalType": "uint256[2]",
              "name": "sv9",
              "type": "uint256[2]"
            },
            {
              "internalType": "bool",
              "name": "sv10",
              "type": "bool"
            },
            {
              "internalType": "uint256[]",
              "name": "sv11",
              "type": "uint256[]"
            }
          ],
          "internalType": "struct E3.TD",
          "name": "p1",
          "type": "tuple"
        }
      ],
      "name": "f185",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][6]",
          "name": "p1",
          "type": "uint256[][6]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        }
      ],
      "name": "f199",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "bool[]",
          "name": "p2",
          "type": "bool[]"
        },
        {
          "internalType": "uint256[]",
          "name": "p3",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p4",
          "type": "uint256"
        },
        {
          "internalType": "uint256[][]",
          "name": "p5",
          "type": "uint256[][]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p6",
          "type": "uint256[][]"
        },
        {
          "internalType": "uint256[]",
          "name": "p7",
          "type": "uint256[]"
        }
      ],
      "name": "f204",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        },
        {
          "internalType": "uint256[][]",
          "name": "p3",
          "type": "uint256[][]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p4",
          "type": "uint256[][]"
        }
      ],
      "name": "f212",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[][6]",
          "name": "p1",
          "type": "uint256[][6]"
        },
        {
          "internalType": "uint256",
          "name": "p2",
          "type": "uint256"
        }
      ],
      "name": "f227",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "p1",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[][]",
          "name": "p2",
          "type": "uint256[][]"
        },
        {
          "internalType": "uint256[]",
          "name": "p4",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "p5",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "p6",
          "type": "uint256"
        }
      ],
      "name": "f270",
      "outputs": [
        {
          "internalType": "uint256[][]",
          "name": "v1",
          "type": "uint256[][]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
]




/* object containing all the event data for all the E5s */
var event_data = {
  'E25':{
    'E5':{
      'e1':[], 'e2':[], 'e3':[], 'e4':[], 'e5':[], 'e6':[], 'e7':[],
    },
    'E52':{
      'e1':[], 'e2':[], 'e3':[], 'e4':[], 'e5':[],
    },
    'F5':{
      'e1':[], 'e2':[], 'e5':[], 'e4':[],
    },
    'G5':{
      'e1':[], 'e2':[],
    },
    'G52':{
      'e1':[], 'e2':[], 'e3':[], 'archive':[],
    },
    'H5':{
      'e1':[], 'e2':[], 'e3':[]
    },
    'H52':{
      'e1':[], 'e2':[], 'e3':[], 'e5':[], 'power':[],
    },
  },
  'E35':{
    'E5':{
      'e1':[], 'e2':[], 'e3':[], 'e4':[], 'e5':[], 'e6':[], 'e7':[],
    },
    'E52':{
      'e1':[], 'e2':[], 'e3':[], 'e4':[], 'e5':[],
    },
    'F5':{
      'e1':[], 'e2':[], 'e5':[], 'e4':[],
    },
    'G5':{
      'e1':[], 'e2':[],
    },
    'G52':{
      'e1':[], 'e2':[], 'e3':[], 'archive':[],
    },
    'H5':{
      'e1':[], 'e2':[], 'e3':[]
    },
    'H52':{
      'e1':[], 'e2':[], 'e3':[], 'e5':[], 'power':[],
    },
  },
}
/* object containing all the ipfs hash data */
var hash_data = {'e':'test'}
/* object containing pointers to the ipfs data stored in files */
var cold_storage_hash_pointers = {}
/* object containing all the data types for all the objects tracked in the node */
var object_types = {}
var start_up_time = Date.now()/* start up time */
var hash_count = 0/* number of ipfs hashes being tracked */
var load_count = 0/* number of ipfs hashes loaded by the node */
var app_key = ``/* app key */


/* AES encrypts passed data with specified key, returns encrypted data. */
function decrypt_storage_data(data, key){
  try{
    var bytes  = CryptoJS.AES.decrypt(data, key);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText
  }catch(e){
    console.log('stackdata', e)
    return data
  }
}

/* decrypts AES encrypted data with the specified key, returns original data */
function encrypt_storage_data(data, key){
  var ciphertext = CryptoJS.AES.encrypt(data, key).toString();
  return ciphertext
}

/* generates a random string with a specified length */
function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

/* adds a new e5 event object that will contain all the events emitted for a new specified e5 */
function add_new_e5_to_event_data(e5){
  event_data[e5] = {
    'E5':{
      'e1':[], 'e2':[], 'e3':[], 'e4':[], 'e5':[], 'e6':[], 'e7':[],
    },
    'E52':{
      'e1':[], 'e2':[], 'e3':[], 'e4':[], 'e5':[],
    },
    'F5':{
      'e1':[], 'e2':[], 'e5':[], 'e4':[],
    },
    'G5':{
      'e1':[], 'e2':[],
    },
    'G52':{
      'e1':[], 'e2':[], 'e3':[], 'archive':[],
    },
    'H5':{
      'e1':[], 'e2':[], 'e3':[]
    },
    'H52':{
      'e1':[], 'e2':[], 'e3':[], 'e5':[], 'power':[],
    },
  }
}




/* fetches the data from an ipfs node that was uploaded via infura api */
async function fetch_object_data_from_infura(ecid_obj, count){
  var cid = ecid_obj['cid']
  if(hash_data[cid] != null) return;

  var gateways = [
    `https://gateway.pinata.cloud/ipfs/${cid}`
  ]
  var selected_gateway = gateways[0]
  selected_gateway = get_selected_gateway_if_custom_set(cid, selected_gateway)
  try {
    const response = await fetch(selected_gateway);
    if (!response.ok) {
      // console.log(response)
      throw new Error(`Failed to retrieve data from IPFS. Status: ${response}`);
    }
    var data = await response.text();
    data = decrypt_storage_data(data, app_key)
    var parsed_data = JSON.parse(data);
    hash_data[cid] = parsed_data
    load_count++
  } catch (error) {
    // console.log('Error fetching infura file: ', error)
    if(count < 5){
      await new Promise(resolve => setTimeout(resolve, 9500))
      await fetch_object_data_from_infura(ecid_obj, count+1)
    }
  }
}

/* fetches the data from an ipfs node that was uploaded via (now discontinued) nft storage api */
async function fetch_objects_data_from_nft_storage (ecid_obj, count){
  var cid = ecid_obj['cid']
  if(hash_data[cid] != null) return;
  var gateways = [
    `https://nftstorage.link/ipfs/${cid}`
  ]
  var selected_gateway = gateways[0]
  selected_gateway = get_selected_gateway_if_custom_set(cid, selected_gateway)
  try {
    const response = await fetch(selected_gateway);
    if (!response.ok) {
      // console.log(response)
      throw new Error(`Failed to retrieve data from IPFS using nft storage. Status: ${response}`);
    }
    var data = await response.text();
    data = decrypt_storage_data(data, app_key)
    var parsed_data = JSON.parse(data);
    hash_data[cid] = parsed_data
    load_count++
  } catch (error) {
    // console.log('Error fetching nft storage file: ', error)
    if(count < 5){
      await new Promise(resolve => setTimeout(resolve, 9500))
      await fetch_objects_data_from_nft_storage(ecid_obj, count+1)
    }
  }
}

/* returns a link to a specified cid if custom gateway is specified, default gateway otherwise */
function get_selected_gateway_if_custom_set(cid, default_gateway){
  if(data['custom_gateway'] != ''){
    var my_gateway = `${data['custom_gateway']}`
    return my_gateway.replace('cid', cid)
  }else{
    return default_gateway
  }
}

async function fetch_data_from_nitro(cid, depth){
  var split_cid_array = cid.split('-');
  var e5_id = split_cid_array[0]
  var nitro_cid = split_cid_array[1]

  if(hash_data[nitro_cid] != null || cold_storage_hash_pointers[nitro_cid] != null) return;
  var nitro_url = get_nitro_link_from_e5_id(e5_id)
  if(nitro_url == null) return
  const params = new URLSearchParams({
    arg_string:JSON.stringify({hashes:[nitro_cid]}),
  });
  var request = `${nitro_url}/data?${params.toString()}`
  try{
    const response = await fetch(request);
    if (!response.ok) {
      console.log('datas',response)
      throw new Error(`Failed to retrieve data. Status: ${response}`);
    }
    var data = await response.text();
    var obj = JSON.parse(data);
    var object_data = obj['data']
    var cid_data = JSON.parse(object_data[nitro_cid])
    
    hash_data[nitro_cid] = cid_data
    load_count++
  }
  catch(e){
    if(depth < 3){
      return await fetch_data_from_nitro(cid, depth+1)
    }
  }
}




/* deconstructs a 'ecid' link, which is a custom link used inside of E5 */
function get_ecid_obj(ecid){
  if(!ecid.includes('.')){
    return {'cid':ecid, 'internal_id':'', 'option':'in'}
  }
  var split_cid_array = ecid.split('.');
  var option = split_cid_array[0]
  var cid = split_cid_array[1]

  var id = cid;
  var internal_id = ''
  if(cid.includes('_')){
    var split_cid_array2 = cid.split('_');
    id = split_cid_array2[0]
    internal_id = split_cid_array2[1]
  }

  return {'cid':id, 'internal_id':internal_id, 'option':option}
}

/* starts the fetching of data stored in multiple ipfs cid links */
async function load_hash_data(cids){
  var ecids = []
  var included_ecids = []
  for(var i=0; i<cids.length; i++){
    var ecid_obj = get_ecid_obj(cids[i])
    if(!included_ecids.includes(ecid_obj['cid'])){
      ecids.push(ecid_obj)
      included_ecids.push(ecid_obj['cid'])
    }
  }
  for(var i=0; i<ecids.length; i++){
    var ecid_obj = ecids[i]
    if(hash_data[ecid_obj['cid']] == null){
      if(ecid_obj['option'] == 'in'){
        await fetch_object_data_from_infura(ecid_obj, 0)
      }
      else if(ecid_obj['option'] == 'nf'){
        await fetch_objects_data_from_nft_storage(ecid_obj, 0)
      }
      else if(ecid_obj['option'] == 'ni'){
        await fetch_data_from_nitro(ecid_obj['cid'], 0)
      }
      await new Promise(resolve => setTimeout(resolve, 6000))
    }
  }
}




/* loads all the events emitted for a specified contract and event type, for a tracked period of time. */
async function load_past_events(contract, event, e5, web3, contract_name, latest){
  try{
    var starting_block = data[e5]['current_block'][contract_name+event] == null ? data[e5]['first_block'] : data[e5]['current_block'][contract_name+event]

    var iteration = data[e5]['iteration']
    var events = []
    if(latest - starting_block < iteration){
      events = await contract.getPastEvents(event, { fromBlock: starting_block, toBlock: latest }, (error, events) => {});
    }else{
      var pos = starting_block
      while (pos < latest) {
        var to = pos+iteration < latest ? pos+iteration : latest
        var from = pos
        events = events.concat(await contract.getPastEvents(event, { fromBlock: from, toBlock: to }, (error, events) => {}))
        pos = to+1
      }
    }

    events.forEach(event => {
      event.address = null
      event.blockHash = null
      event.blockNumber = null
      event.data = null
      event.raw = null
      event.signature = null
      event.topics = null
      event.transactionHash = null
    });

    event_data[e5][contract_name][event] = event_data[e5][contract_name][event].concat(events)
    data[e5]['current_block'][contract_name+event] = latest
  }catch(e){
    console.log(e)
  }

  if(events.length > 0){
    if(contract_name == 'E52' && event == 'e4'/* Data */){
      //new data events
      var ecids = []
      for(var i=0; i<events.length; i++){
        if(!ecids.includes(events[i].returnValues.p4/* string_data */)){
          ecids.push(events[i].returnValues.p4/* string_data */)
        }
      }
      load_hash_data(ecids)
      add_ecids(ecids)
    }
    else if(contract_name == 'E52' && event == 'e5'/* Metadata */){
      //new metadata events
      var ecids = []
      for(var i=0; i<events.length; i++){
        if(!ecids.includes(events[i].returnValues.p4/* metadata */)){
          ecids.push(events[i].returnValues.p4/* metadata */)
        }
      }
      load_hash_data(ecids)
      add_ecids(ecids)
    }
    else if(contract_name == 'H52' && event == 'e5'/* Award */){
      //new award events
      var ecids = []
      for(var i=0; i<events.length; i++){
        if(!ecids.includes(events[i].returnValues.p4/* metadata */)){
          ecids.push(events[i].returnValues.p4/* metadata */)
        }
      }
      load_hash_data(ecids)
      add_ecids(ecids)
    }
    if(contract_name == 'E5' && event == 'e1'/* MakeObject */){
      //record all the object types
      for(var i=0; i<events.length; i++){
        if(object_types[e5] == null){
          object_types[e5] = {}
        }
        object_types[e5][parseInt(events[i].returnValues.p1/* object_id */)] = parseInt(events[i].returnValues.p2/* object_type */)
      }
    }
  }
  
}

/* starts the loading of all the events stored in all the E5 smart contracts for a specified E5 */
async function set_up_listeners(e5) {
  try{
    const web3 = new Web3(data[e5]['web3']);
    const e5_contract = new web3.eth.Contract(E5_CONTRACT_ABI, data[e5]['addresses'][0]);
    const e52_contract = new web3.eth.Contract(E52_CONTRACT_ABI, data[e5]['addresses'][1]);
    const f5_contract = new web3.eth.Contract(F5_CONTRACT_ABI, data[e5]['addresses'][2]);
    const g5_contract = new web3.eth.Contract(G5_CONTRACT_ABI, data[e5]['addresses'][3]);
    const g52_contract = new web3.eth.Contract(G52_CONTRACT_ABI, data[e5]['addresses'][4]);
    const h5_contract = new web3.eth.Contract(H5_CONTRACT_ABI, data[e5]['addresses'][5]);
    const h52_contract = new web3.eth.Contract(H52_CONTRACT_ABI, data[e5]['addresses'][6]);
    const latest = Number(await web3.eth.getBlockNumber())
    const t = 1000
    //E5
    load_past_events(e5_contract, 'e1', e5, web3, 'E5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(e5_contract, 'e2', e5, web3, 'E5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(e5_contract, 'e3', e5, web3, 'E5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(e5_contract, 'e4', e5, web3, 'E5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(e5_contract, 'e5', e5, web3, 'E5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(e5_contract, 'e6', e5, web3, 'E5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(e5_contract, 'e7', e5, web3, 'E5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    

    //E52
    load_past_events(e52_contract, 'e1', e5, web3, 'E52', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(e52_contract, 'e2', e5, web3, 'E52', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(e52_contract, 'e3', e5, web3, 'E52', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(e52_contract, 'e4', e5, web3, 'E52', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(e52_contract, 'e5', e5, web3, 'E52', latest)
    await new Promise(resolve => setTimeout(resolve, t))

    //F5
    load_past_events(f5_contract, 'e1', e5, web3, 'F5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(f5_contract, 'e2', e5, web3, 'F5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(f5_contract, 'e5', e5, web3, 'F5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(f5_contract, 'e4', e5, web3, 'F5', latest)
    await new Promise(resolve => setTimeout(resolve, t))

    //G5
    load_past_events(g5_contract, 'e1', e5, web3, 'G5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(g5_contract, 'e2', e5, web3, 'G5', latest)
    await new Promise(resolve => setTimeout(resolve, t))

    //G52
    load_past_events(g52_contract, 'e1', e5, web3, 'G52', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(g52_contract, 'e2', e5, web3, 'G52', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(g52_contract, 'e3', e5, web3, 'G52', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(g52_contract, 'archive', e5, web3, 'G52', latest)
    await new Promise(resolve => setTimeout(resolve, t))

    //H5
    load_past_events(h5_contract, 'e1', e5, web3, 'H5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(h5_contract, 'e2', e5, web3, 'H5', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(h5_contract, 'e3', e5, web3, 'H5', latest)
    await new Promise(resolve => setTimeout(resolve, t))

    //H52
    load_past_events(h52_contract, 'e1', e5, web3, 'H52', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(h52_contract, 'e2', e5, web3, 'H52', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(h52_contract, 'e3', e5, web3, 'H52', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(h52_contract, 'e5', e5, web3, 'H52', latest)
    await new Promise(resolve => setTimeout(resolve, t))
    load_past_events(h52_contract, 'power', e5, web3, 'H52', latest)
    await new Promise(resolve => setTimeout(resolve, t))

    //load nitro links
    load_nitro_links(e5)
  }catch(e){
    console.log(e)
  }
}

/* starts the loading of all the E5 event data if the app key is defined */
function load_events_for_all_e5s(){
  if(app_key == null || app_key == '') return;

  var e5s = data['e']
  for(var i=0; i<e5s.length; i++){ 
    try{
      set_up_listeners(e5s[i])
    }catch(e){
      console.log(e)
    }
  }
}

function add_ecids(ecids){
  var count = 0
  ecids.forEach(ecid => {
    if(ecid.includes('.') || ecid.startsWith('Qm')){
      count++
    }
  });
  hash_count+=count
}






/* stores a back up of all the node's data in a file. */
async function store_back_up_of_data(){
  var obj = {'data':data, 'event_data':event_data, 'hash_data':hash_data, 'object_types':object_types, 'cold_storage_hash_pointers':cold_storage_hash_pointers}
  const write_data = encrypt_storage_data(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v), data['key']);
  var success = true
  var backup_name = ''
  var isloading = true;
  const now = new Date(Date.now())
  var dir = './backup_data'
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  fs.writeFile(`backup_data/${now}.txt`, write_data, (error) => {
    if (error) {
      console.log(e)
      success =  false
    }else{
      console.log("data written correctly");
      backup_name = `${now}.txt`
    }

    isloading = false
  });

  while (isloading == true) {
    if (isloading == false) break
    await new Promise(resolve => setTimeout(resolve, 700))
  }

  return {success: success, backup_name: backup_name}
}

/* restores backed up data of the node. */
async function restore_backed_up_data_from_storage(file_name, key, backup_key, should_restore_key){
  var name = file_name.endsWith('.txt') ? file_name : `${file_name}.txt`
  console.log(name);
  var success = true;
  var isloading = true;
  fs.readFile(`backup_data/${name}`, (error, data) => {
    if (error) {
      console.log(error)
      success = false
      return success;
    }
    const decrypted_data = decrypt_storage_data(data.toString(), key)
    // console.log('decrypted_data: ', decrypted_data)
    const obj = JSON.parse(decrypted_data);
    if(obj == data){
      console.log('invalid back-up key supplied')
      success = false
    }else{
      data = obj['data']
      event_data = obj['event_data']
      hash_data = obj['hash_data']
      object_types = obj['object_types']
      cold_storage_hash_pointers = obj['cold_storage_hash_pointers']
      console.log('successfully loaded back-up data')

      if(should_restore_key != null && should_restore_key == true){
        data['key'] = backup_key
      }
    }
    isloading = false
  });

  while (isloading == true) {
    if (isloading == false) break
    await new Promise(resolve => setTimeout(resolve, 700))
  }
  return success
}







/* returns all the objects (posts, jobs, contracts etc) stored in this node for a specified target type */
async function get_all_objects(target_type){
  var all_objects = []
  var all_object_positions = {}
  var e5s = data['e']

  var search_cids = []
  var focused_ecid_objects = []
  var focused_object_ids = []
  var focused_object_ids_e5s = []
  for(var i=0; i<e5s.length; i++){
    var events = event_data[e5s[i]]['E52']['e5'/* Metadata */]
    for(var e=0; e<events.length; e++){
      var metadata_pointer = events[e].returnValues.p4/* metadata */
      var object_id = parseInt(events[e].returnValues.p1/* target_obj_id */)
      
      if(object_types[e5s[i]] != null && object_types[e5s[i]][object_id] == target_type){
        var ecid_obj = get_ecid_obj(metadata_pointer)
        var cid = ecid_obj['cid']
        if(!search_cids.includes(cid)){
          search_cids.push(cid)
          focused_ecid_objects.push(ecid_obj)
          focused_object_ids.push(object_id)
          focused_object_ids_e5s.push(e5s[i])
        }
      }
    }
  }

  var object_cid_data = await fetch_hashes_from_file_storage_or_memory(search_cids)

  for(var i=0; i<focused_ecid_objects.length; i++){
    var ecid_obj = focused_ecid_objects[i]
    var e5 = focused_object_ids_e5s[i]
    var object_id = focused_object_ids[i]
    
    var cid = ecid_obj['cid']
    var container_data = object_cid_data[cid]
    if(container_data != null){
      var internal_id = ecid_obj['internal_id']
      var obj_data = internal_id == '' ? container_data : container_data[internal_id]
      var pos = all_objects.length
      if(all_object_positions[e5+object_id] != null){
        //this is an object that was edited
        all_objects[e5+object_id] = {'id':object_id, 'data':obj_data}
      }else{
        all_objects.push({'id':object_id, 'data':obj_data})
        all_object_positions[e5+object_id] = pos
      }
    }
  }

  return all_objects
}

/* filters objects by a specified set of tags */
async function search_for_object_ids_by_tags(tags, target_type){
  var all_objects = await get_all_objects(target_type)

  var filtered_objects = [];
  filtered_objects = all_objects.filter(function (object) {
    var object_tags = object['data']['entered_indexing_tags'] == null ? [] : object['data']['entered_indexing_tags']
    const containsAll = tags.some(r=> object_tags.includes(r))
    return (containsAll)
  });//first find all the objects that have at least 1 tag from the searched


  var final_filtered_objects = []
  final_filtered_objects = filtered_objects.filter(function (object) {
    var object_tags = object['data']['entered_indexing_tags'] == null ? [] : object['data']['entered_indexing_tags']
    const containsAll = tags.every(element => {
      return object_tags.includes(element);
    });
    return (containsAll)
  });//then filter those objects for the objects that have all the tags specified

  filtered_objects.forEach(object => {
    if(!final_filtered_objects.includes(object)){
      final_filtered_objects.push(object)
    }
  });


  var ids = []
  final_filtered_objects.forEach(object => {
    ids.push(object['id'])
  });


  return ids;
}

/* filters objects by a specified title */
async function search_for_object_ids_by_title(title, target_type){
  var all_objects = await get_all_objects(target_type)
  var filtered_objects = [];
  filtered_objects = all_objects.filter(function (object) {
    var object_title = object['data']['entered_title_text'] == null ? '' : object['data']['entered_title_text']
    const match = object_title.toLowerCase().includes(title.toLowerCase())
    if(target_type == 19/* 19(audio_object) */){
      //its a album being searched, so check the songs in it
      var songs = object['data']['songs']
      var filtered_songs = songs.filter(function (object) {
        var song_title = object['song_title'] == null ? '' : object['song_title']
        var song_composer = object['song_composer'] == null ? '' : object['song_composer']
        return (song_title.toLowerCase().includes(title.toLowerCase()) || song_composer.toLowerCase().includes(title.toLowerCase()))
      });
      if(filtered_songs.length > 0){
        return true
      }
    }

    if(target_type == 20/* 20(video_object) */){
      //its a video being searched, check the videos in it
      var videos = object['data']['videos']
      var filtered_videos = videos.filter(function (object) {
        var video_title = object['video_title'] == null ? '' : object['video_title']
        var video_composer = object['video_composer'] == null ? '' : object['video_composer']
        return (video_title.toLowerCase().includes(title.toLowerCase()) || video_composer.toLowerCase().includes(title.toLowerCase()))
      });
      if(filtered_videos.length > 0){
        return true
      }
    }

    return (match)
  });

  var ids = []
  filtered_objects.forEach(object => {
    ids.push(object['id'])
  });

  return ids;
}





/* returns the subscription payment information for a specified account */
async function get_subscription_payment_information(e5, signature_data, subscription, signature){
  const web3 = new Web3(data[e5]['web3']);
  try{
    var original_address = await web3.eth.accounts.recover(signature_data.toString(), signature)
    const e5_contract = new web3.eth.Contract(E5_CONTRACT_ABI, data[e5]['addresses'][0]);
    var accounts = await e5_contract.methods.f167([],[original_address], 2).call((error, result) => {});
    var address_account = accounts[0]

    const f5_contract = new web3.eth.Contract(F5_CONTRACT_ABI, data[e5]['addresses'][2]);
    var payments = await f5_contract.methods.f229([subscription], [[address_account]]).call((error, result) => {});
    var subscription_payment = payments[0][0]

    return {'account':address_account, 'address':original_address, 'expiry_time':subscription_payment, success:false}
  }catch(e){
    console.log(e)
    return null
  }
}

/* returns the E5 contracts linked to the specified E5 from a specified E5 address */
async function get_e5_contracts_from_address(provider, e5_address, first_block){
  const web3 = new Web3(provider);
  try{
    const e5_contract = new web3.eth.Contract(E5_CONTRACT_ABI, e5_address);
    var contract_addresses_events = await e5_contract.getPastEvents('e7', { fromBlock: first_block, toBlock: first_block+50 }, (error, events) => {})
    var contract_addresses = contract_addresses_events[0].returnValues.p5
    return contract_addresses
  }catch(e){
    console.log(e)
    return []
  }
}

/* tests if a supplied provider is a valid web3 provider */
async function test_provider(provider, e5, E5_address, first_block){
  try{
    const web3 = new Web3(provider);
    const e5_contract = new web3.eth.Contract(E5_CONTRACT_ABI, E5_address);
    var contract_addresses_events = await e5_contract.getPastEvents('e7', { fromBlock: first_block, toBlock: first_block+50 }, (error, events) => {})

    if(contract_addresses_events instanceof Array && contract_addresses_events.length > 0){
      return true
    }
    return false
  }catch(e){
    console.log(e)
    return false
  }
}

/* tests if a supplied gateway is a valid gateway */
async function test_gateway(new_provider){
  var cid = 'bafkreigapfe43wknpmflvp234k7fuijmv4fxbyjaybhcgc37pscsschi4u'
  var my_gateway = `${new_provider}`
  var new_gateway =  my_gateway.replace('cid', cid)
  try {
    const response = await fetch(new_gateway);
    if (!response.ok) {
      console.log(response)
      throw new Error(`Failed to retrieve data from IPFS using nft storage. Status: ${response}`);
    }
    return true;
  } catch (error) {
    console.log('Error testing new gateway: ', error)
    return false;
  }
}




/* filters events for a specified E5 and event id, with various filters */
function filter_events(requested_e5, requested_contract, requested_event_id, filter, from_filter){
  // console.log('requested_e5: ', requested_e5)
  var focused_events = event_data[requested_e5][requested_contract][requested_event_id]
  const check_event = (eventt) => {
    var accepted = true
    for (const key in filter) {
      if(filter[key] instanceof Array){
        if(!filter[key].includes(eventt['returnValues'][key])){
          accepted = false
        }
      }else{
        if(eventt['returnValues'][key] != filter[key]){
          accepted = false
        }
      }
    }

    if(from_filter != null && from_filter['p'] != null && from_filter['value'] != null){
      var from_filter_p = from_filter['p']
      var from_filter_value = from_filter['value']

      if(parseInt(eventt['returnValues'][from_filter_p]) < parseInt(from_filter_value)){
        //if the event time or block is less than required
        accepted = false
      }
    }
    return accepted
  }

  try{
    var filtered_events = focused_events.filter(check_event)
    return filtered_events
  }
  catch(e){
    console.log(e)
    return []
  }
  
  
}

/* stores all the ipfs data in files. */
function store_hashes_in_file_storage_if_memory_full(){
  var keys = Object.keys(hash_data)
  if(keys.length >= 125){
    //store all the data in a file
    const now = Date.now()
    const write_data = JSON.stringify(hash_data, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    var dir = './hash_data'
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    fs.writeFile(`hash_data/${now}.json`, write_data, (error) => {
      if (error) {
        console.log(error)
      }else{
        for(var i=0; i<keys.length; i++){
          cold_storage_hash_pointers[keys[i]] = now
        }
        hash_data = {}
        console.log("hashdata written correctly");
      }
    });
  }
}

/* fetches data stored in memory or file storage for specified ipfs hashes */
async function fetch_hashes_from_file_storage_or_memory(hashes){
  var hash_data_objects = {}
  var file_name_function_memory = {}
  var is_loading_file = false
  for(var i=0; i<hashes.length; i++){
    if(hash_data[hashes[i]] != null){
      hash_data_objects[hashes[i]] = hash_data[hashes[i]]
    }
    else if(cold_storage_hash_pointers[hashes[i]]!= null){
      //try fetching it from storage
      var file_name = cold_storage_hash_pointers[hashes[i]]

      if(file_name_function_memory[file_name] != null){
        var cold_storage_obj = file_name_function_memory[file_name]
        hash_data_objects[hashes[i]] = cold_storage_obj[hashes[i]]
      }else{
        is_loading_file = true
        fs.readFile(`hash_data/${file_name}.json`, (error, data) => {
          if (error) {
            console.error(error);
          }else{
            var cold_storage_obj = JSON.parse(data.toString())
            hash_data_objects[hashes[i]] = cold_storage_obj[hashes[i]]
            file_name_function_memory[file_name] = cold_storage_obj
          }
          is_loading_file = false
        });
        while (is_loading_file == true) {
          if (is_loading_file == false) break
          await new Promise(resolve => setTimeout(resolve, 700))
        }
      }
    }
  }

  // console.log('hash_data_objects: ', hash_data_objects)
  return hash_data_objects
}

// async function get_maximum_available_disk_space(){
//   var isloading = true
//   var available_space = 0
//   disk.check('/', function(err, info) {
//     if(err){
//       console.log(err)
//     }else{
//       const freeInPercentage = info.free / info.total;
//       const usedInPercentage = info.available / info.total;
//       available_space = info.free / (1024 * 1024)
//     }
//     isloading = false
//   });
//   while (isloading == true) {
//     if (isloading == false) break
//     await new Promise(resolve => setTimeout(resolve, 700))
//   }
//   return available_space
// }

function round_down(number, round_down_value){
  var n = (Math.floor(number / round_down_value)) * round_down_value
  return n
}

async function get_round_down_value(web3, blockNumber){
  try{
    const currentBlock = await web3.eth.getBlock(blockNumber - 1);
    const previousBlock = await web3.eth.getBlock(blockNumber - 2);
    const miningTime = Number(currentBlock.timestamp - previousBlock.timestamp);
    return Math.round(1 / (miningTime / 120))
  }
  catch(e){
    console.log(e)
    return 10
  }
}

/* returns an accounts available storage in megabytes from their signature */
async function fetch_accounts_available_storage(signature_data, signature){
  const e5 = data['target_account_e5']
  const web3 = new Web3(data[e5]['web3']);
  try{
    var current_block_number = Number(await web3.eth.getBlockNumber())
    var round_down_value = await get_round_down_value(web3, (current_block_number))
    var round_down_block = round_down(current_block_number, round_down_value)
    var current_block = await web3.eth.getBlock(round_down_block);
    var block_hash = current_block.hash

    if(block_hash.toString() !== signature_data.toString()){
      console.log('block hash generated and signature received do not match')
      return { available_space: 0.0, account: 0 }
    } 

    var original_address = await web3.eth.accounts.recover(signature_data.toString(), signature)
    const e5_contract = new web3.eth.Contract(E5_CONTRACT_ABI, data[e5]['addresses'][0]);
    var accounts = await e5_contract.methods.f167([],[original_address], 2).call((error, result) => {});
    var address_account = accounts[0]

    var payment_data = data['storage_data'][address_account.toString()]
    if(payment_data == null) return { available_space: 0.0, account: address_account };
    return { available_space: (payment_data['acquired_space'] - payment_data['utilized_space']), account: address_account }
  }catch(e){
    console.log(e)
    return { available_space: 0.0, account: 0 }
  }
}

/* checks for new storage payments and updates how much storage space their account has in the node */
async function update_storage_payment_information(){
  const e5 = data['target_account_e5']
  const storage_boot_time = parseInt(data['storage_boot_time'])
  if(e5 == '') return;
  var target_storage_purchase_recipient_account = data['target_storage_purchase_recipient_account']
  var last_checked_storage_block = data['last_checked_storage_block']
  // console.log('last_checked_storage_block', last_checked_storage_block)
  
  var from_filter = {'p':'p6'/* block_number */, 'value': last_checked_storage_block}
  var events = filter_events(e5, 'H52', 'e1'/* transfer */, {p3/* receiver */:target_storage_purchase_recipient_account}, from_filter)

  var purchase_events = filter_events(e5, 'E52', 'e4'/* data */, {p1/* target_id */:23, p5/* int_data */: target_storage_purchase_recipient_account}, {})

  const check_event = (eventt) => {
    return (parseInt(eventt.returnValues.p5/* timestamp */) > parseInt(storage_boot_time))
  }

  const check_purchase_event = (eventt) => {
    return (parseInt(eventt.returnValues.p6/* timestamp */) > parseInt(storage_boot_time))
  }

  events = events.filter(check_event)
  purchase_events = purchase_events.filter(check_purchase_event)




  if(events.length > 0){
    //the tracked account received some payments
    var payment_data = {}
    for(var i=0; i<events.length; i++){
      var event = events[i]
      var exchange_id = event.returnValues.p1.toString()/* exchange_id */
      var amount = event.returnValues.p4/* amount */
      var depth = event.returnValues.p7/* depth */
      var event_block = event.returnValues.p6/* block_number */

      const individual_block_filter = (eventt) => {
        return parseInt(eventt.returnValues.p7/* block_number */) == parseInt(event_block)
      }

      var data_events = purchase_events.filter(individual_block_filter)
      
      if(data_events.length > 0){
        var data_event = data_events[0]
        if(data_event.returnValues.p4/* string_data */ == 'storage'){
          var sized_amount = get_actual_number(amount.toString().toLocaleString('fullwide', {useGrouping:false}), depth.toString().toLocaleString('fullwide', {useGrouping:false}))
          var sender = event.returnValues.p2.toString()/* sender */

          if(payment_data[sender] == null) payment_data[sender] = {}
          if(payment_data[sender][exchange_id] == null) payment_data[sender][exchange_id] = bigInt(0)
          payment_data[sender][exchange_id] = bigInt(payment_data[sender][exchange_id]).plus(sized_amount)
          // console.log(`added ${sized_amount} for exchange: ${exchange_id} for sender: ${sender}`)
        }else{
          // console.log('event string not `storage`')
        }
      }
      else{
        // console.log('no purchase events recorded')
      }
      
    }

    var price_per_megabyte = data['price_per_megabyte']
    var accounts_space_units = {}
    for (const account_payment in payment_data) {
      var final_space_units = -1
      for(var p=0; p<price_per_megabyte.length; p++){
        var exchange = price_per_megabyte[p]['exchange']
        var amount = bigInt(price_per_megabyte[p]['amount'])

        var paid_amount_for_exchange = payment_data[account_payment][exchange]
        var final_amount = bigInt(amount).equals(0) ? bigInt(1) : bigInt(amount)
        var space_units_acquired = bigInt(paid_amount_for_exchange).divide(final_amount)
        
        if(final_space_units > space_units_acquired || final_space_units == -1){
          final_space_units = space_units_acquired
          // console.log(`space unit of ${space_units_acquired} set`)
        }else{
          // console.log(`space unit of ${space_units_acquired} not set`)
        }
      }
      if(final_space_units > 0){
        accounts_space_units[account_payment] = final_space_units
        // console.log(`final space units of ${final_space_units} set to account ${account_payment}`)
      }
    }

    for (const account in accounts_space_units) {
      var acquired_space = accounts_space_units[account]
      if(acquired_space > data['max_buyable_capacity']){
        acquired_space = data['max_buyable_capacity']
      }
      if(data['storage_data'][account] == null){
        data['storage_data'][account] = {'files':0, 'acquired_space':parseFloat(acquired_space), 'utilized_space':0.0}
      }else{
        data['storage_data'][account]['acquired_space'] = parseFloat(data['storage_data'][account]['acquired_space']+acquired_space)
      }
      // console.log(`updated storage space for account ${account} to ${data['storage_data'][account]['acquired_space']} mbs`)
    }
  }else{
    // console.log('no storage payments so far.')
  }

  data['last_checked_storage_block'] = (data[e5]['current_block']['H52'+'e1'])
}

/* returns a big int value from a number and its specified depth */
function get_actual_number(number, depth){
  var p = (bigInt(depth).times(72)).toString().toLocaleString('fullwide', {useGrouping:false})
  var depth_vaule = bigInt(('1e'+p))
  return (bigInt(number).times(depth_vaule)).toString().toLocaleString('fullwide', {useGrouping:false})
}





/* returns an array of binaries from their respective file base64encoded datas */
function get_file_binaries(audio_file_datas){
  var binary_array = []
  for(var i=0; i<audio_file_datas.length; i++){
    var dataURL = audio_file_datas[i]
    const base64Data = dataURL.split(",")[1];
    const binaryData = Buffer.from(base64Data, "base64");
    binary_array.push(binaryData)
  }
  return binary_array
}

/* returns the total storage space set to be taken up by an array of binaries in megabytes */
function get_length_of_binary_files_in_mbs(binary_array){
  var length = 0
  for(var i=0; i<binary_array.length; i++){
    length += binary_array[i].length
  }

  return length / (1024 * 1024)
}

/* stores multiple binary files in file storage */
async function store_files_in_storage(binaries, file_types, file_datas){
  var file_names = []
  var successful = true;
  for(var i=0; i<binaries.length; i++){
    var binaryData = binaries[i]
    var file_name = await generate_hash(file_datas[i])
    
    var dir = './storage_data'
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    var isloading = true;
    fs.writeFile(`storage_data/${file_name}.${file_types[i]}`, binaryData, (error) => {
      if (error) {
        console.log(e)
        successful = false
      }else{
        console.log("data written correctly");
        file_names.push(file_name)
      }
      isloading = false
    });

    while (isloading == true) {
      if (isloading == false) break
      await new Promise(resolve => setTimeout(resolve, 700))
    }
    
    if(successful == false){
      return null
    }
  }
  return file_names;
}





/* returns the mimetype for a specified set of file extensions */
function get_final_content_type(content_type){
  var obj = {'mp4':'video/mp4', 'mp3':'audio/mpeg', 'jpeg':'image/jpeg', 'jpg':'image/jpeg', 'png':'image/png', 'pdf':'application/pdf', 'zip':'application/zip'}
  return obj[content_type]
}

/* formats a number by adding commas every three digits */
function number_with_commas(x) {
    if(x == null) x = '';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function get_e5_chain_time(e5){
  var provider = data[e5]['web3']
  var E5_address = data[e5]['addresses'][0]
  const web3 = new Web3(provider);
  try{
    const e5_contract = new web3.eth.Contract(E5_CONTRACT_ABI, E5_address);
    var chain_time = await e5_contract.methods.f147(2/* get_block_timestamp */).call((error, result) => {});
    return chain_time
  }catch(e){
    console.log(e)
    return (Date.now()/1000)
  }
  
}






async function generate_hash(data) {
  // Encode the data as a Uint8Array
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  // Generate the hash using the SubtleCrypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);

  // Convert the hash to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

  return hashHex.substring(0, 64);
}

function get_length_of_string_files_in_mbs(string_array){
  var length = 0

  for(var i=0; i<string_array.length; i++){
    var object_string_length = lengthInUtf8Bytes(string_array[i])
    length += object_string_length
  }

  return length / (1024 * 1024)
}

function lengthInUtf8Bytes(str) {
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}





async function store_objects_in_node(file_datas){
  var file_names = []
  for(var i=0; i<file_datas.length; i++){
    var object_string = file_datas[i]
    var file_name = await generate_hash(object_string)
    hash_data[file_name] = JSON.parse(object_string)
    file_names.push(file_name)
  }

  return file_names
}

function is_all_file_type_ok(file_types){
  var ok = true
  file_types.forEach(file_type => {
    if(file_type != 'mp4' && file_type != 'mp3' && file_type != 'png' && file_type != 'jpeg' && file_type != 'jpg' && file_type != 'pdf' && file_type != 'zip'){
      ok = false
    }
  });
  return ok
}

function load_nitro_links(e5){
  var nitro_link_registry = filter_events(e5, 'E52', 'e4', {p3/* context */:400}, {})
  var registered_nitro_links = {}
  var registered_nitro_links_authors = {}
  nitro_link_registry.forEach(event => {
    var id = event.returnValues.p1/* target_id */
    var data = event.returnValues.p4/* string_data */
    var author = event.returnValues.p2/* sender_acc_id */
    if(registered_nitro_links[(id+e5)] != null){
      if(author.toString() == registered_nitro_links_authors[(id+e5)].toString()){
        //link was reset by author
        registered_nitro_links[(id+e5)] = data
      }
    }else{
      registered_nitro_links[(id+e5)] = data
      registered_nitro_links_authors[(id+e5)] = author
    }
  });
  data['nitro_link_data'][e5] = registered_nitro_links
}




/* returns the url-link for a specified nitro object */
function get_nitro_link_from_e5_id(e5_id){
  var all_nitro_pointer_mappings = get_all_sorted_objects_mappings(data['nitro_link_data'])
  return all_nitro_pointer_mappings[e5_id]
}

/* combines all the mappings for each E5 into one object */
function  get_all_sorted_objects_mappings(object){
  var all_objects = {}
  for(var i=0; i<data['e'].length; i++){
      var e5 = data['e'][i]
      var e5_objects = object[e5]
      var all_objects_clone = structuredClone(all_objects)
      all_objects = { ...all_objects_clone, ...e5_objects}
  }

  return all_objects
}








app.get('/', (req, res) => {
  res.send('Signaling server is running.');
});

/* endpoint for returning E5 event data tracked by the node */
app.get('/events', (req, res) => {
  const arg_string = req.query.arg_string;
  try{
    var arg_obj = JSON.parse(arg_string)
    var requests = arg_obj.requests
    var filtered_events_array = []

    for(var i=0; i<requests.length; i++){
      var requested_e5 = requests[i]['requested_e5']
      var requested_contract = requests[i]['requested_contract']
      var requested_event_id = requests[i]['requested_event_id']
      var filter = requests[i]['filter']
      var from_filter = requests[i]['from_filter']

      var filtered_events = filter_events(requested_e5, requested_contract, requested_event_id, filter, from_filter)
      filtered_events_array.push(filtered_events)
    }
    
    var obj = {'data':filtered_events_array, success:true}
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    return res.send(string_obj);
  }
  catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }
});//ok

/* endpoint for returning E5 hash data stored in ipfs */
app.get('/data', async (req, res) => {
  const arg_string = req.query.arg_string;
  try{
    var arg_obj = JSON.parse(arg_string)
    var hashes = arg_obj.hashes
    var data = await fetch_hashes_from_file_storage_or_memory(hashes)
    var obj = {'data':data, success:true}
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    res.send(string_obj);
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }
});//ok

/* endpoint for filtering tracked E5 objects by specified tags */
app.get('/tags', async (req, res) => {
  const arg_string = req.query.arg_string;
  // console.log(`arg string: ${arg_string}`);
  try{
    var arg_obj = JSON.parse(arg_string)
    var tags = arg_obj.tags
    var target_type = arg_obj.target_type
    var ids = await search_for_object_ids_by_tags(tags, target_type)
    var obj = {'data':ids, success:true}
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    res.send(string_obj);
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string' , success:false}));
  }
});//ok

/* endpoint for filtering tracked E5 objects by specified a title */
app.get('/title', async (req, res) => {
  const arg_string = req.query.arg_string;
  // console.log(`arg string: ${arg_string}`);
  try{
    var arg_obj = JSON.parse(arg_string)
    var title = arg_obj.title
    var target_type = arg_obj.target_type
    var ids = await search_for_object_ids_by_title(title, target_type)
    var obj = {'data':ids, success:true}
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    res.send(string_obj);
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string' , success:false}));
  }
});//ok

/* admin endpoint for restoring the node to a backed up version */
app.post('/restore', async (req, res) => {
  try{
    const file_name = req.query.file_name;
    const backup_key = req.query.backup_key;
    const data_key = req.query.data_key
    const should_restore_key = req.query.should_restore_key
    if(file_name == null || file_name == '' || backup_key == null || backup_key == '' || data_key == null || data_key == ''){
      res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
      return;
    }

    if(data['key'] !== backup_key){
      res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
      return;
    }
    const success = await restore_backed_up_data_from_storage(file_name, data_key, backup_key, should_restore_key)
    if(success == true){
      var obj = {message:`Backup restoration of ${file_name} successful.`, success:true}
      var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
      res.send(string_obj);
    }else{
      var obj = {message:`Backup restoration of ${file_name} unsuccessful. Please ensure the file was not corrupted and the back up key is valid`, success:false}
      var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
      res.send(string_obj);
    }
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }
});//ok ------

/* enpoint for checking if node is online */
app.get('/marco', (req, res) => {
  var ipfs_hashes = load_count
  var storage_accounts_length = Object.keys(data['storage_data']).length
  var booted = app_key != '' && app_key != null
  var e5_data = {}
  data['e'].forEach(e5 => {
    e5_data[e5] = data[e5]
  });
  
  var dir = './backup_data/'
  var files = fs.existsSync(dir) ? fs.readdirSync(dir) : []
  var files_obj = {'data':files}
  var encrypted_files_obj = encrypt_storage_data(JSON.stringify(files_obj), data['key'])
  var obj = {
    'ipfs_hashes':`${number_with_commas(ipfs_hashes)} out of ${number_with_commas(hash_count)}`, 
    'tracked_E5s':data['e'],//
    'storage_accounts':storage_accounts_length,// 
    'target_storage_purchase_recipient_account':data['target_storage_purchase_recipient_account'],// 
    'max_buyable_capacity':data['max_buyable_capacity'],//
    'target_account_e5':data['target_account_e5'],//
    'price_per_megabyte':data['price_per_megabyte'],
    'start_up_time':start_up_time,//
    'booted':booted,//
    'total_files_stored':data['metrics']['total_files_stored'],
    'total_space_utilized':data['metrics']['total_space_utilized'],
    'e5_data':e5_data,
    'custom_gateway':data['custom_gateway'],
    'encrypted_files_obj':encrypted_files_obj,
    'unlimited_basic_storage':data['unlimited_basic_storage'],
    success:true
  }
  
  if(Date.now() - parseInt(start_up_time) < (5 * 60 * 1000)){
    obj['backup-key'] = data['key']
  }
  var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
  res.send(string_obj);
});//ok

/* enpoint for updating the node's provider for a specified E5 */
app.post('/update_provider', async (req, res) => {
  try{
    const new_provider = req.query.new_provider;
    const e5 = req.query.e5;
    const backup_key = req.query.backup_key;

    if(new_provider == null || new_provider == '' || backup_key == null || backup_key == '' || e5 == null || e5 == ''){
      res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
      return;
    }

    if(data['key'] !== backup_key){
      res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
      return;
    }

    if(!data['e'].includes(e5)){
      res.send(JSON.stringify({ message: 'Requested E5 not being tracked', success:false }));
      return;
    }

    var status = await test_provider(new_provider, e5, data[e5]['addresses'][0], data[e5]['first_block'])
    if(status == false){
      //bad provider
      res.send(JSON.stringify({ message: 'That provider is unavailable to use with the E5', success:false }));
      return;
    }else{
      data[e5]['web3'] = new_provider
      var obj = {message:`Web3 provider for ${e5} updated to '${new_provider}' successfully.`, success:true}
      var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
      res.send(string_obj);
    }
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }
});//ok -------

/* endpoint for updating the node's gateway provider for E5 data. */
app.post('/update_content_gateway', async (req, res) => {
  try{
    const new_provider = req.query.new_provider;
    const backup_key = req.query.backup_key;

    if(new_provider == null || new_provider == '' || backup_key == null || backup_key == ''){
      res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
      return;
    }

    if(data['key'] !== backup_key){
      res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
      return;
    }

    if(!new_provider.includes('cid')){
      res.send(JSON.stringify({ message: `That gateway provider is invalid. You need to specify a url that contains the keyword 'cid'.`, success:false }));
      return;
    }

    var test_result = await test_gateway(new_provider)
    if(test_result == false){
      res.send(JSON.stringify({ message: 'That gateway is invalid or unavailable.' , success:false}));
      return;
    }else{
      data['custom_gateway'] = new_provider
      var obj = {message:`Custom gateway updated to '${new_provider}' successfully.`, success:true}
      var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
      res.send(string_obj);
    }
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }
});//ok ----

/* admin endpoint for booting a new E5 to be tracked by the node */
app.post('/new_e5', async (req, res) => {
  const arg_string = req.query.arg_string;
  console.log(`arg string: ${arg_string}`);
  try{
    var arg_obj = JSON.parse(arg_string)
    const e5 = arg_obj.e5;
    const backup_key = arg_obj.backup_key;
    const e5_address = arg_obj.e5_address;
    const web3 = arg_obj.web3;
    const first_block = arg_obj.first_block;
    const iteration = arg_obj.iteration;

    if(e5 == null || e5 == '' || backup_key == null || backup_key == ''){
      res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
      return;
    }

    if(data['key'] !== backup_key){
      res.send(JSON.stringify({ message: 'Invalid back-up key' , success:false}));
      return;
    }

    if(e5_address == null || e5_address == ''){
      res.send(JSON.stringify({ message: 'An E5 address needs to be specified.', success:false }));
      return;
    }

    if(web3 == null || web3 == ''){
      res.send(JSON.stringify({ message: 'The web3 provider needs to be specified', success:false }));
      return;
    }

    if(first_block == null || first_block == 0 || isNaN(first_block)){
      res.send(JSON.stringify({ message: `The first block value cannot be 0 or null. It should be the block that the E5 was deployed in.`, success:false }));
      return;
    }

    if(iteration == null || iteration == '' || iteration == 0 || isNaN(iteration)){
      res.send(JSON.stringify({ message: `The block iteration needs to be specified.`, success:false }));
      return;
    }

    if(data['e'].includes(e5)){
      res.send(JSON.stringify({ message: `The E5 already exists.`, success:false }));
      return;
    }

    var contract_addresses = await get_e5_contracts_from_address(web3, e5_address, first_block)
    if(contract_addresses.length != 7){
      res.send(JSON.stringify({ message: `The E5 address specified is invalid`, success:false }));
      return;
    }

    var status = await test_provider(web3, e5, e5_address, first_block)
    if(status == false){
      //bad provider
      res.send(JSON.stringify({ message: 'That provider is unavailable to use with the E5', success:false }));
      return;
    }

    data[e5] = {'addresses':contract_addresses, 'web3':web3, 'first_block':first_block, 'current_block':{}, 'iteration':iteration}
    add_new_e5_to_event_data(e5)
    data['e'].push(e5)

    var obj = {message:`The new E5 '${e5}' has been added to the node successfully.`, success:true}
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    res.send(string_obj);
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }
});//ok ----

/* admin endpoint for removing tracked data for a specified E5 */
app.post('/delete_e5', (req, res) => {
  try{
    const e5 = req.query.e5;
    const backup_key = req.query.backup_key;

    if(!data['e'].includes(e5)){
      res.send(JSON.stringify({ message: `That E5 doesn't exist.` , success:false}));
      return;
    }
    if(data['key'] !== backup_key){
      res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
      return;
    }

    if(e5 == 'E25'){
      res.send(JSON.stringify({ message: `You can't delete E25` , success: false}));
      return;
    }

    var index = data['e'].indexOf(e5)
    data['e'].splice(index, 1)
    data[e5] = null
    event_data[e5] = null

    var obj = {message:`The E5 '${e5}' has been removed from the node successfully.`, success:true}
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    res.send(string_obj);
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }
});//ok ----

/* endpoint for checking the subscription payment information for a specified account */
app.get('/subscription', async (req, res) => {
  const subscription = req.query.object_id;
  const e5 = req.query.e5
  const signature_data = req.query.data;
  const signature = req.query.signature

  try{
    if(e5 == null || e5 == '' || subscription == null || signature_data == null || signature_data == '' || signature == null || signature == ''){
      res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
      return;
    }
    if(!data['e'].includes(e5)){
      res.send(JSON.stringify({ message: 'That E5 is not being tracked by the node.', success:false }));
      return;
    }
    if(object_types[e5][subscription] != 33/* 33(subscription_object) */){
      res.send(JSON.stringify({ message: 'That object id is not a subscription object.', success:false }));
      return;
    }

    var return_data = await get_subscription_payment_information(e5, signature_data, subscription, signature)
    if(return_data == null){
      res.send(JSON.stringify({ message: 'The data or signature is invalid.', success:false}));
      return;
    }else{
      var string_obj = JSON.stringify(return_data, (_, v) => typeof v === 'bigint' ? v.toString() : v)
      res.send(string_obj);
    }
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }

});//ok

/* admin endpoint for manually backing up your nodes data */
app.post('/backup', async (req, res) => {
  try{
    const backup_key = req.query.backup_key;
    if(data['key'] !== backup_key){
      res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
      return;
    }
    var success_obj = await store_back_up_of_data()
    if(success_obj.success == true){
      var obj = {message:`Data backed up successfully.`, 'backup_file_name':success_obj.backup_name, success:true}
      var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
      res.send(string_obj);
    }else{
      res.send(JSON.stringify({ message: 'Failed to Back up data.', success:false }));
    }
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }
});//ok ------

/* admin endpoint for updating the iteration value for a specified E5 and its corresponding chain */
app.post('/update_iteration', (req, res) => {
  try{
    const new_iteration = req.query.new_iteration;
    const e5 = req.query.e5;
    const backup_key = req.query.backup_key;

    if(new_iteration == null || new_iteration == '' || backup_key == null || backup_key == ''){
      res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
      return;
    }

    if(data['key'] !== backup_key){
      res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
      return;
    }

    if(data[e5] == null){
      res.send(JSON.stringify({ message: 'That E5 does not exist', success:false }));
      return;
    }

    if(isNaN(new_iteration)){
      res.send(JSON.stringify({ message: 'That iteration value is invalid.', success:false }));
      return;
    }

    data[e5]['iteration'] = new_iteration
    var obj = {message:`Iteration for ${e5} updated to '${new_iteration}' successfully.`, success:true}
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    res.send(string_obj);
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }
});//ok ------

/* admin endpoint for booting the entire node with the required app_key */
app.post('/boot', (req, res) => {
  try{
    const key = req.query.app_key;
    const backup_key = req.query.backup_key;
    if(key == null || key == '' || backup_key == null || backup_key == ''){
      res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
      return;
    }
    if(data['key'] !== backup_key){
      res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
      return;
    }
    app_key = key
    var obj = {message:`Node booted successfully.`, success:true}
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    res.send(string_obj);
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }
});//ok ------

/* admin endpoint for booting the node's storage services for paid users */
app.post('/boot_storage', async (req, res) => {
  const { backup_key,/*  max_capacity, */ max_buyable_capacity, target_account_e5, price_per_megabyte, target_storage_purchase_recipient_account, unlimited_basic_storage } = req.body;
  // var available_space = await get_maximum_available_disk_space()
  
  if(backup_key == null || backup_key == '' /* || isNaN(max_capacity) */ || isNaN(max_buyable_capacity) || price_per_megabyte == null || target_account_e5 == null || target_account_e5 == '' || isNaN(target_storage_purchase_recipient_account) || unlimited_basic_storage == null){
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
    return;
  }
  else if(data['key'] !== backup_key){
    res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
    return;
  }
  // else if(max_capacity > available_space){
  //   res.send(JSON.stringify({ message: 'You dont have enough disk space for that specified max_capacity', success:false }));
  //   return;
  // }
  else if(data['max_buyable_capacity'] !== 0 || data['target_account_e5'] !== ''){
    res.send(JSON.stringify({ message: 'Storage already booted in node.', success:false }));
    return;
  }
  else if(!data['e'].includes(target_account_e5)){
    res.send(JSON.stringify({ message: `That E5 is not being watched.`, success:false }));
    return;
  }
  else{
    // data['file_data_capacity'] = max_capacity
    data['max_buyable_capacity'] = max_buyable_capacity
    data['price_per_megabyte'] = price_per_megabyte
    data['target_account_e5'] = target_account_e5
    data['target_storage_purchase_recipient_account'] = target_storage_purchase_recipient_account
    data['storage_boot_time'] = await get_e5_chain_time(target_account_e5)
    data['unlimited_basic_storage'] = unlimited_basic_storage

    res.send(JSON.stringify({ message: `node configured with a maximum buyable capacity of ${max_buyable_capacity} mbs, payments recipient account ${target_storage_purchase_recipient_account} of E5 ${target_account_e5}`, success:true }));
  }
});//ok -------

/* admin endpoint for reconfiguring the storage settings for the node's storage services */
app.post('/reconfigure_storage', async (req, res) => {
  const { backup_key, key, value, e5 } = req.body; // Extract arguments from req.body
  
  if(backup_key == null || backup_key == '' || key == null || key == '' || value == null){
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
    return;
  }
  else if(data['key'] !== backup_key){
    res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
    return;
  }
  else if(/* key !== 'file_data_capacity' && */ key !== 'max_buyable_capacity' && key !== 'price_per_megabyte' && key !== 'target_account_e5' && key !== 'target_storage_purchase_recipient_account' && key !== 'unlimited_basic_storage'){
    res.send(JSON.stringify({ message: 'Invalid modify targets', success:false }));
    return;
  }
  else if(key == 'target_storage_purchase_recipient_account' && !data['e'].includes(e5)){
    res.send(JSON.stringify({ message: 'You need to specify a valid E5 if you are targeting the target_storage_purchase_recipient_account value', success:false }));
    return;
  }
  else{
    data[key] = value
    if(key == 'target_storage_purchase_recipient_account'){
      data['target_account_e5'] = e5
    }
    res.send(JSON.stringify({ message: `node reconfigured with the specified parameter '${key}' to the speicified value`, success:true }));
  }
});//ok -----

/* endpoint for storing files in the storage service for the node */
app.post('/store_files', async (req, res) => {
  const { signature_data, signature, file_datas, file_types } = req.body;
  if(signature_data == null || signature_data == '' || signature == null || signature == '' || file_datas == null || file_types == null || !is_all_file_type_ok(file_types)){
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
    return;
  }
  else if(file_datas.length == 0){
    res.send(JSON.stringify({ message: 'You need to speicify some files to store', success:false }));
    return;
  }
  else if(data['max_buyable_capacity'] == 0){
    res.send(JSON.stringify({ message: 'Storage on this node is disabeld', success:false }));
    return;
  }
  else{
    var storage_data = await fetch_accounts_available_storage(signature_data, signature)
    var binaries = get_file_binaries(file_datas)
    var space_utilized = get_length_of_binary_files_in_mbs(binaries)
    // console.log('storage_data', storage_data)
    if(storage_data.available_space < space_utilized){
      res.send(JSON.stringify({ message: 'Insufficient storage acquired for speficied account.', success:false }));
      return;
    }else{
      data['storage_data'][storage_data.account.toString()]['utilized_space'] += space_utilized
      data['storage_data'][storage_data.account.toString()]['files'] ++;
      data['metrics']['total_files_stored']++
      data['metrics']['total_space_utilized']+= space_utilized
      var success = await store_files_in_storage(binaries, file_types, file_datas)
      
      if(success == null){
        res.send(JSON.stringify({ message: 'Files stored Unsucessfully, internal server error', success:false }));
      }else{
        res.send(JSON.stringify({ message: 'Files stored Successfully', files: success, success:true }));
      }
      
    }
  }
});//ok

/* endpoint for obtaining the storage space utilized by an account */
app.get('/account_storage_data/:account', (req, res) => {
  const { account } = req.params;
  if(account == '' || account == null){
    res.send(JSON.stringify({ message: 'Please specify an account', success:false }));
    return;
  }else{
    var payment_data = data['storage_data'][account.toString()]
    if(payment_data == null){
      res.send(JSON.stringify({ message: 'That account does not exist in this node.', success:false }));
      return;
    }else{
      res.send(JSON.stringify({ message: 'Account found.', account: payment_data, success:true }));
    }
  }
});//ok

/* endpoint for streaming a file stored in the node. */
app.get('/stream_file/:content_type/:file', (req, res) => {
  const { file, content_type } = req.params;
  const final_content_type = get_final_content_type(content_type)
  if(file == '' || file == null || content_type == '' || content_type == null){
    res.send(JSON.stringify({ message: 'Please specify a file to stream and content type', success:false }));
    return;
  }
  else if(final_content_type == null){
    res.send(JSON.stringify({ message: 'Please specify a valid content type', success:false }));
    return;
  }
  else{
    const filePath = `storage_data/${file}`
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const range = req.headers.range;
    
    if (range) {
      const [start, end] = range
        .replace(/bytes=/, '')
        .split('-')
        .map(Number);
      
      const chunkStart = start || 0;
      const chunkEnd = end || fileSize - 1;

      const stream = fs.createReadStream(filePath, {
        start: chunkStart,
        end: chunkEnd,
      });

      res.writeHead(206, {
        'Content-Range': `bytes ${chunkStart}-${chunkEnd}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkEnd - chunkStart + 1,
        'Content-Type': final_content_type,
      });

      stream.pipe(res);
    }
    else{
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': final_content_type,
      });
      fs.createReadStream(filePath).pipe(res);
    }

  }
});//ok

/* endpoint for storing basic E5 run data. */
app.post('/store_data', async (req, res) => {
  const { signature_data, signature, file_datas } = req.body;
  if(signature_data == null || signature_data == '' || signature == null || signature == '' || file_datas == null){
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
    return;
  }
  else if(file_datas.length == 0){
    res.send(JSON.stringify({ message: 'You need to speicify some files to store', success:false }));
    return;
  }
  else if(data['max_buyable_capacity'] == 0){
    res.send(JSON.stringify({ message: 'Storage on this node is disabeld', success:false }));
    return;
  }
  else{
    var space_utilized = get_length_of_string_files_in_mbs(file_datas)
    var success = null;
    if(data['unlimited_basic_storage'] == true){
      success = await store_objects_in_node(file_datas)
    }else{
      if(storage_data.available_space < space_utilized){
        res.send(JSON.stringify({ message: 'Insufficient storage acquired for speficied account.', success:false }));
        return;
      }else{
        var storage_data = await fetch_accounts_available_storage(signature_data, signature)
        data['storage_data'][storage_data.account.toString()]['utilized_space'] += space_utilized
        data['metrics']['total_space_utilized']+= space_utilized
        success = await store_objects_in_node(file_datas)
      }
    }
    if(success == null){
      res.send(JSON.stringify({ message: 'Files stored Unsucessfully, internal server error', success:false }));
    }else{
      res.send(JSON.stringify({ message: 'Files stored Successfully', files: success, success:true }));
    }
  }
});//ok









const when_server_started = () => {
  start_up_time = Date.now()
  var key = 'eeeee'+makeid(32)+'eeeee'
  data['key'] = key
  console.log('')
  console.log('------------------------e----------------------------')
  console.log(key)
  console.log('------------------------e----------------------------')
  console.log('')
  console.log(`Back-ups for the node's data are encrypted and stored periodically. Make sure to keep that nitro key safe incase you need to reboot the node with a backup file. The nitro key will be available in the /marco endpoint for the next five minutes.`)
  console.log('')
  console.log('')
  console.log('')

}




var options = {
  key: fs.readFileSync('/home/ubuntu/client-key.pem'), 
  cert: fs.readFileSync('/home/ubuntu/client-cert.pem')
  // set the directory for the keys and cerificates your using here
};




const EXPRESS_PORT = 3000; // <----- change this to whichever port number you wish to use

// Start server
// app.listen(EXPRESS_PORT, when_server_started);
https.createServer(options, app).listen(EXPRESS_PORT);

setInterval(load_events_for_all_e5s, 2*60*1000);
setInterval(store_back_up_of_data, 24*60*60*1000);
setInterval(store_hashes_in_file_storage_if_memory_full, 2*60*1000);
setInterval(update_storage_payment_information, 2*60*1000);

load_events_for_all_e5s()

