var wallet = require('bitcoin');
var g_rpc;

module.exports = {
/*
  purpose: establish connection to wallet daemon
  returns: rpc object used by other functions in this library
  rpcparams: { host: <string>, port: <int>, user: <string>, pass: <string>}
*/
  connect: function(rpcparams) {
    var rpc = new wallet.Client({
      host: rpcparams.host,
      port: rpcparams.port,
      user: rpcparams.user,
      pass: rpcparams.pass
    });
    g_rpc = rpc;
    return (rpc);
  },

  get_connection: function() {
    return (g_rpc);
  },

/*
  purpose: verify whether an address is a valid Jumbucks address
  routes: POST '/api/v1/validate/jbs/:address'
  results: { valid: <boolean> }
  address: <string>
*/
  verify_address: function(rpc, address, cb) {
    rpc.validateAddress(address, function(err, res){
      if (err) {
        return cb(false);
      } else {
        if (res.ismine === true && res.isvalid === true) {
          return cb(true);
        } else {
          return cb(false);
        }
      }
    });
  }
};
