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
const { exec } = require('child_process');
const path = require('path');
// const CryptoJS = require("crypto-js");
const nacl = require("tweetnacl");

const app = express();
app.use(cors());
app.use(express.json({ limit: "100gb" }));
const version = '1.2'

const SECRET = process.env.SECRET_KEY;
const PRIVATE_KEY_RESOURCE = process.env.PRIVATE_KEY_RESOURCE
const CERTIFICATE_RESOURCE = process.env.CERTIFICATE_RESOURCE
const HTTPS_PORT = process.env.HTTPS_PORT
const AUTO_CERTIFICATE_RENEWAL_ENABLED = process.env.AUTO_CERTIFICATE_RENEWAL == null ? false : (process.env.AUTO_CERTIFICATE_RENEWAL == 'true'); // <---- change this to false if you dont want auto renewal of https certificates using certbot
const ENPOINT_UPDATES_ENABLED = process.env.ENPOINT_UPDATES_ENABLED == null ? false : (process.env.ENPOINT_UPDATES_ENABLED == 'true'); // <---- change this to false if you prefer manually updating your node
var logStream;
var sync_block_number = 0;
var server_public_key = null;
const privacy_address = '';
var server_keys = null;


/* data object containing all the E5 data. */
var data = {
  'key':'',
  'custom_gateway':'',
  'e':['E25',],
  'E25': {
    'addresses':['0xF3895fe95f423A4EBDdD16232274091a320c5284', '0x839C6155383D4a62E31d4d8B5a6c172E6B71979c', '0xD338118A55B5245b9C9F6d5f03BF9d9eA32c5850', '0xec24050b8E3d64c8be3cFE9a40A59060Cb35e57C', '0xFA85d977875092CA69d010d4EFAc5B0E333ce61E', '0x7dcc9570c2e6df2860a518eEE46fA90E13ef6276', '0x0Bb15F960Dbb856f3Eb33DaE6Cc57248a11a4728'],
    'web3':['https://etc.etcdesktop.com'], 'url':0,
    'first_block':19151130, 'current_block':{}, 'iteration':400_000, 'reorgs':[]
  },
  // 'file_data_capacity':0,
  'max_buyable_capacity':0,
  'price_per_megabyte':[],
  'target_account_e5':'',
  'target_storage_purchase_recipient_account':0,
  'last_checked_storage_block':{},
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
  'cold_storage_stream_data_files':{'backup_array':[],},
  'uploaded_files_data':{},
  'target_storage_recipient_accounts':{},
  'last_checked_storage_renewal_block':{},
  'free_default_storage_addresses':{},
  'memory_stats':{},
  'request_stats':{},
  'cold_storage_memory_stats':[],
  'cold_storage_request_stats':[],
  'cold_storage_trends_records':[],
  'hash_data_request_limit':1024,
  'event_data_request_limit':100000,
  'block_mod':10,
  'block_record_sync_time_limit': (135*24*60*60),
  'scheduled_ecids_to_delete':[],
  'is_ecid_delete_scheduled':false,
  'ip_request_time_limit': 1000,
  'certificate_expiry_time':0,
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
var file_data_steams = {}
var ipAccessTimestamps = {}
const RATE_LIMIT_WINDOW = 24*60*60*1000;/* 24hrs */
const STREAM_DATA_THRESHOLD = 1024*1024*5.3/* 5.3mbs */
const rateLimitMap = new Map();
var upload_view_trends_data = {}
const userKeysMap = new Map();
const endpoint_info = {}
let trafficHistory = [];
const originalFetch = global.fetch;

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

async function encrypt_secure_data(text, password){
  const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM needs 12-byte IV
  const key = await get_key_from_password(password, 'e');
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );

  const result = new Uint8Array(iv.length + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), iv.length);

  return uint8ToBase64(result); // return as base64 string
}

async function decrypt_secure_data(encrypted, password){
  const data = base64ToUint8(encrypted);
  const iv   = data.slice(0, 12);
  const ciphertext = data.slice(12);

  const key = await get_key_from_password(password, 'e');
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );
  const decoder = new TextDecoder();
  return decoder.decode(decrypted)
}

