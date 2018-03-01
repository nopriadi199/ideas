const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();

//load router
const ideas = require('./routes/ideas');
const users = require('./routes/users');

//passport config
require('./config/passport')(passport);

// map global promise - get rid of warning
mongoose.Promise =global.Promise;
// Connect to mongoose
mongoose.connect('mongodb://nopriadi:nopriadi@ds251518.mlab.com:51518/nrwebid', {
    useMongoClient : true
})
    .then(function() {
        console.log('MongoDB Connected...'
        )})
    .catch(function (err) {
        console.log(err)
    } );

//handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// body parser middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//static folder
app.use(express.static(path.join(__dirname, 'public')));

// method override middleware
app.use(methodOverride('_method'));

// Express session midleware
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized:true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variabels
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// index route
app.get('/', function(req, res) {
    const title='Welcome';
    res.render('./users/login',{
        title:title
    });
});

// about route
app.get('/about', function(req, res) {
    res.render('about');
});

//use routes
app.use('/ideas', ideas);
app.use('/users', users);

const port = 5000;

app.listen(port,function() {
   console.log("server started on port "+port);
});
