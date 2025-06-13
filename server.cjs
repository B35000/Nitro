// Copyright (c) 2024 Bry Onyoni
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
require('dotenv').config();
const { Web3 } = require('web3');
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const fs = require("fs");
var bigInt = require("big-integer");
var https = require('https');
const os = require("os");
const checkDiskSpace = require("check-disk-space").default;
const mime = require("mime-types");
const { Worker } = require('worker_threads');

const app = express();
app.use(cors());
app.use(express.json({ limit: "100gb" }));
const version = '1.0'


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
  'color_metrics':{},
  'upload_reservations':{},
  'file_streams':{},
  'free_default_storage':0.0,
}

const E5_CONTRACT_ABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" } ], "name": "e1", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "p2", "type": "address" }, { "indexed": true, "internalType": "address", "name": "p3", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" } ], "name": "e2", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" } ], "name": "e3", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "p2", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p8", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p9", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "p10", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "p11", "type": "uint256" } ], "name": "e4", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "string", "name": "p2", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" } ], "name": "e5", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "p2", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" } ], "name": "e6", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "p1", "type": "address" }, { "indexed": true, "internalType": "address", "name": "p2", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "address[7]", "name": "p5", "type": "address[7]" } ], "name": "e7", "type": "event" }, { "inputs": [ { "internalType": "uint256[2]", "name": "p1", "type": "uint256[2]" }, { "internalType": "address[][]", "name": "p2", "type": "address[][]" }, { "internalType": "uint256[][][]", "name": "p3", "type": "uint256[][][]" }, { "internalType": "string[][][]", "name": "p4", "type": "string[][][]" } ], "name": "e", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "p1", "type": "address" }, { "internalType": "uint256[2]", "name": "p2", "type": "uint256[2]" } ], "name": "f145", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "v1", "type": "uint256" } ], "name": "f147", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address[7]", "name": "p1", "type": "address[7]" }, { "internalType": "uint256[][][]", "name": "p2", "type": "uint256[][][]" }, { "internalType": "uint256[][]", "name": "p3", "type": "uint256[][]" }, { "internalType": "string[][]", "name": "p4", "type": "string[][]" }, { "internalType": "uint256[]", "name": "p5", "type": "uint256[]" } ], "name": "f157", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "address[]", "name": "p2", "type": "address[]" }, { "internalType": "uint256", "name": "p3", "type": "uint256" } ], "name": "f167", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address[7]", "name": "p1", "type": "address[7]" } ], "name": "f2023", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" } ], "name": "f206", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" } ], "name": "f280", "outputs": [ { "internalType": "uint256[]", "name": "v1", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" } ], "name": "f287", "outputs": [ { "internalType": "uint256[4][]", "name": "v1", "type": "uint256[4][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "p1", "type": "uint256" } ], "name": "f289", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "f5300g", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }
];
const E52_CONTRACT_ABI = [
    { "inputs": [ { "internalType": "address", "name": "p1", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p8", "type": "uint256" } ], "name": "e1", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "string", "name": "p1", "type": "string" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "p4", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" } ], "name": "e2", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "string", "name": "p3", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" } ], "name": "e3", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "p4", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" } ], "name": "e4", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "p4", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" } ], "name": "e5", "type": "event" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" } ], "name": "f132", "outputs": [ { "internalType": "uint256[]", "name": "v1", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "p1", "type": "uint256" } ], "name": "f133", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" } ], "name": "f134", "outputs": [ { "internalType": "uint256[]", "name": "v1", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "p1", "type": "uint256" } ], "name": "f135", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" } ], "name": "f136", "outputs": [], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256", "name": "p3", "type": "uint256" } ], "name": "f137", "outputs": [ { "internalType": "uint256[]", "name": "v1", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "p2", "type": "uint256[]" }, { "internalType": "uint256", "name": "p3", "type": "uint256" } ], "name": "f138", "outputs": [], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address[7]", "name": "p1", "type": "address[7]" }, { "internalType": "uint256[][]", "name": "p2", "type": "uint256[][]" }, { "internalType": "string[][]", "name": "p3", "type": "string[][]" }, { "internalType": "uint256[]", "name": "p4", "type": "uint256[]" } ], "name": "f158", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "p1", "type": "uint256" }, { "internalType": "uint256", "name": "p3", "type": "uint256" }, { "internalType": "uint256", "name": "p4", "type": "uint256" } ], "name": "f171", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "p2", "type": "uint256[]" }, { "internalType": "uint256", "name": "p3", "type": "uint256" } ], "name": "f188", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "p1", "type": "uint256" }, { "internalType": "uint256", "name": "p2", "type": "uint256" } ], "name": "f193", "outputs": [], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" } ], "name": "f211", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "uint256", "name": "sv1", "type": "uint256" }, { "internalType": "bool", "name": "sv2", "type": "bool" }, { "internalType": "uint256[]", "name": "sv3", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "sv4", "type": "uint256[][]" }, { "internalType": "address[]", "name": "sv5", "type": "address[]" }, { "internalType": "string[][]", "name": "sv6", "type": "string[][]" }, { "internalType": "uint256", "name": "t", "type": "uint256" }, { "internalType": "uint256", "name": "sv7", "type": "uint256" }, { "internalType": "uint256", "name": "sv8", "type": "uint256" }, { "internalType": "uint256[2]", "name": "sv9", "type": "uint256[2]" }, { "internalType": "bool", "name": "sv10", "type": "bool" }, { "internalType": "uint256[]", "name": "sv11", "type": "uint256[]" } ], "internalType": "struct E3.TD", "name": "p1", "type": "tuple" } ], "name": "f217", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" }, { "internalType": "uint256", "name": "p3", "type": "uint256" } ], "name": "f244", "outputs": [], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" } ], "name": "f254", "outputs": [ { "internalType": "bool[]", "name": "", "type": "bool[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "p2", "type": "uint256[][]" } ], "name": "f255", "outputs": [ { "internalType": "bool[][]", "name": "", "type": "bool[][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "p2", "type": "uint256[][]" }, { "internalType": "uint256", "name": "p3", "type": "uint256" }, { "internalType": "uint256", "name": "p4", "type": "uint256" } ], "name": "f256", "outputs": [ { "internalType": "uint256[][]", "name": "", "type": "uint256[][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "p2", "type": "uint256[]" }, { "internalType": "uint256", "name": "p3", "type": "uint256" } ], "name": "f257", "outputs": [], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[][5][5]", "name": "p1", "type": "uint256[][5][5]" }, { "internalType": "uint256[21]", "name": "p2", "type": "uint256[21]" } ], "name": "f275", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" }, { "internalType": "uint256[]", "name": "p3", "type": "uint256[]" } ], "name": "f283", "outputs": [], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" } ], "name": "f69", "outputs": [], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" } ], "name": "f94", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
]
const F5_CONTRACT_ABI = [
    { "inputs": [ { "internalType": "address", "name": "p1", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" } ], "name": "e1", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" } ], "name": "e2", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" } ], "name": "e4", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" } ], "name": "e5", "type": "event" }, { "inputs": [ { "internalType": "address[7]", "name": "p1", "type": "address[7]" }, { "internalType": "uint256[][][]", "name": "p2", "type": "uint256[][][]" }, { "internalType": "uint256[][]", "name": "p3", "type": "uint256[][]" }, { "internalType": "string[][]", "name": "p4", "type": "string[][]" }, { "internalType": "uint256[]", "name": "p5", "type": "uint256[]" } ], "name": "f159", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[][]", "name": "p1", "type": "uint256[][]" } ], "name": "f168", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "uint256", "name": "sv1", "type": "uint256" }, { "internalType": "bool", "name": "sv2", "type": "bool" }, { "internalType": "uint256[]", "name": "sv3", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "sv4", "type": "uint256[][]" }, { "internalType": "address[]", "name": "sv5", "type": "address[]" }, { "internalType": "string[][]", "name": "sv6", "type": "string[][]" }, { "internalType": "uint256", "name": "t", "type": "uint256" }, { "internalType": "uint256", "name": "sv7", "type": "uint256" }, { "internalType": "uint256", "name": "sv8", "type": "uint256" }, { "internalType": "uint256[2]", "name": "sv9", "type": "uint256[2]" }, { "internalType": "bool", "name": "sv10", "type": "bool" }, { "internalType": "uint256[]", "name": "sv11", "type": "uint256[]" } ], "internalType": "struct E3.TD", "name": "p1", "type": "tuple" } ], "name": "f172", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[][5]", "name": "p1", "type": "uint256[][5]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" } ], "name": "f196", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "uint256", "name": "sv1", "type": "uint256" }, { "internalType": "bool", "name": "sv2", "type": "bool" }, { "internalType": "uint256[]", "name": "sv3", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "sv4", "type": "uint256[][]" }, { "internalType": "address[]", "name": "sv5", "type": "address[]" }, { "internalType": "string[][]", "name": "sv6", "type": "string[][]" }, { "internalType": "uint256", "name": "t", "type": "uint256" }, { "internalType": "uint256", "name": "sv7", "type": "uint256" }, { "internalType": "uint256", "name": "sv8", "type": "uint256" }, { "internalType": "uint256[2]", "name": "sv9", "type": "uint256[2]" }, { "internalType": "bool", "name": "sv10", "type": "bool" }, { "internalType": "uint256[]", "name": "sv11", "type": "uint256[]" } ], "internalType": "struct E3.TD", "name": "p1", "type": "tuple" } ], "name": "f197", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "p2", "type": "uint256[][]" } ], "name": "f229", "outputs": [ { "internalType": "uint256[][]", "name": "v1", "type": "uint256[][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "p2", "type": "uint256[][]" } ], "name": "f235", "outputs": [ { "internalType": "uint256[][]", "name": "v1", "type": "uint256[][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[][][]", "name": "v1", "type": "uint256[][][]" }, { "internalType": "uint256[21]", "name": "p2", "type": "uint256[21]" }, { "internalType": "uint256[][]", "name": "p3", "type": "uint256[][]" } ], "name": "f263", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "id", "type": "uint256" } ], "name": "f73", "outputs": [ { "internalType": "uint256[][]", "name": "", "type": "uint256[][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" } ], "name": "f74", "outputs": [ { "internalType": "uint256[][][]", "name": "", "type": "uint256[][][]" } ], "stateMutability": "view", "type": "function" }
]
const G5_CONTRACT_ABI = [
    { "inputs": [ { "internalType": "address", "name": "p1", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" } ], "name": "e1", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" } ], "name": "e2", "type": "event" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" } ], "name": "f111", "outputs": [ { "internalType": "uint256[][][]", "name": "", "type": "uint256[][][]" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address[7]", "name": "p1", "type": "address[7]" }, { "internalType": "uint256[][][]", "name": "p2", "type": "uint256[][][]" }, { "internalType": "uint256[][]", "name": "p3", "type": "uint256[][]" } ], "name": "f160", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "uint256", "name": "sv1", "type": "uint256" }, { "internalType": "bool", "name": "sv2", "type": "bool" }, { "internalType": "uint256[]", "name": "sv3", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "sv4", "type": "uint256[][]" }, { "internalType": "address[]", "name": "sv5", "type": "address[]" }, { "internalType": "string[][]", "name": "sv6", "type": "string[][]" }, { "internalType": "uint256", "name": "t", "type": "uint256" }, { "internalType": "uint256", "name": "sv7", "type": "uint256" }, { "internalType": "uint256", "name": "sv8", "type": "uint256" }, { "internalType": "uint256[2]", "name": "sv9", "type": "uint256[2]" }, { "internalType": "bool", "name": "sv10", "type": "bool" }, { "internalType": "uint256[]", "name": "sv11", "type": "uint256[]" } ], "internalType": "struct E3.TD", "name": "p1", "type": "tuple" } ], "name": "f174", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" }, { "internalType": "uint256[][]", "name": "p3", "type": "uint256[][]" }, { "internalType": "uint256[][][2]", "name": "p4", "type": "uint256[][][2]" } ], "name": "f200", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[][5]", "name": "p1", "type": "uint256[][5]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" }, { "internalType": "uint256", "name": "p3", "type": "uint256" } ], "name": "f238", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "p1", "type": "uint256" }, { "internalType": "bool", "name": "p2", "type": "bool" } ], "name": "f77", "outputs": [ { "internalType": "uint256[][]", "name": "", "type": "uint256[][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "bool", "name": "p2", "type": "bool" } ], "name": "f78", "outputs": [ { "internalType": "uint256[][][]", "name": "", "type": "uint256[][][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "targets", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "p3", "type": "uint256[]" }, { "internalType": "uint256", "name": "p4", "type": "uint256" } ], "name": "f79", "outputs": [ { "internalType": "uint256[][][]", "name": "", "type": "uint256[][][]" }, { "internalType": "uint256[][4]", "name": "", "type": "uint256[][4]" } ], "stateMutability": "view", "type": "function" }
]
const G52_CONTRACT_ABI = [
    { "inputs": [ { "internalType": "address", "name": "p1", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" } ], "name": "archive", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" } ], "name": "e1", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" } ], "name": "e2", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" } ], "name": "e3", "type": "event" }, { "inputs": [ { "internalType": "address[7]", "name": "p1", "type": "address[7]" } ], "name": "f161", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "uint256", "name": "sv1", "type": "uint256" }, { "internalType": "bool", "name": "sv2", "type": "bool" }, { "internalType": "uint256[]", "name": "sv3", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "sv4", "type": "uint256[][]" }, { "internalType": "address[]", "name": "sv5", "type": "address[]" }, { "internalType": "string[][]", "name": "sv6", "type": "string[][]" }, { "internalType": "uint256", "name": "t", "type": "uint256" }, { "internalType": "uint256", "name": "sv7", "type": "uint256" }, { "internalType": "uint256", "name": "sv8", "type": "uint256" }, { "internalType": "uint256[2]", "name": "sv9", "type": "uint256[2]" }, { "internalType": "bool", "name": "sv10", "type": "bool" }, { "internalType": "uint256[]", "name": "sv11", "type": "uint256[]" } ], "internalType": "struct E3.TD", "name": "p1", "type": "tuple" } ], "name": "f189", "outputs": [ { "internalType": "uint256", "name": "v3", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "p1", "type": "uint256" }, { "internalType": "uint256", "name": "p2", "type": "uint256" }, { "internalType": "bool", "name": "p3", "type": "bool" }, { "internalType": "uint256", "name": "p4", "type": "uint256" }, { "internalType": "uint256", "name": "p5", "type": "uint256" }, { "internalType": "uint256", "name": "p6", "type": "uint256" } ], "name": "f194", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[][][]", "name": "p2", "type": "uint256[][][]" }, { "internalType": "uint256[][][2]", "name": "p3", "type": "uint256[][][2]" } ], "name": "f201", "outputs": [ { "internalType": "uint256[21]", "name": "v2", "type": "uint256[21]" }, { "internalType": "bool[3]", "name": "v3", "type": "bool[3]" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "p2", "type": "uint256[][]" } ], "name": "f237", "outputs": [ { "internalType": "uint256[][]", "name": "v1", "type": "uint256[][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "p2", "type": "uint256[][]" }, { "internalType": "uint256", "name": "p3", "type": "uint256" } ], "name": "f266", "outputs": [ { "internalType": "uint256[][]", "name": "v1", "type": "uint256[][]" } ], "stateMutability": "view", "type": "function" }
]
const H5_CONTRACT_ABI = [
    { "inputs": [ { "internalType": "address", "name": "p1", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p8", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p9", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p10", "type": "uint256" } ], "name": "e1", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" } ], "name": "e2", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" } ], "name": "e3", "type": "event" }, { "inputs": [ { "internalType": "address[7]", "name": "p1", "type": "address[7]" }, { "internalType": "uint256[][][]", "name": "p2", "type": "uint256[][][]" }, { "internalType": "uint256[][]", "name": "p3", "type": "uint256[][]" } ], "name": "f162", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "uint256", "name": "sv1", "type": "uint256" }, { "internalType": "bool", "name": "sv2", "type": "bool" }, { "internalType": "uint256[]", "name": "sv3", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "sv4", "type": "uint256[][]" }, { "internalType": "address[]", "name": "sv5", "type": "address[]" }, { "internalType": "string[][]", "name": "sv6", "type": "string[][]" }, { "internalType": "uint256", "name": "t", "type": "uint256" }, { "internalType": "uint256", "name": "sv7", "type": "uint256" }, { "internalType": "uint256", "name": "sv8", "type": "uint256" }, { "internalType": "uint256[2]", "name": "sv9", "type": "uint256[2]" }, { "internalType": "bool", "name": "sv10", "type": "bool" }, { "internalType": "uint256[]", "name": "sv11", "type": "uint256[]" } ], "internalType": "struct E3.TD", "name": "p1", "type": "tuple" } ], "name": "f176", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "uint256", "name": "sv1", "type": "uint256" }, { "internalType": "bool", "name": "sv2", "type": "bool" }, { "internalType": "uint256[]", "name": "sv3", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "sv4", "type": "uint256[][]" }, { "internalType": "address[]", "name": "sv5", "type": "address[]" }, { "internalType": "string[][]", "name": "sv6", "type": "string[][]" }, { "internalType": "uint256", "name": "t", "type": "uint256" }, { "internalType": "uint256", "name": "sv7", "type": "uint256" }, { "internalType": "uint256", "name": "sv8", "type": "uint256" }, { "internalType": "uint256[2]", "name": "sv9", "type": "uint256[2]" }, { "internalType": "bool", "name": "sv10", "type": "bool" }, { "internalType": "uint256[]", "name": "sv11", "type": "uint256[]" } ], "internalType": "struct E3.TD", "name": "p1", "type": "tuple" } ], "name": "f179", "outputs": [ { "internalType": "uint256[3]", "name": "v1", "type": "uint256[3]" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[][5]", "name": "p1", "type": "uint256[][5]" }, { "internalType": "uint256[4]", "name": "p2", "type": "uint256[4]" }, { "internalType": "bool", "name": "p3", "type": "bool" }, { "internalType": "uint256[][2]", "name": "p4", "type": "uint256[][2]" } ], "name": "f180", "outputs": [ { "internalType": "uint256[3]", "name": "v1", "type": "uint256[3]" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[][5]", "name": "p1", "type": "uint256[][5]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" } ], "name": "f198", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[][6]", "name": "p1", "type": "uint256[][6]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" } ], "name": "f230", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "p2", "type": "uint256[]" } ], "name": "f241", "outputs": [ { "internalType": "uint256[4][]", "name": "", "type": "uint256[4][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "p2", "type": "uint256[][]" }, { "internalType": "uint256[]", "name": "p3", "type": "uint256[]" } ], "name": "f245", "outputs": [ { "internalType": "uint256[][]", "name": "v1", "type": "uint256[][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" } ], "name": "f247", "outputs": [ { "internalType": "uint256[]", "name": "v1", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "f258", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "p1", "type": "uint256" }, { "internalType": "uint256", "name": "p2", "type": "uint256" }, { "internalType": "uint256", "name": "p3", "type": "uint256" }, { "internalType": "uint256", "name": "p4", "type": "uint256" }, { "internalType": "uint256", "name": "p5", "type": "uint256" } ], "name": "f286", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "p1", "type": "uint256" } ], "name": "f85", "outputs": [ { "internalType": "uint256[][]", "name": "", "type": "uint256[][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" } ], "name": "f86", "outputs": [ { "internalType": "uint256[][][]", "name": "", "type": "uint256[][][]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[][][]", "name": "p1", "type": "uint256[][][]" } ], "name": "f88", "outputs": [ { "internalType": "uint256[][][2]", "name": "", "type": "uint256[][][2]" } ], "stateMutability": "view", "type": "function" }
]
const H52_CONTRACT_ABI = [
    { "inputs": [ { "internalType": "address", "name": "p1", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" } ], "name": "e1", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" } ], "name": "e2", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p8", "type": "uint256" } ], "name": "e3", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "p4", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p6", "type": "uint256" } ], "name": "e5", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "p1", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p2", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p3", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p4", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p5", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "p6", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p7", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "p8", "type": "uint256" } ], "name": "power", "type": "event" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "p2", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "p3", "type": "uint256[]" }, { "internalType": "uint256", "name": "p4", "type": "uint256" } ], "name": "f140", "outputs": [ { "internalType": "uint256[]", "name": "v1", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" }, { "internalType": "uint256[]", "name": "p3", "type": "uint256[]" } ], "name": "f140e", "outputs": [ { "internalType": "uint256[]", "name": "v1", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address[7]", "name": "p1", "type": "address[7]" } ], "name": "f163", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[][5]", "name": "p1", "type": "uint256[][5]" }, { "internalType": "uint256[]", "name": "p2", "type": "uint256[]" }, { "internalType": "uint256", "name": "p3", "type": "uint256" }, { "internalType": "uint256[][][]", "name": "p4", "type": "uint256[][][]" }, { "internalType": "bool", "name": "p5", "type": "bool" } ], "name": "f182", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[][5]", "name": "p1", "type": "uint256[][5]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" }, { "internalType": "uint256", "name": "p3", "type": "uint256" }, { "internalType": "bool", "name": "p4", "type": "bool" }, { "internalType": "bool", "name": "p5", "type": "bool" }, { "internalType": "uint256", "name": "p6", "type": "uint256" } ], "name": "f184", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "uint256", "name": "sv1", "type": "uint256" }, { "internalType": "bool", "name": "sv2", "type": "bool" }, { "internalType": "uint256[]", "name": "sv3", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "sv4", "type": "uint256[][]" }, { "internalType": "address[]", "name": "sv5", "type": "address[]" }, { "internalType": "string[][]", "name": "sv6", "type": "string[][]" }, { "internalType": "uint256", "name": "t", "type": "uint256" }, { "internalType": "uint256", "name": "sv7", "type": "uint256" }, { "internalType": "uint256", "name": "sv8", "type": "uint256" }, { "internalType": "uint256[2]", "name": "sv9", "type": "uint256[2]" }, { "internalType": "bool", "name": "sv10", "type": "bool" }, { "internalType": "uint256[]", "name": "sv11", "type": "uint256[]" } ], "internalType": "struct E3.TD", "name": "p1", "type": "tuple" } ], "name": "f185", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[][6]", "name": "p1", "type": "uint256[][6]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" } ], "name": "f199", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "bool[]", "name": "p2", "type": "bool[]" }, { "internalType": "uint256[]", "name": "p3", "type": "uint256[]" }, { "internalType": "uint256", "name": "p4", "type": "uint256" }, { "internalType": "uint256[][]", "name": "p5", "type": "uint256[][]" }, { "internalType": "uint256[][]", "name": "p6", "type": "uint256[][]" }, { "internalType": "uint256[]", "name": "p7", "type": "uint256[]" } ], "name": "f204", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" }, { "internalType": "uint256[][]", "name": "p3", "type": "uint256[][]" }, { "internalType": "uint256[][]", "name": "p4", "type": "uint256[][]" } ], "name": "f212", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[][6]", "name": "p1", "type": "uint256[][6]" }, { "internalType": "uint256", "name": "p2", "type": "uint256" } ], "name": "f227", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "p1", "type": "uint256[]" }, { "internalType": "uint256[][]", "name": "p2", "type": "uint256[][]" }, { "internalType": "uint256[]", "name": "p4", "type": "uint256[]" }, { "internalType": "uint256", "name": "p5", "type": "uint256" }, { "internalType": "uint256", "name": "p6", "type": "uint256" } ], "name": "f270", "outputs": [ { "internalType": "uint256[][]", "name": "v1", "type": "uint256[][]" } ], "stateMutability": "view", "type": "function" }
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
}
/* object containing all the ipfs hash data */
var hash_data = {'e':'test'}
/* object containing pointers to the ipfs data stored in files */
var cold_storage_hash_pointers = {}
var cold_storage_event_files = []
/* object containing all the data types for all the objects tracked in the node */
var object_types = {}
var start_up_time = Date.now()/* start up time */
var hash_count = 0/* number of ipfs hashes being tracked */
var load_count = 0/* number of ipfs hashes loaded by the node */
var app_key = ``/* app key */
var pointer_data = {}
var beacon_chain_link = ``
var staged_ecids = {}
var failed_ecids = {'in':[], 'nf':[], 'ni':[], 'ar':[]}
const SECRET = process.env.SECRET_KEY;
const PRIVATE_KEY_RESOURCE = process.env.PRIVATE_KEY_RESOURCE
const CERTIFICATE_RESOURCE = process.env.CERTIFICATE_RESOURCE
const HTTPS_PORT = process.env.HTTPS_PORT

