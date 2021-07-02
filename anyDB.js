const Q = require('q');
let client;

module.exports = async function () {
    const defer = Q.defer();
    var pg = require('pg'),
        ssh2 = require('ssh2');
    var pgHost = '', // remote aws pg hostname
        pgPort = 5432,
        proxyPort = 9090,
        ready = false;
    var proxy = require('net').createServer(function(sock) {
        if (!ready)
          return sock.destroy();
        c.forwardOut(sock.remoteAddress, sock.remotePort, pgHost, pgPort, function(err, stream) {
          if (err)
            return sock.destroy();
          sock.pipe(stream);
          stream.pipe(sock);
        });
    });
    proxy.listen(proxyPort, '127.0.0.1');
    var c = new ssh2();
    c.connect({
      host : '{jumphost server ip address}',
      port : 22,
      username : '{username in key}',
      privateKey : require('fs').readFileSync('{./location/to/privatekey}')
    });
    c.on('connect', function() {
      console.log('Connection :: connect');
    });
    c.on('ready', function() {
        ready = true;
        var conString = 'postgres://{username}:{password}@127.0.0.1:' + proxyPort + '/{database name}';
        client = new pg.Client(conString);
        client.connect(async function(err) {
            if(err) {
              console.log('ERROR', err);
              return defer.reject(err);
            }
            defer.resolve(client);
        });
    });
    return defer.promise;
};
