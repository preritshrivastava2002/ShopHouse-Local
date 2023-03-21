const Shopowner = require('../models/Shopowner');
const fast2sms = require('fast-two-sms');

exports.formAddShop = async(req, res) =>{
    // console.log(req.user);
    const { shopname, ownername,  shoptype, donationwant, aboutshop, pincode, area } = req.body;
    // console.log(req.body.shopname);
    // console.log(req.body.ownername);
    // console.log(req.body.shoptype);
    // console.log(req.body.donationwant);
    // console.log(req.body.aboutshop);
    // console.log(req.body.pincode);
    // console.log(req.body.area);
    let errors = [];

    if (!shopname || !ownername || !shoptype || !donationwant || !aboutshop || !pincode || !area){
        errors.push({ msg: 'Please enter all fields' });
    }
    else if(pincode.length != 6) {
        errors.push({msg: "Please enter valid Pincode"});
    }
    if (errors.length > 0) {
        res.render('formaddshop', {
            errors,shopname,ownername,shoptype,
            donationwant,aboutshop,pincode,area
        });
    }
    else{
        Shopowner.findOne({ shopname:shopname, pincode:pincode, area:area, shoptype:shoptype }).then(shopowner =>
        {
            if (shopowner){
                errors.push({ msg: 'Shop name already exists' });
                res.render('formaddshop', {
                    errors,shopname,ownername,shoptype,
                    donationwant,aboutshop,pincode,area
                });
            }
            else{
                //console.log(req.user);
                req.user.addShop = true;
                req.user.save();
                //console.log(req.user);
                const newShopowner = new Shopowner({
                    email: req.user.email,
                    shopname,ownername,shoptype,
                    donationwant,aboutshop,pincode,area
                });
                newShopowner.save().then(shopowner=>{
                    req.flash(
                        'success_msg',
                        'Your shop has been registered successfully'
                      );
                    res.redirect('/');
                })
                .catch(err => console.log(err));
            }
        });
    }
}

exports.myShop = async(req , res) => {
    Shopowner.find({email: req.user.email} , (err , data) => {
        if(err) throw err;
        res.render('myshop' , {data: data,user:req.user});
    });
}

exports.filterPincode = async(req,res)=>{
    const pincode = req.body.pincode;
    //console.log(req.body.pincode);

    let errors=[];

    if (!pincode){
        errors.push({ msg: 'Please enter Pincode' });
    }
    else if(pincode.length != 6){
        errors.push({msg: "Please enter a valid Pincode"});
    }

    if (errors.length > 0){
        res.render('index', {
            errors,
            pincode,
        });
    }
    else{
        Shopowner.find({pincode:req.body.pincode},function(err,data){
            if(err){
                errors.push({ msg: 'Not able to process the Pincode you entered' });
                res.render('index', {
                    errors,
                    pincode,
                });
                process.exit(1);
            }
            //console.log(data.length);
            let set=new Set();
            for(let i=0;i<data.length;i++){
                set.add(data[i].area);
            }
            let pcode={
                pc:req.body.pincode
            };
            let val=Array.from(set);
            val.sort();
            //console.log(val.length);
            if(data.length==0){
                //console.log(val);
                errors.push({ msg: 'No Shop is registered under this pincode.' });
                res.render('index', {
                    errors,
                    pincode,
                    val:val,
                    pcode:pcode,
                    user:req.user
                });
            }
            else{
                res.render('index-1',{val:val,pcode:pcode,user:req.user});
            }
        })
    }
}

exports.filterArea = async(req,res)=>{
    let errors =[];
    if(!req.body.area){
        errors.push({ msg: 'Please enter a valid area' });
        Shopowner.find({pincode:req.body.pincode},function(err,data){
            if(err){
                process.exit(1);
            }
            let set=new Set();
            for(let i=0;i<data.length;i++){
                set.add(data[i].area);
            }
            let pcode={
                pc:req.body.pincode
            };
            let val=Array.from(set);
            val.sort();
            res.render('index-1',{errors, val:val,pcode:pcode,user:req.user});
        })
    }
    else{
        Shopowner.find({pincode:req.body.pincode,area:req.body.area},function(err,data){
            if(err){
                process.exit(1);
            }
            res.render('shopslist',{data:data,user:req.user});
        })
    }
}

exports.filterShop = async(req,res)=>{
    Shopowner.find({pincode:req.body.pincode,area:req.body.area,shopname:req.body.shopname},function(err,data)
    {
        if(err){
            process.exit(1);
        }
        res.render('shopsearch',{data:data,user:req.user});
      })
}