/* AES encrypts passed data with specified key, returns encrypted data. */
// function decrypt_storage_data(data, key){
//   try{
//     var bytes  = CryptoJS.AES.decrypt(data, key);
//     var originalText = bytes.toString(CryptoJS.enc.Utf8);
//     return originalText
//   }catch(e){
//     return data
//   }
// }

/* decrypts AES encrypted data with the specified key, returns original data */
// function encrypt_storage_data(data, key){
//   var ciphertext = CryptoJS.AES.encrypt(data, key).toString();
//   return ciphertext
// }

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
  await new Promise(resolve => setTimeout(resolve, 1500))
  var cid = ecid_obj['cid']
  if(hash_data[cid] != null || cold_storage_hash_pointers[cid] != null){
    return;
  }

  var gateways = [
    `https://ipfs.io/ipfs/${cid}`
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
    // data = decrypt_storage_data(data, app_key)
    var parsed_data = attempt_parsing(data)
    update_color_metric(parsed_data)
    hash_data[cid] = parsed_data
    load_count++
  } catch (error) {
    // console.log('Error fetching infura file: ', error)
    if(count < 5){
      await new Promise(resolve => setTimeout(resolve, 9500))
      await fetch_object_data_from_infura(ecid_obj, count+1)
    }else{
      const includes = failed_ecids['in'].find(e => e['cid'] === ecid_obj['cid']);
      if(includes == null) failed_ecids['in'].push(ecid_obj);
    }
  }
}

