const Canvas = require('canvas');
const opentype = require('opentype.js');
const Instagram = require('instagram-private-api').V1;
const utils = require('./utils.js');
const path = require('path');
const pngToJpeg = require('png-to-jpeg');
const fs = require('fs');
const express = require('express');
const WebSocket = require('ws');
const device = new Instagram.Device('someuser');
const storage = new Instagram.CookieFileStorage(__dirname + '/cookies/aviaozinho_oficina.json');

const staticPath = path.join(__dirname, '/public');
const port = process.env.PORT || 8080;
const server = express().use(express.static(staticPath)).listen(port, function() {
  console.log('Listening on port ' + port);
});
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    var json = JSON.parse(message);
    if (json.text && json.caption) {
      console.log(json);
      postMessage(json.text, json.caption, link => {
        console.log(link);
        ws.send(JSON.stringify({link: link}));
      });
    }
  });
});

function postMessage(text, caption, callback) {
  const canvas = new Canvas(1080, 1080);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  utils.paint_centered_wrap(canvas, 0, 0, 1080, 1080, text, 72, 2);
  var randomString = Math.random().toString(36).substr(2, 6);
  var filePath = "./images/jpg/" + randomString + ".jpg";
  pngToJpeg({quality: 90})(canvas.toBuffer()).then(jpgOutput => {
    fs.writeFile(filePath, jpgOutput, () => {
      Instagram.Session.create(device, storage, 'aviaozinho_oficina', '49177083').then(function(session) {
        Instagram.Upload.photo(session, filePath).then(function(upload) {
          return Instagram.Media.configurePhoto(session, upload.params.uploadId, caption);
        }).then(function(medium) {
          fs.unlinkSync(filePath);
          callback(medium._params.webLink);
        });
      });
    });
  });
}
