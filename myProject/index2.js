var Hapi = require ('hapi');
var server = new Hapi.Server();

server.connection({
	host:'localhost',
	port:5050,
});

server.route({
	method:'GET',
	path:'/',
	handler: function(request,reply){
		reply('Hiii all !!');
	}
});

server.start(function(){
	console.log('server started at:' + server.info.uri);
});
