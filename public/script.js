var socketprot = 'ws'
if (window.location.protocol == 'https:') socketprot = 'wss';

var socket = new WebSocket(`${socketprot}://${window.location.host}/`);

function submit() {
  var texto = document.getElementById('field-message').value;
  var legenda = document.getElementById('field-caption').value;
  document.getElementById('btn-submit').innerHTML = '<i class="fa fa-spinner fa-spin"></i> Postando...';
  document.getElementById('btn-submit').setAttribute('disabled', 'true');
  var message = {
    text: texto,
    caption: legenda
  }
  socket.send(JSON.stringify(message));
}

socket.onclose = function(event) {
  location.reload();
}

socket.onmessage = function (event) {
  var message = JSON.parse(event.data);
  if (message.link) location.href = message.link;
}
