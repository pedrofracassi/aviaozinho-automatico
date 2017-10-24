const Canvas = require('canvas-prebuilt');
const Instagram = require('instagram-private-api').V1;
const utils = require('./utils.js');
const gradientsFile = require('./public/gradients.js');
const path = require('path');
const pngToJpeg = require('png-to-jpeg');
const fs = require('fs');
const express = require('express');
const WebSocket = require('ws');
const device = new Instagram.Device('someuser');
const storage = new Instagram.CookieFileStorage(__dirname + '/cookies.json');

const staticPath = path.join(__dirname, '/public');
const port = process.env.PORT || 8080;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const server = express().use(express.static(staticPath)).listen(port, function() {
  console.log('Listening on port ' + port);
});
const wss = new WebSocket.Server({ server });
const forbidden_words = [
  'fudidolly',
  'fudidoly'
]
Canvas.registerFont('.fonts/Arial-Black.ttf', {family: 'Arial Black'});

// Creat image directory if it doesen't exist yet
var imagedir = './images'
if (!fs.existsSync(imagedir)) fs.mkdirSync(imagedir);
var jpgdir = './images/jpg'
if (!fs.existsSync(jpgdir)) fs.mkdirSync(jpgdir);
console.log(gradientsFile);
var gradients = gradientsFile.gradients;

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    var json = JSON.parse(message);
    if (json.text && json.caption) {
      console.log(json);
      postMessage(json.text, json.caption, json.gradient, message => {
        console.log(message);
        ws.send(JSON.stringify(message));
      });
    }
  });
});

function postMessage(text, caption, gradient, callback) {
  if (!(new RegExp(forbidden_words.join("|")).test(text.toLowerCase()))) {
    const canvas = new Canvas(1080, 1080);
    const ctx = canvas.getContext('2d');
    var grd = ctx.createLinearGradient(0,0,1080,1080);
    grd.addColorStop(0, gradient[0]);
    grd.addColorStop(1, gradient[1]);
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,1080,1080);
    ctx.fillStyle = "white";
    utils.paint_centered_wrap(canvas, 0, -30, canvas.width, canvas.height, text, 55, 10);
    var randomString = Math.random().toString(36).substr(2, 6);
    var filePath = "./images/jpg/" + randomString + ".jpg";
    fs.readFile(__dirname + '/logo-simple.png', function(err, data) {
      if (err) {
        var message = {
          success: false,
          error: err
        }
        callback(message)
      } else {
        var img = new Canvas.Image;
        img.src = data;
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "#111111";
        ctx.rect(0,0,1080,125);
        ctx.fill();
        ctx.globalAlpha = 1;
        var logoX = (canvas.width / 2) - (img.width / 2);
        ctx.drawImage(img, logoX, 10, img.width, img.height);
        pngToJpeg({quality: 100})(canvas.toBuffer()).then(jpgOutput => {
          fs.writeFile(filePath, jpgOutput, () => {
            Instagram.Session.create(device, storage, username, password).then(function(session) {
              Instagram.Upload.photo(session, filePath).then(function(upload) {
                return Instagram.Media.configurePhoto(session, upload.params.uploadId, caption);
              }).then(function(medium) {
                fs.unlinkSync(filePath);
                var message = {
                  success: true,
                  link: medium._params.webLink
                }
                callback(message);
              });
            });
          });
        });
      }
    });
    console.log("teste");
  } else {
    var message = {
      success: false,
      error: "Devido a acontecimentos recentes, a palavra <strong>Fudidolly</strong> foi bloqueada."
    }
    callback(message)
  }
}
