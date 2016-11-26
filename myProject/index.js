var Hapi = require ('hapi');
var Path = require('path');
var mysql = require('mysql');
var inert = require('inert');
var Bcrypt = require('bcrypt');
var Basic_auth = require('hapi-auth-basic');
var Vision = require('vision');
var good = require('good');
var Routes = require('./routes'),
Config = require('./config/config');
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
	password:'cav@216',
	database:'se'
});
server.route(Routes.endpoints);
var row_count = 0;
var k=0;
var delay = 500;

io.on('connection',function(socket){
	socket.on('insert',function(data){
		var query = connection.query("insert into logins(firstName,lastName,email,pass) values('"+data.firstName+"','"+data.lastName+"','"+data.email+"','"+data.password+"')",function(err,result){
			console.log(query.sql);
			if(err)
				throw err;
		socket.emit('success',{msg:'Registration successfull'});
		});
	});
	
	socket.on('login_check',function(data){
		var loginid = data.loginid;
		var loginpass = data.loginpass;
		console.log(data.loginid);
		
		var basicValidation = function(request, loginid, loginpass, callback) {
				var loginid = loginid
				if(!loginid){
					return callback(null, false)
				}
				var pass = connection.query("select pass from logins where email='"+loginid+"'", function(err, rows, result){

					Bcrypt.compare(loginpass, rows[0].pass, function(err, isValid){
						server.log('info', 'user authentication successfull')
						callback(err, isValid, {id: loginid})
					});
				});
		}

		// connection.query("select count(*) as count from logins where email='"+loginid+"'",function(err,rows,result){
  //       	if(err)
  //       		throw err;
		// 	row_count=rows[0].count;

		// 	setTimeout(function(){
		// 		// console.log('****'+row_count+'****');
		// 		if(row_count>0){
		// 			var query2 = connection.query("select pass as password from logins where email='"+loginid+"'",function(err,rows,fields){
		// 				if(err)
		// 					throw err;
		// 				if(rows[0].password == loginpass){
		// 					socket.emit('login_success',{msg:'Hi'});
		// 				}
		// 				else if(rows[0].password!=loginpass){
		// 					socket.emit('failure',{msg:'Authentication failure'});
		// 				}
		// 				row_count = 0;
		// 			});
		// 		}
		// 		else{
		// 			console.log('count'+row_count);
		// 			socket.emit('hacker',{msg:'Email ID Not Registered'});
		// 		}
				
		// 	}, delay);

		// });
	server.auth.strategy('basic', 'basic', {validationFunc: basicValidation})
    });
});
// authenticaion
// server.register([
// 	, function (err) {
// 	if(err) {
// 		server.log('error', 'failed to install plugins')

// 		throw err
// 	}

// 	server.log('info', 'plugins registered')
// }
// );
 
server.register([
	{
		register: Vision
	},
	{
		register: good,
		options: {
			ops: {
				interval: 10000
			},
			reporters:{
				console: [
					{
						module: 'good-squeeze',
						name: 'Squeeze',
						args: [{ log: '*', response: '*', requests: '*'}]
					},
					{
						module: 'good-console'
					},
					'stdout'
				]
			}
		}
	},
	{
		register: Basic_auth 
	},
    require('inert')
 ],
 	function(err){
		if(err)
		{
			throw(err);
		}
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
		path:'/assets/img/{filename*}',
		handler: {
			directory: {
				path: 'templates/assets/img',
				listing: true
			}
		}
	});
	server.route({
		method:'GET',
		path:'/assets/css/{filename*}',
		handler:{
			directory:{
				path: 'templates/assets/css',
				listing: true
			}
		}
	});
	server.route({
		method:'GET',
		path:'/assets/js/{filename*}',
		handler: {
			directory: {
				path: 'templates/assets/js',
				listing: true
			}
		}
	});
	server.route({
		method:'GET',
		path:'/assets1/css/{filename*}',
		handler: {
			directory: {
				path: 'templates/assets1/css',
				listing: true
			}
		}
	});
	server.route({
		method:'GET',
		path:'/assets1/js/{filename*}',
		handler: {
			directory: {
				path: 'templates/assets1/js',
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
				
	server.start(function(){
		console.log('server started at:' + server.info.uri);
	});
});
