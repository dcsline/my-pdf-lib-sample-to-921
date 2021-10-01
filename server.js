const app = require('./app');
const client = require('socket.io').listen(3333).sockets
const http = require('http');

http.createServer(app).listen(4444);  //process.env.PORT);
