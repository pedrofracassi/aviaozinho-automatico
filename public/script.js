var socketprot = 'ws'
if (window.location.protocol == 'https:') socketprot = 'wss';

var socket = new WebSocket(`${socketprot}://${window.location.host}/`);
const expression = /(?:@)([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)/g;
const url = "https://www.instagram.com/web/search/topsearch/?context=blended&query="

var currentGradient = 0;
var active = false;

function submit() {
  var texto = document.getElementById('field-message').value;
  var legenda = document.getElementById('field-caption').value;
  active=true;
  if(legenda == '') legenda = 'Sem descrição.';
  document.getElementById('btn-submit').innerHTML = '<i class="fa fa-spinner fa-spin"></i> Postando...';
  document.getElementById('btn-submit').setAttribute('disabled', 'true');
  document.getElementById('field-message').setAttribute('disabled', 'true');
  document.getElementById('field-caption').setAttribute('disabled', 'true');
  var message = {
    text: texto,
    caption: legenda,
    gradient: gradients[currentGradient]
  }
  socket.send(JSON.stringify(message));
}

socket.onclose = function(event) {
  location.reload();
}

socket.onmessage = function (event) {
  var message = JSON.parse(event.data);
  console.log(event.data);
  if (message.success) {
    if (message.link) location.href = message.link;
  } else {
    document.getElementById('errorbox').innerHTML = message.error;
    document.getElementById('errorbox').setAttribute('style', 'display: block');
  }
}

function changeClass() {
  if(active==false) {
    $('#picker li').removeClass('active');
    $(this).addClass('active');
    currentGradient = $(this).attr('data-gradient-id');
    update();
  }
}

$('#picker li').on('click', changeClass);
