var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 8080;
var crypto = require('crypto');
var md5 = require('md5');
var MongoClient = require('mongodb').MongoClient;
var MongoUsersCollection;
var MongoCharsCollection;
var MongoChatCollection;
var world = require('good-old-days-main/world');


var seaLevel = -1.5;
var beachLevel = -1.4;
var grassLevel = -1;
var snowCapLevel = 1.65;

var forestsNames = ["Highrise", "Fire", "Frost", "Dread", "Great", "Dark", "Mist", "Neverending", "Severn", "Soven", "Spider", "Bear", "Wolf", "Owl", "Styx", "Elven", "Dwarven", "Mythical", "Central"];
var mineralTypes = ["Iron", "Copper", "Silver", "Gold", "Mercury", "Tin", "Aluminium", "Coal"];
var fieldTypes = [
    {name : "Camomile", category : "herbs", expand : 2, probabilityMultipler : 3, lowerAltLimit : beachLevel, upperAltLimit : snowCapLevel},
    {name : "Mint", category : "herbs", expand : 2, probabilityMultipler : 2, lowerAltLimit : beachLevel, upperAltLimit : snowCapLevel},
    {name : "Basil", category : "herbs", expand : 2, probabilityMultipler : 2, lowerAltLimit : beachLevel, upperAltLimit : snowCapLevel},
    {name : "Wheat", category : "crops", expand : 3, probabilityMultipler : 4, lowerAltLimit : beachLevel, upperAltLimit : 999},
    {name : "Hop", category : "crops", expand : 2, probabilityMultipler : 2, lowerAltLimit : beachLevel, upperAltLimit : 999},
    {name : "Carrot", category : "vegetables", expand : 1, probabilityMultipler : 1, lowerAltLimit : beachLevel, upperAltLimit : snowCapLevel},
    {name : "Cabbage", category : "vegetables", expand : 1, probabilityMultipler : 1, lowerAltLimit : beachLevel, upperAltLimit : snowCapLevel},
    {name : "Amanita Alba", category : "mushrooms", expand : 1, probabilityMultipler : 1, lowerAltLimit : beachLevel, upperAltLimit : snowCapLevel},
    {name : "Amanita Mortem", category : "mushrooms", expand : 1, probabilityMultipler : 1, lowerAltLimit : beachLevel, upperAltLimit : snowCapLevel},
    {name : "Wild Apple", category : "fruit", expand : 3, probabilityMultipler : 3, lowerAltLimit : grassLevel, upperAltLimit : snowCapLevel},
    {name : "Olive", category : "fruit", expand : 3, probabilityMultipler : 1, lowerAltLimit : grassLevel, upperAltLimit : snowCapLevel},
    {name : "Mountain Berries", category : "berries", expand : 1, probabilityMultipler : 1, lowerAltLimit : grassLevel, upperAltLimit : 999},
    {name : "Strawberries", category : "berries", expand : 1, probabilityMultipler : 2, lowerAltLimit : grassLevel, upperAltLimit : snowCapLevel}
];

