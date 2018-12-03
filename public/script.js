'use strict';
const messageArea = document.getElementById('message-area');
const messageInput = document.getElementById('message-input');
const submitButton = document.getElementById('submit-button');
var ws;  // WebSocket

const connect = (url) => {
  ws = new WebSocket(url);

  ws.onopen = () => {};

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
  timeElm.textContent = `${time.getFullYear()}å¹´${time.getMonth() + 1}æœˆ${time.getDate()}æ—¥ ${time.getHours()}:${('0' + time.getMinutes()).slice(-2)}:${('0' + time.getSeconds()).slice(-2)}`;
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

connect('wss://kakudo.app/webchat/ws/');

messageInput.oninput = () => {
  if (messageInput.value.length > 0) {
    submitButton.style.color = '#FFF';
    submitButton.style.background = '#4CAF50';
    submitButton.style.cursor = 'pointer';
  } else {
    submitButton.style.color = '#000';
    submitButton.style.background = '#0002';
    submitButton.style.cursor = 'default';
  }
};

submitButton.onclick = () => {
  if (messageInput.value.length === 0) {
    return;
  }
  ws.send(JSON.stringify({
    msg: messageInput.value
  }));
  messageInput.value = '';
  submitButton.style.color = '#000';
  submitButton.style.background = '#0002';
  submitButton.style.cursor = 'default';
};

messageInput.onkeypress = (ev) => {
  if (ev.keyCode !== 13 || (ev.keyCode === 13 && (ev.shiftKey === true || ev.ctrlKey === true || ev.altKey === true))) {
    return;
  }
  submitButton.click();
};