/* fetches the data from an ipfs node that was uploaded via (now discontinued) nft storage api */
async function fetch_objects_data_from_nft_storage (ecid_obj, count){
  var cid = ecid_obj['cid']
  if(hash_data[cid] != null || cold_storage_hash_pointers[cid] != null){
    return;
  }
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
    // data = decrypt_storage_data(data, app_key)
    var parsed_data = attempt_parsing(data)
    update_color_metric(parsed_data)
    hash_data[cid] = parsed_data
    load_count++
  } catch (error) {
    // console.log('Error fetching nft storage file: ', error)
    if(count < 5){
      await new Promise(resolve => setTimeout(resolve, 9500))
      await fetch_objects_data_from_nft_storage(ecid_obj, count+1)
    }else{
      const includes = failed_ecids['nf'].find(e => e['cid'] === ecid_obj['cid']);
      if(includes == null) failed_ecids['nf'].push(ecid_obj)
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

/* fetches data from another nitro node */
async function fetch_data_from_nitro(cid, depth){
  var split_cid_array = cid.split('-');
  var e5_id = split_cid_array[0]
  var nitro_cid = split_cid_array[1]

  if(hash_data[nitro_cid] != null || cold_storage_hash_pointers[nitro_cid] != null){
    return;
  }
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
    var cid_data = object_data[nitro_cid]
    var parsed_data = attempt_parsing(cid_data)
    update_color_metric(parsed_data)
    hash_data[nitro_cid] = parsed_data
    load_count++
  }
  catch(e){
    if(depth < 3){
      return await fetch_data_from_nitro(cid, depth+1)
    }else{
      const includes = failed_ecids['ni'].find(e => e === cid);
      if(includes == null) failed_ecids['ni'].push(cid)
    }
  }
}

/* fetches data stored in arweave storage */
async function fetch_data_from_arweave(id){
  if(hash_data[id] != null || cold_storage_hash_pointers[id] != null){
    return;
  }
  try{
    const decoded = Buffer.from(id, 'base64').toString();
    // var data = await arweave.transactions.getData(decoded, {decode: true, string: true})
    var return_data = await fetch(`https://arweave.net/${decoded}`)
    var data = await return_data.text()
    // var decrypted_data = decrypt_storage_data(data)
    var parsed_data = attempt_parsing(data)
    update_color_metric(parsed_data)
    hash_data[id] = parsed_data
    load_count++
  }catch(e){
    const includes = failed_ecids['ar'].find(e => e === id);
    if(includes == null) failed_ecids['ar'].push(id)
  }
}

/* updates the metrics for traffic from each color */
function update_color_metric(hash_data){
  var set_color = 'g'
  if(hash_data != null && isJsonObject(hash_data) == true && hash_data['tags'] != null && hash_data['tags']['color'] != null){
    set_color = hash_data['tags']['color']
  }
  try{
    if(data['color_metrics'][set_color] == null) {
      data['color_metrics'][set_color] = 0
    }
    data['color_metrics'][set_color]++
  }catch(e){
    console.log(e)
  }
}

/* returns true if the specified argument is a JSON object */
function isJsonObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}