var wildlife = [
	{name : "Sparrow", population : "high", altRange : [beachLevel, 999], type : "flying", physique : "very light", travelSpeed : "very fast", attitude : ["cowardly"], attractedTo: ["berries"]},
	{name : "Pidgeon", population : "high", altRange : [beachLevel, 999], type : "flying", physique : "very light", travelSpeed : "very fast", attitude : ["cowardly"], attractedTo: ["berries", "crops"]},
	{name : "Vulture", population : "low", altRange : [beachLevel, 999], type : "flying", physique : "light", travelSpeed : "very fast", attitude : ["scavenger"], attractedTo: ["wildlife", "death"]},
	{name : "Eagle", population : "low", altRange : [beachLevel, 999], type : "flying", physique : "light", travelSpeed : "very fast", attitude : ["predator"], attractedTo: ["wildlife", "very light", "light"]},
	{name : "Hare", population : "high", altRange : [beachLevel, snowCapLevel], type : "ground", physique : "light", travelSpeed : "normal", attitude : ["cowardly"], attractedTo: ["berries", "vegetables"]},
	{name : "Rat", population : "very high", altRange : [beachLevel, snowCapLevel], type : "ground", physique : "very light", travelSpeed : "slow", attitude : ["cowardly", "hearding"], attractedTo: ["berries", "vegetables", "crops"]},
	{name : "Mole", population : "high", altRange : [beachLevel, grassLevel], type : "underground", physique : "very light", travelSpeed : "very slow", attitude : ["cowardly"], attractedTo: ["vegetables"]},
	{name : "Snake", population : "medium", altRange : [beachLevel, grassLevel], type : "ground", physique : "very light", travelSpeed : "very slow", attitude : ["predator", "defensive"], attractedTo: ["wildlife", "very light", "light"]},
	{name : "Coyote", population : "medium", altRange : [beachLevel, snowCapLevel], type : "ground", physique : "light", travelSpeed : "normal", attitude : ["predator", "hearding", "cowardly", "scavenger"], attractedTo: ["wildlife", "very light", "light", "medium", "death"]},
	{name : "Wolf", population : "low", altRange : [beachLevel, 999], type : "ground", physique : "medium", travelSpeed : "normal", attitude : ["predator", "hearding", "offensive in heard", "cowardly", "scavenger"], attractedTo: ["ground in heard", "wildlife", "very light", "light", "medium", "heavy in heard", "very heavy in heard"]},
	{name : "Wild Boar", population : "medium", altRange : [beachLevel, 999], type : "ground", physique : "heavy", travelSpeed : "normal", attitude : ["cowardly", "hearding", "defensive in heard", "cowardly"], attractedTo: ["fruit", "berries", "vegetables", "crops"]},
	{name : "Deer", population : "medium", altRange : [grassLevel, 999], type : "ground", physique : "heavy", travelSpeed : "fast", attitude : ["defensive"], attractedTo: ["fruit", "berries", "vegetables", "crops", "mushrooms"]},
	{name : "Bison", population : "low", altRange : [grassLevel, snowCapLevel], type : "ground", physique : "very heavy", travelSpeed : "normal", attitude : ["uninterested", "hearding", "cowardly when attacked"], attractedTo: ["vegetables", "crops"]},
	{name : "Horse", population : "high", altRange : [grassLevel, snowCapLevel], type : "ground", physique : "heavy", travelSpeed : "fast", attitude : ["hearding", "cowardly"], attractedTo: ["fruit", "vegetables", "crops"]},
	{name : "Brown Bear", population : "very low", altRange : [beachLevel, 999], type : "ground", physique : "very heavy", travelSpeed : "fast", attitude : ["predator", "defensive"], attractedTo: ["wildlife", "ground", "fruit", "berries"]}
];

var w = new world(128, seaLevel, beachLevel, grassLevel, snowCapLevel, forestsNames, mineralTypes, fieldTypes, wildlife, false, true, true, true);

var md5sum = crypto.createHash('md5');

function Player(id, socket) {
	this.socket = socket;
	this.user = '';
	this.id = id;
}

function PlayerShort(id, name, pos, vel, angle, charData) {
	this.id = id;
	this.name = name;
	this.pos = pos;
	this.vel = vel;
	this.angle = angle;
	this.charData = {};
}

function PlayerShortFromIdAndName(id, name) {
	return new PlayerShort(id, name, {x:0, y: 0, z:0}, {x:0, y: 0, z:0}, 0, {name: name});
}

function PlayerShortFromId(id) {
	return new PlayerShort(id, '', {x:0, y: 0, z:0}, {x:0, y: 0, z:0}, 0, {});
}

app.get('/', function(req, res){
  res.send(w.GetGridView());
});

var players = [];
var playersShort = [];

var playerPositions = [];

