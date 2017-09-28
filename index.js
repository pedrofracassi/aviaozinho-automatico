const Canvas = require('canvas-prebuilt');
const Instagram = require('instagram-private-api').V1;
const utils = require('./utils.js');
const path = require('path');
const pngToJpeg = require('png-to-jpeg');
const fs = require('fs');
const express = require('express');
const WebSocket = require('ws');
const device = new Instagram.Device('someuser');
const storage = new Instagram.CookieFileStorage(__dirname + '/cookies.json');

const staticPath = path.join(__dirname, '/public');
const port = process.env.PORT || 3000;
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

// Creat image directory if it doesen't exist yet
var imagedir = './images'
if (!fs.existsSync(imagedir)) fs.mkdirSync(imagedir);
var jpgdir = './images/jpg'
if (!fs.existsSync(jpgdir)) fs.mkdirSync(jpgdir);

// Load gradients file
var gradientsFile = fs.readFileSync('gradients.json', 'utf8');
var gradients = JSON.parse(gradientsFile).gradients;

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    var json = JSON.parse(message);
    if (json.text && json.caption) {
      console.log(json);
      postMessage(json.text, json.caption, message => {
        console.log(message);
        ws.send(JSON.stringify(message));
      });
    }
  });
});

function postMessage(text, caption, callback) {
  if (!(new RegExp(forbidden_words.join("|")).test(text.toLowerCase()))) {
    var gradient = gradients[Math.floor(Math.random() * gradients.length)];
    const canvas = new Canvas(1080, 1080);
    const ctx = canvas.getContext('2d');
    var grd = ctx.createLinearGradient(0,0,1080,1080);
    grd.addColorStop(0, gradient[0]);
    grd.addColorStop(1, gradient[1]);
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,1080,1080);
    ctx.fillStyle = "white";
    utils.paint_centered_wrap(canvas, 0, 0, 1080, 1080, text, 72, 2);
    var randomString = Math.random().toString(36).substr(2, 6);
    var filePath = "./images/jpg/" + randomString + ".jpg";
    fs.readFile(__dirname + '/logo.png', function(err, data) {
      if (err) {
        var message = {
          success: false,
          error: err
        }
        callback(message)
      } else {
        var img = new Canvas.Image;
        img.src = data;
        var logoX = (canvas.width / 2) - (img.width / 8);
        ctx.drawImage(img, logoX, 20, img.width / 4, img.height / 4);
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
  } else {
    var message = {
      success: false,
      error: "Devido a acontecimentos recentes, a palavra <strong>Fudidolly</strong> foi bloqueada."
    }
    callback(message)
  }
}