/* attempts to parse a string into a JSON object. Upon failure it returns the argument instead. */
function attempt_parsing(data){
  try{
    var obj = JSON.parse(data)
    if(obj != null){
      return obj
    }else{
      return data
    }
  }catch(e){
    return data
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
async function load_hash_data(cids, ecid_ids){
  var ecids = []
  var included_cids = []
  for(var i=0; i<cids.length; i++){
    var ecid_obj = get_ecid_obj(cids[i])
    if(!included_cids.includes(ecid_obj['cid'])){
      ecids.push(ecid_obj)
      included_cids.push(ecid_obj['cid'])
    }
  }
  if(beacon_chain_link != ''){
    await load_data_from_beacon_node(included_cids)
  }else{
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
        else if(ecid_obj['option'] == 'ar'){
          await fetch_data_from_arweave(ecid_obj['cid'])
        }
        await new Promise(resolve => setTimeout(resolve, 6000))
      }
    }
  }
}

/* loads data from the beacon chain if a link to the node is specified */
async function load_data_from_beacon_node(cids){
  const params = new URLSearchParams({
    arg_string:JSON.stringify({hashes: cids}),
  });
  var request = `${beacon_chain_link}/data?${params.toString()}`
  try{
    const response = await fetch(request);
    if (!response.ok) {
      console.log('datas',response)
      throw new Error(`Failed to retrieve data. Status: ${response}`);
    }
    var data = await response.text();
    var obj = JSON.parse(data);
    var object_data = obj['data']

    cids.forEach(cid => {
      var parsed_data = (object_data[cid])
      if(parsed_data != null){
        update_color_metric(parsed_data)
        hash_data[cid] = parsed_data
        load_count++
      }
    });
  }
  catch(e){
    if(depth < 3){
      return await load_data_from_beacon_node(cid, depth+1)
    }
  }
}



async function load_events_from_nitro(contract_name, event_id, e5, filter){
  var event_request = {'requested_e5':e5, 'requested_contract':contract_name, 'requested_event_id':event_id, 'filter':filter}
  const params = new URLSearchParams({
    arg_string:JSON.stringify({requests:[event_request]}),
  });
  var request = `${beacon_chain_link}/events?${params.toString()}`
  try{
    const response = await fetch(request);
    if (!response.ok) {
      console.log('all_data2',response)
      throw new Error(`Failed to retrieve data. Status: ${response}`);
    }
    var data = await response.text();
    var obj = JSON.parse(data);
    return { 'events': obj['data'][0], 'height': obj['block_heights'][0] }
  }
  catch(e){
    // console.log(e)
    return { 'events': [], 'height': 0 }
  }
}

/* loads all the events emitted for a specified contract and event type, for a tracked period of time. */
async function load_past_events(contract, event, e5, web3, contract_name, latest){
  if(beacon_chain_link != '' && data[e5]['current_block'][contract_name+event] == null){
    var event_data_obj = await load_events_from_nitro(contract_name, event, e5, {})
    var events = event_data_obj['events']
    var height = event_data_obj['height']

    event_data[e5][contract_name][event] = event_data[e5][contract_name][event].concat(events)
    data[e5]['current_block'][contract_name+event] = height
  }else{
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
        delete event.address
        delete event.blockHash
        delete event.blockNumber
        delete event.data
        delete event.raw
        delete event.signature
        delete event.topics
        delete event.transactionHash
        
        for(var v=0; v<15; v++){
          if(event.returnValues[v] != null){
            delete event.returnValues[v]
          }
        }
      });

      event_data[e5][contract_name][event] = event_data[e5][contract_name][event].concat(events)
      data[e5]['current_block'][contract_name+event] = latest
    }catch(e){
      console.log(e)
    }
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
      var ecid_ids = []
      for(var i=0; i<events.length; i++){
        if(!ecids.includes(events[i].returnValues.p4/* metadata */)){
          ecids.push(events[i].returnValues.p4/* metadata */)
          ecid_ids.push(events[i].returnValues.p1/* target_obj_id */)
        }
      }
      load_hash_data(ecids, ecid_ids)
      add_ecids(ecids)
      stage_ids_to_track(ecids, ecid_ids)
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

/* calculates and records the number of ipfs hashes that have been recorded */
function add_ecids(ecids){
  var count = 0
  ecids.forEach(ecid => {
    if(ecid.includes('.') || ecid.startsWith('Qm')){
      count++
    }
  });
  hash_count+=count
}

/* stages specified ecids and object ids into memory to track once loaded via ipfs */
function stage_ids_to_track(ecids, obj_ids){
  ecids.forEach((ecid, index) => {
    staged_ecids[ecid] = obj_ids[index]
  });
}

/* loads the tags from the objects loaded in memory. */
function update_staged_hash_data(){
  // console.log('updating staged hash data...')
  for(const ecid in staged_ecids){
    if(staged_ecids.hasOwnProperty(ecid)){
      const ecid_obj = get_ecid_obj(ecid)
      const cid = ecid_obj['cid']
      const container_data = hash_data[cid]
      if(container_data != null){
        try{
          if(container_data['tags'] != null){
            // console.log('found an object with tags', container_data['tags'])
            for(const key in container_data['tags']){
              if(container_data['tags'].hasOwnProperty(key)){
                if(key != 'color'){
                  const index_values = container_data['tags'][key]['elements']
                  const item_type = container_data['tags'][key]['type']
                  if(pointer_data[item_type] == null){
                    pointer_data[item_type] = []
                  }
                  pointer_data[item_type].push({'id':staged_ecids[ecid], 'keys':index_values})
                  delete staged_ecids[ecid]
                }
              }
            }
          }else{
            delete staged_ecids[ecid]
          }
        }catch(e){
          
        }
      }
    }
  }
}






