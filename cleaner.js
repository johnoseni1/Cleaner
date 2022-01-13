var settings = require('./lib/settings');
var lib = require('./lib/wallet.js');

// displays usage and exits
function usage() {
  console.log('Usage: node cleanup.js [address] [maxAmount]');
  console.log('');
  process.exit(0);
}

var address = '';
var maxAmount = 0;
var restrictAmount = false;

var COIN = 100000000;
var FEE = settings.fee;

// check arguments
if (process.argv.length < 3) {
  usage();
} else {
  address = process.argv[2];
}

if (process.argv.length > 3) {
  maxAmount = process.argv[3];
  restrictAmount = true;
}

// wallet daemon
var rpc = lib.connect(settings.wallet);

// validate address
lib.verify_address(rpc, address, function(isValid) {
  if (isValid === true) {
    // list unspent for specified address
    var txCount = 0;
    var txs = [];
    var total = 0;
    rpc.listUnspent(10, function(err, res){
      for (var i = 0; i < res.length; i++) {
        if (res[i].address === address && txCount < settings.maxInputs) {
          if (res[i].amount < maxAmount || restrictAmount === false) {
            txCount += 1;
            txs.push({txid: res[i].txid, vout: res[i].vout});
            total = total + (res[i].amount * COIN);
          }
        }
        if (i === res.length - 1) {
          var obj = {};
          obj[address] = ((total - FEE) / COIN);
          rpc.createRawTransaction(txs, obj, function(err, hex){
            if (err) {
              console.log(err);
              process.exit(0);
            } else {
              rpc.signRawTransaction(hex, function(err, signedtx){
                if (err) {
                  console.log(err);
                } else {
                  rpc.sendRawTransaction(signedtx.hex, function(err, txid) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log(txid);
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  } else {
    console.log('Invalid Address');
    process.exit(0);
  }
});
