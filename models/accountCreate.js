const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name:{
    type:String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  uid:{
    type:Number,
  },
  profilePic:{
    type:String,
    default:"https://via.placeholder.com/150"
  },
  userType:{
    type:String,
    enum:['admin','user','super_admin'],
    default:'user'
  },
  plan:{
    type:String,
    enum:['free','echopro','echoproplus'],
    default:'free'
  },
  planExpiry:{
    type:Date,
  },
  planStart:{
    type:Date,
  },
  isVerified:{
    type:Boolean,
    default:false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  jwtToken:{
    type:String,
  },
  resetPasswordOtp:{
    type:Number,
  },
  resetPasswordOtpExpiry:{
    type:Date,
  },
  resetPasswordOtpVerified:{
    type:Boolean,
    default:false
  },
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
