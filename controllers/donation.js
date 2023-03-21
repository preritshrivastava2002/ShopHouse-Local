const Donation = require('../models/Donation');

exports.formDonate = async(req, res) => {
    const { donorname, ownername, shopname, pincode, area, amount} = req.body;
    // console.log(req.body.donorname);
    // console.log(req.body.ownername);
    // console.log(req.body.shopname);
    // console.log(req.body.pincode);
    // console.log(req.body.area);
    // console.log(req.body.amount);
    let errors = [];

    // Check required fields
    if( !donorname || !ownername || !shopname || !amount || !pincode || !area ){
        errors.push({msg:' Please fill in all fields'});
    }

    if (errors.length > 0) {
        res.render('formdonate', {
            errors,
            donorname,
            ownername,
            shopname,
            pincode,
            area,
            amount
        });
    }
    else{
        //Validation pass
        Shopowner.findOne({shopname: shopname}).then(donation=>{
            if(donation){
                const newDonation = new Donation({
                    donorname,
                    ownername,
                    shopname,
                    pincode,
                    area,
                    amount
                });
                newDonation.save()
                .then(donation => {
                    req.flash(
                        'success_msg',
                        'Your request for donation has been sent successfully'
                    );
                    res.redirect('/');
                })
                .catch(err => console.log(err))
            }
            else{
                //Shop is not registered
                errors.push({msg: 'Shop is not registered'});
                res.render('formdonate', {
                    errors,
                    donorname,
                    ownername,
                    shopname,
                    pincode,
                    area,
                    amount
                });
            }
        });
    }
}