var messagesGeneral = [];
var messagesDevChat = [];
var messagesDevChatStoreList = [];

var db = null;

MongoClient.connect('mongodb://localhost:27017/serverdatabase', function(err, connecteddb){
	if(err){
		return;
	}
	db = connecteddb;
	MongoUsersCollection = db.collection("users");
	MongoCharsCollection = db.collection("chars");
	MongoChatCollection = db.collection("chats");
});

io.on('connection', function(socket) {
	
	var idNum = players.length;
	
	socket.on ('initialize', function() {
		for(var i=0; i<players.length+1; i++){
			if(players[i] == undefined || players[i] == null){
				idNum = i;
				break;
			}
		}
		var newPlayer = new Player(idNum, socket);
		players[idNum] = newPlayer;
		var newPlayerShort = PlayerShortFromId(idNum);
		playersShort[idNum] = newPlayerShort;
		
		socket.emit('chatMessages', {messages:messagesGeneral});
		socket.emit('chatMessages', {messages:messagesDevChat});
	});
	
	socket.on('disconnect', function(){
		players[idNum] = null;
		playersShort[idNum] = null;
		socket.broadcast.emit('playerDisconnected', {id: idNum});
	});
	
	socket.on ('register', function(data){
		var email = data.email;
		var user = data.user;
		var pass = data.pass;
		pass = md5(pass);
		var salt = crypto.randomBytes(32).toString('base64');
		pass = md5(pass + salt);
		var data = {
			_id: user,
			pass: pass,
			salt: salt,
			email: email
		};
		MongoUsersCollection.find({email : data.email}).toArray(function(err, items){
			if(err){
				console.log('Register Error:\n' + err);
			} else if(items.length > 0){
				socket.emit('register-message', {err: 1, message: "That email is already in use."});
			} else {
				MongoUsersCollection.insert(data, function(err, doc){
					if(err){
						if(err.code == 11000){
							socket.emit('register-message', {err: 2, message: "That username is already in use."});
						}
					} else {
						players[idNum].user = data._id;
						socket.emit('register-message', {success: 1, message: "Welcome " + data._id, user: data._id});
						socket.emit('playerData', {id: idNum, players: playersShort});
					}
				});
			}
		});
	});
	
	socket.on ('login', function(data){
		var user = data.user;
		var pass = data.pass;
		MongoUsersCollection.findOne({_id : user}, function(err, result){
			if(err){
				console.log('Login Error:\n' + err);
			} else {
				if(result == null){
					MongoUsersCollection.findOne({email:user}, function(err, result){
						if(err){
							console.log('Login Error:\n' + err);
						} else {
							if(result == null){
								socket.emit('login-message', {err: 2, message: "Username and/or password invalid."});
							} else {
								pass = md5(pass);
								var salt = result.salt;
								pass = md5(pass + salt);
								if(pass != result.pass){
									socket.emit('login-message', {err: 1, message: "Username and/or password invalid."});
								} else {
									//console.log(idNum);
									//console.log(players);
									players[idNum].user = result._id;
									user = result._id;
									socket.emit('login-message', {success: 1, message: "Welcome back " + user, user: user});
									socket.emit('playerData', {id: idNum, players: playersShort});
								}
							}
						}
					});
				} else {
					pass = md5(pass);
					var salt = result.salt;
					pass = md5(pass + salt);
					if(pass != result.pass){
						socket.emit('login-message', {err: 1, message: "Username and/or password invalid."});
					} else {
						players[idNum].user = user;
						socket.emit('login-message', {success: 1, message: "Welcome back " + user, user: user});
						socket.emit('playerData', {id: idNum, players: playersShort});
					}
				}
			}
		});
	});
	
	socket.on('listCharacters', function(data){
		MongoCharsCollection.find({owner : data.user}).toArray(function(err, items) {
			socket.emit('listCharacters', {chars : items});
		});
	});
	
	socket.on('initializeChar', function(charData){
		playersShort[idNum].name = charData.name;
		playersShort[idNum].pos = charData.pos;
		playersShort[idNum].angle = charData.angle;
		playersShort[idNum].charData = charData;
		socket.broadcast.emit('initializeNetworkChar', playersShort[idNum]);
		socket.emit('initializeOtherChars', {charData : playersShort});
	});
	
	socket.on('createNewChar', function(data){
		data._id = data.name;
		MongoCharsCollection.findOne({_id : data.name}, function(err, result){
			if(err) {
				console.log('Creating New Char Error:\n' + err);
			} else {
				if(result == null){
					MongoCharsCollection.insert(data, function(err, doc){
						if(err){
							if(err.code == 11000){
								socket.emit('error-message', {err: 3, message: "Character with that name already exists"});
							}
						} else {
							MongoCharsCollection.find({owner : data.user}).toArray(function(err, items) {
								socket.emit('listCharactersWithNewOne', {chars : items});
							});
						}
					});
				} else {
					socket.emit('error-message', {err: 3, message: "Character with that name already exists"});
				}
			}
		});
	});
	
	socket.on ('chatMessage', function(data) {
		if(data.channel){
			if(data.channel == -1){
				var newMessage = {user: data.user, message: data.message, channel:-1};
				if(messagesGeneral.length >= 100){
					messagesGeneral.splice(0,1);
				}
				messagesGeneral.push(newMessage);
				socket.broadcast.emit('chatMessage', newMessage);
				socket.emit('chatMessage', newMessage);
			} else if(data.channel == -2){
				var newMessage = {user: data.user, message: data.message, channel:-2};
				if(messagesDevChat.length >= 100){
					messagesDevChat.splice(0,1);
				}
				messagesDevChat.push(newMessage);
				messagesDevChatStoreList.push(newMessage);
				if(messagesDevChatStoreList.length >= 10){
					var devChatData = {};
					MongoChatCollection.findOne({_id:"devchat"}, function(err, result){
						if(err){
							devChatData = {_id:"devchat", rows:messagesDevChatStoreList};
							MongoChatCollection.insert(devChatData, function(err, doc){
								if(err){
									console.log('Chat Message Error:\n' + err);
								}
							});
						} else {
							devChatData = result;
							devChatData.rows.concat(messagesDevChatStoreList);
							MongoChatCollection.updateOne({_id:"devchat"}, devChatData);
						}
					});
					messagesDevChatStoreList = [];
				}
				socket.broadcast.emit('chatMessage', newMessage);
				socket.emit('chatMessage', newMessage);
			} else {
				for(var i=0; i<players.length; i++){
					if(players[i] && players[i].user == data.channel){
						var newMessage = {user: data.user, message: data.message, channel:data.channel};
						socket.emit('chatMessage', newMessage);
						players[i].socket.emit('chatMessage', newMessage);
						break;
					}
				}
			}
		} else {
			var newMessage = {user: data.user, message: data.message, channel:-1};
			messagesGeneral.push(newMessage);
			socket.broadcast.emit('chatMessage', newMessage);
			socket.emit('chatMessage', newMessage);
		}
	});
	
	socket.on ('playerPosition', function(data) {
		if(data) {
			if(playerPositions[idNum]){
				playerPositions[idNum].pos = data.pos;
				playerPositions[idNum].vel = data.vel;
				playerPositions[idNum].angle = data.angle;
			} else {
				playerPositions[idNum] = new PlayerShort(idNum, '', data.pos, data.vel, data.angle);
			}
		}
		socket.broadcast.emit('playerUpdate', data);
	});
});

//var Update = setInterval(function(){
	// var data = {
		// players: playerPositions
	// };
	// io.sockets.emit('update', data)
	// playerPositions = [];
// }, 100);

http.listen(port, function () {
  console.log('NodeJS started, listening on port: ' + port + '...');
});
