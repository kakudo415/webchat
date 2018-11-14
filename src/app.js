const http = require('http');
const fs = require('fs');
const wsServer = require('ws').Server;
const server = new wsServer({
  port: 50001
});
let lastID = 0;
let msgHistory = new Array;

http.createServer((req, res) => {
      fs.readFile('client.html', (err, data) => {
        if (err) {
          res.end(404);
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html'
          });
          res.end(data);
        }
      });
    })
    .listen(50000);

server.on('connection', (ws) => {
  ws.userID = lastID++;
  ws.send(JSON.stringify(msgHistory), (err) => {
    if (err) {
      ws.close();
    }
  });

  ws.on('message', (message) => {
    const time = new Date();
    let data = {
      user: ws.userID,
      time: `${time.getFullYear()}/${time.getMonth()}/${time.getDate()} ${time.getHours()}:${time.getMinutes()}`
    };
    try {
      let post = JSON.parse(message).message;
      if (typeof post !== 'string') {
        throw 'not string'
      }
      if (post.length > 1000) {
        throw 'too long';
      }
      data.message = post;
    } catch (err) {
      if (err === 'too long') {
        data.message = '1000文字超えたらあかんで！！';
      } else if (err === 'not string') {
        data.message = 'ちゃんと文字データ送信せぇ！';
      } else {
        data.message = '自分なんか変なもん送ったやろ？';
      }
    }
    broadcast([data]);
    msgHistory.push(data);
  });

  ws.on('close', () => {});
});

const broadcast = (msg) => {
  server.clients.forEach((client) => {
    client.send(JSON.stringify(msg), (err) => {
      if (err) {
        client.close();
      }
    });
  });
}