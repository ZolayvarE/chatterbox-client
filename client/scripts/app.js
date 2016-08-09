//-------------------------------------------------------------------//
// Message Filter & Hacker Punisher                                  //
//-------------------------------------------------------------------//
// This guarantess that messages appended to the DOM aren't 
// 100% totally stupid garbage.
// 
// I'm not even frustrated.
var zxc = window.localStorage;

if (zxc.foo === undefined) { zxc.foo = JSON.stringify({}); }

var p = function (input) { return JSON.parse(input); }
var s = function (input) { return JSON.stringify(input); }

var deliverRetribution = function (obj) {
  var key = obj.username + '' + obj.objectId;
  var temp = p(zxc.foo);
  if (!temp[key]) {
    temp[key] = true;
    newObj = {};
    newObj.username = obj.username;
    newObj.roomname = 'Known XSSers';
    newObj.text = randInsult();
    app.send(newObj);
    console.log('Wrist Slapped!');
    console.log(obj);
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
  
  if (messageObject.username.toUpperCase().indexOf('<SCRIPT') !== -1) {
    messageObject.username = "An XSSer";
    // deliverRetribution(messageObject);
    return false;
  };

  if (messageObject.username.toUpperCase().indexOf('<IMG') !== -1) {
    messageObject.username = "An XSSer";
    // deliverRetribution(messageObject);
    return false;
  };

  if (messageObject.text.toUpperCase().slice(0,7) === '<SCRIPT') {
    // deliverRetribution(messageObject);
    return false;
  };

  if (messageObject.text.toUpperCase().slice(0,4) === '<IMG') {
    // deliverRetribution(messageObject);
    return false;
  };

  if (messageObject.text.toUpperCase().indexOf('<SCRIPT') !== -1) {
    // deliverRetribution(messageObject);
    return false;
  };

  if (messageObject.text.toUpperCase().indexOf('<IMG') !== -1) {
    // deliverRetribution(messageObject);
    return false;
  };

 
  if (messageObject.roomname.toUpperCase().indexOf('<SCRIPT') !== -1) {
    // deliverRetribution(messageObject);
    return false;
  };

  if (messageObject.roomname.toUpperCase().indexOf('<IMG') !== -1) {
    // deliverRetribution(messageObject);
    return false;
  };

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
    var room = $('#selector').val();
    if (room === 'chat') {
      room = 'LOBBY';
    }
    var message = {
      username: window.location.search.slice(10),
      text: input,
      roomname: room
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
        window.unfiltered = dataObject;
        var filtered = {};
        
        filtered.results = _.filter(dataObject.results, function (x) {
          return sterilize(x);
        });
        return JSON.stringify(filtered);
      },

      success: function (data) {
        window.filtered = data;
        // var numBlocked = window.unfiltered.results.length - window.filtered.results.length;
        // console.log('Messages fetched!\n' + numBlocked + ' message(s) blocked!');
        // if(numBlocked === 0 && zxc.foo.length !== 0) {
        //   zxc.clear();
        //   zxc.foo = s({});
        // }
        $('#chats').empty();
        data.results.forEach(function (x) {
          app.addMessage(x);
        });
        filterRooms();
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
    var post = $(
      '<div class="chat ' + messageObj.roomname.split(' ').join('_').toUpperCase() + '" id=' + messageObj.objectId + '></div>');
    var user = $('<div class="username"></div>');
    var message = $('<div class="messageText"></div>');
    var messageText = document.createTextNode(messageObj.text);
    var userText = document.createTextNode(messageObj.username);
    app.addRoom(messageObj.roomname);
    post.prepend(user);
    post.append(message);
    user.append(userText);
    message.append(messageText);
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

  $('#submit').keypress(function (e) {
    if (e.which === 13) {
      e.preventDefault;
      if (this.value !== '') {
        app._send(this.value);
        this.value = '';
      }
    }
  })

  $('#selector').change(function () {
    $('.chat').css('display', 'none');
    console.log(this.value);
    $('.' + this.value).css('display', 'block');
  });

  var button = $('<button>Submit</button>');
  button.css({
    float: 'right',
    'font-size': '12px'
  })
  button.click(function () {
    var msg = $('#submit').val();
    if (msg !== '') {
      app._send(msg);
      $('#submit').val('');
    }
  })
  $('#main').append(button);

  $('#makeRoom').click(function () {
    if (room !== '') {
      var room = $('#roomMaker').val().toUpperCase();
      app.addRoom(room);
      $('#selector').val(room.split(' ').join('_'));
      filterRooms();
    }
  })
  
})

var filterRooms = function () {
  var room = $('#selector').val();
  $('.chat').css('display', 'none');
  $('.' + room).css('display', 'block');
}

//===================================================================//




var searchFor = function (string, obj) {
  var all = obj.results;
  var results = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].text !== undefined && all[i].text.indexOf(string) !== -1) {
      results.push(all[i]);
    }
  }
  return results;
}