async function get_key_from_password(password, final_salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(final_salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
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
  var request = `${nitro_url}/data/e?${params.toString()}`
  try{
    await new Promise(resolve => setTimeout(resolve, 1100))
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
    try{
      var ecid_obj = get_ecid_obj(cids[i])
      if(!included_cids.includes(ecid_obj['cid'])){
        ecids.push(ecid_obj)
        included_cids.push(ecid_obj['cid'])
      }
    }
    catch(e){
      log_error({stack:e.toString()})
    }
  }
  if(beacon_chain_link != ''){
    if(included_cids.length > 35){
      const split_array_cid = splitIntoChunks(included_cids, 35)
      for(var i=0; i<split_array_cid.length; i++){
        await load_data_from_beacon_node(split_array_cid[i])
      }
    }else{
      await load_data_from_beacon_node(included_cids)
    }
  }else{
    for(var i=0; i<ecids.length; i++){
      var ecid_obj = ecids[i]
      delete_scheduled_entry_if_exists(ecid_obj['cid'])
      if(hash_data[ecid_obj['cid']] == null && cold_storage_hash_pointers[ecid_obj['cid']] == null){
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

function splitIntoChunks(arr, chunkSize) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

/* loads data from the beacon chain if a link to the node is specified */
async function load_data_from_beacon_node(cids){
  const params = new URLSearchParams({
    arg_string:JSON.stringify({hashes: cids}),
  });
  var request = `${beacon_chain_link}/data/e?${params.toString()}`
  try{
    await new Promise(resolve => setTimeout(resolve, 1100))
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
  var request = `${beacon_chain_link}/events/e?${params.toString()}`
  try{
    await new Promise(resolve => setTimeout(resolve, 1100))
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
        // delete event.blockNumber
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
  
  post_event_processing(contract_name, events, e5, event)
}

async function load_multiple_past_events(contract, event_names, e5, web3, contract_name, latest){
  try{
    var starting_block = data[e5]['current_block'][contract_name+event_names[0]] == null ? data[e5]['first_block'] : data[e5]['current_block'][contract_name+event_names[0]]

    var iteration = data[e5]['iteration']
    var events = []
    if(latest - starting_block < iteration){
      events = await contract.getPastEvents('allEvents', { fromBlock: starting_block, toBlock: latest }, (error, events) => {});
    }else{
      var pos = starting_block
      while (pos < latest) {
        var to = pos+iteration < latest ? pos+iteration : latest
        var from = pos
        events = events.concat(await contract.getPastEvents('allEvents', { fromBlock: from, toBlock: to }, (error, events) => {}))
        pos = to+1
      }
    }

    events.forEach(event => {
      delete event.address
      delete event.blockHash
      // delete event.blockNumber
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

    const groups = {}
    for(var e=0; e<events.length; e++){
      const focused_event = events[e]
      const event_name = focused_event["event"]
      if(groups[event_name] == null){
        groups[event_name] = []
      }
      groups[event_name].push(focused_event)
    }

    event_names.forEach(event_name => {
      const event_array = groups[event_name] == null ? [] : groups[event_name]
      event_data[e5][contract_name][event_name] = event_data[e5][contract_name][event_name].concat(event_array)
      data[e5]['current_block'][contract_name+event_name] = latest
      post_event_processing(contract_name, event_array, e5, event_name)
    });
  }catch(e){
    console.log(e)
  }
}

function post_event_processing(contract_name, events, e5, event_name){
  if(events.length > 0){
    if(contract_name == 'E52' && event_name == 'e4'/* Data */){
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
    else if(contract_name == 'E52' && event_name == 'e5'/* Metadata */){
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
      stage_ids_to_track(ecids, ecid_ids, e5)
    }
    else if(contract_name == 'H52' && event_name == 'e5'/* Award */){
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
    if(contract_name == 'E5' && event_name == 'e1'/* MakeObject */){
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
    const web3 = data[e5]['url'] != null ? new Web3(data[e5]['web3'][data[e5]['url']]): new Web3(data[e5]['web3']);
    const e5_contract = new web3.eth.Contract(E5_CONTRACT_ABI, data[e5]['addresses'][0]);
    const e52_contract = new web3.eth.Contract(E52_CONTRACT_ABI, data[e5]['addresses'][1]);
    const f5_contract = new web3.eth.Contract(F5_CONTRACT_ABI, data[e5]['addresses'][2]);
    const g5_contract = new web3.eth.Contract(G5_CONTRACT_ABI, data[e5]['addresses'][3]);
    const g52_contract = new web3.eth.Contract(G52_CONTRACT_ABI, data[e5]['addresses'][4]);
    const h5_contract = new web3.eth.Contract(H5_CONTRACT_ABI, data[e5]['addresses'][5]);
    const h52_contract = new web3.eth.Contract(H52_CONTRACT_ABI, data[e5]['addresses'][6]);
    const latest = Number(await web3.eth.getBlockNumber())
    const t = 3000

    if(beacon_chain_link != '' && data[e5]['current_block']['E5'+'e1'] == null){
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
    }else{
      //E5
      load_multiple_past_events(e5_contract, ['e1','e2', 'e3', 'e4', 'e5', 'e6', 'e7'], e5, web3, 'E5', latest)
      await new Promise(resolve => setTimeout(resolve, t))

      //E52
      load_multiple_past_events(e52_contract, ['e1','e2', 'e3', 'e4', 'e5'], e5, web3, 'E52', latest)
      await new Promise(resolve => setTimeout(resolve, t))

      //F5
      load_multiple_past_events(f5_contract, ['e1','e2', 'e5', 'e4'], e5, web3, 'F5', latest)
      await new Promise(resolve => setTimeout(resolve, t))

      //G5
      load_multiple_past_events(g5_contract, ['e1','e2'], e5, web3, 'G5', latest)
      await new Promise(resolve => setTimeout(resolve, t))

      //G52
      load_multiple_past_events(g52_contract, ['e1','e2', 'e3', 'archive'], e5, web3, 'G52', latest)
      await new Promise(resolve => setTimeout(resolve, t))

      //H5
      load_multiple_past_events(h5_contract, ['e1','e2', 'e3'], e5, web3, 'H5', latest)
      await new Promise(resolve => setTimeout(resolve, t))

      //H52
      load_multiple_past_events(h52_contract, ['e1','e2', 'e3', 'e5', 'power'], e5, web3, 'H52', latest)
      await new Promise(resolve => setTimeout(resolve, t))
    }

    //load nitro links
    load_nitro_links(e5)
  }catch(e){
    console.log(e)
  }
}

/* starts the loading of all the E5 event data if the app key is defined */
async function load_events_for_all_e5s(){
  if(app_key == null || app_key == '') return;

  var e5s = data['e']
  for(var i=0; i<e5s.length; i++){ 
    try{
      await check_for_reorgs(e5s[i])
      await check_and_set_default_rpc(e5s[i])
      set_up_listeners(e5s[i])
    }catch(e){
      log_error(e)
    }
  }
}

async function check_and_set_default_rpc(e5){
  if(data[e5]['url'] == null) return;
  data[e5]['url'] = 0
  const web3_url = data[e5]['web3'][data[e5]['url']]
  const web3 = new Web3(web3_url);

  var is_conn = await web3.eth.net.isListening()
  if(!is_conn){
    if(data[e5]['url'] < data[e5]['web3'].length - 1){
      data[e5]['url'] ++
      await check_and_set_default_rpc(e5)
    }else{
      return;
    }
  }else{
    return;
  }
}

async function check_for_reorgs(e5){
  const web3 = data[e5]['url'] != null ? new Web3(data[e5]['web3'][data[e5]['url']]): new Web3(data[e5]['web3']);
  const current_block_number = Number(await web3.eth.getBlockNumber())
  const current_block = await web3.eth.getBlock(current_block_number);
  const current_block_hash = current_block.hash == null ? '' : current_block.hash.toString()
  const current_block_time = parseInt(current_block.timestamp)
  if(data[e5]['block_hashes'] == null){
    data[e5]['block_hashes'] = {'e':[]}
    if(current_block_hash != '') {
      data[e5]['block_hashes'][current_block_number] = { 'hash': current_block_hash, 'timestamp':current_block_time }
      data[e5]['block_hashes']['e'].push(current_block_number)
    }
  }
  else if(data[e5]['block_hashes'] != null && current_block_number > 0){
    const last_block_pos = data[e5]['block_hashes']['e'].length() - 1
    const last_block_number = data[e5]['block_hashes']['e'][last_block_pos]
    const last_block = await web3.eth.getBlock(last_block_number);
    const last_block_hash = last_block.hash == null ? '' : last_block.hash.toString()

    if(last_block_hash != '' && data[e5]['block_hashes'][last_block_number] != null && data[e5]['block_hashes'][last_block_number]['hash'] != last_block_hash){
      //there was a reorg, so find last matching block
      var last_matching_block = null
      var last_matching_block_time = null;
      var block_being_checked = last_block_pos - 1
      const blocks_to_delete = []
      
      while(last_matching_block == null && block_being_checked >= 0){
        const focused_block_number = data[e5]['block_hashes']['e'][block_being_checked]
        const block_being_chekced_block = await web3.eth.getBlock(focused_block_number);
        const block_being_chekced_block_hash = block_being_chekced_block.hash == null ? '' : block_being_chekced_block.hash.toString()
        
        if(data[e5]['block_hashes'][focused_block_number]['hash'] != block_being_chekced_block_hash){
          //hash doesnt match, move back to previously recorded hash
          blocks_to_delete.push(focused_block_number)
          block_being_checked --;
        }
        else{
          last_matching_block = focused_block_number
          last_matching_block_time = block_being_chekced_block.timestamp
        }
      }

      if(last_matching_block == null){
        last_matching_block = data[e5]['first_block']
        const first_block = await web3.eth.getBlock(last_matching_block)
        last_matching_block_time = first_block.timestamp
      }

      blocks_to_delete.forEach(invalid_block_number => {
        delete data[e5]['block_hashes'][invalid_block_number]
      });
      data[e5]['block_hashes']['e'].splice(block_being_checked + 1);
      if(data[e5]['current_block'] != null){
        const keys = Object.keys(data[e5]['current_block'])
        keys.forEach(key => {
          data[e5]['current_block'][key] = last_matching_block
        });
      }
      await delete_all_events_after_specific_block(last_matching_block, last_matching_block_time, e5, current_block_number)
    }else{
      //record block hash normally
      if(current_block_hash != '') {
        data[e5]['block_hashes'][current_block_number] = { 'hash': current_block_hash, 'timestamp':current_block_time }
        data[e5]['block_hashes']['e'].push(current_block_number)
      }
    }
  }
}

async function delete_all_events_after_specific_block(block_number, last_matching_block_time, e5, current_block_number){
  log_error({stack: `Reorg detected in ${e5}! Rolling back node by ${current_block_number - block_number} blocks to ${block_number} validated on ${new Date(last_matching_block_time*1000)}.`})

  if(data[e5]['reorgs'] == null){
    data[e5]['reorgs'] = []
  }
  data[e5]['reorgs'].push({'last_valid_block':block_number, 'affected_blocks':(current_block_number - block_number), 'last_valid_block_timestamp':(last_matching_block_time*1000), 'now':Date.now()})

  for(var i=0; i<cold_storage_event_files.length; i++){
    const focused_file = cold_storage_event_files[i]
    if(parseInt(focused_file) > (last_matching_block_time * 1000)){
      const events_object = await fetch_entire_event_file_from_storage(focused_file)
      const updated_events_object = delete_all_invalid_event_entries(events_object, e5, block_number)
      await replace_event_file_after_edit(updated_events_object.events_object, focused_file)
      await start_delete_event_data_hashes(updated_events_object.deleted_events_object, last_matching_block_time)
    }
  }
  const updated_object_data = delete_all_invalid_event_entries(event_data, e5, block_number)
  await start_delete_event_data_hashes(updated_object_data.deleted_events_object, last_matching_block_time)
  event_data = updated_object_data.events_object
}

function delete_all_invalid_event_entries(object, e5, block_number){
  const events_object = structuredClone(object)
  const deleted_events_object = {}
  Object.keys(events_object).forEach(focused_e5 => {
    if(focused_e5 == e5){
      Object.keys(events_object[focused_e5]).forEach(contract => {
        Object.keys(events_object[focused_e5][contract]).forEach(event_name => {
          events_object[focused_e5][contract][event_name].forEach((event_item, index) => {
            if(event_item.blockNumber != null && parseInt(event_item.blockNumber) > block_number){
              events_object[focused_e5][contract][event_name].splice(index, 1)
              if(deleted_events_object[contract] == null){
                deleted_events_object[contract] = {}
              }
              if(deleted_events_object[contract][event_name] == null){
                deleted_events_object[contract][event_name] = []
              }
              deleted_events_object[contract][event_name].push(event_item)
            }
          });
        });
      });
    }
  });

  return { events_object, deleted_events_object };
}

async function start_delete_event_data_hashes(deleted_events_object, last_matching_block_time){
  const contracts = Object.keys(deleted_events_object)
  if(contracts.length > 0){
    for(var c=0; c<contracts.length; c++){
      const focused_contract = contracts[c]
      const event_names = Object.keys(deleted_events_object[focused_contract])
      for(var e=0; e<event_names.length; e++){
        const event_name = event_names[e]
        const deleted_events = deleted_events_object[focused_contract][event_name]
        await delete_invalid_entry_hashes(focused_contract, deleted_events, e5, event_name, last_matching_block_time)
      }
    }
  }
}

async function delete_invalid_entry_hashes(contract_name, events, e5, event_name, last_matching_block_time){
  if(events.length > 0){
    if(contract_name == 'E52' && event_name == 'e4'/* Data */){
      //new data events
      var ecids = []
      for(var i=0; i<events.length; i++){
        if(!ecids.includes(events[i].returnValues.p4/* string_data */)){
          ecids.push(events[i].returnValues.p4/* string_data */)
        }
      }
      await schedule_delete_hash_data(ecids)
      remove_ecids(ecids)
    }
    else if(contract_name == 'E52' && event_name == 'e5'/* Metadata */){
      //new metadata events
      var ecids = []
      var ecid_ids = []
      for(var i=0; i<events.length; i++){
        if(!ecids.includes(events[i].returnValues.p4/* metadata */)){
          ecids.push(events[i].returnValues.p4/* metadata */)
          ecid_ids.push(events[i].returnValues.p1/* target_obj_id */)
        }
      }
      await schedule_delete_hash_data(ecids)
      remove_ecids(ecids)
      await reverse_update_staged_hash_data(ecids, last_matching_block_time)
    }
    else if(contract_name == 'H52' && event_name == 'e5'/* Award */){
      //new award events
      var ecids = []
      for(var i=0; i<events.length; i++){
        if(!ecids.includes(events[i].returnValues.p4/* metadata */)){
          ecids.push(events[i].returnValues.p4/* metadata */)
        }
      }
      await schedule_delete_hash_data(ecids)
      remove_ecids(ecids)
    }
    if(contract_name == 'E5' && event_name == 'e1'/* MakeObject */){
      //record all the object types
      for(var i=0; i<events.length; i++){
        if(object_types[e5] == null){
          object_types[e5] = {}
        }
        delete object_types[e5][parseInt(events[i].returnValues.p1/* object_id */)];
      }
    }
  }
}

function remove_ecids(ecids){
  var count = 0
  ecids.forEach(ecid => {
    if(ecid.includes('.') || ecid.startsWith('Qm')){
      count++
    }
  });
  hash_count-=count
}

async function schedule_delete_hash_data(cids){
  var included_cids = []
  for(var i=0; i<cids.length; i++){
    var ecid_obj = get_ecid_obj(cids[i])
    if(!included_cids.includes(ecid_obj['cid'])){
      ecids.push(ecid_obj)
      included_cids.push(ecid_obj['cid'])
    }
  }
  data['scheduled_ecids_to_delete'] = data['scheduled_ecids_to_delete'].concat(included_cids)
  if(data['is_ecid_delete_scheduled'] != true){
    setTimeout(delete_hash_data, 18*24*60*60*1000);
    data['is_ecid_delete_scheduled'] = true
  }
}

async function delete_hash_data(){
  data['is_ecid_delete_scheduled'] = false
  const file_mapping = {}
  data['scheduled_ecids_to_delete'].forEach(cid => {
    if(cold_storage_hash_pointers[cid] != null){
      if(file_mapping[cold_storage_hash_pointers[cid]] == null){
        file_mapping[cold_storage_hash_pointers[cid]] = []
      }
      file_mapping[cold_storage_hash_pointers[cid]].push(cid)
    }else{
      if(hash_data[cid]!= null){
        delete_color_metric(hash_data[cid])
        delete hash_data[cid]
        delete_scheduled_entry_if_exists(cid)
      }
    }
  });

  const files_to_modify = Object.keys(file_mapping)
  if(files_to_modify.length > 0){
    for(var f=0; f<files_to_modify.length; f++){
      const file_name = files_to_modify[f]
      const file_object = await fetch_entire_data_file_from_storage(file_name)
      file_mapping[file_name].forEach(cid_entry => {
        if(file_object[cid_entry]!= null){
          delete_color_metric(file_object[cid_entry])
          delete file_object[cid_entry];
          delete_scheduled_entry_if_exists(cid_entry)
        }
      });
      await replace_data_file_after_edit(file_object, file_name)
    }
  }
}

function delete_scheduled_entry_if_exists(cid){
  if(data['scheduled_ecids_to_delete'].includes(cid)){
    const index = data['scheduled_ecids_to_delete'].indexOf(cid)
    if(index != -1){
      data['scheduled_ecids_to_delete'].splice(index, 1)
    }
  }
}

async function fetch_entire_data_file_from_storage(file){
  var is_loading_file = true
  var cold_storage_obj = {}
  fs.readFile(`hash_data/${file}.json`, (error, data) => {
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
  return cold_storage_obj
}

async function replace_data_file_after_edit(data_object, file_name){
  var is_loading_file = true
  const write_data = JSON.stringify(data_object, (_, v) => typeof v === 'bigint' ? v.toString() : v)
  var dir = './hash_data'
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  fs.writeFile(`hash_data/${file_name}.json`, write_data, (error) => {
    if (error) {
      console.log(error)
    }else{      
      console.log("hash_data replaced correctly");
    }
    is_loading_file = false
  });
  while (is_loading_file == true) {
    if (is_loading_file == false) break
    await new Promise(resolve => setTimeout(resolve, 700))
  }
}


function delete_color_metric(hash_data){
  var set_color = 'g'
  if(hash_data != null && isJsonObject(hash_data) == true && hash_data['tags'] != null && hash_data['tags']['color'] != null){
    set_color = hash_data['tags']['color']
  }
  try{
    if(data['color_metrics'][set_color] != null){
      data['color_metrics'][set_color]--;
    }
  }catch(e){
    console.log(e)
  }
}

async function replace_event_file_after_edit(events_object, file_name){
  var is_loading_file = true
  const write_data = JSON.stringify(events_object, (_, v) => typeof v === 'bigint' ? v.toString() : v)
  var dir = './event_data'
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  fs.writeFile(`event_data/${file_name}.json`, write_data, (error) => {
    if (error) {
      console.log(error)
    }else{      
      console.log("event_data replaced correctly");
    }
    is_loading_file = false
  });
  while (is_loading_file == true) {
    if (is_loading_file == false) break
    await new Promise(resolve => setTimeout(resolve, 700))
  }
}

/* fetches the data stored in a event storage file */
async function fetch_entire_event_file_from_storage(file){
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
  return cold_storage_obj
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
function stage_ids_to_track(ecids, obj_ids, e5){
  ecids.forEach((ecid, index) => {
    staged_ecids[ecid] = { object_id: obj_ids[index], e5: e5 }
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
                  const item_lan = container_data['tags'][key]['lan'] == null ? 'en' : container_data['tags'][key]['type']
                  const item_state = container_data['tags']['key']['state'] == null ? '0x' : container_data['tags']['key']['state']
                  if(pointer_data[item_type] == null){
                    pointer_data[item_type] = []
                  }
                  const id = isNaN(staged_ecids[ecid]) ? staged_ecids[ecid].object_id : staged_ecids[ecid]
                  const e5 = isNaN(staged_ecids[ecid]) ? staged_ecids[ecid].e5 : 'E25'
                  pointer_data[item_type].push({'id':id, 'e5':e5, 'keys':index_values})
                  record_trend('uploads', index_values, item_lan, item_state, item_type, {})
                  delete staged_ecids[ecid]
                }
              }
            }
          }else{
            delete staged_ecids[ecid]
          }
        }
        catch(e){
          log_error(e)
        }
      }
    }
  }
}

function record_trend(type, keys, language, state, object_type, tag_type_mapping){
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const timestamp = now.getTime()
  keys.forEach((tag, index) => {
    if(upload_view_trends_data[timestamp] == null){
      upload_view_trends_data[timestamp] = {'uploads':{}, 'views':{} }
    }
    if(upload_view_trends_data[timestamp][type][language] == null){
      upload_view_trends_data[timestamp][type][language] = {}
    }
    if(upload_view_trends_data[timestamp][type][language][tag] == null){
      upload_view_trends_data[timestamp][type][language][tag] = {}
    }
    if(upload_view_trends_data[timestamp][type][language][tag][state] == null){
      upload_view_trends_data[timestamp][type][language][tag][state] = {}
    }
    if(object_type == 0){
      const targeted_object_ids_to_update = tag_type_mapping[tag] || [];
      targeted_object_ids_to_update.forEach(object_e5_id => {
        const object_e5 = object_e5_id.split(':')[0]
        const object_id = object_e5_id.split(':')[1]
        const final_object_type = object_types[object_e5][object_id]
        if(upload_view_trends_data[timestamp][type][language][tag][state][final_object_type] == null){
          upload_view_trends_data[timestamp][type][language][tag][state][final_object_type] = { 'hits':0 }
        }
        upload_view_trends_data[timestamp][type][language][tag][state][final_object_type]['hits'] ++
      });
    }else{
      if(upload_view_trends_data[timestamp][type][language][tag][state][object_type] == null){
        upload_view_trends_data[timestamp][type][language][tag][state][object_type] = { 'hits':0 }
      }
      upload_view_trends_data[timestamp][type][language][tag][state][object_type]['hits'] ++
    }
    
  });
}


async function reverse_update_staged_hash_data(staged_ecids_to_remove, last_matching_block_time){
  // console.log('updating staged hash data...')
  for(const ecid in staged_ecids_to_remove){
    if(staged_ecids_to_remove.hasOwnProperty(ecid)){
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
                  const item_lan = container_data['tags'][key]['lan'] == null ? 'en' : container_data['tags'][key]['type']

                  if(pointer_data[item_type] != null){
                    const id = isNaN(staged_ecids_to_remove[ecid]) ? staged_ecids_to_remove[ecid].object_id : staged_ecids_to_remove[ecid]
                    const e5 = isNaN(staged_ecids_to_remove[ecid]) ? staged_ecids_to_remove[ecid].e5 : 'E25'

                    const index = pointer_data[item_type].findIndex(obj => (obj['id'] == id && obj['e5'] == e5));
                    if (index != -1) {
                      pointer_data[item_type].splice(index, 1); // remove 1 item at that index
                    }
                  }
                  await unrecord_trend('uploads', index_values, item_lan, last_matching_block_time)
                  if(staged_ecids[ecid] != null){
                    delete staged_ecids[ecid]
                  }
                }
              }
            }
          }
          else{
            if(staged_ecids[ecid] != null){
              delete staged_ecids[ecid]
            }
          }
        }
        catch(e){
          log_error(e)
        }
      }
    }
  }
}


async function unrecord_trend(type, keys, language, last_matching_block_time){
  const recorded_trends_data_files = data['cold_storage_trends_records'].filter(function (time) {
    return (parseInt(time) >= parseInt(last_matching_block_time))
  });

  if(recorded_trends_data_files.length > 0){
    for(var i=0; i<recorded_trends_data_files.length; i++){
      const focused_file = recorded_trends_data_files[i]
      const object = await read_file(focused_file, 'trends_stats_history')
      const updated_object = change_trends_object_file(type, keys, language, last_matching_block_time, object)
      await rewrite_entire_trend_file_in_storage(focused_file, updated_object)
    }
  }

  upload_view_trends_data = change_trends_object_file(type, keys, language, last_matching_block_time, upload_view_trends_data)
}

function change_trends_object_file(type, keys, language, last_matching_block_time, view_trends_data){
  const upload_view_trends_data_clone = structuredClone(view_trends_data)
  Object.keys(upload_view_trends_data_clone).forEach(timestamp => {
    if(timestamp > last_matching_block_time){
      if(upload_view_trends_data_clone[timestamp] != null && upload_view_trends_data_clone[timestamp][type] != null && upload_view_trends_data_clone[timestamp][type][language] != null){
        keys.forEach(tag => {
          if(upload_view_trends_data_clone[timestamp][type][language][tag] != null){
            const states = Object.keys(upload_view_trends_data_clone[timestamp][type][language][tag])
            states.forEach(state => {
              upload_view_trends_data_clone[timestamp][type][language][tag][state]['hits'] --;
            });
          }
        });
      }
    }
  });
  return upload_view_trends_data_clone
}

async function rewrite_entire_trend_file_in_storage(file_name, updated_object){
  var is_loading_file = true
  const write_data = JSON.stringify(updated_object, (_, v) => typeof v === 'bigint' ? v.toString() : v)
  var dir = './trends_stats_history'
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  fs.writeFile(`trends_stats_history/${file_name}.json`, write_data, (error) => {
    if (error) {
      console.log(error)
    }else{      
      console.log("trends_stats_history replaced correctly");
    }
    is_loading_file = false
  });
  while (is_loading_file == true) {
    if (is_loading_file == false) break
    await new Promise(resolve => setTimeout(resolve, 700))
  }
}









/* stores a back up of all the node's data in a file. */
async function store_back_up_of_data(){
  var obj = {
    'data':data,
    'event_data':event_data, 
    'hash_data':hash_data,
    'object_types':object_types, 
    'cold_storage_hash_pointers':cold_storage_hash_pointers, 
    'cold_storage_event_files':cold_storage_event_files, 
    'pointer_data':pointer_data, 
    'hash_count': hash_count, 
    'load_count': load_count, 
    'app_key': app_key, 
    'staged_ecids':staged_ecids, 
    'beacon_chain_link': beacon_chain_link, 
    'failed_ecids':failed_ecids, 
    'file_data_steams':file_data_steams,
    'upload_view_trends_data':upload_view_trends_data,
  }
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
      if(obj['file_data_steams'] != null){
        file_data_steams = obj['file_data_steams']
      }
      if(obj['upload_view_trends_data'] != null){
        upload_view_trends_data = obj['upload_view_trends_data']
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
async function search_for_object_ids_by_tags(tags, target_type, language, state){
  var all_objs = pointer_data[target_type] == null ? [] : pointer_data[target_type]
  if(target_type == 0){
    for(var p=17; p<=36; p++){
      var p_objs = pointer_data[p] == null ? [] : pointer_data[p]
      all_objs = all_objs.concat(p_objs)
    }
  }
  var filtered_objects = [];
  var processed_tags = tags.map(word => word.toString());
  const tag_type_mapping = {}
  filtered_objects = all_objs.filter(function (object) {
    var object_tags = object['keys']
    const containsAll = processed_tags.some(r=> object_tags.includes(r))
    if(containsAll == true){
      object_tags.forEach(tag => {
        if(tag_type_mapping[tag] == null){
          tag_type_mapping[tag] = []
        }
        const id = object['id']
        const e5 = object['e5'] == null ? 'E25' : object['e5']
        const e5_id = e5+':'+id
        if(!tag_type_mapping[tag].includes(e5_id)){
          tag_type_mapping[tag].push(e5_id)
        }
      });
    }
    return (containsAll)
  });
  var final_filtered_objects = []
  final_filtered_objects = filtered_objects.filter(function (object) {
    var object_tags = object['keys']
    const containsAll = processed_tags.every(element => {
      const includes = object_tags.includes(element);
      if(includes == true){
        if(tag_type_mapping[element] == null){
          tag_type_mapping[element] = []
        }
        const id = object['id']
        const e5 = object['e5'] == null ? 'E25' : object['e5']
        const e5_id = e5+':'+id
        if(!tag_type_mapping[element].includes(e5_id)){
          tag_type_mapping[element].push(e5_id)
        }
      }
      return includes
    });
    return (containsAll)
  });

  var ids = []
  final_filtered_objects.forEach(item => {
    const id = item['id']
    const e5 = item['e5'] == null ? 'E25' : item['e5']
    const e5_id = e5+':'+id
    if(!ids.includes(e5_id)){
      ids.push(e5_id)
    }
  });
  filtered_objects.forEach(item => {
    const id = item['id']
    const e5 = item['e5'] == null ? 'E25' : item['e5']
    const e5_id = e5+':'+id
    if(!ids.includes(e5_id)){
      ids.push(e5_id)
    }
  });

  record_trend('views', tags, language, state, target_type, tag_type_mapping)

  return ids;
}

/* filters objects by a specified title */
async function search_for_object_ids_by_title(title, target_type){
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
    const containsAll = object_tags.includes(title.toString())
    return (containsAll)
  });

  var ids = []
  filtered_objects.forEach(item => {
    const id = item['id']
    const e5 = item['e5'] == null ? 'E25' : item['e5']
    const e5_id = e5+':'+id
    if(!ids.includes(e5_id)){
      ids.push(e5_id)
    }
  });

  return ids;
}





/* returns the subscription payment information for a specified account */
async function get_subscription_payment_information(e5, signature_data, subscription, signature){
  const web3 = data[e5]['url'] != null ? new Web3(data[e5]['web3'][data[e5]['url']]): new Web3(data[e5]['web3']);
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
  if(get_object_size_in_mbs(hash_data) > 5.3){
    //store all the data in a file
    const now = Date.now()
    const write_data = JSON.stringify(hash_data, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    var dir = './hash_data'
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    fs.writeFile(`hash_data/${now}.json`, write_data, (error) => {
      if (error) {
        log_error(error)
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
async function fetch_accounts_available_storage(signature_data, signature, e5){
  const web3 = data[e5]['url'] != null ? new Web3(data[e5]['web3'][data[e5]['url']]): new Web3(data[e5]['web3']);
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
    const e5_address_account = e5+':'+address_account

    var payment_data = data['storage_data'][e5_address_account]
    if(payment_data == null){
      if(data['free_default_storage'] != 0 && address_account != 0 && 
        data['free_default_storage_addresses'][original_address] == null){
        var balance = await web3.eth.getBalance(original_address)
        if(balance != 0){
          data['storage_data'][e5_address_account] = {'files':0, 'acquired_space':parseFloat(data['free_default_storage']), 'utilized_space':0.0};
          data['free_default_storage_addresses'][original_address] = true

          payment_data = data['storage_data'][e5_address_account]
          return { available_space: (payment_data['acquired_space'] - payment_data['utilized_space']), account: e5_address_account }
        }
        else{
          return { available_space: 0.0, account: e5_address_account };
        }
      }
      return { available_space: 0.0, account: e5_address_account };
    } 
    return { available_space: (payment_data['acquired_space'] - payment_data['utilized_space']), account: e5_address_account }
  }catch(e){
    return { available_space: 0.0, account: e5+':'+0, }
  }
}

/* checks for new storage payments and updates how much storage space their account has in the node */
function start_update_storage_payment_information(){
  const e5_keys = Object.keys(data['target_storage_recipient_accounts'])
  if(!isNaN(data['last_checked_storage_block'])){
    data['last_checked_storage_block'] = {}
  }
  e5_keys.forEach(e5_key => {
    const target_storage_purchase_recipient_account = data['target_storage_recipient_accounts'][e5_key]
    if(data['last_checked_storage_block'][e5_key] == null){
      data['last_checked_storage_block'][e5_key] = 0
    }
    update_storage_payment_information(e5_key, target_storage_purchase_recipient_account)
  });
}

async function update_storage_payment_information(e5, target_storage_purchase_recipient_account){
  const storage_boot_time = parseInt(data['storage_boot_time'])
  var last_checked_storage_block = data['last_checked_storage_block'][e5]
  
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
          const sender = e5+':'+event.returnValues.p2.toString()/* sender */

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

    var price_per_megabyte = data['price_per_megabyte'][e5]
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
        data['storage_data'][account] = { 'files':0, 'acquired_space':parseFloat(acquired_space), 'utilized_space':0.0,}
      }else{
        data['storage_data'][account]['acquired_space'] = parseFloat(data['storage_data'][account]['acquired_space']+acquired_space)
      }
      // console.log(`updated storage space for account ${account} to ${data['storage_data'][account]['acquired_space']} mbs`)
    }
  }
  
  data['last_checked_storage_block'][e5] = (data[e5]['current_block']['H52'+'e1'])
}

/* returns a big int value from a number and its specified depth */
function get_actual_number(number, depth){
  var p = (bigInt(depth).times(72)).toString().toLocaleString('fullwide', {useGrouping:false})
  var depth_vaule = bigInt(('1e'+p))
  return (bigInt(number).times(depth_vaule)).toString().toLocaleString('fullwide', {useGrouping:false})
}


function start_update_storage_renewal_payment_information(){
  const current_month = new Date().getMonth()
  if(current_month > 5){
    return;
  }

  const e5_keys = Object.keys(data['target_storage_recipient_accounts'])
  e5_keys.forEach(e5_key => {
    const target_storage_purchase_recipient_account = data['target_storage_recipient_accounts'][e5_key]
    if(data['last_checked_storage_renewal_block'][e5_key] == null){
      data['last_checked_storage_renewal_block'][e5_key] = 0
    }
    update_storage_renewal_payment_information(e5_key, target_storage_purchase_recipient_account)
  });
}

async function update_storage_renewal_payment_information(e5, target_storage_purchase_recipient_account){
  const storage_boot_time = parseInt(data['storage_boot_time'])
  var last_checked_storage_block = data['last_checked_storage_renewal_block'][e5]
  
  var from_filter = {'p':'p6'/* block_number */, 'value': last_checked_storage_block}
  var events = await filter_events(e5, 'H52', 'e1'/* transfer */, {p3/* receiver */:target_storage_purchase_recipient_account}, from_filter)

  var purchase_events = await filter_events(e5, 'E52', 'e4'/* data */, {p1/* target_id */:29, p5/* int_data */: target_storage_purchase_recipient_account}, {})

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
        if(data_event.returnValues.p4/* string_data */ == 'renewal'){
          var sized_amount = get_actual_number(amount.toString().toLocaleString('fullwide', {useGrouping:false}), depth.toString().toLocaleString('fullwide', {useGrouping:false}))
          const sender = e5+':'+event.returnValues.p2.toString()/* sender */

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

    var price_per_megabyte = data['price_per_megabyte'][e5]
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
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime()
    const last_year = new Date().getFullYear() - 1
    for (const account in accounts_space_units) {
      var acquired_space = accounts_space_units[account]
      if(data['storage_data'][account] != null){
        var total_space_to_be_paid_for = 0
        const files = []
        if(data['storage_data'][account]['uploaded_files'] != null && data['storage_data'][account]['uploaded_files'].length > 0){
          data['storage_data'][account]['uploaded_files'].forEach(file => {
            const file_size = data['uploaded_files_data'][file]['size']
            const file_upload_time = data['uploaded_files_data'][file]['time']
            const is_file_deleted = data['uploaded_files_data'][file]['deleted']
            if(file_upload_time < startOfYear && is_file_deleted != true){
              total_space_to_be_paid_for += file_size
              files.push(file)
            }
          });
        }
        if(acquired_space >= total_space_to_be_paid_for){
          files.forEach(file => {
            if(data['uploaded_files_data'][file]['renewals'] == null){
              data['uploaded_files_data'][file]['renewals'] = []
            }
            if(!data['uploaded_files_data'][file]['renewals'].includes(last_year)){
              data['uploaded_files_data'][file]['renewals'].push(last_year)
            }
          });
        }
      }
    }
  }
  
  data['last_checked_storage_renewal_block'][e5] = (data[e5]['current_block']['H52'+'e1'])
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
  var provider = data[e5]['url'] == null ? data[e5]['web3'] : data[e5]['web3'][data[e5]['url']]
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
  if(get_object_size_in_mbs(event_data) > 5.3){
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
  const web3 = data['E25']['url'] != null ? new Web3(data['E25']['web3'][data['E25']['url']]): new Web3(data['E25']['web3']);
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
  const web3 = data[e5]['url'] != null ? new Web3(data[e5]['web3'][data[e5]['url']]): new Web3(data[e5]['web3']);/* initialize a web3 object */
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

/* calculates the chart data to display in requested subscription */
async function calculate_income_stream_data_points(subscription_object, steps, filter_value, token_name_data){
  const subscription_e5 = subscription_object['e5']
  const subscription_id = subscription_object['id']
  const events = await filter_events(subscription_e5, 'F5', 'e1', { p1/* target_id */: subscription_id}, null)
  if(events.length == 0){
    return { data: {}, success:false, reason: 'No payment events Found' }
  }
  const all_modification_events = await filter_events(subscription_e5, 'F5', 'e5', { p1/* target_id */: subscription_id}, null)

  const price_data_snapshots = get_price_data_snapshots(all_modification_events, object)
  var data = []
  var total_payment_data = {}
  const starting_time = Math.floor(Date.now()/1000) - filter_value

  try{
    const payment_history = {}
    for(var j=0; j<events.length; j++){
        const time_units_bought = events[j].returnValues.p3/* time_units_paid_for */
        const paying_account = events[j].returnValues.p2/* sender_acc_id */
        const paying_time = parseInt(events[j].returnValues.p5/* timestamp */)
        if(payment_history[paying_account] == null){
            payment_history[paying_account] = []
        }
        const price_snapshot = price_data_snapshots.find(e => (paying_time > e['from'] && paying_time < e['to']))
        if(price_snapshot != null){
            const time_unit = price_snapshot['time_unit']
            const prices_used = price_snapshot['prices']
            if(payment_history[paying_account].length == 0){
                const to = bigInt(paying_time).plus((bigInt(time_units_bought).multiply(bigInt(time_unit))))
                payment_history[paying_account].push({'from':paying_time, 'to':to, 'prices':prices_used})
            }else{
                const last_payment_item = payment_history[paying_account][payment_history[paying_account].length -1]
                if(last_payment_item['to'] > paying_time){
                    //account added to ther existing subscription before expiry
                    const to = bigInt(last_payment_item['to']).plus((bigInt(time_units_bought).multiply(bigInt(time_unit))))
                    
                    payment_history[paying_account].push({'from':paying_time, 'to':to, 'prices':prices_used})
                }else{
                    // account returned to pay subscription after expiry
                    const to = bigInt(paying_time).plus((bigInt(time_units_bought).multiply(bigInt(time_unit))))
                    payment_history[paying_account].push({'from':paying_time, 'to':to, 'prices':prices_used})
                }
            }
        }
    }
    const time_steps = []
    const steps_to_use = Math.floor((Math.floor(Date.now()/1000) - starting_time) / steps)
    for(var l=0; l<steps_to_use; l++){
        var start = time_steps.length == 0 ? starting_time + (steps * l) : time_steps[time_steps.length -1]['end_time']+1
        var end = start + (steps-1)
        time_steps.push({'start_time':start, 'end_time':end})
    }
    // console.log('income_stream_data_points', 'time_steps', time_steps.length)
    for(var i=0; i<time_steps.length; i++){
        const focused_step = time_steps[i]
        const valid_user_keys = Object.entries(payment_history).filter(([key, value]) => {
                var result = value.filter(function (payment_object) {
                    return (
                        bigInt(focused_step['start_time']).greaterOrEquals(bigInt(payment_object['from'])) && bigInt(focused_step['start_time']).lesserOrEquals(bigInt(payment_object['to']))
                    )
                })
                return result.length > 0
            }
        );
        const price_snapshot = price_data_snapshots.find(e => ( focused_step['start_time'] >= e['from'] && focused_step['end_time'] <= e['to'] ) )
        
        if(price_snapshot != null){
            // const number_count = Object.keys(valid_user_keys).length
            const number_count = valid_user_keys.length
            data.push({'count':number_count, 'price_data':price_snapshot})
        }
    }
  }catch(e){
    return { data: {}, success:false, reason: e.toString() }
  }

  for(var w=0; w<data.length; w++){
      const focused_data_point = data[w]
      const focused_time_unit = focused_data_point['price_data']['time_unit']
      const focused_payment_exchange_items = focused_data_point['price_data']['prices']
      const paying_accounts = focused_data_point['count']
      const time_share = steps / focused_time_unit
      if(total_payment_data == null){
          focused_payment_exchange_items.forEach(price_object => {
              total_payment_data[price_object['id']] = bigInt(0)
          });
      }
      focused_payment_exchange_items.forEach(price_object => {
          var total_amount_for_period = Math.floor((bigInt(paying_accounts).multiply(price_object['amount'])) * time_share)
          total_payment_data[price_object['id']] = bigInt(total_payment_data[price_object['id']]).plus(bigInt(total_amount_for_period))
      });
  }


  var xVal = 1, yVal = 0;
  var dps = [];
  var noOfDps = 100;
  var factor = Math.round(data.length/noOfDps) +1;
  var largest_number = get_total_supply_interval_figure(data)
  for(var v = 0; v < noOfDps; v++) {
    var pos = factor * xVal
    const focused_data_point = data[pos]
    yVal = 0
    if(focused_data_point != null && focused_data_point['count'] != 0 && largest_number != 0){
        yVal = parseInt(bigInt(focused_data_point['count']).multiply(100).divide(largest_number))
    }
    
    if(yVal != null && focused_data_point != null){
      if(v == 25 || v == 76){
          const price_data =  focused_data_point['price_data']['prices']
          var selected_price_item = price_data[0]
          for(var p = 0; p < price_data.length; p++) {
              const price_item = price_data[p]
              if(price_item['id'] == 3 || price_item['id'] == 5){
                  if(selected_price_item['id'] != 3 && selected_price_item['id'] != 5){
                      selected_price_item = price_item
                  }
              }
          }
          const final_price_amount = bigInt(selected_price_item['amount']).multiply(focused_data_point['count'])
          const token_name = token_name_data[selected_price_item['id']]

          dps.push({x: xVal,y: (yVal+10), indexLabel: ""+format_account_balance_figure(final_price_amount)+` ${token_name}`});//
      }else{
          dps.push({x: xVal, y: (yVal+10)});//
      }
      xVal++;
    }
  }

  return { data: {dps, total_payment_data}, success:true }
}

/* gets the largest figure from an array of items */
function get_total_supply_interval_figure(valid_data){
  var largest = 0
  valid_data.forEach(valid_data_item => {
      if(valid_data_item['count'] > largest){
          largest = valid_data_item['count']
      }
  });
  return largest
}

/* returns an object containing the price data of a given subscription over time */
function get_price_data_snapshots(modification_events, object){
  const original_price_data = object['ipfs'].price_data
  const original_time_unit = object['ipfs'].time_unit == 0 ? 60*53 : object['ipfs'].time_unit
  const original_time = parseInt(object['event'].returnValues.p4/* timestamp */)
  const now = Math.floor(Date.now()/1000)
  const snapshots = [{'from':original_time, 'prices':original_price_data, 'time_unit':original_time_unit, 'to':now}]

  modification_events.forEach(event => {
      const config_item_array = event.returnValues.p3/* config_item_array */
      const config_item_pos = event.returnValues.p4/* config_item_pos */
      const new_config_item = event.returnValues.p5/* new_config_item */
      const timestamp = parseInt(event.returnValues.p6/* timestamp */)

      const last_configuration = structuredClone(snapshots[snapshots.length -1])
      if(config_item_array == 3/* amounts_for_buying */){
          last_configuration['prices'][config_item_pos]['amount'] = new_config_item
          last_configuration['from'] = timestamp
          snapshots[snapshots.length -1]['to'] = timestamp - 1
          snapshots.push(last_configuration)
      }
      else if(config_item_array == 1 && config_item_pos == 5/* <5>time_unit */){
          last_configuration['time_unit'] = new_config_item == 0 ? 60*53 : new_config_item
          last_configuration['from'] = timestamp
          snapshots[snapshots.length -1]['to'] = timestamp - 1
          snapshots.push(last_configuration)
      }
  });

  return snapshots
}









/*  */
function record_stream_event(file, chunk_length, ip){
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const timestamp_id = now.getTime()

  if(file_data_steams[timestamp_id] == null){
    file_data_steams[timestamp_id] = {}
  }

  if(file_data_steams[timestamp_id][file] == null){
    file_data_steams[timestamp_id][file] = bigInt(0)
  }

  file_data_steams[timestamp_id][file] = bigInt(file_data_steams[timestamp_id][file]).plus(bigInt(chunk_length))

  ipAccessTimestamps[ip+file]['bytes'] = bigInt(file_data_steams[timestamp_id][file]).plus(bigInt(chunk_length))
}

function record_view_event(file){
  if(data['file_streams'][file] == null){
    data['file_streams'][file] = 0
  }
  data['file_streams'][file]++
}

function backup_stream_count_data_if_large_enough(){
  var keys_to_backup = Object.keys(file_data_steams)
  if(keys_to_backup.length > 0){
    //stash backup keys
    const now = Date.now()
    var backup_obj = {}
    keys_to_backup.forEach(key => {
      obj[key] = file_data_steams[key]
    });
    const write_data = JSON.stringify(backup_obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    var dir = './stream_data'
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    fs.writeFile(`stream_data/${now}.json`, write_data, (error) => {
      if (error) {
        console.log(error)
      }else{
        keys_to_backup.forEach(key => {
          data['cold_storage_stream_data_files'][key] = now
          delete file_data_steams[key]
        });
        data['cold_storage_stream_data_files']['backup_array'].push(now)
      }
    });
  }
}

async function get_data_streams_for_files(files){
  var active_time_keys = Object.keys(file_data_steams)
  var cold_storage_time_keys = data['cold_storage_stream_data_files']['backup_array']
  var file_data_objects = {}
  var file_name_function_memory = {}
  var is_loading_file = false

  for(var i=0; i<files.length; i++){
    var focused_file = files[i]
    if(file_data_objects[focused_file] == null){
      file_data_objects[focused_file] = {}
    }
    for(var k=0; k<active_time_keys.length; k++){
      var focused_time_key = active_time_keys[k]
      if(file_data_steams[focused_time_key] != null){
        file_data_objects[focused_file][focused_time_key] = file_data_steams[focused_time_key][focused_file] || bigInt(0)
      }
    }
    for(var j=0; j<cold_storage_time_keys.length; j++){
      var focused_time_key = cold_storage_time_keys[j]
      if(file_name_function_memory[focused_time_key] != null){
        Object.keys(file_name_function_memory[focused_time_key]).forEach(recorded_time => {
          file_data_objects[focused_file][recorded_times] = file_name_function_memory[focused_time_key][recorded_time][focused_file] || bigInt(0)
        });
      }
      else{
        var cold_storage_file_name = data['cold_storage_stream_data_files'][focused_time_key]
        is_loading_file = true
        fs.readFile(`stream_data/${cold_storage_file_name}.json`, (error, data) => {
          if (error) {
            console.error(error);
          }else{
            var cold_storage_obj = JSON.parse(data.toString())
            Object.keys(cold_storage_obj).forEach(recorded_times => {
              file_data_objects[focused_file][recorded_times] = cold_storage_obj[recorded_times][focused_file] || bigInt(0)
            });

            if(get_object_size_in_mbs(file_name_function_memory) + get_object_size_in_mbs(cold_storage_obj) < 100){
              if(file_name_function_memory[focused_time_key] != null){
                file_name_function_memory[focused_time_key] = cold_storage_obj
              }
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

  return file_data_objects
}

function get_file_views(files){
  const return_views_data = {}
  files.forEach(file => {
    var stream_count = data['file_streams'][file]
    if(stream_count == null){
      stream_count = 0
    }
    return_views_data[file] = stream_count
  });
  return return_views_data
}









function reset_ip_access_timestamp_object(){
  var keys = Object.keys(ipAccessTimestamps)
  const now = Date.now();
  keys.forEach(key => {
    var lastAccess = ipAccessTimestamps[key]['time']
    if(now - lastAccess < RATE_LIMIT_WINDOW){
      delete ipAccessTimestamps[key]
    }
  });
}

async function calculate_income_stream_for_multiple_subscriptions(subscription_objects, steps, filter_value, file_view_data){
  const subscription_object_keys = Object.keys(subscription_objects)
  const total_payment_data_for_subscriptions = {}
  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const last_month_date = new Date(firstOfThisMonth.getTime() - 1);
  const starting_time = Math.floor(last_month_date.getTime()/1000) - filter_value
  const starting_time_date = new Date(starting_time*1000);
  const end_time = last_month_date.getTime()

  if(starting_time > (end_time / 1000)){
    return { data: {}, success:false, reason: 'The filter value provided is invalid' }
  }

  const subscription_e5s = []
  const transaction_event_object = {}

  for(var i=0; i<subscription_object_keys.length; i++){
    const subscription_object = subscription_objects[subscription_object_keys[i]]
    const subscription_e5 = subscription_object['e5']
    const subscription_id = subscription_object['id']
    const events = await filter_events(subscription_e5, 'F5', 'e1', { p1/* target_id */: subscription_id}, null)
    if(events.length > 0){
      subscription_e5s.push(subscription_e5)
      const all_modification_events = await filter_events(subscription_e5, 'F5', 'e5', { p1/* target_id */: subscription_id}, null)

      transaction_event_object[subscription_e5] = await filter_events(subscription_e5, 'E5', 'e4', {}, null)

      const price_data_snapshots = get_price_data_snapshots(all_modification_events, object)
      var data = []
      var total_payment_data = {}

      try{
        const payment_history = {}
        for(var j=0; j<events.length; j++){
            const time_units_bought = events[j].returnValues.p3/* time_units_paid_for */
            const paying_account = events[j].returnValues.p2/* sender_acc_id */
            const paying_time = parseInt(events[j].returnValues.p5/* timestamp */)
            if(payment_history[paying_account] == null){
                payment_history[paying_account] = []
            }
            const price_snapshot = price_data_snapshots.find(e => (paying_time > e['from'] && paying_time < e['to']))
            if(price_snapshot != null){
                const time_unit = price_snapshot['time_unit']
                const prices_used = price_snapshot['prices']
                if(payment_history[paying_account].length == 0){
                    const to = bigInt(paying_time).plus((bigInt(time_units_bought).multiply(bigInt(time_unit))))
                    payment_history[paying_account].push({'from':paying_time, 'to':to, 'prices':prices_used})
                }else{
                    const last_payment_item = payment_history[paying_account][payment_history[paying_account].length -1]
                    if(last_payment_item['to'] > paying_time){
                        //account added to ther existing subscription before expiry
                        const to = bigInt(last_payment_item['to']).plus((bigInt(time_units_bought).multiply(bigInt(time_unit))))
                        
                        payment_history[paying_account].push({'from':paying_time, 'to':to, 'prices':prices_used})
                    }else{
                        // account returned to pay subscription after expiry
                        const to = bigInt(paying_time).plus((bigInt(time_units_bought).multiply(bigInt(time_unit))))
                        payment_history[paying_account].push({'from':paying_time, 'to':to, 'prices':prices_used})
                    }
                }
            }
        }
        const time_steps = []
        const steps_to_use = Math.floor((Math.floor(end_time/1000) - starting_time) / steps)
        for(var l=0; l<steps_to_use; l++){
            var start = time_steps.length == 0 ? starting_time + (steps * l) : time_steps[time_steps.length -1]['end_time']+1
            var end = start + (steps-1)
            time_steps.push({'start_time':start, 'end_time':end})
        }
        // console.log('income_stream_data_points', 'time_steps', time_steps.length)
        for(var i=0; i<time_steps.length; i++){
            const focused_step = time_steps[i]
            const valid_user_keys = Object.entries(payment_history).filter(([key, value]) => {
                    var result = value.filter(function (payment_object) {
                        return (
                            bigInt(focused_step['start_time']).greaterOrEquals(bigInt(payment_object['from'])) && bigInt(focused_step['start_time']).lesserOrEquals(bigInt(payment_object['to']))
                        )
                    })
                    return result.length > 0
                }
            );
            const price_snapshot = price_data_snapshots.find(e => ( focused_step['start_time'] >= e['from'] && focused_step['end_time'] <= e['to'] ) )
            
            if(price_snapshot != null){
                // const number_count = Object.keys(valid_user_keys).length
                const number_count = valid_user_keys.length
                data.push({'count':number_count, 'price_data':price_snapshot})
            }
        }
      }catch(e){
        return { data: {}, success:false, reason: e.toString() }
      }

      for(var w=0; w<data.length; w++){
          const focused_data_point = data[w]
          const focused_time_unit = focused_data_point['price_data']['time_unit']
          const focused_payment_exchange_items = focused_data_point['price_data']['prices']
          const paying_accounts = focused_data_point['count']
          const time_share = steps / focused_time_unit
          if(total_payment_data == null){
              focused_payment_exchange_items.forEach(price_object => {
                  total_payment_data[price_object['id']] = bigInt(0)
              });
          }
          focused_payment_exchange_items.forEach(price_object => {
              var total_amount_for_period = Math.floor((bigInt(paying_accounts).multiply(price_object['amount'])) * time_share)
              total_payment_data[price_object['id']] = bigInt(total_payment_data[price_object['id']]).plus(bigInt(total_amount_for_period))
          });
      }

      total_payment_data_for_subscriptions[subscription_object_keys[i]] = total_payment_data
    }
  }
  
  const valid_time_list = get_time_list(starting_time_date, last_month_date)
  var total_data_bytes_streamed = bigInt(0)
  const valid_user_stream_data = {}

  for(var j=0; j<file_view_data.length; j++){
    const stream_user_item = file_view_data[j]
    const stream_data_object = stream_user_item['view_data'].files_stream_count
    const stream_keys = Object.keys(stream_data_object)
    var bytes_stream_count = bigInt(0)
    stream_keys.forEach(key => {
      if(valid_time_list.includes(key)){
        total_data_bytes_streamed = bigInt(total_data_bytes_streamed).plus(stream_data_object[key])
        bytes_stream_count = bigInt(bytes_stream_count).plus(stream_data_object[key]) 
      }
    });
    const user_e5_id = stream_user_item['e5']+':'+stream_user_item['author']
    if(valid_user_stream_data[user_e5_id] == null){
      valid_user_stream_data[user_e5_id] = bigInt(0)
    }
    valid_user_stream_data[user_e5_id] = bigInt(valid_user_stream_data[user_e5_id]).plus(bytes_stream_count)
  }

  const final_payment_info = {}
  const user_stream_data_keys = Object.keys(valid_user_stream_data)
  for(var k=0; k<user_stream_data_keys.length; k++){
    const user_e5_id = user_stream_data_keys[k]
    if(final_payment_info[user_e5_id] == null){
      final_payment_info[user_e5_id] = {}
    }
    const subscription_keys = Object.keys(total_payment_data_for_subscriptions)
    for(var l=0; l<subscription_keys.length; l++){
      const subscription_id = subscription_keys[l]
      const subscription_payment_data = total_payment_data_for_subscriptions[subscription_id]
      const subscription_object = subscription_objects[subscription_id]
      const subscription_e5 = subscription_object['e5']
       
      const focused_exchanges = Object.keys(subscription_payment_data)
      for(var m=0; m<focused_exchanges.length; m++){
        const exchange_id = focused_exchanges[m]
        const total_collected_amounts = subscription_payment_data[exchange_id]
        if(
          bigInt(total_collected_amounts).equals(bigInt(0)) || 
          bigInt(total_data_bytes_streamed).equals(bigInt(0)) || 
          bigInt(valid_user_stream_data[user_e5_id]).equals(bigInt(0))
        ){
          final_payment_info[user_e5_id][(subscription_e5+':'+exchange_id)] = bigInt(0)
        }else{
          const users_amount_share = bigInt(total_collected_amounts).multiply(bigInt(valid_user_stream_data[user_e5_id])).divide(bigInt(total_data_bytes_streamed))
          final_payment_info[user_e5_id][(subscription_e5+':'+exchange_id)] = users_amount_share
        }
      }
    }
  }

  const user_account_data = {}
  const user_account_addresses = []
  const searched_account_e5_ids = []
  for(var l=0; l<user_stream_data_keys.length; l++){
    const user_e5_id = user_stream_data_keys[l]
    
    if(user_account_data[user_e5_id] == null){
      const user_e5 = user_e5_id.split(':')[0]
      const user_id = user_e5_id.split(':')[1]

      // const web3 = data[user_e5]['url'] != null ? new Web3(data[user_e5]['web3'][data[user_e5]['url']]): new Web3(data[user_e5]['web3']);
      // const e5_contract = new web3.eth.Contract(E5_CONTRACT_ABI, data[user_e5]['addresses'][0]);
      // await new Promise(resolve => setTimeout(resolve, 1500))
      // const account_address = await e5_contract.methods.f289(user_id).call((error, result) => {});

      const accounts_transaction_events = transaction_event_object[user_e5].find(e => e.returnValues.p1/* sender_account_id */ == user_id)

      const account_address = accounts_transaction_events.returnValues.p2/* sender_address */

      user_account_data[user_e5_id] = {'address':account_address, 'accounts':{}}   
      user_account_addresses.push(account_address)  
      searched_account_e5_ids.push(user_e5_id) 
    }
  }

  for(var m=0; m<subscription_e5s.length; m++){
    const e5 = subscription_e5s[m]
    const web3 = data[e5]['url'] != null ? new Web3(data[e5]['web3'][data[e5]['url']]): new Web3(data[e5]['web3']);
    const e5_contract = new web3.eth.Contract(E5_CONTRACT_ABI, data[user_e5]['addresses'][0]);
    const account_ids = await e5_contract.methods.f167([],user_account_addresses, 2).call((error, result) => {});
    account_ids.forEach((account, index) => {
      const user_e5_id = searched_account_e5_ids[index]
      user_account_data[user_e5_id]['accounts'][e5] = account
    });
  }
  
  return { 
    data: {
      final_payment_info, 
      total_payment_data_for_subscriptions, 
      end_time: last_month_date.getTime(),
      start_time:(starting_time*1000),
      total_data_bytes_streamed, 
      valid_user_stream_data,
      user_account_data,
    },
    success: true
  }
}

function get_time_list(startDate, endDate) {
  const dates = [];
  const date = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (date <= endDate) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear(); 
    const timestamp_id = year.toString()+':'+month.toString()

    dates.push(timestamp_id);
    date.setMonth(date.getMonth() + 1);
  }

  return dates.reverse();
}

function record_file_data(file_names, binaries, account, file_types){
  for(var i=0; i<binaries.length; i++){
    const file_name = file_names[i]
    var binaryData = binaries[i]
    var file_size = get_length_of_binary_files_in_mbs([binaryData])[0]
    data['uploaded_files_data'][file_name] = {'size':file_size, 'owner':account, 'time':Date.now(), 'extension':file_types[i]}
  }
}







function delete_unrenewed_files(){
  const current_month = new Date().getMonth()
  if(current_month != 6) return;
  var files = Object.keys(data['uploaded_files_data'])
  files.forEach(file => {
    if(data['uploaded_files_data'][file]['deleted'] == null && !is_file_ok_to_stream(file)){
      data['uploaded_files_data'][file]['deleted'] = true;
      var extension = data['uploaded_files_data'][file]['extension']

      if(extension != null){
        var dir = `./storage_data/${file}.${extension}`
        fs.unlink(dir, (err) => {
          if (err) {
            console.error('Failed to delete file:', err);
          } else {
            console.log('File deleted successfully.');
          }
        });
      }
    }
  });
}

function is_file_ok_to_stream(file){
  if(data['uploaded_files_data'][file] == null || data['uploaded_files_data'][file]['deleted'] == true) return false;
  var upload_time = data['uploaded_files_data'][file]['time']
  var current_year = new Date().getFullYear()
  var upload_year = upload_time == null ? current_year : new Date(upload_time).getFullYear();

  var required_years = []
  for(var i=upload_year; i<current_year; i++){
    required_years.push(i)
  }

  if(required_years.length == 0){
    return true;
  }

  var is_ok = true;
  const my_paid_years = data['uploaded_files_data'][file]['renewals'] == null ? [] : data['uploaded_files_data'][file]['renewals']
  required_years.forEach(year => {
    if(!my_paid_years.includes(year)){
      is_ok = false
    }
  });

  return is_ok
}

function get_file_renewal_data(files){
  const return_data = {}
  files.forEach(file => {
    const my_paid_years = data['uploaded_files_data'][file] == null ? [] : (data['uploaded_files_data'][file]['renewals'] == null ? [] : data['uploaded_files_data'][file]['renewals'])
    return_data[file] = my_paid_years
  });
  return return_data
}

function get_files_statuses(files){
  const return_data = {}
  files.forEach(file => {
    const is_file_deleted = data['uploaded_files_data'][file] == null ? false : (data['uploaded_files_data'][file]['deleted'] == null ? false : data['uploaded_files_data'][file]['deleted'])
    return_data[file] = is_file_deleted
  });
  return return_data
}








function format_account_balance_figure(amount){
  if(amount == null){
    amount = 0;
  }
  if(amount < 1_000_000_000){
    return number_with_commas(amount.toString())
  }else{
    var power = amount.toString().length - 9
    return number_with_commas(amount.toString().substring(0, 9)) +'e'+power
  }
  
}

function delete_accounts_file(file){
  if(data['uploaded_files_data'][file] != null && data['uploaded_files_data'][file]['deleted'] == null){
    data['uploaded_files_data'][file]['deleted'] = true;
    var extension = data['uploaded_files_data'][file]['extension']

    if(extension != null){
      var dir = `./storage_data/${file}.${extension}`
      fs.unlink(dir, (err) => {
        if (err) {
          console.error('Failed to delete file:', err);
        } else {
          console.log('File deleted successfully.');
        }
      });
    }
  }
}

async function is_privacy_signature_valid(signature){
  if(signature == null || signature == ''){
    return false
  }
  if(privacy_address == null || privacy_address == ''){
    return true;
  }
  const e5 = 'E25'
  const web3 = data[e5]['url'] != null ? new Web3(data[e5]['web3'][data[e5]['url']]): new Web3(data[e5]['web3']);
  try{
    var current_block_number = sync_block_number != 0 ? sync_block_number : Number(await web3.eth.getBlockNumber())
    // const block_mod = data['block_mod'] == null ? 10 : data['block_mod']
    const block_mod = 10;
    var signature_data = Math.floor(current_block_number/block_mod)
    var value1 = await check_privacy_signature(signature, web3, signature_data)
    var value2 = null;
    if(current_block_number % block_mod <= 3){
      var signature_data2 = signature_data - 1
      value2 = await check_privacy_signature(signature, web3, signature_data2)
    }
    if(value1 == true || (value2 != null && value2 == true)){
      return true
    }
    else return false
  }
  catch(e){
    log_error(e)
    return false
  }
}

async function check_privacy_signature(signature, web3, signature_data){
  try{
    var original_address = await web3.eth.accounts.recover(signature_data.toString(), signature)
    if(original_address == privacy_address){
      return true;
    }
    return false
  }
  catch(e){
    log_error(e)
    return false
  }
}

function clear_rate_limit_info(){
  const threshold = Date.now() - 10_000; // Keep only last 10 seconds
  for (const [ip, time] of rateLimitMap.entries()) {
    if (time < threshold) {
      rateLimitMap.delete(ip);
    }
  }

  const keys_threshold = Date.now() - (5*60*60*1000)
  for (const [ip, key_data] of userKeysMap.entries()) {
    if (key_data['time'] < keys_threshold) {
      userKeysMap.delete(ip);
    }
  }
}

async function record_ram_rom_usage(){
  const rom_usage = await get_maximum_available_disk_space();
  const network_usage_stats = await get_network_usage_info();
  const total_streamed_data_traffic = get_total_traffic_stream_info_and_delete_old_data();
  const consumed = rom_usage.total - rom_usage.free
  const memoryUsage = process.memoryUsage();
  const free_ram = os.freemem();
  const obj = {
    1/* 'consumed_rom' */:consumed,
    2/* 'network' */:network_usage_stats,
    3/* 'rss' */:memoryUsage.rss,
    4/* 'heapTotal' */:memoryUsage.heapTotal,
    5/* 'heapUsed' */:memoryUsage.heapUsed,
    6/* 'external' */:memoryUsage.external,
    7/* 'free_ram' */:free_ram,
    8/* 'data_sent' */:total_streamed_data_traffic.sent,
    9/* 'data_received' */:total_streamed_data_traffic.received,
  }
  const now = Date.now();
  data['memory_stats'][now] = obj
}








function delete_older_ram_rom_usage_stats(){
  var keys = Object.keys(data['memory_stats'])
  const threshold = Date.now() - 30*24*60*60*1000;
  const storage_object = {}
  keys.forEach(time => {
    if(time < threshold){
      storage_object[time] = structuredClone(data['memory_stats'][time])
      delete data['memory_stats'][time]
    }
  });
  write_stat_to_cold_storage(storage_object, 'memory_stats_history', 'cold_storage_memory_stats', true)
}

function record_request(endpoint){
  const timestamp = Math.floor(Date.now() / (5*60*1000)) * (5*60*1000)
  if(data['request_stats'][timestamp] == null){
    data['request_stats'][timestamp] = {}
  }
  if(data['request_stats'][timestamp][endpoint] == null){
    data['request_stats'][timestamp][endpoint] = 0
  }
  data['request_stats'][timestamp][endpoint] ++
}

function delete_older_request_stats(){
  var keys = Object.keys(data['request_stats'])
  const threshold = Date.now() - 30*24*60*60*1000;
  const storage_object = {}
  keys.forEach(time => {
    if(time < threshold){
      storage_object[time] = structuredClone(data['request_stats'][time])
      delete data['request_stats'][time]
    }
  });
  write_stat_to_cold_storage(storage_object, 'request_stats_history', 'cold_storage_request_stats')
}

function write_stat_to_cold_storage(storage_object, directory, datapoint, should_watch_file = false){
  const timestamp_id = Date.now()
  const write_data = JSON.stringify(storage_object, (_, v) => typeof v === 'bigint' ? v.toString() : v)
  var dir = `./${directory}`
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  const file_path = `${directory}/${timestamp_id}.json`
  fs.writeFile(file_path, write_data, (error) => {
    if (error) {
      console.log(error)
    }else{
      if(data[datapoint] == null){
        data[datapoint] = []
      }
      data[datapoint].push(timestamp_id)
      if(should_watch_file == true){
        watch_specific_file(file_path)
      }
    }
  });
}

async function get_traffic_stats_history(filter_time){
  const selected_cold_storage_request_stat_files = data['cold_storage_request_stats'].filter(function (time) {
    return (parseInt(time) >= parseInt(filter_time))
  });
  const selected_cold_storage_memory_stat_files = data['cold_storage_memory_stats'].filter(function (time) {
    return (parseInt(time) >= parseInt(filter_time))
  });

  var selected_cold_storage_request_stat_obj = {}
  const request_keys = Object.keys(data['request_stats'])
  request_keys.forEach(time => {
    if(time >= filter_time){
      selected_cold_storage_request_stat_obj[time] = structuredClone(data['request_stats'][time])
    }
  });
  for(var i=0; i<selected_cold_storage_request_stat_files; i++){
    const focused_file = selected_cold_storage_request_stat_files[i]
    const object = await read_file(focused_file, 'memory_stats_history')
    Object.assign(selected_cold_storage_request_stat_obj, object);
  }

  var selected_cold_storage_memory_stat_obj = {}
  const memory_keys = Object.keys(data['memory_stats'])
  memory_keys.forEach(time => {
    if(time >= filter_time){
      selected_cold_storage_memory_stat_obj[time] = structuredClone(data['memory_stats'][time])
    }
  });
  for(var e=0; e<selected_cold_storage_memory_stat_files; e++){
    const focused_file = selected_cold_storage_memory_stat_files[e]
    const object = await read_file(focused_file, 'request_stats_history')
    Object.assign(selected_cold_storage_memory_stat_obj, object);
  }

  return { selected_cold_storage_request_stat_obj, selected_cold_storage_memory_stat_obj }
}








async function read_file(cold_storage_file_name, directory){
  var is_loading_file = true
  var cold_storage_obj = {}
  fs.readFile(`${directory}/${cold_storage_file_name}.json`, (error, data) => {
    if (error) {
      console.error(error);
    }else{
      cold_storage_obj = JSON.parse(data.toString())
    }
    is_loading_file = false
  });
  while (is_loading_file == true) {
    if (is_loading_file == false) break
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return cold_storage_obj
}

function ip_limits(ip){
  if(ip == null){
    return { message: 'Ip address required', success:false };
  }
  const now = Date.now();
  const lastRequestTime = rateLimitMap.get(ip);
  const time_difference = data['ip_request_time_limit'] == null ? 1000 : data['ip_request_time_limit']
  if (lastRequestTime != null && now - lastRequestTime < time_difference) {
    return { message: 'Rate limit exceeded. Wait a bit.', success:false }
  }
  rateLimitMap.set(ip, now);
  return { message: '', success: true }
}

function set_up_error_logs_filestream(){
  const date = new Date();
  const yyyyMmDd = date.toISOString().split('T')[0];
  const log_file_name = yyyyMmDd + ':' + Date.now()
  var dir = `./logs`
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  logStream = fs.createWriteStream(`logs/${log_file_name}.log`, { flags: 'a' })
}

function milliseconds_till_midnight() {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );
  return nextMidnight - now;
}

function update_logStream(){
  set_up_error_logs_filestream();
  setInterval(set_up_error_logs_filestream, 24*60*60*1000);
}











async function check_if_log_file_exists(file) {
  try {
    await fs.access(file);
    return true;
  } 
  catch (err) {
    return false;
  }
}

async function schedule_certificate_renewal(){
  if(AUTO_CERTIFICATE_RENEWAL_ENABLED == false){
    return;
  }
  const now = Date.now()
  const next_certificate_renewal_time = await fetch_current_certificate_expiry()
  if(next_certificate_renewal_time == 0){
    return;
  }
  const difference = (next_certificate_renewal_time - now) - 5*60*60*1000
  setTimeout(renew_https_certificates, difference);
}

async function renew_https_certificates(){
  const server_file_name = path.basename(require.main.filename)
  const final_renew_script = 'sudo certbot renew'
  const final_restart_script = `sudo pm2 restart ${server_file_name}`
  
  exec(final_renew_script, (error, stdout, stderr) => {
    if (error) {
      log_error(error)
      return;
    }

    exec(`openssl x509 -enddate -noout -in ${CERTIFICATE_RESOURCE}`, (err, stdout) => {
      if (err){
        log_error(err)
        return;
      }
      const expiry = stdout.trim().split('=')[1];
      const expiry_time = new Date(expiry).getTime()
      
      // Restart server using PM2
      exec(final_restart_script, (restartError, restartStdout, restartStderr) => {
        if (restartError) {
          log_error(restartError)
          return;
        }
        var return_obj = { message: 'Certificate renewal successful.', restartStdout: restartStdout, stdout: stdout, expiry_time: expiry_time, success:true }
        log_error({stack: JSON.stringify(return_obj)})
      });
    });
  });
}

async function fetch_current_certificate_expiry(){
  var is_loading_file = true;
  var expiry_time = 0
  exec(`openssl x509 -enddate -noout -in ${CERTIFICATE_RESOURCE}`, (err, stdout) => {
    if (err){
      log_error(err)
      is_loading_file = false
    }
    const expiry = stdout.trim().split('=')[1];
    expiry_time = new Date(expiry).getTime()
    is_loading_file = false
  });

  while (is_loading_file == true) {
    if (is_loading_file == false) break
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return expiry_time
}

function log_error(err){
  try{
    if(logStream != null) {
      const divider = '-------------------------------e-----------------------------------'
      logStream.write(`${divider}\n \n ${err.stack}\n \n \n`);
    }
  }catch(e){
    console.log(e)
  }
}









/* stores multiple node binary files in file storage */
async function store_temp_node_files_in_storage(binaries, file_names, temp_id){
  var successful = true;
  for(var i=0; i<binaries.length; i++){
    const binaryData = binaries[i]
    const temp_file_name = `${temp_id}${file_names[i]}.cjs`
    const temp_file_directory = path.join(__dirname, temp_file_name);
    
    var isloading = true;
    fs.writeFile(temp_file_directory, binaryData, (error) => {
      if (error) {
        log_error(error)
        successful = false
      }else{
        console.log("data written correctly");
      }
      isloading = false
    });

    while (isloading == true) {
      if (isloading == false) break
      await new Promise(resolve => setTimeout(resolve, 700))
    }
  }
  return successful;
}

async function test_temp_node_files_in_storage(file_names){
  var successful = true;
  for(var i=0; i<file_names.length; i++){
    const temp_file_name = `${temp_id}${file_names[i]}.cjs`
    const temp_file_directory = path.join(__dirname, temp_file_name);
    var isloading = true;

    exec(`node --check ${temp_file_directory}`, (checkErr, stdout, stderr) => {
      if (checkErr) {
        log_error(checkErr)
        successful = false
      }
      isloading = false
    });

    while (isloading == true) {
      if (isloading == false) break
      await new Promise(resolve => setTimeout(resolve, 700))
    }
  }
  return successful
}

async function copy_temp_node_files_in_storage(file_names, temp_id){
  var successful = true;
  for(var i=0; i<file_names.length; i++){
    const temp_file_name = `${temp_id}${file_names[i]}.cjs`
    const temp_file_directory = path.join(__dirname, temp_file_name);
    const file_name = `${file_names[i]}.cjs`
    var isloading = true;

    fs.copyFile(temp_file_directory, file_name, (copyErr) => {
      if (copyErr) {
        log_error(copyErr)
        successful = false
      }else{
        console.log("data copied correctly");
      }
      isloading = false
    });

    while (isloading == true) {
      if (isloading == false) break
      await new Promise(resolve => setTimeout(resolve, 700))
    }
  }
  return successful;
}

async function delete_temp_node_files_in_storage(file_names, temp_id){
  var successful = true;
  for(var i=0; i<file_names.length; i++){
    const temp_file_name = `${temp_id}${file_names[i]}.cjs`
    const temp_file_directory = path.join(__dirname, temp_file_name);
    var isloading = true;

    fs.unlink(temp_file_directory, (error) => {
      if (error) {
        log_error(error)
        successful = false
      }else{
        console.log("data deleted correctly");
      }
      isloading = false
    });

    while (isloading == true) {
      if (isloading == false) break
      await new Promise(resolve => setTimeout(resolve, 700))
    }
  }
  return successful;
}







async function run_pre_executions(commands){
  var successful = true;
  for(var i=0; i<commands.length; i++){
    const command = commands[i]
    var isloading = true;

    exec(command, (checkErr, stdout, stderr) => {
      if (checkErr) {
        log_error(checkErr)
        successful = false
      }
      isloading = false
    });

    while (isloading == true) {
      if (isloading == false) break
      await new Promise(resolve => setTimeout(resolve, 700))
    }
  }
  return successful
}

function are_all_script_names_vaid(file_names){
  var valid = true;
  file_names.forEach(name => {
    try{
      if(name.endsWith('.cjs') || name.endsWith('.js')){
        valid = false;
      }
    }catch(e){
      valid = false
    }
  });
  return valid;
}

function are_executions_valid(commands){
  var valid = true;
  const knownPMs = ['npm', 'yarn', 'pnpm', 'bun'];
  commands.forEach(command => {
    const firstWord = command.trim().split(/\s+/)[0];
    if(!knownPMs.includes(firstWord)){
      valid = false
    }
  });
  return valid;
}

async function write_block_number(){
  const e5 = 'E25'
  try{
    const web3 = data[e5]['url'] != null ? new Web3(data[e5]['web3'][data[e5]['url']]): new Web3(data[e5]['web3']);
    sync_block_number = Number(await web3.eth.getBlockNumber())
  }
  catch(error){
    log_error(error)
  }
}







function stash_old_trends_in_cold_storage(){
  const keys = Object.keys(upload_view_trends_data)
  if(keys.length > 0){
    const record_obj = {}
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    now.setHours(0, 0, 0, 0);
    const cutoff_timestamp = now.getTime();
    keys.forEach(timestamp => {
      if(parseInt(timestamp) < cutoff_timestamp){
        record_obj[timestamp] = structuredClone(upload_view_trends_data[timestamp])
      }
    });

    if(Object.keys(record_obj).length > 0){
      write_stat_to_cold_storage(record_obj, 'trends_stats_history', 'cold_storage_trends_records', true)
    }
  }
}

async function get_old_trends_history_data(start_time, end_time, keywords, filter_type, filter_languages, filter_states, filter_object_types){
  const selected_cold_storage_request_trends_files = data['cold_storage_trends_records'].filter(function (time) {
    return (parseInt(time) >= parseInt(start_time) && parseInt(time) <= parseInt(end_time))
  });

  var selected_cold_storage_request_trend_obj = {}
  const keys = Object.keys(upload_view_trends_data)
  if(keys.length > 0){
    keys.forEach(timestamp => {
      if(parseInt(timestamp) >= parseInt(start_time) && parseInt(timestamp) <= parseInt(end_time)){
        selected_cold_storage_request_trend_obj[timestamp] = structuredClone(upload_view_trends_data[timestamp])
      }
    });
  }

  for(var i=0; i<selected_cold_storage_request_trends_files; i++){
    const focused_file = selected_cold_storage_request_trends_files[i]
    const object = await read_file(focused_file, 'trends_stats_history')
    Object.assign(selected_cold_storage_request_trend_obj, object);
  }

  const timestamp_ids = Object.keys(selected_cold_storage_request_trend_obj)
  timestamp_ids.forEach(timestamp_id => {
    const types = Object.keys(selected_cold_storage_request_trend_obj[timestamp_id])
    types.forEach(type => {
      const languages = Object.keys(selected_cold_storage_request_trend_obj[timestamp_id][type])
      languages.forEach(language => {
        const original = selected_cold_storage_request_trend_obj[timestamp_id][type][language]
        const filtered = keywords.length > 0 ? Object.fromEntries(
          Object.entries(original).filter(([key, _]) =>
            keywords.includes(key)
          )
        ) : structuredClone(original);

        if(filter_states.length > 0){
          Object.keys(filtered).forEach(tag => {
            const filtered_by_states = Object.fromEntries(
              Object.entries(filtered[tag]).filter(([key, _]) =>
                filter_states.includes(key)
              )
            )
            filtered[tag] = filtered_by_states;
          });
        }
        if(filter_object_types.length > 0){
          Object.keys(filtered).forEach(tag => {
            Object.keys(filtered[tag]).forEach(state => {
                const filtered_by_object_type = Object.fromEntries(
                  Object.entries(filtered[tag][state]).filter(([key, _]) =>
                    filter_object_types.includes(key)
                  )
              );
              filtered[tag][state] = filtered_by_object_type;
            });
          });
        }
        
        selected_cold_storage_request_trend_obj[timestamp_id][type][language] = filtered
        if(filter_languages.length > 0 && !filter_languages.includes(language)){
          delete selected_cold_storage_request_trend_obj[timestamp_id][type][language]
        }
      });
      if(filter_type != '' && type != filter_type){
        delete selected_cold_storage_request_trend_obj[timestamp_id][type]
      }
    });
  });

  return selected_cold_storage_request_trend_obj
}

function trim_block_record_data(){
  const difference = (isNaN(data['block_record_sync_time_limit']) || data['block_record_sync_time_limit'] > (530*24*60*60)) ? (530*24*60*60) : data['block_record_sync_time_limit']
  const cutoff_timestamp = (Date.now() / 1000) - difference
  if(data[e5]['block_hashes'] == null){
    return;
  }
  const block_numbers = Object.keys(data[e5]['block_hashes'])
  block_numbers.forEach(block_number => {
    if(data[e5]['block_hashes'][block_number]['timestamp'] < cutoff_timestamp){
      delete data[e5]['block_hashes'][block_number]
      const block_index = data[e5]['block_hashes']['e'].indexOf(block_number)
      if(block_index != -1){
        data[e5]['block_hashes']['e'].splice(block_index, 1)
      }
    }
  });
}

async function record_https_certificate_info(){
  data['certificate_expiry_time'] = await fetch_current_certificate_expiry()
  get_active_interface((err, interfaceName) => {
    if (err){
      return log_error({stack:err.message})
    }

    get_node_network_speed(interfaceName, (err, result) => {
      if (err){
        return log_error({stack:err.message})
      }
      data['network_interface'] = result.interface
      data['network_speed_in_mbps'] = result.speed
    });
  });
}









function get_node_network_speed(interfaceName, callback) {
  exec(`ethtool ${interfaceName}`, (err, stdout, stderr) => {
    if (err || stderr) {
      return callback(new Error(`Failed to get speed for ${interfaceName}`));
    }

    const match = stdout.match(/Speed:\s+(\d+)\s*Mb\/s/);
    if (match) {
      const speedMbps = parseInt(match[1], 10);
      return callback(null, { interface: interfaceName, speed: speedMbps });
    }

    return callback(new Error(`Speed not detected for ${interfaceName}`));
  });
}

function get_active_interface(callback) {
  exec('ip route get 8.8.8.8', (err, stdout, stderr) => {
    if (err || stderr) {
      return callback(new Error('Failed to get network interfaces'));
    }
    const match = stdout.match(/dev\s+(\S+)/);
    if (match) {
      const iface = match[1];
      return callback(null, iface);
    } else {
      return callback(new Error('No active network interface found'));
    }
  });
}

async function get_network_usage_info(){
  var isloading = true;
  var return_data = {};
  const used_network_interface = data['network_interface'];
  const network_speed_in_mbps = data['network_speed_in_mbps']
  if(used_network_interface == null){
    return return_data
  }
  exec(`ifstat -i ${used_network_interface} 1 1`, (error, stdout, stderr) => {
    if (error) return log_error({stack:error.message})
    if (stderr) return log_error({stack:stderr})

    const lines = stdout.trim().split('\n');
    const dataLine = lines[2]; // First line is header, second is labels, third is data
    const [rx, tx] = dataLine.trim().split(/\s+/).map(parseFloat);

    const used_download_speed_in_mbps = (rx * 0.008).toFixed(2);
    const used_upload_speed_in_mbps = (tx * 0.008).toFixed(2);
    const utilization = ((used_download_speed_in_mbps+used_upload_speed_in_mbps) / network_speed_in_mbps) * 100;

    return_data = {'received': rx, 'transmitted':tx, 'utilization':utilization}
    isloading = false;
  });

  while (isloading == true) {
    if (isloading == false) break
    await new Promise(resolve => setTimeout(resolve, 700))
  }
  return return_data
}

function get_total_traffic_stream_info_and_delete_old_data(){
  const totals = trafficHistory.reduce((sum, entry) => {
      sum.sent += entry.sent;
      sum.received += entry.received;
      return sum;
    },
    { sent: 0, received: 0 }
  );

  trafficHistory = []
  return totals
}







async function record_public_key_for_use(){
  const server_key = data['key']
  const e5 = 'E25'
  const web3 = data[e5]['url'] != null ? new Web3(data[e5]['web3'][data[e5]['url']]): new Web3(data[e5]['web3']);
  var hash = web3.utils.keccak256(server_key.toString()).slice(34)
  const private_key_to_use = crypto.createHash("sha256").update(hash).digest(); // 32 bytes
  server_keys = nacl.sign.keyPair.fromSeed(new Uint8Array(private_key_to_use));
  server_public_key = uint8ToBase64(new Uint8Array(server_keys.publicKey))

  // var private_key_to_use = Buffer.from(hash)
  // const publicKeyA = await ecies.getPublic(private_key_to_use);
  // server_public_key = uint8ToBase64(new Uint8Array(publicKeyA))
}

function uint8ToBase64(uint8){
  return Buffer.from(uint8).toString('base64')
}

function base64ToUint8(base64){
  return new Uint8Array(Buffer.from(base64, 'base64'))
}

async function register_user_encryption_key(user_temp_hash, encrypted_key, ip_address){
  if(userKeysMap.get(user_temp_hash.toString()) != null){
    return { success: false, message: 'user hash already registered', existing: true }
  }
  try{
    // const private_key_to_use = Buffer.from(server_public_key, 'base64')
    // const encrypted_key_as_uint8array = base64ToUint8(encrypted_key)
    // const my_key = await ecies.decrypt(private_key_to_use, encrypted_key_as_uint8array)
    // const user_key = my_key.toString()

    const private_key_to_use = server_keys.secretKey
    const public_key_to_use = base64ToUint8(user_temp_hash)
    const base64_encoded_cypher = encrypted_key.split('_')[0]
    const nonce_cypher = encrypted_key.split('_')[1]
    const encrypted_key_as_uint8array = base64ToUint8(base64_encoded_cypher)
    const nonce = this.base64ToUint8(nonce_cypher)
    const decrypted = nacl.box.open(encrypted_key_as_uint8array, nonce, public_key_to_use, private_key_to_use);
    const decoder = new TextDecoder();
    const user_key = decoder.decode(decrypted);

    userKeysMap.set(user_temp_hash.toString(), { 'key': user_key, 'ip':ip_address, 'time':Date.now() })
    return { success: true, message: '' }
  }
  catch(e){
    console.log(e)
    return { success: false, message: e.toString() }
  }
}









async function process_request_params(data, ip_address){
  try{
    const return_obj = structuredClone(data)
    if(data['privacy_signature'] != null && data['privacy_signature'] != 'e'){
      const encrypted_signature_data_array = data['privacy_signature'].split('|')
      const registered_user = encrypted_signature_data_array[0]
      if(userKeysMap.get(registered_user) == null /* || userKeysMap.get(registered_user)['ip'] != ip_address */){
        return data
      }
      return_obj['registered_user'] = registered_user
      const keys = Object.keys(data)
      for(var k=0; k<keys.length; k++){
        const key = keys[k]
        if(key == 'privacy_signature' && data[key] != 'e'){
          const encrypted_signature = encrypted_signature_data_array[1]
          if(userKeysMap.get(registered_user) != null){
            const registered_users_key = userKeysMap.get(registered_user)['key']
            return_obj[key] = await decrypt_secure_data(encrypted_signature, registered_users_key)
            return_obj['registered_users_key'] = registered_users_key
          }
        }
        else if(key != 'privacy_signature'){
          if(userKeysMap.get(registered_user) != null){
            const registered_users_key = userKeysMap.get(registered_user)['key']
            return_obj[key] = await decrypt_secure_data(data[key], registered_users_key)
            return_obj['registered_users_key'] = registered_users_key
          }
        }
      }
    }
    update_registered_user_time(registered_user)
    return return_obj
  }
  catch(e){
    console.log(e)
    return data
  }
}

function update_registered_user_time(registered_user){
  let obj = userKeysMap.get(registered_user);
  obj['time'] = Date.now()
}

async function process_request_body(data){
  const registered_user = data['registered_user']
  if(registered_user == null || userKeysMap.get(registered_user) == null){
    return data
  }
  try{
    const registered_users_key = userKeysMap.get(registered_user)['key']
    const return_obj = JSON.parse(await decrypt_secure_data(data['encrypted_data'], registered_users_key));
    update_registered_user_time(registered_user)
    return return_obj
  }
  catch(e){
    console.log(e)
    return data
  }
}

function generate_and_record_endpoint_info(){
  const endpoints = ['tags', 'title', 'restore', 'marco', 'register', 'traffic_stats', 'trends', 'new_e5', 'update_provider', 'update_content_gateway', 'delete_e5', 'backup', 'update_iteration', 'boot', 'boot_storage', 'reconfigure_storage', 'store_files', 'reserve_upload', 'upload', 'account_storage_data', 'stream_file', 'store_data', 'streams', 'count_votes', 'subscription_income_stream_datapoints', 'creator_group_payouts', 'delete_file', 'stream_logs', 'update_certificates', 'update_nodes', 'run_transaction', 'run_contract_call'];

  endpoints.forEach(endpoint => {
    endpoint_info[endpoint] = makeid(35)
  });
  endpoint_info['events'] = 'events'
  endpoint_info['data'] = 'data'
  endpoint_info['subscription'] = 'subscription'
  endpoint_info['itransfers'] = 'itransfers'
  endpoint_info['bill_payments'] = 'bill_payments'
}

global.fetch = async (url, options = {}) => {
  const startTime = Date.now();

  // Measure request body size (sent bytes)
  let sentBytes = 0;
  if (options.body) {
    if (typeof options.body === "string") {
      sentBytes = Buffer.byteLength(options.body);
    } 
    else if (Buffer.isBuffer(options.body)) {
      sentBytes = options.body.length;
    }
  }

  const response = await originalFetch(url, options);

  // Measure received bytes
  const buffer = await response.clone().arrayBuffer();
  const receivedBytes = buffer.byteLength;

  trafficHistory.push({ time: startTime, sent: sentBytes, received: receivedBytes, url });

  return response; // still return usable Response
};

generate_and_record_endpoint_info()








function set_up_file_watch_times(){
  const cold_storage_trends_records = data['cold_storage_trends_records'] || []
  const cold_storage_memory_stats = data['cold_storage_memory_stats'] || []

  cold_storage_trends_records.forEach(file_name => {
    const file_path = `trends_stats_history/${file_name}.json`
    watch_specific_file(file_path)
  });

  cold_storage_memory_stats.forEach(file_name => {
    const file_path = `memory_stats_history/${file_name}.json`
    watch_specific_file(file_path)
  });

  const server_file_name = path.basename(require.main.filename)
  watch_specific_file(server_file_name)
}

function watch_specific_file(filePath){
  fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
    if (curr.mtime > prev.mtime) {
      log_error({stack:`modification alert!\n file:${filePath}\n Modification time: ${curr.mtime}\n `})
    }
  });
}

async function set_up_ssh_login_requests(){
  const possible_files = ['/var/log/auth.log', '/var/log/secure', '/var/log/messages'];
  for(var i=0; i<possible_files.length; i++){
    const focused_file = possible_files[i]
    const is_file_accessible = await check_if_log_file_exists(focused_file)
    if(is_file_accessible == true){
      read_and_record_ssh_access_events(focused_file)
    }
  }
}

function read_and_record_ssh_access_events(log_file){
  const stream = fs.createReadStream(log_file, { encoding: "utf8", flags: "r" });
  const rl = readline.createInterface({ input: stream });

  rl.on("line", (line) => {
    const date = new Date().toUTCString()
    if (line.includes("Accepted")) {
      log_error({stack:`[SSH LOGIN]!\n time:${date}\n ${line}`})
    } 
    else if (line.includes("Failed password")) {
      log_error({stack:`[SSH FAILED]!\n time:${date}\n ${line}`})
    }
  });
}

async function get_all_login_access_time_info(){
  var isloading = true;
  var data = ''
  exec("last", (err, stdout) => {
    if (err){
      log_error(err)
    }
    else{
      data = stdout
    }
    isloading = false;
  });

  while (isloading == true) {
    if (isloading == false) break
    await new Promise(resolve => setTimeout(resolve, 700))
  }

  return data
}






function get_contract_abi_and_address_from_id(contract_id, e5){
  const abi_obj = {
    'E5': E5_CONTRACT_ABI,
    'E52': E52_CONTRACT_ABI,
    'F5': F5_CONTRACT_ABI,
    'G5': G5_CONTRACT_ABI,
    'G52': G52_CONTRACT_ABI,
    'H5': H5_CONTRACT_ABI,
    'H52': F5_CONTRACT_ABI,
  }
  const address_obj = {
    'E5': data[e5]['addresses'][0],
    'E52': data[e5]['addresses'][1],
    'F5': data[e5]['addresses'][2],
    'G5': data[e5]['addresses'][3],
    'G52': data[e5]['addresses'][4],
    'H5': data[e5]['addresses'][5],
    'H52': data[e5]['addresses'][6],
  }
  return { abi: abi_obj[contract_id], address: address_obj[contract_id] }
}

async function calculate_price_info_for_specified_tokens(token_ids, filter_start, filter_end){
  const return_data = {}
  for(var i=0; i<token_ids.length; i++){
    const focused_token_id = token_ids[i]
    if(!focused_token_id.includes(':') || countChar(focused_token_id, ':') > 1){
      continue;
    }
    const token_e5 = focused_token_id.split(':')[0].toUpperCase()
    const token_id = focused_token_id.split(':')[1]

    if(!data['e'].includes(token_e5) || isNaN(token_id) || parseInt(token_id) < 1000 || object_types[token_e5][token_id] != 31/* 31(exchange_object) */){
      continue;
    }

    const all_exchange_ratio_data = await filter_events(token_e5, 'H5', 'e1', { p1/* target_id */: token_id}, null)

    const targeted_exchange_ratio_data = all_exchange_ratio_data.filter(function (event) {
      return (event.returnValues.p9/* timestamp */ >= filter_start && event.returnValues.p9/* timestamp */ <= filter_end)
    })
    const token_type = get_token_type(all_exchange_ratio_data)
    const price_data = []

    targeted_exchange_ratio_data.forEach(event => {
      const input_amount = 1
      const input_reserve_ratio = event.returnValues.p5/* exchange_ratio_x */
      const output_reserve_ratio = event.returnValues.p6/* exchange_ratio_y */
      const price = calculate_price(input_amount, input_reserve_ratio, output_reserve_ratio, token_type)
      price_data.push({'time':event.returnValues.p9/* timestamp */, 'price':price})
    });

    if(token_type == 3 && all_exchange_ratio_data.length > 0){
      const initial_supply = bigInt(all_exchange_ratio_data[0].returnValues.p5/* updated_exchange_ratio_x */).plus(bigInt(all_exchange_ratio_data[0].returnValues.p8/* amount */))
      const total_minted_as_auth = await get_total_minted_as_auth(token_id, token_e5, filter_end)
      const final_supply = bigInt(initial_supply).plus(total_minted_as_auth)

      return_data[focused_token_id] = { 'price_change_history':price_data, 'total_supply': final_supply }
    }
    else if(token_type == 5 && targeted_exchange_ratio_data.length > 0){
      const latest_exchange_ratio_event = targeted_exchange_ratio_data[targeted_exchange_ratio_data.length -1]
      const input_amount = latest_exchange_ratio_event.returnValues.p7/* parent_tokens_balance */
      const input_reserve_ratio = latest_exchange_ratio_event.returnValues.p5/* exchange_ratio_x */
      const output_reserve_ratio = latest_exchange_ratio_event.returnValues.p6/* exchange_ratio_y */
      const final_supply = calculate_price(input_amount, input_reserve_ratio, output_reserve_ratio, token_type);

      return_data[focused_token_id] = { 'price_change_history':price_data, 'total_supply': final_supply }
    }
  }

  return return_data
}

function countChar(str, char) {
  return str.split(char).length - 1;
}

async function get_total_minted_as_auth(token_id, e5, filter_end){
  const all_auth_mint_data = await filter_events(e5, 'H52', 'power', { p1/* target_id */: token_id, p2/* action */: 2/* depth_auth_mint */}, null)

  const targeted_auth_mint_data = all_auth_mint_data.filter(function (event) {
    return (event.returnValues.p7/* timestamp */ <= filter_end)
  })

  var total = bigInt(0)
  targeted_auth_mint_data.forEach(event => {
    total = bigInt(total).plus(get_actual_number(event.returnValues.p5/* amount */, event.returnValues.p4/* depth_val */))
  });
  return total
}

function get_token_type(all_exchange_ratio_data){
  if(all_exchange_ratio_data.length >= 2){
    const first_event = all_exchange_ratio_data[0]
    const last_event = all_exchange_ratio_data[1]
    if(first_event.returnValues.p6/* updated_exchange_ratio_y */ == last_event.returnValues.p6/* updated_exchange_ratio_y */){
      return 5
    }
    else{
      return 3
    }
  }
  else{
    return 5
  }
}

function calculate_price(input_amount, input_reserve_ratio, output_reserve_ratio, token_type){
  if(token_type == 3){
      var price = (bigInt(input_amount).times(bigInt(output_reserve_ratio))).divide(bigInt(input_reserve_ratio).plus(input_amount))
      if(price == 0){
          price = (input_amount * output_reserve_ratio) / (input_reserve_ratio + input_amount)
      }
      return price
  }else{
      var price = (bigInt(input_amount).times(bigInt(output_reserve_ratio))).divide(bigInt(input_reserve_ratio))
      if(price == 0){
          price = (input_amount * output_reserve_ratio) / (input_reserve_ratio)
      }
      return price
  }
}











app.use((req, res, next) => {
  let bytesSent = 0;
  let bytesReceived = 0;

  // Count incoming request data
  req.on('data', chunk => {
    bytesReceived += chunk.length;
  });

  const origWrite = res.write;
  const origEnd = res.end;

  res.write = function (chunk, ...args) {
    if (chunk) {
      bytesSent += chunk.length;
    }
    return origWrite.call(this, chunk, ...args);
  };

  res.end = function (chunk, ...args) {
    if (chunk) {
      bytesSent += chunk.length;
    }
    // Log this request/response traffic
    trafficHistory.push({ time: Date.now(), sent: bytesSent, received: bytesReceived });
    return origEnd.call(this, chunk, ...args);
  };

  next();
});

app.get('/:privacy_signature', async (req, res) => {
  const { privacy_signature } = req.params
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Node online', b: sync_block_number, success:true }))
  }
  else{
    res.send(JSON.stringify({ message: 'Node online', b: sync_block_number, success:true, directory: endpoint_info }))
  }
});

/* endpoint for returning E5 event data tracked by the node */
app.get(`/${endpoint_info['events']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_users_key, registered_user } = await process_request_params(req.params, req.ip);
  var limit = data['event_data_request_limit'];
  if(privacy_signature == 'e'){
    //apply rate limits
    const rate_limit_results = ip_limits(req.ip)
    if(rate_limit_results.success == false){
      return res.status(429).json({ message: rate_limit_results.message});
    }
    limit = 35
  }
  else{
    if(!await is_privacy_signature_valid(privacy_signature)){
      res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
      return;
    }
  }
  try{
    const arg_string = privacy_signature == 'e' ? req.query.arg_string: await decrypt_secure_data(req.query.arg_string, registered_users_key)

    var arg_obj = JSON.parse(arg_string)
    var requests = arg_obj.requests
    const load_limit = (arg_obj.load_limit == null || isNaN(arg_obj.load_limit)) ? 100_000_000 : parseInt(arg_obj.load_limit)
    
    var filtered_events_array = []
    var block_heights = []
    if(requests.length > limit){
      res.send(JSON.stringify({ message: 'request count exceeded limit', success:false }));
      return;
    }
    for(var i=0; i<requests.length; i++){
      var requested_e5 = requests[i]['requested_e5']
      var requested_contract = requests[i]['requested_contract']
      var requested_event_id = requests[i]['requested_event_id']
      var filter = requests[i]['filter']
      var from_filter = requests[i]['from_filter']

      var filtered_events = await filter_events(requested_e5, requested_contract, requested_event_id, filter, from_filter)
      filtered_events_array.push(0, filtered_events.slice(load_limit))
      var block_id = data[requested_e5]['current_block'][requested_contract+requested_event_id]
      block_heights.push(block_id)
    }
    
    var obj = {'data':filtered_events_array, 'block_heights':block_heights, success:true}
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    record_request('/events')
    return res.send(string_obj);
  }
  catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }
});//ok

/* endpoint for returning E5 hash data stored */
app.get(`/${endpoint_info['data']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_users_key, registered_user } = await process_request_params(req.params, req.ip);
  var limit = data['hash_data_request_limit'];
  if(privacy_signature == 'e'){
    //apply rate limits
    const rate_limit_results = ip_limits(req.ip)
    if(rate_limit_results.success == false){
      return res.status(429).json({ message: rate_limit_results.message});
    }
    limit = 35
  }
  else{
    if(!await is_privacy_signature_valid(privacy_signature)){
      res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
      return;
    }
  }
  
  try{
    const arg_string = privacy_signature == 'e' ? req.query.arg_string: await decrypt_secure_data(req.query.arg_string, registered_users_key)

    var arg_obj = JSON.parse(arg_string)
    var hashes = arg_obj.hashes
    if(hashes.length > limit){
      res.send(JSON.stringify({ message: 'request count exceeded limit', success:false }));
      return;
    }
    var data = await fetch_hashes_from_file_storage_or_memory(hashes)
    var obj = {'data':data, success:true}
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    record_request('/data')
    res.send(string_obj);
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }
});//ok

/* endpoint for filtering tracked E5 objects by specified tags */
app.get(`/${endpoint_info['tags']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_users_key, registered_user } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  try{
    const arg_string = await decrypt_secure_data(req.query.arg_string, registered_users_key)
    var arg_obj = JSON.parse(arg_string)
    var tags = arg_obj.tags
    var target_type = arg_obj.target_type
    var language = arg_obj.language == null ? 'en' : arg_obj.language
    var state = arg_obj.state == null ? '0x' : arg_obj.state
    var ids = await search_for_object_ids_by_tags(tags, target_type, language, state)
    var obj = {'data':ids, success:true}
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    record_request('/tags')
    res.send(string_obj);
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string' , success:false}));
  }
});//ok

/* endpoint for filtering tracked E5 objects by specified a title */
app.get(`/${endpoint_info['title']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_users_key, registered_user } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  try{
    const arg_string = await decrypt_secure_data(req.query.arg_string, registered_users_key)
    var arg_obj = JSON.parse(arg_string)
    var title = arg_obj.title
    var target_type = arg_obj.target_type
    var ids = await search_for_object_ids_by_title(title, target_type)
    var obj = {'data':ids, success:true}
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    record_request('/title')
    res.send(string_obj);
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string' , success:false}));
  }
});//ok

/* enpoint for checking if node is online */
app.get(`/${endpoint_info['marco']}`, async (req, res) => {
  //apply rate limits
  const rate_limit_results = ip_limits(req.ip)
  if(rate_limit_results.success == false){
    return res.status(429).json({ message: rate_limit_results.message});
  }
  var ipfs_hashes = load_count
  var storage_accounts_length = Object.keys(data['storage_data']).length
  var booted = app_key != '' && app_key != null
  var e5_data = {}
  data['e'].forEach(e5 => {
    e5_data[e5] = data[e5]
  });
  
  var files = fs.existsSync('./backup_data/') ? fs.readdirSync('./backup_data/') : []
  var log_files = fs.existsSync('./logs/') ? fs.readdirSync('./logs/') : []
  var files_obj = { 'data':files, 'log_data':log_files }
  var encrypted_files_obj = JSON.stringify(files_obj)
  const total_ram = Math.floor(os.totalmem() / (1024 * 1024))
  
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
    'target_storage_recipient_accounts':data['target_storage_recipient_accounts'],
    'version':version,
    'privacy_address':privacy_address,
    'total_ram':total_ram,
    'cold_storage_memory_stats':data['cold_storage_memory_stats'],
    'cold_storage_request_stats':data['cold_storage_request_stats'],
    'platform':os.platform(),
    'hash_data_request_limit':data['hash_data_request_limit'],
    'event_data_request_limit':data['event_data_request_limit'],
    'block_mod':data['block_mod'],
    'ip_request_time_limit':data['ip_request_time_limit'],
    'block_record_sync_time_limit':data['block_record_sync_time_limit'],
    'auto_certificte_renewal_enabled': AUTO_CERTIFICATE_RENEWAL_ENABLED,
    'endpoint_updates_enabled': ENPOINT_UPDATES_ENABLED,
    'certificate_expiry_time':data['certificate_expiry_time'],
    'network_speed_in_mbps':data['network_speed_in_mbps'],
    'network_interface':data['network_interface'],
    'node_public_key':server_public_key,
    success:true
  }
  var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
  record_request('/marco')
  res.send(string_obj);
});//ok

/* register a user endpoint with specified encryption keys */
app.post(`/${endpoint_info['register']}`, async (req, res) => {
  //apply rate limits
  const rate_limit_results = ip_limits(req.ip)
  if(rate_limit_results.success == false){
    return res.status(429).json({ message: rate_limit_results.message});
  }
  const { user_temp_hash, encrypted_key } = req.body
  if(user_temp_hash == null || encrypted_key == null || user_temp_hash == '' || encrypted_key == ''){
    res.send(JSON.stringify({ message: 'Invalid args', success:false }));
    return;
  }
  try{
    const obj = await register_user_encryption_key(user_temp_hash, encrypted_key, req.ip)
    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    res.send(string_obj);
  }
  catch(e){
    log_error(e)
    res.send(JSON.stringify({ message: 'Invalid arg string' , success:false}));
  }
});

/* enpoint for loading traffic stats */
app.get(`/${endpoint_info['traffic_stats']}/:filter_time/:privacy_signature`, async (req, res) => {
  const { filter_time, privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  if(filter_time == null || isNaN(filter_time) || parseInt(filter_time) > 0){
    res.send(JSON.stringify({ message: 'Invalid filter time', success:false }));
    return;
  }
  try{
    const history_data = await get_traffic_stats_history(filter_time)
    const access_info = await get_all_login_access_time_info()
    var obj = {
      'memory_stats': history_data.selected_cold_storage_memory_stat_obj,
      'request_stats': history_data.selected_cold_storage_request_stat_obj,
      'access_info':access_info,
      success:true
    }

    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    record_request('/traffic_stats')
    res.send(string_obj);
  }
  catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string' , success:false}));
  }
  
});

/* enpoint for loading trends */
app.post(`/${endpoint_info['trends']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  const { start_time, end_time, keywords, filter_type, filter_languages, filter_states, filter_object_types } = await process_request_body(req.body)
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  else if(start_time == null || isNaN(start_time) || end_time == null || isNaN(end_time) || keywords == null || filter_type == null || filter_languages == null || !Array.isArray(filter_languages) || filter_states == null || !Array.isArray(filter_states) || filter_object_types == null || !Array.isArray(filter_object_types)){
    res.send(JSON.stringify({ message: 'Invalid filter time', success:false }));
    return;
  }
  else if((parseInt(end_time) - parseInt(start_time)) < 10_000){
    res.send(JSON.stringify({ message: 'start time value cannot be greater than end time value', success:false }));
    return;
  }
  try{
    var obj = {
      'trends': await get_old_trends_history_data(start_time, end_time, keywords, filter_type, filter_languages, filter_states, filter_object_types),
      success:true
    }

    var string_obj = JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    record_request('/trends')
    res.send(string_obj);
  }
  catch(e){
    log_error(e)
    res.send(JSON.stringify({ message: 'Invalid arg string' , success:false}));
  }
});

/* admin endpoint for booting a new E5 to be tracked by the node */
app.post(`/${endpoint_info['new_e5']}/:privacy_signature`, async (req, res) => {
  try{
    const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
    if(!await is_privacy_signature_valid(privacy_signature)){
      res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
      return;
    }
    const { backup_key, e5, e5_address, web3, web3_backups, first_block, iteration } = await process_request_body(req.body)

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

    if(web3_backups == null){
      res.send(JSON.stringify({ message: 'You need to provide backup rpcs for your new e5 incase the default stops working', success:false }));
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

    data[e5] = {'addresses':contract_addresses, 'web3':[web3], 'url':0, 'first_block':first_block, 'current_block':{}, 'iteration':iteration}

    web3_backups.forEach(backup_link => {
      data[e5]['web3'].push(backup_link)
    });

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

/* enpoint for updating the node's provider for a specified E5 */
app.post(`/${endpoint_info['update_provider']}/:privacy_signature`, async (req, res) => {
  try{
    const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
    if(!await is_privacy_signature_valid(privacy_signature)){
      res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
      return;
    }
    const { new_provider, backup_key, e5, new_providers } = await process_request_body(req.body)

    if(new_provider == null || new_provider == '' || new_providers == null || backup_key == null || backup_key == '' || e5 == null || e5 == ''){
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
      const new_web3 = [new_provider]
      new_providers.forEach(provider => {
        new_web3.push(provider)
      });
      data[e5]['web3'] = new_web3
      if(data[e5]['url'] == null){
        data[e5]['url'] = 0
      }

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
app.post(`/${endpoint_info['update_content_gateway']}/:privacy_signature`, async (req, res) => {
  try{
    const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
    if(!await is_privacy_signature_valid(privacy_signature)){
      res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
      return;
    }
    const { new_provider, backup_key } = await process_request_body(req.body)
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

/* admin endpoint for removing tracked data for a specified E5 */
app.post(`/${endpoint_info['delete_e5']}/:privacy_signature`, async (req, res) => {
  try{
    const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
    if(!await is_privacy_signature_valid(privacy_signature)){
      res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
      return;
    }
    const { e5, backup_key } = await process_request_body(req.body)
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

/* admin endpoint for manually backing up your nodes data */
app.post(`/${endpoint_info['backup']}/:privacy_signature`, async (req, res) => {
  try{
    const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
    if(!await is_privacy_signature_valid(privacy_signature)){
      res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
      return;
    }
    const { backup_key } = await process_request_body(req.body)
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

/* admin endpoint for restoring the node to a backed up version */
app.post(`/${endpoint_info['restore']}/:privacy_signature`, async (req, res) => {
  try{
    const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
    if(!await is_privacy_signature_valid(privacy_signature)){
      res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
      return;
    }
    const { backup_key, file_name, data_key, should_restore_key } = await process_request_body(req.body)
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

/* admin endpoint for updating the iteration value for a specified E5 and its corresponding chain */
app.post(`/${endpoint_info['update_iteration']}/:privacy_signature`, async (req, res) => {
  try{
    const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
    if(!await is_privacy_signature_valid(privacy_signature)){
      res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
      return;
    }
    const { new_iteration, e5, backup_key } = await process_request_body(req.body)
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
app.post(`/${endpoint_info['boot']}/:privacy_signature`, async (req, res) => {
  try{
    const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
    if(!await is_privacy_signature_valid(privacy_signature)){
      res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
      return;
    }
    const { new_beacon_chain_link, backup_key } = await process_request_body(req.body)
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
app.post(`/${endpoint_info['boot_storage']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { backup_key,/*  max_capacity, */ max_buyable_capacity, target_account_e5, price_per_megabyte, target_storage_purchase_recipient_account, unlimited_basic_storage, free_default_storage, target_storage_recipient_accounts } = await process_request_body(req.body);
  // var available_space = await get_maximum_available_disk_space()
  
  if(backup_key == null || backup_key == '' /* || isNaN(max_capacity) */ || isNaN(max_buyable_capacity) || price_per_megabyte == null || /* target_account_e5 == null || target_account_e5 == '' || isNaN(target_storage_purchase_recipient_account) || */ unlimited_basic_storage == null || target_storage_recipient_accounts == null){
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
  // else if(!data['e'].includes(target_account_e5)){
  //   res.send(JSON.stringify({ message: `That E5 is not being watched.`, success:false }));
  //   return;
  // }
  else{
    try{
      Object.keys(target_storage_recipient_accounts).forEach(focused_e5 => {
        if(!data['e'].includes(focused_e5)){
          res.send(JSON.stringify({ message: `${focused_e5} is not being watched.`, success:false }));
          return;
        }
      });
    }catch(e){
      res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
      return;
    }
    // data['file_data_capacity'] = max_capacity
    const default_e5_key = Object.keys(target_storage_recipient_accounts)[0]
    data['max_buyable_capacity'] = max_buyable_capacity
    data['price_per_megabyte'] = price_per_megabyte
    data['target_account_e5'] = default_e5_key
    data['target_storage_purchase_recipient_account'] = target_storage_recipient_accounts[default_e5_key]
    data['storage_boot_time'] = await get_e5_chain_time(target_account_e5)
    data['unlimited_basic_storage'] = unlimited_basic_storage
    if(free_default_storage != null && !isNaN(free_default_storage)){
      data['free_default_storage'] = free_default_storage
    }
    data['target_storage_recipient_accounts'] = target_storage_recipient_accounts

    res.send(JSON.stringify({ message: `node configured with a maximum buyable capacity of ${max_buyable_capacity} mbs.`, success:true }));
  }
});//ok -------

/* admin endpoint for reconfiguring the storage settings for the node's storage services */
app.post(`/${endpoint_info['reconfigure_storage']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { backup_key, key, value, e5 } = await process_request_body(req.body);
  if(backup_key == null || backup_key == '' || key == null || key == '' || value == null){
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
    return;
  }
  else if(data['key'] !== backup_key){
    res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
    return;
  }
  
  const accepted_keys = ['max_buyable_capacity', 'price_per_megabyte', 'unlimited_basic_storage', 'free_default_storage', 'hash_data_request_limit', 'event_data_request_limit', 'block_mod', 'block_record_sync_time_limit', 'ip_request_time_limit']
  
  if(!accepted_keys.includes(key)){
    res.send(JSON.stringify({ message: 'Invalid modify targets', success:false }));
    return;
  }
  else{
    if(key == 'price_per_megabyte'){
      data['price_per_megabyte'] = value.price_per_megabyte
      data['target_storage_recipient_accounts'] = value.target_storage_recipient_accounts
    }else{
      data[key] = value
    }
    res.send(JSON.stringify({ message: `node reconfigured with the specified parameter '${key}' to the speicified value`, success:true }));
  }
});//ok -----

/* endpoint for storing files in the storage service for the node */
app.post(`/${endpoint_info['store_files']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { signature_data, signature, file_datas, file_types, e5 } = await process_request_body(req.body);
  if(signature_data == null || signature_data == '' || signature == null || signature == '' || file_datas == null || file_types == null || !is_all_file_type_ok(file_types) || e5 == null || e5 == ''){
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
  else if(!data['e'].includes(e5)){
    res.send(JSON.stringify({ message: `That E5 is not being watched.`, success:false }));
    return;
  }
  else{
    var storage_data = await fetch_accounts_available_storage(signature_data, signature, e5)
    var binaries = get_file_binaries(file_datas)
    var space_utilized = get_length_of_binary_files_in_mbs(binaries)
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
      var success = await store_files_in_storage(binaries, file_types, file_datas, storage_data.account)
      
      if(success == null){
        res.send(JSON.stringify({ message: 'Files stored Unsucessfully, internal server error', success:false }));
      }else{
        record_file_data(success, binaries, storage_data.account, file_types)
        if(data['storage_data'][storage_data.account.toString()]['uploaded_files'] == null){
          data['storage_data'][storage_data.account.toString()]['uploaded_files'] = []
        }
        success.forEach(file => {
          data['storage_data'][storage_data.account.toString()]['uploaded_files'].push(file)
        });
        record_request('/store_files')
        res.send(JSON.stringify({ message: 'Files stored Successfully', files: success, success:true }));
      }
    }
  }
});//ok -----

/* reserve a right to stream a file into storage */
app.post(`/${endpoint_info['reserve_upload']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { signature_data, signature, file_length, file_type, upload_extension, e5 } = await process_request_body(req.body);
  if(signature_data == null || signature_data == '' || signature == null || signature == '' || file_length == null || isNaN(file_length) || file_type == null || !is_all_file_type_ok([file_type]) || e5 == null || e5 == ''){
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
  }
  else if(!data['e'].includes(e5)){
    res.send(JSON.stringify({ message: `That E5 is not being watched.`, success:false }));
    return;
  }
  else if(req.ip == null){
    res.send(JSON.stringify({ message: `Ip address required for reserving upload`, success:false }));
    return;
  }
  else{
    var storage_data = await fetch_accounts_available_storage(signature_data, signature, e5)
    if((storage_data.available_space * (1024 * 1024)) < file_length){
      res.send(JSON.stringify({ message: 'Insufficient storage acquired for speficied account.', success:false }));
      return;
    }
    else{
      const expiry = Date.now() + (1000 * 60 * 60 * 24 * 3)/* 3 days */
      data['upload_reservations'][upload_extension] = {'length':file_length, 'type':file_type, 'expiry':expiry, 'account':storage_data.account.toString(), 'aborted':false, 'ip_address':req.ip}
      record_request('/reserve_upload')
      res.send(JSON.stringify({ message: 'reservation successful.', extension: upload_extension, success:true }));
    }
  }
});//ok -----

/* stream data into a file under a specified reservation */
app.post(`/${endpoint_info['upload']}/:extension/:privacy_signature`, async (req, res) => {
  const { extension, privacy_signature, registered_user, registered_users_key} = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
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
    else if(reservation_data['ip_address'] != req.ip){
      res.send(JSON.stringify({ message: 'Only the ip address that made the reservation can stream the upload', success:false }));
      return;
    }
    else{
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
        
        data['uploaded_files_data'][extension] = {'size': (receivedBytes/(1024 * 1024)), 'owner':account, 'time':Date.now(), 'extension':reservation_data['type']}
        if(data['storage_data'][account]['uploaded_files'] == null){
          data['storage_data'][account]['uploaded_files'] = []
        }
        data['storage_data'][account]['uploaded_files'].push(extension)

        data['upload_reservations'][extension]['aborted'] = true;
        record_request('/upload')
        res.send(JSON.stringify({ message: 'Upload Successful.', success:true }));
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
app.get(`/${endpoint_info['account_storage_data']}/:account/:privacy_signature`, async (req, res) => {
  const { privacy_signature, account, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  if(account == '' || account == null){
    res.send(JSON.stringify({ message: 'Please specify an account', success:false }));
    return;
  }else{
    var payment_data = data['storage_data'][account.toString()]
    if(payment_data == null){
      res.send(JSON.stringify({ message: 'That account does not exist in this node.', success:false }));
    }else{
      res.send(JSON.stringify({ message: 'Account found.', account: payment_data, success:true }));
    }
    record_request('/account_storage_data')
  }
});//ok -----

/* endpoint for streaming a file stored in the node. */
app.get(`/${endpoint_info['stream_file']}/:content_type/:file/:privacy_signature`, async (req, res) => {
  const { file, content_type, privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  const final_content_type = get_final_content_type(content_type)
  if(file == '' || file == null || content_type == '' || content_type == null){
    res.send(JSON.stringify({ message: 'Please specify a file to stream and content type', success:false }));
    return;
  }
  else if(final_content_type == null){
    res.send(JSON.stringify({ message: 'Please specify a valid content type', success:false }));
    return;
  }
  else if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  else if(!is_file_ok_to_stream(file)){
    res.send(JSON.stringify({ message: 'The file has not been renewed', success:false }));
    return;
  }
  else if(data['uploaded_files_data'][file]['deleted'] == true){
    res.send(JSON.stringify({ message: 'The file was deleted', success:false }));
    return;
  }
  else{
    const filePath = `storage_data/${file}`
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    const ip = registered_user;
    const now = Date.now();
    var should_count_view = true
    var should_count_stream = true

    var stream_proportion_target = fileSize > STREAM_DATA_THRESHOLD ? 
    fileSize / STREAM_DATA_THRESHOLD : 96.0

    if(ip != null){
      if(ipAccessTimestamps[ip+file] == null){
        ipAccessTimestamps[ip+file] = { 'time': now, 'bytes': 0, 'view_counted':false }
      }
      else{
        ipAccessTimestamps[ip+file]['time'] = now
      }

      var stream_proportion = ipAccessTimestamps[ip+file]['bytes'] == 0 ? 0 : (ipAccessTimestamps[ip+file]['bytes'] / fileSize)

      if(stream_proportion > stream_proportion_target){
        should_count_view = false
      }
      if(ipAccessTimestamps[ip+file]['bytes'] >= fileSize){
        should_count_stream = false
      }
    }else{
      should_count_view = false
      should_count_stream = false
    }
    
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

      let bytesSent = 0;
      stream.on('data', (chunk) => {
        if(should_count_stream == true){
          record_stream_event(file, chunk.length, ip)
        }
        if(should_count_view == true){
          bytesSent += chunk.length;
          const streamed_proportion = bytesSent / fileSize
          if(!ipAccessTimestamps[ip+file]['view_counted'] && streamed_proportion >= stream_proportion_target){
            ipAccessTimestamps[ip+file]['view_counted'] = true
            record_view_event(file)
          }
        }
      });

      res.writeHead(206, {
        'Content-Range': `bytes ${chunkStart}-${chunkEnd}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkEnd - chunkStart + 1,
        'Content-Type': final_content_type,
      });

      stream.pipe(res);
      record_request('/stream_file')
    }
    else{
      if(should_count_stream == true){
        record_stream_event(file, fileSize, ip)
      }
      if(should_count_view == true && !ipAccessTimestamps[ip+file]['view_counted']){
        record_view_event(file)
        ipAccessTimestamps[ip+file]['view_counted'] = true;
      }

      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': final_content_type,
      });
      fs.createReadStream(filePath).pipe(res);
      record_request('/stream_file')
    }

  }
});//ok -----

/* endpoint for storing basic E5 run data. */
app.post(`/${endpoint_info['store_data']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { signature_data, signature, file_datas } = await process_request_body(req.body);
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
      record_request('/store_data')
      res.send(JSON.stringify({ message: 'Files stored Successfully', files: success, success:true }));
    }
  }
});//ok -----

/* returns the view count for a given file */
app.post(`/${endpoint_info['streams']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { files } = await process_request_body(req.body);
  if(files == null || files.length == 0){
    res.send(JSON.stringify({ message: 'Please speficy an array of file names.', success:false }));
    return;
  }

  try{
    const return_views_data = get_file_views(files)
    const return_streams_data = await get_data_streams_for_files(files)
    const file_renewal_data = get_file_renewal_data(files)
    const file_status = get_files_statuses(files)
    var return_obj = { message: 'Search successful.', renewal_years: file_renewal_data, file_status, views:return_views_data , streams: return_streams_data, success:true }
    var string_obj = JSON.stringify(return_obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    record_request('/streams')
    res.send(string_obj);
  }
  catch(e){
    res.send(JSON.stringify({ message: 'Something went wrong', error: e.toString(), success:false }));
    return;
  }
});

/* endpoint for fetching itransfers with a specified identifier */
app.get(`/${endpoint_info['itransfers']}`, async (req, res) => {
  const { identifier, account, recipient, e5 } = req.query;
  //apply rate limits
  const rate_limit_results = ip_limits(req.ip)
  if(rate_limit_results.success == false){
    return res.status(429).json({ message: rate_limit_results.message});
  }
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

  var return_obj = { message: 'Search successful.', payment_data: itransfer_data, success:true }
  var string_obj = JSON.stringify(return_obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
  record_request('/iTransfers')
  res.send(string_obj);
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
app.get(`/${endpoint_info['bill_payments']}`, async (req, res) => {
  //identifier, account, recipient, requested_e5, type
  //apply rate limits
  const rate_limit_results = ip_limits(req.ip)
  if(rate_limit_results.success == false){
    return res.status(429).json({ message: rate_limit_results.message});
  }
  const { identifier, account, recipient, e5 } = req.query;
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

  var return_obj = { message: 'Search successful.', payment_data: itransfer_data, success:true }
  var string_obj = JSON.stringify(return_obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
  record_request('/bill_payments')
  res.send(string_obj);
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

/* endpoint for checking the subscription payment information for a specified account */
app.get(`/${endpoint_info['subscription']}`, async (req, res) => {
  const subscription = req.query.object_id;
  const e5 = req.query.e5
  const signature_data = req.query.data;
  const signature = req.query.signature
  const rate_limit_results = ip_limits(req.ip)
  if(rate_limit_results.success == false){
    return res.status(429).json({ message: rate_limit_results.message});
  }
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
      record_request('/subscription')
      res.send(string_obj);
    }
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }

});//ok

/* endpoint for calculating and tallying consensus info for a specified poll */
app.post(`/${endpoint_info['count_votes']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  try{
    const { static_poll_data, poll_id, file_objects, poll_e5 } = await process_request_body(req.body);
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
      record_request('/count_votes')
      res.send(string_obj);
    }else{
      res.send(JSON.stringify({ message: success_obj.message, success:false, error:success_obj.error}));
    }
  }catch(e){
    res.send(JSON.stringify({ message: 'Something went wrong.', success:false, error: e }));
  }
});//ok -----

/* endpoint for calculating income stream datapoints for subscription payments */
app.post(`/${endpoint_info['subscription_income_stream_datapoints']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { subscription_object, steps, filter_value, token_name_data } = await process_request_body(req.body);
  if(subscription_object == null || steps == null || filter_value == null || isNaN(steps) || isNaN(filter_value) || token_name_data == null ){
    res.send(JSON.stringify({ message: 'Invalid arg strings', success:false }));
    return;
  }
  
  try{
    var data = await calculate_income_stream_data_points(subscription_object, steps, filter_value, token_name_data)
    if(data.success == false){
      res.send(JSON.stringify({ message: 'Something went wrong', error: data.reason, success:false }));
      return;
    }else{
      var return_obj = { message: 'Calculation successful.', data: data.data, success:true }
      var string_obj = JSON.stringify(return_obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
      record_request('/subscription_income_stream_datapoints')
      res.send(string_obj);
    }
  }catch(e){
    res.send(JSON.stringify({ message: 'Something went wrong', error: e.toString(), success:false }));
    return;
  }
});//ok -----

/* endpoint for calculating payout information for the creators in a creator group */
app.post(`/${endpoint_info['creator_group_payouts']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { subscription_objects, steps, filter_value, file_view_data } = await process_request_body(req.body);
  if(subscription_objects == null || subscription_objects.length == 0 || steps == null || filter_value == null || isNaN(steps) || isNaN(filter_value) || file_view_data == null || file_view_data.length == 0){
    res.send(JSON.stringify({ message: 'Invalid arg strings', success:false }));
    return;
  }
  
  try{
    var data = await calculate_income_stream_for_multiple_subscriptions(subscription_objects, steps, filter_value, file_view_data)
    if(data.success == false){
      res.send(JSON.stringify({ message: 'Something went wrong', error: data.reason, success:false }));
      return;
    }else{
      var return_obj = { message: 'Calculation successful.', data: data.data, success:true }
      var string_obj = JSON.stringify(return_obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
      record_request('/creator_group_payouts')
      res.send(string_obj);
    }
  }catch(e){
    res.send(JSON.stringify({ message: 'Something went wrong', error: e.toString(), success:false }));
    return;
  }
});

/* endpoint for deleting an uploaded file from the node permanently */
app.post(`/${endpoint_info['delete_files']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { signature_data, signature, file, e5,  } = await process_request_body(req.body);
  if(file == null && signature_data == null || signature_data == '' || signature == null || signature == '' || e5 == null || e5 == ''){
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
    return;
  }
  else if(!data['e'].includes(e5)){
    res.send(JSON.stringify({ message: `That E5 is not being watched.`, success:false }));
    return;
  }
  else if(data['uploaded_files_data'][file]['deleted'] == true){
    res.send(JSON.stringify({ message: `That file was already deleted.`, success:false }));
    return;
  }

  try{
    const storage_data = await fetch_accounts_available_storage(signature_data, signature, e5)
    if(data['uploaded_files_data'][file]['owner'] != storage_data.account.toString()){
      res.send(JSON.stringify({ message: `Youre not the author of that file`, success:false }));
      return;
    }
    else{
      delete_accounts_file(file)
      var return_obj = { message: 'Delete complete.',  success:true }
      var string_obj = JSON.stringify(return_obj, (_, v) => typeof v === 'bigint' ? v.toString() : v)
      record_request('/delete_file')
      res.send(string_obj);
    }
  }
  catch(e){
    res.send(JSON.stringify({ message: 'Something went wrong', error: e.toString(), success:false }));
    return;
  }
});

/* endpoint for streaming the log file stored in the node. */
app.get(`/${endpoint_info['stream_logs']}/:file/:backup_key/:privacy_signature`, async (req, res) => {
  const { file, backup_key, privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(file == '' || file == null || !file.endsWith('.log')){
    res.send(JSON.stringify({ message: 'Please specify a valid file to stream', success:false }));
    return;
  }
  else if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  else if(data['key'] !== backup_key){
    res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
    return;
  }
  else if(!await check_if_log_file_exists(`logs/${file}`)){
    res.send(JSON.stringify({ message: 'File does not exist', success:false }));
    return;
  }
  else{
    const filePath = `logs/${file}`
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const ip = req.ip;
    const final_content_type = 'text/plain'

    if(ip != null){
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
  }
});

/* endpoint for updating the nodes https certificates */
app.post(`/${endpoint_info['update_certificates']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { backup_key } = await process_request_body(req.body);
  if(backup_key == null || backup_key == '' || data['key'] !== backup_key){
    res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
    return;
  }
  const is_root = process.getuid || process.getuid();
  if(is_root == null){
    res.send(JSON.stringify({ message: 'Endpoint only available for Linux/macOS systems', success:false }));
    return;
  }

  const server_file_name = path.basename(require.main.filename)
  const final_renew_script =  'sudo certbot renew';
  const final_restart_script = `sudo pm2 restart ${server_file_name}`;

  try{
    exec(final_renew_script, (error, stdout, stderr) => {
      if (error) {
        res.send(JSON.stringify({ message: `Something went wrong`, error: error.message, success:false }));
        return;
      }

      exec(`openssl x509 -enddate -noout -in ${CERTIFICATE_RESOURCE}`, (err, stdout) => {
        if (err){
          res.send(JSON.stringify({ message: `Something went wrong`, error: err.message, success:false }));
          return;
        }
        const expiry = stdout.trim().split('=')[1];
        const expiry_time = new Date(expiry).getTime()
        
        // Restart server using PM2
        exec(final_restart_script, (restartError, restartStdout, restartStderr) => {
          if (restartError) {
            res.send(JSON.stringify({ message: `Something went wrong with the restart`, error: restartError.message, success:false }));
            return;
          }
          var return_obj = { message: 'Certificate renewal successful.', restartStdout: restartStdout, stdout: stdout, expiry_time: expiry_time, success:true }
          res.send(JSON.stringify(return_obj));
        });
      });
    });
  }
  catch(e){
    res.send(JSON.stringify({ message: 'Something went wrong', error: e.toString(), success:false }));
    return;
  }
});

/* endpoint for updating and restarting the node */
app.post(`/${endpoint_info['update_nodes']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { backup_key, file_datas, file_names, commands } = await process_request_body(req.body);
  if(file_datas == null || file_names == null || backup_key == null || backup_key == '' || commands == null){
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
    return;
  }
  else if(file_datas.length == 0){
    res.send(JSON.stringify({ message: 'You need to speicify some script files to write', success:false }));
    return;
  }
  else if(file_datas.length != file_names.length){
    res.send(JSON.stringify({ message: 'The script files and the file names dont match', success:false }));
    return;
  }
  else if(data['key'] !== backup_key){
    res.send(JSON.stringify({ message: 'Invalid back-up key', success:false }));
    return;
  }
  else if(!are_all_script_names_vaid(file_names)){
    res.send(JSON.stringify({ message: 'Invalid file names', success:false }));
    return;
  }
  else if(!are_executions_valid(commands)){
    res.send(JSON.stringify({ message: 'Invalid executions passed. You can only run package manager commands.', success:false }));
    return;
  }
  else if(ENPOINT_UPDATES_ENABLED == false){
    res.send(JSON.stringify({ message: 'Over the air updates disabled', success:false }));
    return;
  }
  const is_root = process.getuid || process.getuid();
  if(is_root == null){
    res.send(JSON.stringify({ message: 'Endpoint only available for Linux/macOS systems', success:false }));
    return;
  }
  const server_file_name = path.basename(require.main.filename)
  const final_restart_script = `sudo pm2 restart ${server_file_name}`
  const temp_id = Date.now()+'temp_';
  try{
    var binaries = get_file_binaries(file_datas)
    const success = await store_temp_node_files_in_storage(binaries, file_names, temp_id)
    if(success == false){
      res.send(JSON.stringify({ message: 'Something went wrong while writing temp files', success:false }));
      return;
    }
    const check_success = await test_temp_node_files_in_storage(file_names)
    if(check_success == false){
      res.send(JSON.stringify({ message: 'Something went wrong while validating temp files', success:false }));
      return;
    }
    const copy_success = await copy_temp_node_files_in_storage(file_names, temp_id)
    if(copy_success == false){
      res.send(JSON.stringify({ message: 'Something went wrong while copying temp files', success:false }));
      return;
    }
    const delete_success = await delete_temp_node_files_in_storage(file_names, temp_id)
    if(delete_success == false){
      res.send(JSON.stringify({ message: 'Something went wrong while deleting temp files', success:false }));
      return;
    }
    const executions_success = await run_pre_executions(commands)
    if(executions_success == false){
      res.send(JSON.stringify({ message: 'Something went wrong while deleting temp files', success:false }));
      return;
    }

    // Restart server using PM2
    exec(final_restart_script, (restartError, restartStdout, restartStderr) => {
      if (restartError) {
        res.send(JSON.stringify({ message: `Something went wrong with the restart`, error: restartError.message, success:false }));
        return;
      }
      var return_obj = { message: 'Server update successful.', restartStdout: restartStdout, success:true }
      res.send(JSON.stringify(return_obj));
    });
  }
  catch(e){
    res.send(JSON.stringify({ message: 'Something went wrong', error: e.toString(), success:false }));
    return;
  }
});

/* endpoint for posting e5 runs */
app.post(`/${endpoint_info['run_transaction']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { e5, rawTransaction } = await process_request_body(req.body);
  if(e5 == null || rawTransaction == null){
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
    return;
  }
  if(!data['e'].includes(e5)){
    res.send(JSON.stringify({ message: 'That e5 doesnt exist', success:false }));
    return;
  }
  
  try{
    const web3 = data[e5]['url'] != null ? new Web3(data[e5]['web3'][data[e5]['url']]): new Web3(data[e5]['web3']);

    web3.eth.sendSignedTransaction(rawTransaction).on('receipt', (receipt) => {
      record_request('/run_transaction')
      res.send(JSON.stringify({ message: 'Transaction complete', receipt: receipt, success:true }));
    })
    .on('error', (error) => {
      record_request('/run_transaction')
      res.send(JSON.stringify({ message: 'Something went wrong', error: error.message, success:false }));
    });
  }
  catch(e){
    res.send(JSON.stringify({ message: 'Something went wrong', error: e.toString(), success:false }));
  }
});

/* endpoint for running contract calls */
app.post(`/${endpoint_info['run_contract_call']}/:privacy_signature`, async (req, res) => {
  const { privacy_signature, registered_user, registered_users_key } = await process_request_params(req.params, req.ip);
  if(!await is_privacy_signature_valid(privacy_signature)){
    res.send(JSON.stringify({ message: 'Invalid signature', success:false }));
    return;
  }
  const { e5, contract_id, function_name, parameters } = await process_request_body(req.body);
  if(e5 == null || contract_id == null || function_name == null || parameters == null || !Array.isArray(parameters)){
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
    return;
  }
  if(!data['e'].includes(e5)){
    res.send(JSON.stringify({ message: 'That e5 doesnt exist', success:false }));
    return;
  }
  
  try{
    const web3 = data[e5]['url'] != null ? new Web3(data[e5]['web3'][data[e5]['url']]): new Web3(data[e5]['web3']);
    const { abi, address } = get_contract_abi_and_address_from_id(contract_id, e5)
    const focused_contract = new web3.eth.Contract(abi, address);
    const return_data = await focused_contract.methods[function_name](...parameters).call();
    
    record_request('/run_contract_call')
    res.send(JSON.stringify({ message: 'Call complete', return_data: return_data, success:true }));
  }
  catch(e){
    res.send(JSON.stringify({ message: 'Something went wrong', error: e.toString(), success:false }));
  }
});

/* endpoint for obtaining the price info for specified tokens */
app.get(`/${endpoint_info['token_price']}`, async (req, res) => {
  const token_ids = req.query.token_ids;
  const from = req.query.from;
  const to = req.query.to;

  /*
    example:
    token_ids ---> ['E25:10032', 'E25:54039', 'E35:22019', 'E25:100293']
    
    //invalid values wont be processed
  */

  const rate_limit_results = ip_limits(req.ip)
  if(rate_limit_results.success == false){
    return res.status(429).json({ message: rate_limit_results.message});
  }
  try{
    if(token_ids == null || Array.isArray(token_ids) || isNaN(from) || isNaN(to)){
      res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
      return;
    }
    else if(token_ids.length > 100){
      res.send(JSON.stringify({ message: 'You can only check up to 100 tokens', success:false }));
      return;
    }
    const return_data = await calculate_price_info_for_specified_tokens(token_ids, from, to)
    const string_obj = JSON.stringify(return_data, (_, v) => typeof v === 'bigint' ? v.toString() : v)
    record_request('/token_price')
    res.send(string_obj);
  }catch(e){
    console.log(e)
    res.send(JSON.stringify({ message: 'Invalid arg string', success:false }));
  }

});








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
  console.log(`Back-ups for the node's data are stored periodically. Make sure to keep that nitro key safe incase you need to reboot the node.`)
  console.log('')
  console.log('')
  console.log('')

  get_list_of_server_files_and_auto_backup()
  record_https_certificate_info()
  record_public_key_for_use()

  setTimeout(function() {
    log_error({stack: `~~~~~~~~~~~~~~~~~~~~ Node rebooted on ${new Date(start_up_time)} ~~~~~~~~~~~~~~~~~~~~`});
    set_up_file_watch_times()
    set_up_ssh_login_requests()
  }, (5 * 1000));
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
//npm install tweetnacl

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
// app.listen(4000, when_server_started); <-------- use this if youre testing, then comment out 'options'
https.createServer(options, app).listen(HTTPS_PORT, when_server_started);

setInterval(attempt_loading_failed_ecids, 53*60*1000)
setInterval(load_events_for_all_e5s, 2*60*1000);
setInterval(store_back_up_of_data, 2*60*60*1000);
setInterval(store_hashes_in_file_storage_if_memory_full, 2*60*1000);
setInterval(start_update_storage_payment_information, 2*60*1000);
setInterval(backup_event_data_if_large_enough, 2*60*1000)
setInterval(delete_old_backup_files, 2*60*60*1000)
setInterval(backup_stream_count_data_if_large_enough, 32*24*60*60*1000)
setInterval(reset_ip_access_timestamp_object, 5*60*60*1000)
setInterval(start_update_storage_renewal_payment_information, 2*60*1000)
setInterval(delete_unrenewed_files, 7*24*60*60*1000)
setInterval(clear_rate_limit_info, 5*60*1000)
setInterval(record_ram_rom_usage, 5*60*1000)
setInterval(delete_older_ram_rom_usage_stats, 30*24*60*60*1000)
setInterval(delete_older_request_stats, 30*24*60*60*1000)
setTimeout(update_logStream, milliseconds_till_midnight());
setInterval(write_block_number, 11*1000)
setInterval(stash_old_trends_in_cold_storage, 30*24*60*60*1000)
setInterval(trim_block_record_data, 3*24*60*60*1000)



set_up_error_logs_filestream()
schedule_certificate_renewal()



// Catch termination signals
process.on('SIGINT', () => when_server_killed('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => when_server_killed('SIGTERM')); // kill
process.on('SIGHUP', () => when_server_killed('SIGHUP'));   // terminal closed

// Catch normal exit
process.on('exit', (code) => {
  console.log(`\nProcess exited with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  log_error(err)
});