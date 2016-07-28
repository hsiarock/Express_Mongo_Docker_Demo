
A simple demo to use Express 4 + MongoDB 3.2 + NodeJS 6.0

Install Express-generator
------------------------
   $ npm install express-generator -g

Generate the default structure
----------------------------
   This is generated structure

	$ express myapp 
	create : myapp
	create : myapp/package.json
	create : myapp/app.js
	create : myapp/public
	create : myapp/public/javascripts
	create : myapp/public/images
	create : myapp/public/stylesheets
	create : myapp/public/stylesheets/style.css
	create : myapp/routes
	create : myapp/routes/index.js
	create : myapp/routes/users.js
	create : myapp/views
	create : myapp/views/index.jade
	create : myapp/views/layout.jade
	create : myapp/views/error.jade
	create : myapp/bin
	create : myapp/bin/www

   install dependencies:
	$ cd myapp && npm install
	
   run the app:
	$ DEBUG=myapp:* npm start

   Using tree . to see the directory structure

Notes:
-----

   1. npm start will run ./bin/www, so u can also just run it directly

   2. www is javascript, it sets up port and listener, then use 'http' module to start server

	var server = http.createServer(app);
	
	Note: app is loaded via ---> var app = require('../app'); 
			in other words, all logic/mapping/routing is done in ../app.js 

   3. we are using Express 4.x, with Route module and middleware features

	So, these are loaded modules
	
	var expresss = require('express');
	var path = require('path');
	var favicon = require('serve-favicon');
	var logger = require('morgan');
	var cookieParser = require('cookie-parser');
	var bodyParser = require('body-parser');

	Also, see how we load the middlewares

	// uncomment after placing your favicon in /public
	//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, 'public')));

   4. Specify routing path and its scripts

	var routes = require('./routes/index');
	var users = require('./routes/users');
	var db_ado = require('./routes/db_ado'); // hsia added

   5. start express object

	var app = express();
 
   6. setup Template engine

	// view engine setup
	app.set('views', path.join(__dirname, 'views')); --> all templates go to views directory
	app.set('view engine', 'jade'); ----> template using 'jade' (call pug b4?)
					-----> check ./views/index.jade, layout.jade, 
                                        -----> I added db_ado.jade

   7. so, routing is done via

	app.use('/', routes);	---> routes is middleware in above require('./reoutes/index')
				---> so, ./routes/index.js
	app.use('/users', users);---> users is middleware in above require('./reoutes/users')
				---> so, ./routes/users.js
	app.use('/db_ado', db_ado);---> db_ado is middleware in above require('./reoutes/db_ado')
				---> so, ./routes/db_ado.js

Integrate with MongoDB data model
--------------------------
Module: mongodb Installation

	$ npm install mongodb

	Example
	
	var MongoClient = require('mongodb').MongoClient;
	
	MongoClient.connect('mongodb://localhost:27017/animals', function(err, db) {
	  if (err) {
	    throw err;
	  }
	  db.collection('mammals').find().toArray(function(err, result) {
	    if (err) {
	      throw err;
	    }
	    console.log(result);
	  });
	});
	
	If you want an object model driver for MongoDB, look at Mongoose.



Install nodemon to automatically restart server when code change
----------------------------------------------------------------

	$ npm install nodemon --save-dev

  if not -g, you can start nodemon this way

	$ ./node_modules/.bin/nodemon server.js

  Or, use configuratiion in package.json
	
	{
	  // ...
	  "scripts": {
	    "dev": "nodemon server.js"
	  }
	  // ...
	}

  Now, you can run npm run dev to trigger nodemon server.js.

Free Cloud MongoDB
------------------

	https://mlab.com/


start MongoDB in docker
------------------------

In order to let all docker to connect to Docker daemon, I start it -

	$ sudo docker daemon -H 0.0.0.0:2375 &
	$ docker -H :2375 info ---> check docker status
	$ cat /etc/default/docker ---> see how I config auto-start docker daemon 
					using "-H tcp://0.0.0.0:2375"

	$ docker -H :2375 images
	REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
	mongo                latest              7f09d45df511        13 days ago         336.1 MB
	ubuntu               latest              cf62323fa025        2 weeks ago         125 MB
	mysql/mysql-server   5.6                 a0e42803a1e7        3 months ago        303.1 MB

So, need to specify the -H in docker client CML

	$ docker -H :2375 run --name david_mongo -p 27017:27017 -v /home/david/mongodb_data:/data/db -d mongo
	9a920928d0b80a7b782c940d8266827ffd406284c338093c725dcdfb64034d7c
	Note: watch!! -H :2375 is b4 'run'


