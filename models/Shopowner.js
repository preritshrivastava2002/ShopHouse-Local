const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* Schema for shopowners */
const ShopownerSchema = new Schema({
   email: {type: String},
   ownername: { type: String, uppercase: true },
   shopname: { type: String, uppercase: true },
   shoptype: { type: String},
   donationwant: { type: String, uppercase: true },
   aboutshop: { type: String, required: true},
   pincode: { type: Number, maxlength: 6 },
   area: { type: String, required: true , uppercase: true},
   phoneNumbers: { type: Array, default: [] },
   items: { type: Array, default: [] },
});

const Shopowner = mongoose.model('Shopowner',ShopownerSchema);
 
module.exports = Shopowner;