var express = require('express');
var bodyParser = require('body-parser');
var engines = require('consolidate');
var mongoose = require('mongoose');
var sessions = require('client-sessions');
var bcrypt = require('bcryptjs');
var path = require('path');
//var Config = require('./config/config');
//var Routes = require('./routes.js');
//var csrf = require('csurf');

var schema = mongoose.Schema;
var ObjectId = schema.ObjectId;

var user = mongoose.model('User', new schema({
	id: ObjectId,
	firstname: String,
	lastname: String,
	email: { type: String, unique: true},
	password: String,
}));


var app = express();
app.engine('html', engines.mustache);
	app.set('view engine', "html")
app.locals.pretty= true;

//connect to mongo
mongoose.connect('mongodb://localhost/newauth');

// middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser({uploadDir:'/home/chandu/file-upload/node-app/uploads'}));
app.use(sessions({
	cookieName: 'session',
	secret: 'sad3hh32647dhyddguyvpcv09u0u',
	duration: 30*60*100,
	activeDuration: 5*60*100,
	httpOnly: true,
	secure: true,
	ephmeral: true,
}));

// app.use(csrf());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'public/uploads')));
var path = require('path'),
    fs = require('fs');
// ...
/*app.post('/upload', function (req, res) {
    var tempPath = req.files.file.path,
        targetPath = path.resolve('./uploads/image.png');
    if (path.extname(req.files.file.name).toLowerCase() === '.mp4') {
        fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            console.log("Upload completed!");
        });
    } else {
        fs.unlink(tempPath, function () {
            if (err) throw err;
            console.error("Only .mp4 files are allowed!");
        });
    }
    // ...
});*/
app.use(function(req, res, next){
	if(req.session && req.session.user){
		user.findOne({email: req.session.user.email}, function(err, user){
			if(user){
				req.user = user;
				delete req.user.password;
				req.session.user = req.user;
				res.locals.user = req.user;
			}
			next();
		});
	}else{
		next();
	}
});
//app.route(Routes.endpoints);
function requireLogin(req, res, next){
	if(!req.user){
		res.redirect('/');
	} else {
		next();
	}
}

app.get('/', function(req,res){
	res.render('index.html');
});
 
app.get('/register', function(req,res){
	res.render('register3.html'); //, {csrfToken: req.csrfToken()}
});


app.post('/register', function(req,res){
	var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
	var newUser = new user({
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		email: req.body.email,
		password: hash,
	});
	newUser.save(function(err){
		if(err){
			var err = 'Something bad happened! Try Again';
			if(err.code == 11000){
				error = 'that email is already taken, try another';
			} 
			res.render('register.html', {error: error});
		} else{
				res.redirect('/login');
		}	
	}); 
});

app.get('/login', function(req,res){
	res.render('login3.html');
});
app.get('/play',requireLogin, function(req,res){
	res.render('play.html');
});
app.post('/login', function(req, res){
	user.findOne({email: req.body.email}, function(err, user){
		if(!user){
			res.render('login3.html', { error: 'Invalid email or password'});
		} else{
			if(bcrypt.compareSync(req.body.password, user.password)){
				req.session.user = user; 
				res.redirect('/user_upload');
			} else{
				res.render('login3.html', { error: 'Invalid email or password'});
			}
		}

	});
});

app.get('/user_upload', requireLogin, function(req,res){
	res.render('user_upload.html');
});
app.post('/upload',function(req,res){
    console.log('FIRST TEST: ' + JSON.stringify(req.body.file.theFile));
    console.log('second TEST: ' +req.body.files.theFile.name);
    fs.readFile(req.files.theFile.path, function (err, data) {
        var newPath = "./uploads"+req.body.theFile.name;
        fs.writeFile(newPath, data, function (err) {
          res.send("hi");  
        });
    });
});

app.get('/dashboard/listofvideos', requireLogin, function(req,res){
	res.render('listfile.html');
});

app.get('/logout', function(req,res){
	req.session.reset();
	res.redirect('/');
});

app.listen(3003);
