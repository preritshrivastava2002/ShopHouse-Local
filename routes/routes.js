const router = require('express').Router();
const bodyParser = require('body-parser');
const passport = require('passport');

let urlencodedParser = bodyParser.urlencoded({ extended: false });

const {forwardAuthenticated, ensureAuthenticated } = require('../controllers/auth');
const {formRegister, formLogin, logout} = require("../controllers/users"); 
const {formAddShop, myShop, filterPincode, filterArea, filterShop, addQueuePage, editAbout, reduceCount} = require("../controllers/shopowner");
const {formDonate} = require("../controllers/donation")
const {contact} = require('../controllers/contact');

// Index page
router.get('/' , (req , res) => {
    res.render('index' , {user: req.user})
});

// Register Page
router.get('/formregister', (req, res) => {
    res.render('formregister')
});

// Login Page
router.get('/formlogin', forwardAuthenticated , (req, res) => {
    res.render('formlogin');
});

// Add Shop Page
router.get('/formaddshop', ensureAuthenticated, (req, res) => {
    res.render('formaddshop')
});

// Donation Page
router.get('/formdonate', (req, res) => {
    res.render('formdonate')
});

// Myshop Page
router.get('/myshop' , ensureAuthenticated , myShop);

// User Registration
router.post('/formregister', formRegister);

// User Login 
router.post('/formlogin', formLogin);

// User Logout 
router.get('/logout', logout);

// Register Shop 
router.post('/formaddshop',ensureAuthenticated, formAddShop);

// Donation Form 
router.post('/formdonate', formDonate);

// Pincode Filter
router.post('/filterpincode', filterPincode);

// Area Filter 
router.post('/filterarea', filterArea);

// Shop Filter 
router.post('/filtershop', filterShop);

// Add Customer in Queue
router.post('/addqueuepage',urlencodedParser, ensureAuthenticated , addQueuePage);

// Edit Shop About 
router.post('/editabout',urlencodedParser, editAbout);

// Remove Customer from Queue 
router.post('/reducecount',urlencodedParser, reduceCount);

// Contact Us from Index/Index-1 
router.post('/contactindex', contact);


module.exports = router;