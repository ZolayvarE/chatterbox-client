//-------------------------------------------------------------------//
// Message Filter & Hacker Punisher                                  //
//-------------------------------------------------------------------//
// This guarantess that messages appended to the DOM aren't 
// 100% totally stupid garbage.
// 
// I\'m not even frustrated.
var zxc = window.localStorage;

if (zxc.foo === undefined) { zxc.foo = JSON.stringify({}); }

var p = function (input) { return JSON.parse(input); }
var s = function (input) { return JSON.stringify(input); }

var deliverRetribution = function (obj) {
  var key = obj.username + '' + obj.text;
  var temp = p(zxc.foo);
  if (!temp[key]) {
    temp[key] = key;
    newObj = {};
    if (obj.username === 'Anonymous') {
      newObj.name = "Someone coward who wouldn't name themselves"
    } else {
      newObj.username = obj.username;
    }
    newObj.roomname = obj.roomname;
    newObj.text = randInsult();
    app.send(newObj);
    console.log('Wrist Slapped!')
    zxc.foo = s(temp);
  }
};

var randInsult = function () {
  var insultArray = [
    'I\'m a stupid mouthbreather!',
    'I am just a complete waste of space!',
    'I know I am a bad person, and I genuinely don\'t care!',
    'The world would ACTUALLY be a better place without me!',
    'I hate myself, and the only way to express it is to be a jerk!',
    'I am insecure and I act out in the hope that someone one notices me!',
    'I wish even a single person would love me!',
    'I LITERALLY eat garbage!',
    'I wet myself until I was 18 years old!'
  ];
  return insultArray[Math.floor(Math.random() * insultArray.length)];  
};

var sterilize = function (messageObject) {
  messageObject.username = messageObject.username || 'Anonymous';
  messageObject.roomname = messageObject.roomname || 'Lobby';
  if (messageObject.text === undefined) { return false; };
  if (messageObject.username === 'shawndrost') { return false; }
  if (messageObject.text.slice(0, 4).toUpperCase() === 'TROL') { return false; }
  if (messageObject.username === 'Mel Brooks') { return false; }
  if (messageObject.text === '') { return false; }
  
  if (messageObject.username.indexOf('<script') !== -1) {
    messageObject.username = "Someone coward who wouldn't name themselves"
    deliverRetribution(messageObject);
    return false;
  ;}

  if (messageObject.username.indexOf('<img') !== -1) {
    messageObject.username = "Someone coward who wouldn't name themselves"
    deliverRetribution(messageObject);
    return false;
  ;}

  if (messageObject.text.indexOf('<script') !== -1) {
    deliverRetribution(messageObject);
    return false;
  ;}

  if (messageObject.text.indexOf('<img') !== -1) {
    deliverRetribution(messageObject);
    return false;
  ;}

 
  if (messageObject.roomname.indexOf('<script') !== -1) {
    deliverRetribution(messageObject);
    return false;
  ;}

  if (messageObject.roomname.indexOf('<img') !== -1) {
    deliverRetribution(messageObject);
    return false;
  ;}

  return true;
};

//===================================================================//


//-------------------------------------------------------------------//
// Server Interfacer                                                 //
//-------------------------------------------------------------------//
var app = {
  init: function () {},
  server: 'https://api.parse.com/1/classes/messages',

  // Sends a pre-made message object to the server.
  send: function (message) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },

  // Should intelligently generate a message object given
  // a text string.
  _send: function (input) {
    var message = {
      username: window.location.search.slice(10),
      text: input,
      roomname: 'test'
    };
    app.send(message);
  },

  // Gets messages from the server sterilizes them, and uses 'addMessage'
  // to append them to the DOM.
  fetch: function () {
    $.ajax({
      url: app.server,
      type: 'GET',
      contentType: 'application/json',
 
      dataFilter: function (data, dataType) {
        var dataObject = JSON.parse(data);
        window.test = dataObject;
        var filtered = {};
        
        filtered.results = _.filter(dataObject.results, function (x) {
          return sterilize(x);
        });
        return JSON.stringify(filtered);
      },

      success: function (data) {
        $('#chats').empty();
        data.results.forEach(function (x) {
          app.addMessage(x);
        });
      },
    
      error: function (data) {
        console.error('chatterbox: Failed to get anything', data);
      }
    });
  },

  // Removes all posted messages from the DOM.
  clearMessages: function () {
    var targets = $('#chats').children().remove();
  },

  // Takes in a message Obj
  addMessage: function (messageObj, id) {
    var post = $('<div class="chat" id=' + messageObj.objectId + '></div>');
    var user = $('<div class="username">' + messageObj.username + '</div>');
    var message = $('<div class="messageText">' + messageObj.text + '</div>');
    app.addRoom(messageObj.roomname);
    post.prepend(user);
    post.append(message);
    $('#chats').append(post);
  },

  addRoom: function (roomId) {
    roomName = roomId.toUpperCase();
    roomId = roomName.split(' ').join('_');
    var room = $('<option id=' + roomId + ' value=' + roomId + '>' + roomName + '</option>');
    if (!document.getElementById(roomId)) {
      $('#selector').append(room);
    }
  },

  addFriend: function () {

  }
};
//===================================================================//

//-------------------------------------------------------------------//
// Event Listeners                                                   //
//-------------------------------------------------------------------//

$(document).ready(function () {
  app.fetch();
  window.grabMessages = setInterval(function () {
    return app.fetch();
  }, 3000);
})








//===================================================================//