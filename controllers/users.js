const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

exports.formRegister = async(req, res) => {
    const { name, email, phone, gender, age, password, password2 } = req.body;
    // console.log(req.body.name);
    // console.log(req.body.email);
    // console.log(req.body.phone);
    // console.log(req.body.gender);
    // console.log(req.body.age);
    // console.log(req.body.password);
    // console.log(req.body.password2);

    let errors = [];

    // Check required fields
    if(!name || !email || !phone || !gender || !age || !password || !password2 ){
        errors.push({msg: 'Please fill in all fields'});
    }

    // check Passwords Match
    if(password!=password2){
        errors.push({msg:' Passwords do not match'});
    }

    //check password length
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('formregister', {
            errors,
            name,
            email,
            phone,
            gender,
            age,
            password,
            password2
        });
    }
    else{
        //Validation pass
        User.findOne({email: email}).then(user=>{
            if(user){
                //User exists
                errors.push({msg: 'Email is already registered'});
                res.render('formregister', {
                    errors,name,email,phone,
                    gender,age,password,password2
                });
            }
            else{
                const newUser = new User({
                    name,email,phone,
                    gender,age,password
                });

                // Hash Password
                bcrypt.genSalt(10, (err, salt) =>{
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        // Set password to hashed
                        newUser.password = hash;
                        //Save user
                        newUser.save()
                        .then(user => {
                            req.flash(
                                'success_msg',
                                'You are now registered and can log in'
                              );
                            res.redirect('/formlogin');
                        })
                        .catch(err => console.log(err));
                    });
                });
            }
        });
    }
}

exports.formLogin = async(req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/',
      successFlash: true,
      failureRedirect: '/formlogin',
      failureFlash: true
    })(req, res, next);
}

exports.logout = async(req, res) => {
    req.logout();
    req.flash(
        'error',
        'You are logged out'
      );
    res.redirect('/');
}