exports.addQueuePage = async(req,res)=>{
    let phoneNumbers = req.body.phonenumber;
    let items= req.body.listofitems;
    let errors=[];
    if (!phoneNumbers){
        errors.push({ msg: 'Please enter your mobile number' });
    }
    else if(phoneNumbers.length !=10){
        errors.push({ msg: 'Please enter valid mobile number' });
    }
    else{
        for(var i=0;i<phoneNumbers.length;i++){
            if(phoneNumbers[i]<'0' || phoneNumbers[i]>'9'){
                errors.push({ msg: 'Please enter valid mobile number' });
                break;
            }
        }
    }
    if (errors.length > 0) {
        Shopowner.find({pincode:req.body.pincode,area:req.body.area,shopname:req.body.shopname},function(err,data)
        {
            res.render('shopsearch',{   
                data:data,
                errors,
                user:req.user});
        });
    }
    else{
        Shopowner.findOneAndUpdate({pincode:req.body.pincode,area:req.body.area,shopname:req.body.shopname},
        {
            $push: {phoneNumbers:req.body.phonenumber,items:req.body.listofitems}
        },
        function(err, docs){
            if(err){
                res.json(err);
            }
            else
            {
                Shopowner.find({pincode:req.body.pincode,area:req.body.area,shopname:req.body.shopname},function(err,data)
                {
                    var pos = (data[0].items.length);
                    try{
                        if(data[0].items.length == 1) {
                            const response = fast2sms.sendMessage({authorization: process.env.API_KEY, sender_id: 'SABLCL', message: `You have been added successfully to the queue at ${data[0].shopname}. Your position in the queue is ${pos}. You should reach the shop within 7 minutes else your registration will be cancelled. 
Regards
SAB LOCAL` , numbers: [req.body.phonenumber]});
                        }
                        else if(data[0].items.length == 2) {
                            const response = fast2sms.sendMessage({authorization: process.env.API_KEY, sender_id: 'SABLCL', message: `You have been added successfully to the queue at ${data[0].shopname}. Your position in the queue is ${pos}. You should reach the shop within 7-14 minutes from now else your registration will be cancelled. 
Regards
SAB LOCAL` , numbers: [req.body.phonenumber]});
                        }
                        else {
                            var exptime = (data[0].items.length - 1) * 7;
                            //console.log(exptime);
                            const response = fast2sms.sendMessage({authorization: process.env.API_KEY, sender_id: 'SABLCL', message: `You have been added successfully to the queue at ${data[0].shopname}. Your position in the queue is ${pos}. Your expected time is ${exptime} minutes from now. You will be notified once again about the exact time. 
Regards
SAB LOCAL` , numbers: [req.body.phonenumber]});
                        }
                        res.render('shopsearch',{data:data,user:req.user});
                    }
                    catch(err) {
                        console.log(err);
                        process.exit(1);
                    }
                })
            }
        });
    }
}

exports.editAbout = async(req,res)=>{
    let newobj={
       aboutshop:req.body.newaboutshop
    };
    Shopowner.findOneAndUpdate({pincode:req.body.pincode,area:req.body.area,shopname:req.body.shopname},
    newobj,
    function(err, docs){
        if(err){
            res.json(err);
        }
        else{
            Shopowner.find({pincode:req.body.pincode,area:req.body.area,shopname:req.body.shopname},function(err,data)
            {
                if(err){
                    process.exit(1);
                }
                res.render('myshop',{data:data,user:req.user});
            })
        }
   });
}

exports.reduceCount = async(req,res)=>{
    // console.log(req.body);
    Shopowner.findOneAndUpdate({pincode:req.body.pincode,area:req.body.area,shopname:req.body.shopname},{
        $pop: {phoneNumbers:-1,items:-1}
    },
    function(err, docs){
        if(err){
            res.json(err);
        }
        else{
            Shopowner.find({pincode:req.body.pincode,area:req.body.area,shopname:req.body.shopname},function(err,data)
            {
                if(err){
                    process.exit(1);
                }
                if(data[0].items.length > 1) {
                    const response = fast2sms.sendMessage({authorization: process.env.API_KEY, sender_id: 'SABLCL', message: `This is a reminder message. Your current position in the queue at ${data[0].shopname} is 2. You should reach the shop within 7-14 minutes from now else your registration will be cancelled.
Regards
SAB LOCAL` , numbers: [data[0].phoneNumbers[1]]}); 
                }
                res.render('myshop',{data:data,user:req.user});
            })
        }
    });
}