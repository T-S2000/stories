//Express is a node js web application framework that provides broad features for building web and mobile applications.
const express = require('express');
//module provides utilities for working with file and directory paths
const path = require('path');
//morgan is a Node. js and Express middleware to log HTTP requests and errors, and simplifies the process
const morgan = require('morgan');
//Passport is Express-compatible authentication middleware for Node. js
const passport = require('passport');
//Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env
const dotenv = require('dotenv');
//templating engine
const { engine } = require('express-handlebars');
//db configuring
const connectDB = require('./config/db');
//importing necessary middleware
const { formatDate,truncate,stripTags,editIcon,select } = require('./helpers/hbs')
//Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn’t support it.
const methodOverride = require('method-override')
//When the client makes a login request to the server, the server will create a session and store it on the server-side. 
//When the server responds to the client, it sends a cookie. 
//This cookie will contain the session’s unique id stored on the server, which will now be stored on the client. 
//This cookie will be sent on every request to the server.
const session = require('express-session');
//MongoDB session store for Connect and Express
const MongoStore = require('connect-mongo');
//configuring environment variables
dotenv.config({path:'./config/config.env'})
//passport config
require('./config/passport')(passport);
//db connecting 
connectDB();
//express intialization
const app = express();
//body parser
app.use(express.urlencoded({extended: false}))
//parse the incoming requests with JSON payloads
app.use(express.json())
//methodOverride function
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
  )
//app logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
//handlerbars
app.engine('.hbs',engine({helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
},
defaultLayout: 'main',extname: '.hbs'
})
)
app.set('view engine', '.hbs');

app.use(session({
    secret: 'keyboard kill',
    resave: false,
    saveUninitialized:false,
    store: MongoStore.create({mongoUrl: process.env.MONGO_URI})
}))

app.use(passport.initialize())
app.use(passport.session())

//set global variable
app.use(function (req,res,next) {
    res.locals.user = req.user || null
    next();
})

//static folder
app.use(express.static(path.join(__dirname, '/public')))
//Routes
app.use('/',require('./routes/index'))
app.use('/auth',require('./routes/auth'))
app.use('/stories',require('./routes/stories'))

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`))