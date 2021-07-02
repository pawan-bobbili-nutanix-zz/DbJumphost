let client;
module.exports = function () {
    return new Promise( (resolve, reject) => {
        var pg = require('pg'),
            ssh2 = require('ssh2');
        var pgHost = '{hostname}', //  remote aws pg hostname
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
          host : '{jumphost ip address}',
          port : '{jumpost port in number only}',
          username : '{username in key}',
          privateKey : require('fs').readFileSync('{location/to/private/key}')
        });
        c.on('connect', function() {
          console.log('Connection :: connect');
        });
        c.on('ready', function() {
            ready = true;
            var conString = 'postgres://{username}:{password}@127.0.0.1:' + proxyPort + '/{dbName}';
            client = new pg.Client(conString);
            client.connect(async function(err) {
                if(err) {
                  console.log('ERROR', err);
                  return reject(err);
                }
                resolve(client);
            });
        });
    });
};