/* stores a back up of all the node's data in a file. */
async function store_back_up_of_data(){
  var obj = {'data':data, 'event_data':event_data, 'hash_data':hash_data, 'object_types':object_types, 'cold_storage_hash_pointers':cold_storage_hash_pointers, 'cold_storage_event_files':cold_storage_event_files, 'pointer_data':pointer_data, 
  'hash_count': hash_count, 'load_count': load_count, 'app_key': app_key, 'staged_ecids':staged_ecids, 'beacon_chain_link': beacon_chain_link, 'failed_ecids':failed_ecids}
  const write_data = (JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v));
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
  fs.readFile(`backup_data/${name}`, (error, dat) => {
    if (error) {
      console.log(error)
      success = false
      return success;
    }
    const decrypted_data = (dat.toString())
    // console.log('decrypted_data: ', decrypted_data)
    const obj = JSON.parse(decrypted_data);
    if(obj == dat){
      console.log('invalid back-up key supplied')
      success = false
    }else{
      Object.assign(data, obj['data']);
      event_data = obj['event_data']
      hash_data = obj['hash_data']
      object_types = obj['object_types']
      cold_storage_hash_pointers = obj['cold_storage_hash_pointers']
      cold_storage_event_files = obj['cold_storage_event_files']
      if(obj['pointer_data'] != null){
        pointer_data = obj['pointer_data']
      }
      if(obj['hash_count'] != null){
        // hash_count = obj['hash_count']
      }
      if(obj['load_count'] != null){
        load_count = obj['load_count']
      }
      if(obj['app_key'] != null){
        app_key = obj['app_key']
      }
      if(obj['staged_ecids'] != null){
        staged_ecids = obj['staged_ecids']
      }
      if(obj['beacon_chain_link'] != null){
        beacon_chain_link = obj['beacon_chain_link']
      }
      if(obj['failed_ecids'] != null){
        failed_ecids = obj['failed_ecids']
      }
      
      console.log('successfully loaded back-up data')

      if(should_restore_key != null && should_restore_key == true){
        // data['key'] = backup_key
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






/* filters objects by a specified set of tags */
async function search_for_object_ids_by_tags(tags, target_type){
  // var all_objects = await get_all_objects(target_type)

  // var filtered_objects = [];
  // filtered_objects = all_objects.filter(function (object) {
  //   var object_tags = object['data']['entered_indexing_tags'] == null ? [] : object['data']['entered_indexing_tags']
  //   const containsAll = tags.some(r=> object_tags.includes(r))
  //   return (containsAll)
  // });//first find all the objects that have at least 1 tag from the searched


  // var final_filtered_objects = []
  // final_filtered_objects = filtered_objects.filter(function (object) {
  //   var object_tags = object['data']['entered_indexing_tags'] == null ? [] : object['data']['entered_indexing_tags']
  //   const containsAll = tags.every(element => {
  //     return object_tags.includes(element);
  //   });
  //   return (containsAll)
  // });//then filter those objects for the objects that have all the tags specified

  // filtered_objects.forEach(object => {
  //   if(!final_filtered_objects.includes(object)){
  //     final_filtered_objects.push(object)
  //   }
  // });


  // var ids = []
  // final_filtered_objects.forEach(object => {
  //   ids.push(object['id'])
  // });
  var all_objs = pointer_data[target_type] == null ? [] : pointer_data[target_type]
  if(target_type == 0){
    for(var p=17; p<=36; p++){
      var p_objs = pointer_data[p] == null ? [] : pointer_data[p]
      all_objs = all_objs.concat(p_objs)
    }
  }
  var filtered_objects = [];
  var processed_tags = tags.map(word => word.toLowerCase());
  filtered_objects = all_objs.filter(function (object) {
    var object_tags = object['keys']
    const containsAll = processed_tags.some(r=> object_tags.includes(r))
    return (containsAll)
  });
  var final_filtered_objects = []
  final_filtered_objects = filtered_objects.filter(function (object) {
    var object_tags = object['keys']
    const containsAll = processed_tags.every(element => {
      return object_tags.includes(element);
    });
    return (containsAll)
  });
  

  var ids = []
  final_filtered_objects.forEach(item => {
    if(!ids.includes(item['id'])){
      ids.push(item['id'])
    }
  });
  filtered_objects.forEach(item => {
    if(!ids.includes(item['id'])){
      ids.push(item['id'])
    }
  });

  return ids;
}

/* filters objects by a specified title */
async function search_for_object_ids_by_title(title, target_type){
  // var all_objects = await get_all_objects(target_type)
  // var filtered_objects = [];
  // filtered_objects = all_objects.filter(function (object) {
  //   var object_title = object['data']['entered_title_text'] == null ? '' : object['data']['entered_title_text']
  //   const match = object_title.toLowerCase().includes(title.toLowerCase())
  //   if(target_type == 19/* 19(audio_object) */){
  //     //its a album being searched, so check the songs in it
  //     var songs = object['data']['songs']
  //     var filtered_songs = songs.filter(function (object) {
  //       var song_title = object['song_title'] == null ? '' : object['song_title']
  //       var song_composer = object['song_composer'] == null ? '' : object['song_composer']
  //       return (song_title.toLowerCase().includes(title.toLowerCase()) || song_composer.toLowerCase().includes(title.toLowerCase()))
  //     });
  //     if(filtered_songs.length > 0){
  //       return true
  //     }
  //   }

  //   if(target_type == 20/* 20(video_object) */){
  //     //its a video being searched, check the videos in it
  //     var videos = object['data']['videos']
  //     var filtered_videos = videos.filter(function (object) {
  //       var video_title = object['video_title'] == null ? '' : object['video_title']
  //       var video_composer = object['video_composer'] == null ? '' : object['video_composer']
  //       return (video_title.toLowerCase().includes(title.toLowerCase()) || video_composer.toLowerCase().includes(title.toLowerCase()))
  //     });
  //     if(filtered_videos.length > 0){
  //       return true
  //     }
  //   }

  //   return (match)
  // });

  // var ids = []
  // filtered_objects.forEach(object => {
  //   ids.push(object['id'])
  // });

  var all_objs = pointer_data[target_type] == null ? [] : pointer_data[target_type]
  if(target_type == 0){
    for(var p=17; p<=36; p++){
      var p_objs = pointer_data[p] == null ? [] : pointer_data[p]
      all_objs = all_objs.concat(p_objs)
    }
  }
  var filtered_objects = [];
  filtered_objects = all_objs.filter(function (object) {
    var object_tags = object['keys']
    const containsAll = object_tags.includes(title.toLowerCase())
    return (containsAll)
  });

  var ids = []
  filtered_objects.forEach(item => {
    if(!ids.includes(item['id'])){
      ids.push(item['id'])
    }
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
async function filter_events(requested_e5, requested_contract, requested_event_id, filter, from_filter){
  if(event_data[requested_e5] == null) return []
  // var focused_events = event_data[requested_e5][requested_contract][requested_event_id]
  var focused_events = await fetch_event_data_for_specific_e5(requested_e5, requested_contract, requested_event_id)
  const check_event = (eventt) => {
    var accepted = true
    for (const key in filter) {
      var is_array = false
      try{
        if(typeof filter[key] === 'string'){
          is_array = false
        }else{
          var clone = filter[key].slice()
          clone.concat(clone)
          is_array = true
        }
      }catch(e){}
      if(is_array == true){
        if(!filter[key].includes(eventt['returnValues'][key]) && eventt['returnValues'][key] != filter[key]){
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
  update_staged_hash_data()
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
            if(get_object_size_in_mbs(file_name_function_memory) < 100){
              file_name_function_memory[file_name] = cold_storage_obj
            }
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

/* returns the amount of storage space available */
async function get_maximum_available_disk_space(){
  try {
    const path = get_default_partition_name()
    const diskSpace = await checkDiskSpace(path);
    const free_space = Math.round(diskSpace.free / (1024 * 1024))
    const total = Math.round(diskSpace.size / (1024 * 1024))
    return {free: free_space, total: total}
  } catch (error) {
    console.log("Error fetching disk space:", error);
    return {free: 0, total: 0}
  }
}

/* returns the default partition name based on the os version thats in use */
function get_default_partition_name(){
  const platform = os.platform();
  if (platform === "win32") {
    return 'C:'
  }
  else {
    return '/'
  }
}

function round_down(number, round_down_value){
  var n = (Math.floor(number / round_down_value)) * round_down_value
  return n
}

async function get_round_down_value(web3, blockNumber){
  try{
    const currentBlock = await web3.eth.getBlock(blockNumber - 1);
    const previousBlock = await web3.eth.getBlock(blockNumber - 2);
    const miningTime = Number(currentBlock.timestamp - previousBlock.timestamp);
    return Math.round(1 / (miningTime / 12000))
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
    // var current_block_number = Number(await web3.eth.getBlockNumber())
    // var round_down_value = await get_round_down_value(web3, (current_block_number))
    // var round_down_block = round_down(current_block_number, round_down_value)
    // var current_block = await web3.eth.getBlock(round_down_block);
    // var block_hash = current_block.hash
    // if(block_hash.toString() !== signature_data.toString()){
    //   console.log('block hash generated and signature received do not match')
    //   return { available_space: 0.0, account: 0 }
    // } 

    var original_address = await web3.eth.accounts.recover(signature_data.toString(), signature)
    const e5_contract = new web3.eth.Contract(E5_CONTRACT_ABI, data[e5]['addresses'][0]);
    var accounts = await e5_contract.methods.f167([],[original_address], 2).call((error, result) => {});
    var address_account = accounts[0]

    var payment_data = data['storage_data'][address_account.toString()]
    if(payment_data == null){
      if(data['free_default_storage'] != 0 && address_account != 0){
        var balance = await web3.eth.getBalance(original_address)
        if(balance != 0){
          data['storage_data'][address_account.toString()] = {'files':0, 'acquired_space':parseFloat(data['free_default_storage']), 'utilized_space':0.0};

          payment_data = data['storage_data'][address_account.toString()]

          return { available_space: (payment_data['acquired_space'] - payment_data['utilized_space']), account: address_account }
        }
      }
      return { available_space: 0.0, account: address_account };
    } 
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
  var events = await filter_events(e5, 'H52', 'e1'/* transfer */, {p3/* receiver */:target_storage_purchase_recipient_account}, from_filter)

  var purchase_events = await filter_events(e5, 'E52', 'e4'/* data */, {p1/* target_id */:23, p5/* int_data */: target_storage_purchase_recipient_account}, {})

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
  if(content_type == 'lrc'){
    return 'text/plain'
  }
  else if(content_type == 'vtt'){
    return 'text/vtt'
  }
  return mime.lookup(content_type)
}

/* formats a number by adding commas every three digits */
function number_with_commas(x) {
    if(x == null) x = '';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* returns the timestamp as by a specified blockchain */
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





/* generates a SHA-256 hash of a specified data string. */
async function generate_hash(data) {
  /* try not to change this please. */
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
  var accepted = ['vtt', 'lrc']
  file_types.forEach(file_type => {
    if((mime.lookup(file_type) == null || mime.lookup(file_type) == false) && !accepted.includes(file_type)){
      ok = false
    }
  });
  return ok
}

async function load_nitro_links(e5){
  var nitro_link_registry = await filter_events(e5, 'E52', 'e4', {p3/* context */:400}, {})
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
function get_all_sorted_objects_mappings(object){
  var all_objects = {}
  for(var i=0; i<data['e'].length; i++){
      var e5 = data['e'][i]
      var e5_objects = object[e5]
      var all_objects_clone = structuredClone(all_objects)
      all_objects = { ...all_objects_clone, ...e5_objects}
  }

  return all_objects
}

/* automatically restore the node to the most recent backup */
function get_list_of_server_files_and_auto_backup(){
  var dir = './backup_data/'
  var files = fs.existsSync(dir) ? fs.readdirSync(dir) : []
  if(files.length == 0) return
  //Fri Jan 10 2025 20:57:42 GMT+0000 (Coordinated Universal Time).txt
  var int_dates = []
  var int_string_date_obj = {}
  files.forEach(filename => {
    var string_date = filename.replaceAll('.txt', '')
    var date_in_mills = Date.parse(string_date)
    if(Date.now() - date_in_mills > (1000*60*60*24*7)){
      //file is old and should be deleted
      delete_backup_file(filename)
    }else{
      int_dates.push(date_in_mills)
      int_string_date_obj[date_in_mills] = filename
    }
  });

  var largest = Math.max.apply(Math, int_dates);
  var most_recent_backup = int_string_date_obj[largest]
  restore_backed_up_data_from_storage(most_recent_backup, '', '', false)
}


function delete_backup_file(file_name){
  var dir = `./backup_data/${file_name}`
  fs.unlink(dir, (err) => {
    if (err) {
      console.error('Failed to delete file:', err);
    } else {
      console.log('File deleted successfully.');
    }
  });
}

function delete_old_backup_files(){
  var dir = './backup_data/'
  var files = fs.existsSync(dir) ? fs.readdirSync(dir) : []
  if(files.length == 0) return
  //Fri Jan 10 2025 20:57:42 GMT+0000 (Coordinated Universal Time).txt
  files.forEach(filename => {
    var string_date = filename.replaceAll('.txt', '')
    var date_in_mills = Date.parse(string_date)
    if(Date.now() - date_in_mills > (1000*60*60*24*7)){
      //file is old and should be deleted
      delete_backup_file(filename)
    }
  });
}




/* checks if the event_data object is large enough to back up in storage and backs up if so */
function backup_event_data_if_large_enough(){
  if(get_object_size_in_mbs(event_data) > 64){
    //store all the data in a file
    const now = Date.now()
    const write_data = JSON.stringify(event_data, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    var dir = './event_data'
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    fs.writeFile(`event_data/${now}.json`, write_data, (error) => {
      if (error) {
        console.log(error)
      }else{
        cold_storage_event_files.push(now)
        const keys = Object.keys(event_data)
        for(var i=0; i<keys.length; i++){
          var e5 = keys[i]
          add_new_e5_to_event_data(e5)
        }
        console.log("event_data written correctly");
      }
    });
  }
}

/* fetches the data stored in storage for a specifid e5, contract and event_name */
async function fetch_event_data_for_specific_e5(e5, contract, event_name){
  var memory_data = event_data[e5] == null ? [] : event_data[e5][contract][event_name]
  var final_data = []
  for(var i=0; i<cold_storage_event_files.length; i++){
    var data = await fetch_event_file_from_storage(cold_storage_event_files[i], e5, contract, event_name)
    final_data = final_data.concat(data)
  }
  final_data = final_data.concat(memory_data)
  return final_data
}

/* fetches the data stored in a event storage file */
async function fetch_event_file_from_storage(file, e5, contract, event_name){
  var is_loading_file = true
  var cold_storage_obj = {}
  fs.readFile(`event_data/${file}.json`, (error, data) => {
    if (error) {
      console.error(error);
    }else{
      cold_storage_obj = JSON.parse(data.toString())
    }
    is_loading_file = false
  });
  while (is_loading_file == true) {
    if (is_loading_file == false) break
    await new Promise(resolve => setTimeout(resolve, 700))
  }
  if(cold_storage_obj[e5] != null){
    if(cold_storage_obj[e5][contract] != null){
      if(cold_storage_obj[e5][contract][event_name] != null){
        return cold_storage_obj[e5][contract][event_name] 
     }
    }
  }
  return []
}

/* returns the size of an object in megabytes */
function get_object_size_in_mbs(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)).length;
  return (bytes / (1024 * 1024)).toFixed(2); // Convert bytes to MB
}





function attempt_loading_failed_ecids(){
  reload_failed_infura_data(failed_ecids['in'])
  reload_failed_nft_data(failed_ecids['nf'])
  reload_failed_ni_data(failed_ecids['ni'])
  reload_failed_ar_data(failed_ecids['ar'])
}

async function reload_failed_infura_data(cids){
  for(var i=0; i<cids.length; i++){
    await fetch_object_data_from_infura(cids[i], 0)
    await new Promise(resolve => setTimeout(resolve, 6000))
  }
}

async function reload_failed_nft_data(cids){
  for(var i=0; i<cids.length; i++){
    await fetch_objects_data_from_nft_storage(cids[i], 0)
    await new Promise(resolve => setTimeout(resolve, 6000))
  }
}

async function reload_failed_ni_data(cids){
  for(var i=0; i<cids.length; i++){
    await fetch_data_from_nitro(cids[i], 0)
    await new Promise(resolve => setTimeout(resolve, 6000))
  }
}

async function reload_failed_ar_data(cids){
  for(var i=0; i<cids.length; i++){
    await fetch_data_from_arweave(cids[i], 0)
    await new Promise(resolve => setTimeout(resolve, 6000))
  }
}




/* returns all the iTransfer data given a specified identifier */
async function get_iTransfer_data(identifier, account, recipient, requested_e5, type){
  /* type 1: iTransfer, type 2: Bill */
  const used_identifier = hash_my_data(identifier)
  var itransfer_event_params = []
  var transfer_event_params = []
  if(account != ''){
    itransfer_event_params = await filter_events(requested_e5, 'H52', 'e5', {p4/* metadata */: used_identifier,p2/* awward_receiver */: recipient, p1/* awward_sender */:account, p3/* awward_context */: type}, null)

    transfer_event_params =  await filter_events(requested_e5, 'H52', 'e1', {p3/* receiver */: recipient, p2/* sender */:account}, null)
  }else{
    itransfer_event_params = await filter_events(requested_e5, 'H52', 'e5', {p4/* metadata */: used_identifier,p2/* awward_receiver */: recipient, p3/* awward_context */: type}, null)

    transfer_event_params =  await filter_events(requested_e5, 'H52', 'e1', {p3/* receiver */: recipient}, null)
  }

  itransfer_event_params = itransfer_event_params.reverse()
  transfer_event_params = transfer_event_params.reverse()

  var iTransfer_objects = {}
  itransfer_event_params.forEach(event => {
    var block = event.returnValues.p6/* block_number */
    var transfers_for_block = grouped_transfers_by_block[block]
    if(iTransfer_objects[block] == null){
      iTransfer_objects[block] = {}
    }
    transfers_for_block.forEach(transfer => {
      var transfer_exchange = transfer.returnValues.p1/* exchange */
      var transfer_receiver = transfer.returnValues.p3/* receiver */
      var transfer_sender = transfer.returnValues.p2/* sender */
      var transfer_amount = transfer.returnValues.p4/* amount */
      var transfer_depth = transfer.returnValues.p7/* depth */
      var amount = get_actual_number(transfer_amount, transfer_depth)
      
      if(transfer_receiver == recipient){
        if(iTransfer_objects[block][transfer_sender] == null){
          iTransfer_objects[block][transfer_sender] = []
        }
        iTransfer_objects[block][transfer_sender].push({'exchange':transfer_exchange, 'receiver':transfer_receiver, 'sender':transfer_sender, 'amount':amount })
      }
    });
  });

  return iTransfer_objects
}

/* hashes data using keccak256 formula in web3 */
function hash_my_data(h_data){
  const web3 = new Web3(data['E25']['web3']);
  var hash = web3.utils.keccak256(h_data.toString())
  return hash
}





/* calculates the results of a poll */
async function calculate_poll_results(static_poll_data, poll_id, file_objects, poll_e5){
  try{
    var verification_data = await verify_poll_data(static_poll_data, file_objects, poll_e5, poll_id)/* call the verification function that verifies that the supplied registered voter data is valid and matches the originally recorded data. */
    if(!verification_data.is_valid){
      /* if invalid, return */
      return { success:false, message: 'Verification failed. Your provided data is invalid.', error: verification_data.message }
    }
  }
  catch(e){
    return { success:false, message: 'Your provided data may be malformed', error: e }
  }

  const poll_e5s = static_poll_data.poll_e5s/* the e5s that were selected for the poll */
  const poll_votes = {}/* initialize an object to hold all the cast votes */
  var does_poll_contain_votes = false;

  for(var i=0; i<poll_e5s.length; i++){
    var event_votes = await filter_events(poll_e5s[i], 'E52', 'e4', { p1/* target_id */: 25, p3/* context */:poll_id, p5/* int_data */: parseInt(poll_e5s[i].replace('E','')) }, null)
    if(event_votes.length > 0){/* if a vote exists */
      does_poll_contain_votes = true;
    }
    poll_votes[poll_e5s[i]] = event_votes/* record the event array under the e5 key */
  }

  if(!does_poll_contain_votes){/* if no votes have been cast in the poll, return */
    return { success: false, message: 'Inconclusive consensus. No votes were found.', error: null }
  }
  
  try{
    var current_results = await runPollVoteCounterWorker({poll_votes, static_poll_data, file_objects})/* run the poll vote counter worker in a background thread */
    return { success: true, message: '', error: null, results: current_results }
  }
  catch(e){
    return { success: false, message: 'something went wrong during the calculation process', error: e }
  }
}

/* verifies that the poll data supplied is valid and matches the original */
async function verify_poll_data(static_poll_data, file_objects, e5, poll_id){
  const web3 = new Web3(data[e5]['web3']);/* initialize a web3 object */
  const e52_contract = new web3.eth.Contract(E52_CONTRACT_ABI, data[e5]['addresses'][1]);
  var author = await e52_contract.methods.f133(poll_id).call((error, result) => {});/* read the author owner of the poll */
  if(author == 0) return { is_valid: false, message: 'No author found with provided poll id' };/* if the author value is 0, return */

  var filtered_events = await filter_events(e5, 'E52', 'e4', { p1/* target_id */: poll_id, p2/* sender_acc_id */: author, p3/* context */:42 }, null)/* fetch the hash record events under the specific poll  */
  
  if(filtered_events.length == 0){/* if no hash record was made, return */
    return { is_valid: false, message: 'No hash record made with specific poll object' }
  }
  const final_valid_hash = filtered_events[0].returnValues.p4/* string_data */
  const final_static_poll_data_hash = hash_my_data(JSON.stringify(static_poll_data))
  if(final_static_poll_data_hash != final_valid_hash){/* require the hash generated from the supplied poll data matches the hash recorded on the blockchain */
    return { is_valid: false, message: `The original poll data object provided does not generate a hash matching the record found on the blockchain.` }
  }

  const csv_data = file_objects.csv_files
  const json_data = file_objects.json_files
  for(var i=0; i<csv_data.length; i++){/* for each csv file */
    var csv_file = csv_data[i]
    var provided_hash = csv_file['data'].data/* the hash provided for the csv file in focus */
    var data_hash = await generate_hash(JSON.stringify(csv_file['data'].final_obj))
    if(data_hash != provided_hash){/* if the provided hash doesnt match the hash of the voter retistry provided, return */
      return { is_valid: false, message: 'The hash generated from the csv final object does not match the hash youve provided.' }
    }
    var specific_csv_object = static_poll_data.csv_files.find(e => e['name'] === csv_file['name']);/* fetch the csv file object matching the csv file in focus */
    if(specific_csv_object == null){/* if none was found, return */
      return { is_valid: false, message: `The original poll data object provided does not contain a file titled ${csv_file['name']} that youve provided` }
    }
    var specific_csv_object_hash = specific_csv_object['data'].data/* the csv file hash from the csv file in the static poll data value */
    if(data_hash != specific_csv_object_hash){/* if the hash doesnt match the hash provided in the csv file in focus and consequently the hash generated by the voter registry object supplied, return */
      return { is_valid: false, message: `The hash of the data youve provided under the file ${csv_file['name']} does not match the original file hash that was first posted` }
    }
  }

  for(var i=0; i<json_data.length; i++){
    var json_file = json_data[i]
    var provided_hash = json_file['data'].data
    var data_hash = await generate_hash(JSON.stringify(json_file['data'].final_obj))
    if(data_hash != provided_hash){
      return { is_valid: false, message: 'The hash generated from the json final object does not match the hash youve provided.' }
    }
    var specific_json_object = static_poll_data.json_files.find(e => e['name'] === json_file['name'])
    if(specific_json_object == null){
      return { is_valid: false, message: `The original poll data object provided does not contain a file titled ${json_file['name']} that youve provided` }
    }
    var specific_json_object_hash = specific_json_object['data'].data
    if(data_hash != specific_json_object_hash){
      return { is_valid: false, message: `The hash of the data youve provided under the file ${json_file['name']} does not match the original file hash that was first posted` }
    }
  }

  return { is_valid: true, message: '', author }/* if everything is valid, return */
}

/* initializes background thread in the polls.js file */
function runPollVoteCounterWorker(poll_data) {
  return new Promise((resolve, reject) => {
      const worker = new Worker('./polls.cjs', {
          workerData: poll_data
      });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
      if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
  });
}




/* returns false if basic data being uploaded doesnt exceed 0.5 mbs */
function is_basic_data_upload_size_valid(string_array){
  var is_valid = true;
  for(var i=0; i<string_array.length; i++){
    var object_string_length = lengthInUtf8Bytes(string_array[i])
    if(object_string_length > (1024 * 530)){
      is_valid = false
    }
  }
  return is_valid
}








app.get('/', (req, res) => {
  res.send('Signaling server is running.');
});

/* endpoint for returning E5 event data tracked by the node */
app.get('/events', async (req, res) => {
  const arg_string = req.query.arg_string;
  try{
    var arg_obj = JSON.parse(arg_string)
    var requests = arg_obj.requests
    var filtered_events_array = []
    var block_heights = []
    for(var i=0; i<requests.length; i++){
      var requested_e5 = requests[i]['requested_e5']
      var requested_contract = requests[i]['requested_contract']
      var requested_event_id = requests[i]['requested_event_id']
      var filter = requests[i]['filter']
      var from_filter = requests[i]['from_filter']

      var filtered_events = await filter_events(requested_e5, requested_contract, requested_event_id, filter, from_filter)
      filtered_events_array.push(filtered_events)
      var block_id = data[requested_e5]['current_block'][requested_contract+requested_event_id]
      block_heights.push(block_id)
    }
    
    var obj = {'data':filtered_events_array, 'block_heights':block_heights, success:true}
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
    const backup_key = req.query.backup_key;//the current key for the server
    const data_key = req.query.data_key//the old key for the server
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
app.get('/marco', async (req, res) => {
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
  var encrypted_files_obj = JSON.stringify(files_obj)
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
    'color_metrics':data['color_metrics'],
    'storage': await get_maximum_available_disk_space(),
    'free_default_storage':data['free_default_storage'],
    'version':version,
    success:true
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
    const new_beacon_chain_link = req.query.beacon_chain_link;
    const backup_key = req.query.backup_key;
    if(new_beacon_chain_link == null || new_beacon_chain_link == '' || backup_key == null || backup_key == ''){
      res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
      return;
    }
    if(data['key'] !== backup_key){
      res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
      return;
    }
    beacon_chain_link = new_beacon_chain_link
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
  const { backup_key,/*  max_capacity, */ max_buyable_capacity, target_account_e5, price_per_megabyte, target_storage_purchase_recipient_account, unlimited_basic_storage, free_default_storage } = req.body;
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
    if(free_default_storage != null && !isNaN(free_default_storage)){
      data['free_default_storage'] = free_default_storage
    }

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
  else if(
    key !== 'max_buyable_capacity' && 
    key !== 'price_per_megabyte' && 
    key !== 'target_storage_purchase_recipient_account' && 
    key !== 'unlimited_basic_storage' && 
    key !== 'free_default_storage'
  ){
    res.send(JSON.stringify({ message: 'Invalid modify targets', success:false }));
    return;
  }
  else if(key == 'target_storage_purchase_recipient_account' && !data['e'].includes(e5)){
    res.send(JSON.stringify({ message: 'You need to specify a valid E5 if you are targeting the target_storage_purchase_recipient_account value', success:false }));
    return;
  }
  else{
    data[key] = value
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
    }
    // else if(space_utilized > 35){
    //   res.send(JSON.stringify({ message: 'Youll need to stream each file individually', success:false }));
    //   return;
    // }
    else{
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
});//ok -----

app.post('/reserve_upload', async (req, res) => {
  const { signature_data, signature, file_length, file_type, upload_extension } = req.body;
  if(signature_data == null || signature_data == '' || signature == null || signature == '' || file_length == null || isNaN(file_length) || file_type == null || !is_all_file_type_ok([file_type])){
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
    return;
  }
  else if(file_length <= 0){
    res.send(JSON.stringify({ message: 'You need to speicify the length of the file', success:false }));
    return;
  }
  else if(data['max_buyable_capacity'] == 0){
    res.send(JSON.stringify({ message: 'Storage on this node is disabeld', success:false }));
    return;
  }else{
    var storage_data = await fetch_accounts_available_storage(signature_data, signature)
    if((storage_data.available_space * (1024 * 1024)) < file_length){
      res.send(JSON.stringify({ message: 'Insufficient storage acquired for speficied account.', success:false }));
      return;
    }
    // else if(data['upload_reservations'][storage_data.account.toString()] != null && data['upload_reservations'][storage_data.account.toString()]['expiry'] < Date.now()){
    //   res.send(JSON.stringify({ message: 'You cant reserve more than one upload at once.', success:false }));
    //   return;
    // }
    else{
      // const upload_extension = makeid(53)
      const expiry = Date.now() + (1000 * 60 * 60 * 24 * 3)/* 3 days */
      data['upload_reservations'][upload_extension] = {'length':file_length, 'type':file_type, 'expiry':expiry, 'account':storage_data.account.toString(), 'aborted':false}
      // data['upload_reservations'][storage_data.account.toString()] = {'extension':upload_extension, 'expiry':expiry}
      res.send(JSON.stringify({ message: 'reservation successful.', extension: upload_extension, success:true }));
    }
  }
});//ok -----

app.post('/upload/:extension', async (req, res) => {
  const { extension } = req.params;
  if(extension == null || extension == ''){
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
    return;
  }else{
    var reservation_data = data['upload_reservations'][extension]
    if(reservation_data == null){
      res.send(JSON.stringify({ message: 'Reservation doesnt exist.', success:false }));
      return;
    }
    else if(Date.now() > reservation_data['expiry']){
      res.send(JSON.stringify({ message: 'Reservation already expired.', success:false }));
      return;
    }
    else if(reservation_data['aborted'] == true){
      res.send(JSON.stringify({ message: 'Reservation is invalid, please make another reservation.', success:false }));
      return;
    }
    else{
      // data['upload_reservations'][extension]['aborted'] = true;
      // delete data['upload_reservations'][reservation_data['account']];
      let receivedBytes = 0;
      const filePath = `storage_data/${extension}.${reservation_data['type']}`;
      var dir = './storage_data'
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
      const writeStream = fs.createWriteStream(filePath);
      const target_length = reservation_data['length']
      const account = reservation_data['account']

      req.on("data", (chunk) => {
        receivedBytes += chunk.length;
        data['storage_data'][account]['utilized_space'] += (chunk.length / (1024 * 1024))
        data['metrics']['total_space_utilized']+= (chunk.length / (1024 * 1024))
        if(receivedBytes > target_length || data['storage_data'][account]['utilized_space'] > data['storage_data'][account]['acquired_space']){
          console.log("Upload exceeded limit! Aborting...");
          req.destroy(); // Close the connection
          writeStream.destroy();
          res.send(JSON.stringify({ message: 'Upload exceeded reserved space.', success:false }));
        }else{
          // console.log(`Received: ${receivedBytes} bytes`);
        }
      });

      writeStream.on("finish", () => {
        console.log("Upload complete!");
        data['storage_data'][account]['files'] ++;
        data['metrics']['total_files_stored']++
        res.send(JSON.stringify({ message: 'Upload Successful.', success:true }));
        data['upload_reservations'][extension]['aborted'] = true;
      });

      writeStream.on("error", (err) => {
        console.error("Error writing file:", err);
        res.send(JSON.stringify({ message: 'Upload Failed.', success:false }));
      });

      req.pipe(writeStream);
    }
    
  }
})//ok -----

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
});//ok -----

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
    if(data['file_streams'][file] == null){
      data['file_streams'][file] = 0
    }
    data['file_streams'][file]++
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
});//ok -----

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
  else if(!is_basic_data_upload_size_valid(file_datas)){
    res.send(JSON.stringify({ message: 'One of the data objects has an invalid size', success:false }));
    return;
  }
  else{
    var success = await store_objects_in_node(file_datas);
    if(success == null){
      res.send(JSON.stringify({ message: 'Files stored Unsucessfully, internal server error', success:false }));
    }else{
      res.send(JSON.stringify({ message: 'Files stored Successfully', files: success, success:true }));
    }
  }
});//ok -----

/*  */
app.get('/streams', (req, res) => {
  const { files } = req.body;
  if(files == null || files.length == 0){
    res.send(JSON.stringify({ message: 'Please speficy an array of file names.', success:false }));
    return;
  }

  const return_streams_data = {}
  files.forEach(file => {
    var stream_count = data['file_streams'][file]
    if(stream_count == null){
      stream_count = 0
    }
    return_streams_data[file] = stream_count
  });

  res.send(JSON.stringify({ message: 'Search successful.', streams: return_streams_data, success:true }));
});

/* endpoint for fetching itransfers with a specified identifier */
app.get('/iTransfers', async (req, res) => {
  const { identifier, account, recipient, e5 } = req.body;
  if(identifier == null || identifier == ''){
    res.send(JSON.stringify({ message: 'Please speficy an identifier', success:false }));
    return;
  }
  if(recipient == null){
    res.send(JSON.stringify({ message: 'Please speficy the recipient of the iTransfer', success:false }));
    return;
  }
  const used_account = account == null ? '' : account
  const used_e5 = e5 == null ? 'E25' : e5

  if(!data['e'].includes(used_e5)){
    res.send(JSON.stringify({ message: 'The E5 youve specified is invalid.', success:false }));
    return;
  }

  /* 1: iTransfer, 2: Bill */
  var itransfer_data = await get_iTransfer_data(identifier, used_account, recipient, used_e5, 1/* iTransfer */)

  res.send(JSON.stringify({ message: 'Search successful.', payment_data: itransfer_data, success:true }));
  /* 
    {
      21_123_456 (block_number):{
        1002 (account_number):[
          { exchange: 3, amount: 50000, sender:1002, receiver:1112 },
          { exchange: 5, amount: 60000, sender:1002, receiver:1112 },
        ],
        1005 (account_number):[
          { exchange: 3, amount: 50000, sender:1005, receiver:1112 },
          { exchange: 5, amount: 60000, sender:1005, receiver:1112 },
        ],
        ...
      },
      ...
    }
  */
});

/* endpoint for fetching bill payment data with a specified identifier */
app.get('/bill_payments', async (req, res) => {
  //identifier, account, recipient, requested_e5, type
  const { identifier, account, recipient, e5 } = req.body;
  if(identifier == null || identifier == ''){
    res.send(JSON.stringify({ message: 'Please speficy an identifier', success:false }));
    return;
  }
  if(recipient == null){
    res.send(JSON.stringify({ message: 'Please speficy the recipient of the bill payments', success:false }));
    return;
  }
  if(account == null){
    res.send(JSON.stringify({ message: 'Please speficy the targeted account that received the bill', success:false }));
    return;
  }
  const used_e5 = e5 == null ? 'E25' : e5
  
  if(!data['e'].includes(used_e5)){
    res.send(JSON.stringify({ message: 'The E5 youve specified is invalid.', success:false }));
    return;
  }

  /* 1: iTransfer, 2: Bill */
  var itransfer_data = await get_iTransfer_data(identifier, account, recipient, used_e5, 2/* Bill */)

  res.send(JSON.stringify({ message: 'Search successful.', payment_data: itransfer_data, success:true }));
  /* 
    {
      21_123_456 (block_number):{
        1002 (account_number):[
          { exchange: 3, amount: 50000, sender:1002, receiver:1112 },
          { exchange: 5, amount: 60000, sender:1002, receiver:1112 },
        ],
        1005 (account_number):[
          { exchange: 3, amount: 50000, sender:1005, receiver:1112 },
          { exchange: 5, amount: 60000, sender:1005, receiver:1112 },
        ],
        ...
      },
      ...
    }
  */
});

/* endpoint for calculating and tallying consensus info for a specified poll */
app.post('/count_votes', async (req, res) => {
  try{
    const { static_poll_data, poll_id, file_objects, poll_e5 } = req.body;
    if(!data['e'].includes(poll_e5)){
      res.send(JSON.stringify({ message: 'The poll e5 value provided is invalid', success:false }));
      return;
    }
    if(isNaN(poll_id)){
      res.send(JSON.stringify({ message: 'The poll id value provided is invalid', success:false }));
      return;
    }
    var success_obj = await calculate_poll_results(static_poll_data, poll_id, file_objects, poll_e5)
    if(success_obj.success == true){
      var obj = {message:`Vote counted successfully.`, results: success_obj.results, success: true}
      var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
      res.send(string_obj);
    }else{
      res.send(JSON.stringify({ message: success_obj.message, success:false, error:success_obj.error}));
    }
  }catch(e){
    res.send(JSON.stringify({ message: 'Something went wrong.', success:false, error: e }));
  }
});//ok -----









const when_server_started = () => {
  start_up_time = Date.now()
  // var key = 'eeeee'+makeid(32)+'eeeee'
  var key = SECRET
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

  get_list_of_server_files_and_auto_backup()
}

async function when_server_killed(){
  await store_back_up_of_data()
  setTimeout(() => {
    console.log("Cleanup complete. Exiting.");
    process.exit(0);
  }, 1000);
}




var options = {
  key: fs.readFileSync(`${PRIVATE_KEY_RESOURCE}`), 
  cert: fs.readFileSync(`${CERTIFICATE_RESOURCE}`)
  // set the directory for the keys and cerificates your using here
};


//npm install express web3 crypto-js
//npm install pm2@latest -g
//npm install big-integer
//npm install crypto
//npm install os
//npm install check-disk-space
//npm install mime-types
//npm install dotenv

//pm2 start server.js --no-daemon
//pm2 ls
//pm2 stop all | 0
//sudo pm2 kill
//sudo pm2 start server.js --no-daemon

//client-cert.pem  contract-listener  package-lock.json
//client-key.pem   hash_data          package.json
//client.csr

//or node server.js if youre debugging
//ps aux | grep node
//kill [processID]


// Start server
// app.listen(4000, when_server_started); <-------- use this if youre testing, then comment 'options'
https.createServer(options, app).listen(HTTPS_PORT, when_server_started);

setInterval(attempt_loading_failed_ecids, 53*60*1000)
setInterval(load_events_for_all_e5s, 2*60*1000);
setInterval(store_back_up_of_data, 2*60*60*1000);
setInterval(store_hashes_in_file_storage_if_memory_full, 2*60*1000);
setInterval(update_storage_payment_information, 2*60*1000);
setInterval(backup_event_data_if_large_enough, 2*60*1000)
setInterval(delete_old_backup_files, 2*60*60*1000)



// Catch termination signals
process.on('SIGINT', () => when_server_killed('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => when_server_killed('SIGTERM')); // kill
process.on('SIGHUP', () => when_server_killed('SIGHUP'));   // terminal closed

// Catch normal exit
process.on('exit', (code) => {
  console.log(`\nProcess exited with code: ${code}`);
});