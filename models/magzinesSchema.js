const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const magzinesSchema = new Schema({
    mid:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    file:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        enum:['free','pro'],
        default:'free',
    },
    isActive:{
        type:Boolean,
        default:true,
    },
    description:{
        type:String,
    },
    createdAt:{
        type:Date,
    
},
})

const Magzines = mongoose.model('Magzines',magzinesSchema);

module.exports = Magzines;