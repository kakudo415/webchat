const shortid = require('shortid');
const wsServer = require('ws').Server;

const server = new wsServer({
  port: 50000,
  maxPayload: 10000
});
const msgQueue = {
  msgs: []
};
const msgHistory = [];
const accessTime = {};

server.on('connection', (ws) => {
  ws.userID = shortid.generate();
  ws.send(JSON.stringify({
    msgs: [{
      msg: '接続完了',
      uid: 'システム',
      time: nowTime()
    }].concat(msgHistory)
  }, null, 2));

  ws.on('message', (msg) => {
    if (isTooEarly(ws.userID)) {
      return;
    }
    accessTime[ws.userID] = nowTime();
    let data;
    try {
      data = JSON.parse(msg).msg;
      if (typeof data !== 'string') {
        throw 'not string';
      }
      if (data.length > 1000) {
        throw 'too long';
      }
      if (data.length === 0) {
        throw 'too short';
      }
    } catch (err) {
      switch (err) {
        case 'not string':
          data = 'ちゃんと文字列データ送って！';
          break;
        case 'too long':
          data = 'そんな長いの送らんといて！';
          break;
        case 'too short':
          data = '空のデータ送るんちゃうわ！';
          break;
        default:
          data = 'データ構造間違えとるで！';
      }
      ws.send(JSON.stringify({
        msgs: [{
          msg: data,
          uid: ws.userID,
          time: nowTime()
        }]
      }, null, 2));
      return;
    }
    msgQueue.msgs.push({
      msg: data,
      uid: ws.userID,
      time: nowTime()
    });
    msgHistory.push({
      msg: data,
      uid: ws.userID,
      time: nowTime()
    });
  });

  ws.on('error', (err) => {
    console.error(`[ERROR WebSocket] ${err}`);
  });
});

const sendToEveryone = (msg) => {
  if (msgQueue.msgs.length == 0) {
    return;
  }
  server.clients.forEach((client) => {
    client.send(msg, (err) => {
      if (err) {
        console.error(`[ERROR Send] ${err}`);
      }
    });
  });
};

const isTooEarly = (userID) => {
  if (accessTime[userID]) {
    return (nowTime() - 1) < accessTime[userID];
  }
  return false;
};

const nowTime = () => {
  return Math.round(new Date().getTime() / 1000);
};

// 一秒ごとにまとめて送信
setInterval(() => {
  sendToEveryone(JSON.stringify(msgQueue, null, 2));
  msgQueue.msgs = [];
}, 1000);