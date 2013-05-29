var express = require('express');
var aws = require('aws-sdk');
var uuid = require('node-uuid');

var app = express();

aws.config.loadFromPath('./config.json');

var dynamodb = new aws.DynamoDB({apiVersion: '2012-08-10'});

app.use(express.limit('1mb')); 
app.use(express.bodyParser()); 
app.use(express.methodOverride());
app.enable("jsonp callback");

app.get('/all', function (req, res) {
	//get all the tasks
	dynamodb.client.scan({ TableName : 'posts'}, function(err, data) {
		res.json(data);
		//console.log(data);
	});
});
app.post('/post', function (req, res) {
	//add task
	if (req.body.task) {
		var d = new Date();
		var obj = { id: { S : uuid.v4() }, 
						text : { S : req.body.task},
						date: { S : d.toUTCString()} };
		if (req.body.x && req.body.y) {
			obj.x = { S : req.body.x };
			obj.y = { S : req.body.y };
		}
		dynamodb.client.putItem({ TableName: 'posts', 
			Item: obj 
			},
			function (err, data) {
				if (err) {
					res.send({status: "nok-db"});
					console.log(err);
				}
				else res.send({status: "ok"});
		});
		//tasks.push(req.body.task);
		//res.send({status: "ok"});
	}
	else {
		res.send({status: "nok"});
	}
});

app.listen(8000);
