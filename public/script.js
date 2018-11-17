'use strict';
const messageArea = document.getElementById('message-area');
const messageInput = document.getElementById('message-input');
const submitButton = document.getElementById('submit-button');
var ws; // WebSocket

const connect = () => {
  ws = new WebSocket('ws:127.0.0.1:50000');

  ws.onopen = () => {
    appendMessage({
      msg: '接続完了',
      uid: 'システム',
      time: nowTime()
    });
  };

  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      data.msgs.forEach(msg => {
        appendMessage(msg);
      });
    } catch (err) {
      console.error(err);
    }
  };
};

const appendMessage = (msg) => {
  const time = new Date(msg.time * 1000);
  const msgElm = document.createElement('div');
  const textElm = document.createElement('div');
  const infoElm = document.createElement('div');
  const userElm = document.createElement('span');
  const timeElm = document.createElement('span');
  msgElm.classList.add('message');
  textElm.classList.add('message-text');
  textElm.textContent = msg.msg;
  infoElm.classList.add('message-info');
  userElm.classList.add('info-userid');
  userElm.textContent = msg.uid;
  timeElm.textContent = `${time.getHours()}:${('0' + time.getMinutes()).slice(-2)}:${('0' + time.getSeconds()).slice(-2)}`;
  timeElm.classList.add('info-time');
  infoElm.appendChild(userElm);
  infoElm.appendChild(timeElm);
  msgElm.appendChild(textElm);
  msgElm.appendChild(infoElm);
  messageArea.insertBefore(msgElm, messageArea.firstChild);
};

const nowTime = () => {
  return Math.round(new Date().getTime() / 1000);
};

connect();

submitButton.onclick = () => {
  ws.send(JSON.stringify({
    msg: messageInput.value
  }));
  messageInput.value = '';
};

messageInput.onkeypress = (ev) => {
  if (ev.keyCode !== 13 || (ev.keyCode === 13 && (ev.shiftKey === true || ev.ctrlKey === true || ev.altKey === true))) {
    return;
  }
  submitButton.click();
};