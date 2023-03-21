const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');         /* Including flash for message display */
const fast2sms = require('fast-two-sms');       /* Including fast2sms for sending sms */
const session = require('express-session');
const path = require('path');
const routes = require("./routes/routes");
require('dotenv').config();
require('./controllers/passport')(passport);

const app = express();

app.set('view engine' , 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
);

/* Passport middleware */
app.use(passport.initialize());
app.use(passport.session());

/* Middleware to connect flash */
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    res.locals.error_cntct = req.flash('error_cntct');
    next();
});

app.use(express.static(path.join(__dirname + '/public')));

app.use(routes);

const port = process.env.PORT || 3000;
const uri = process.env.mongodburl;

app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
    mongoose
        .connect(uri,{ useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false})
        .then("Connected Successfully")
        .catch((err)=> console.log(err))
});