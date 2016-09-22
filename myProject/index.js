var Hapi = require ('hapi');
var Path = require('path');
var mysql = require('mysql');
var inert = require('inert');
var server = new Hapi.Server();
server.connection({
	host:'localhost',
	port:5050,
});
var io = require('socket.io')(server.listener);
var connection = mysql.createPool({
	connectionLimit: 100,
	host:'localhost',
	user:'root',
	password:'akashdas',
	database:'se'
});
//connection.connect();

server.register([require('vision'),require('inert')],function(err){
	if(err)
	{
		throw(err);
	}
	/*server.route({
		method:'GET',
		path: '/',
		handler: function(request,reply){
			connection.query('select * from people',function(err,rows,fields){
				if(err){
					throw(err);
				}
				reply('The name is : '+rows[0].name);
			});
		}
	});*/
	server.route({
		method:'GET',
		path:'/js/{filename*}',
		handler: {
			directory: {
				path: 'templates/js',
				listing: true
			}
		}
	});
	server.route({
		method:'GET',
		path:'/css/{filename*}',
		handler: {
			directory: {
				path:'templates/css',
				listing:true
			}
		}
	});
	server.route({
		method:'GET',
		path:'/',
		handler: function(request,reply){
			reply.view('index');
		}
	});
	/*server.route({
		method:'GET',
		path:'/css/normalize.css',
		handler: function(request,reply){
			reply.view('normalize.css');
		}
	});
	server.route({
		method:'GET',
		path:'/css/style.css',
		handler: function(request,reply){
			reply.view('style.css');
		}
	});*/
	/*server.route({
		method:'GET',
		path:'/users/{username}',
		handler: function(request,reply){
			var name = encodeURIComponent(request.params.username);
			reply.view('user',{name: name} );
		}
	});*/
	
	server.views({
		engines:{
			html:require('handlebars'),
			//css: require('handlebars')
		},
		relativeTo: __dirname,
		path:'templates',
		//helpersPath: 'templates/js',
		//layoutPath: 'templates/css'
	});
	server.start(function(){
		console.log('server started at:' + server.info.uri);
	});
});
io.on('connection',function(socket){
	//socket.emit('count',{count:count});
	socket.on('insert',function(data){
		//console.log(data.temp);
		//var name=data.temp;
		//console.log(typeof(name));
		var query = connection.query("insert into logins(firstName,lastName,email,pass) values('"+data.firstName+"','"+data.lastName+"','"+data.email+"','"+data.password+"')",function(err,result){
			console.log(query.sql);
			if(err)
				throw err;
		socket.emit('success',{msg:'Registration successfull'});
		});
	//	io.sockets.emit('success',{msg:'signup successfull'});
	});
	socket.on('login_check',function(data){
		var loginid = data.loginid;
		var loginpass = data.loginpass;
		//console.log(loginid);
		//console.log(loginpass);
		var query = connection.query("select pass as password from logins where email='"+data.loginid+"'",function(err,rows,fields){
			if(err)
				throw err;
			console.log(rows[0].password);
		});
	});
});