To connect to mongo client

        $ docker -H :2375 run -it --link david_mongo:mongo --rm mongo sh -c 'exec mongo "$MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT/test"'


   see collection schema, enter mongo shell and do this:

	> show collections
	restaurants
	> var item = db.resturnants.findOne();
	> for (var key in item) { print (key) ; }
	_id
	address
	borough
	cuisine
	grades
	name
	restaurant_id

	test it using - 

	db.resturnants.find({"cuisine": "Italian", "address.zipcode": "10075"}).sort({ "grades.score": -1})

	Note: I've imported data into resturnants container
	1. first make sure you have the data file 
	2. in the shell of david_mongo, run mongoimport
		$ docker -H :2375 exec -it  david_mongo /bin/sh   ---> open a shell in david_mongo docker
		# cd /data/db
		# mongoimport --db test --collection restaurants --drop --file primer-dataset.json
		mongoimport --db test --collection restaurants --drop --file primer-dataset_short.json


Add db model to Express
------------------------

	make sure you have mongodb
	
	$ npm install mongodb

	add the connection
	
	var MongoClient = require('mongodb').MongoClient;
	
	MongoClient.connect('mongodb://localhost:27017/animals', function(err, db) {
	  if (err) {
	    throw err;
	  }
	  db.collection('mammals').find().toArray(function(err, result) {
	    if (err) {
	      throw err;
	    }
	    console.log(result);
	  });
	});


we want to connect to Docker's mongo DB, modify the host
--------------------------------------------------------

Since we start Docker using -p 271017:271017, we can use localhost:271017
But we also can use docker's host ip 

	$ docker -H :2375 inspect david_mongo
	    .........
	    "Networks": {
                "bridge": {
                    "IPAMConfig": null,
                    "Links": null,
                    "Aliases": null,
                    "NetworkID": "ce0d6279033d4a819032936f27d2afad8415dfd40e52bedb00fac482c804f296",
                    "EndpointID": "0f9e7d4c5f089dee952f9fcb7ac084b81dc82c4e8fb39d9c27ef6d26fefb3027",
                    "Gateway": "172.17.0.1",
                    "IPAddress": "172.17.0.2",  ---> use this ip
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "MacAddress": "02:42:ac:11:00:02"
                }

so "172.17.0.2:271017" is also working

Add database connection and query into Express generator model
----------------------------------------------------------------
First of all, nodejs use module.exports... to expose variables

bin/www --> requires(../app.js) --> 
			--->requires(../routes/index.js, db_ado.js, user.js ....
			--->requires(../views/index.jade, db_ado.jade, layout.jade
so, in order to open Mongodb connection at the server start up, 
put the connect() in app.js, it will be loaded via bin/wwww
But db connection is a one time and I want to keep it in global variable
so add the following connect() function in routes/db_ado.js
then module.exports.db_conn = db_conn (see below)


routes/db_ado.js added
-----------------------
var db_conn = function() {

  mongoClient.connect('mongodb://localhost:27017/test', function(err, database_connection) {
  if (err) {
     throw err;
  }

  console.log("Open Mongo DB successfully");

  db = database_connection;

  });

  return db;
} ;

module.exports = router;
module.exports.db_conn = db_conn ;

../app.js added
---------------

    do = require('./routes/db_ado'); // dhsia added

    // open Mongo DB connection - dhsia

    db_ado.db_conn();   ---> call db_ado.db_conn(), then the db_conn is init

    module.exports = app;

add view/ado_table.jade, use this template to show the query result
------------------------------------------------------------------
	david@ubuntu-pc:~/myexpress/myapp$ cat views/ado_table.jade
	extends layout
	
	block content
	  h1= title
	
	  For query:
	
	  table(border='1')
	    thead
	        tr
	            th #
	            th id
	            th address
	            th borough
	            th cuisine
	            th grades
	            th name
	            th restaurant_id
	    tbody
	        each item, i in items
	            tr
	                td= i+1
	                td= item._id
	                td= item.address
	                td= item.borough
	                td= item.cuisine
	                td= item.grades
	                td= item.name
	                td= item.restaurant_id

modify routes/db_ado.js to add the post() method for query.
------------------------------------------------------
	/* Render /db_table template, after submit the query */
	router.post('/quotes', function(req, res, next) {
	
	  var msg = "Result : " ;
	
	  db.collection('restaurants').find({"borough": "Brooklyn"}).sort({"grades.score": -1}).toArray(function(err, result) {
	
	    if (err) {
	      throw err;
	    }
	
	    res.render('ado_table', { items: result} );
	
	  });


OK, start the Express server. You can
-------------------------------------------------------------------------
1. npm start
or
2. cd myapp
   ./bin/www

    You should see the msg "Open Mongo DB successfully"
3. Open your browser and ope

     http://localhost:3000/  ----> this is index.js 

     http://localhost:3000/db_ado  ----> this isdb_ado.js
	- it displays the query input ---> just enter anything, this is a demo only
	- after you 'submit' ---> it display the query result. The query is hard-coded 
	using  db.collection('restaurants').find({"borough": "Brooklyn"}).sort({"grades.score": -1}).toArray(function(err, result);
	- it should display data in HTML tble nicely... 

4. make sure you load the data first using primer-dataset_short.json

