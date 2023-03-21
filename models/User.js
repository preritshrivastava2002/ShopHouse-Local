const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
/* Schema for users */
const UserSchema = new Schema({
   name:{ type:String ,uppercase:true},
   email:{ type:String},
   phone:{ type:Number},
   gender:{ type:String ,uppercase:true},
   age:{ type:Number},
   password:{type:String},
   addShop: {type: Boolean , default: false}
});
 
const User = mongoose.model('User',UserSchema);
 
module.exports = User;