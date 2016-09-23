var Hapi = require ('hapi');
var Path = require('path');
var mysql = require('mysql');
var inert = require('inert');
var Bcrypt = require('bcrypt');
//var Basic = require('hapi-auth-basic');
var Routes = require('./routes'),
Config = require('./config/config');
//var basic = require('basic');
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
server.route(Routes.endpoints);
//const validate = function(request,login,loginpass,callback){};
var row_count = 0;
var k=0;
var delay = 500;
//const validate = function(login,loginpass,callback){};
//const callback = function(err,isValid,credentials){};

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
		console.log(data.loginid);
		//console.log(loginpass);
		//row_count = -1;
		//connection.query("select count(*) as count from logins where email='"+loginid+"'",function(err,rows,result){
		//connection.query("select name as username from logins where email="+loginid+"",function(err,rows,result){
		//validate(0,data.loginid,data.loginpass,function(err,isValid,credentials){});
    	//const user = users[username];
		//console.log('###',login,'###');
		connection.query("select count(*) as count from logins where email='"+loginid+"'",function(err,rows,result){
    	//	if (rows[0].count!=1) {
        //		return callback(null, false);
    	//	}
    	//	password = "select pass from logins where email = "+data.loginid+"",function(err,rows,result){}
    	//	Bcrypt.compare(password, password, function(err, isValid){
        //	callback(err, isValid, { id: user.id, name: user.name });
        	if(err)
        		throw err;
			row_count=rows[0].count;
			//k=1;
			//console.log('####'+row_count+'####');
			setTimeout(function(){
		//console.log('k = '+k);
				console.log('****'+row_count+'****');
				if(row_count>0){
					var query2 = connection.query("select pass as password from logins where email='"+loginid+"'",function(err,rows,fields){
						if(err)
				//socket.emit('alert',{msg:'Not Registered'});
							throw err;
						if(rows[0].password == loginpass){
							socket.emit('login_success',{msg:'Hi'});
						}
		//				Bcrypt.compare(rows[0].password, loginpass, (err, isValid) => {
        //					callback(err, isValid, { name: rows[0].name });
						else if(rows[0].password!=loginpass){
							socket.emit('failure',{msg:'Authentication failure'});
						}
						row_count = 0;
					});
				}
				else{
					console.log('count'+row_count);
					socket.emit('hacker',{msg:'Email ID Not Registered'});
				}
				
			}, delay);
		});
    });
});

server.register([require('vision'),require('inert'),require('hapi-auth-basic')],function(err){
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
	/*server.auth.strategy('simple', 'basic', { validateFunc: validate });
    server.route({
        method: 'GET',
        path: '/user1',
        config: {
            auth: 'simple',
            handler: function (request, reply) {
                reply('hello, ' + request.auth.credentials.name);
            }
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
	/*server.route({
    	config: {
        	auth: {
            	strategy: 'session',
            	mode: 'try'
        	}
    	},
    	method: 'GET',
    	path: '/',
    	handler: function (request, reply) {
        	if (request.auth.isAuthenticated) {
            	return reply.redirect('/user');        // user is logged-in send 'em away
        	}
        	return reply.view('index');            // do the login thing
    	}
	});*/
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
		path:'/user',
		handler: function(request,reply){
			reply.view('index2');
		}
	});*/
	/*server.route({
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
