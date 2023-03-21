const Contact = require("../models/Contact");

exports.contact = async(req,res)=>{
    
    const { username, useremail, message } = req.body;
    //console.log(req.body.username);
    //console.log(req.body.useremail);
    //console.log(req.body.message);
    
    // Check required fields
    if(!username || !useremail || !message ){
        //errors.push({msg: 'Please fill in all fields'});
        req.flash(
            'error_cntct',
            'Please fill in all fields'
        );
        res.redirect('/');
    }else{
        const newContact = new Contact({
            username,
            useremail,
            message
        });
        //Save Contact
        newContact.save()
        .then(contact => {
            req.flash(
                'success_msg',
                'Your message has been sent'
            );
            res.redirect('/');
        })
        .catch(err => console.log(err));
    }
}