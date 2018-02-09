var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
const { check, validationResult } = require('express-validator/check');
var mongojs = require('mongojs');
var db = mongojs('customerApp:Fu39pkw9pM5SGWRZ@node-express-app-test-shard-00-00-2wdo0.mongodb.net:27017,node-express-app-test-shard-00-01-2wdo0.mongodb.net:27017,node-express-app-test-shard-00-02-2wdo0.mongodb.net:27017/customerapp?ssl=true&replicaSet=node-express-app-test-shard-0&authSource=admin', ['users'], {ssl: true});
var ObjectId = mongojs.ObjectId;
var app = express();

var currentStageOwner = "no one";

//view engine
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000))
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//set static path
app.use(express.static(path.join(__dirname, 'public')));

app.use( (req,res,next) => {
    res.locals.errors = null;
    next();
});

app.get('/', (req, res) => {
    db.users.find(function (err, docs) {
        res.render('index', {
            title: 'Homepage',
            users: docs
        });
    });
    
});

app.post('/stage/who/', (req, res) => {
    let command = req.body.command;

    if(command == "/who-has-stage"){
        res.send(currentStageOwner);
    }else if(command == "/set-stage"){
        currentStageOwner = req.body.text;
        res.send(currentStageOwner + ' now holds stage');
    }else if(command == "/drop-stage"){
        currentStageOwner = 'no one';
        res.send('no one now holds stage');
    }
});

app.post('/users/add/', [
    check('first_name').isLength({ min: 1 }).withMessage('First name can not be empty'),
    check('last_name').isLength({ min: 1 }).withMessage('Last name can not be empty'),
    check('email').isEmail().withMessage('Email is not valid')
], (req, res) => {
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){

        db.users.find(function (err, docs) {
            res.render('index', {
                title: 'Homepage',
                users: docs,
                errors: errors.array()
            })
        });
    } else{
        var newUser = { 
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
        }

        db.users.insert(newUser, function(err, result){
            if(err){
                console.log(err);
            }
            res.redirect('/');
        });
    }
});

app.delete('/users/delete/:id', (req, res) => {
    db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
        if(err){
            console.log(err);
        }else{
            res.status(200).send();
        }
    })
});

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
});

