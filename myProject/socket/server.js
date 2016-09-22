var Hapi = require ('hapi');
var server = new Hapi.Server();
var io = require('socket.io')(server.listener);

server.register(require('inert'),function(err){
	if(err)
	{
		throw(err);
	}
	server.route({
		method:'GET',
		path:'/',
		handler: function(request,reply){
			reply.file('index.html');
		}
	});
	server.start(function(){
		console.log('server started at:' + server.info.uri);
	});
});
var count = 0;
io.on('connection',function(socket){
	socket.emit('count',{count:count});
	socket.on('increase',function(data){
		data.count++;
	});
});


