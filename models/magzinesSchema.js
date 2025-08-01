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
    fileType:{
        type:String,
        default:'pdf',
    },
    magzineType:{
        type:String,
        enum:['magzine','article','digest'],
        default:'magzine',
    },
    isActive:{
        type:Boolean,
        default:true,
    },
    category:{
        type:String,
        default:'other',
    },
    downloads:{
        type:Number,
        default:0,
    },
    description:{
        type:String,
    },
    rating:{
        type:Number,
        default:0,
    },
    reviews:[
        {
            type:String,
            time:Date.now(),
            userId:Number,
        },
    ],
    createdAt:{
        type:Date,
    
},
})

const Magzines = mongoose.model('Magzines',magzinesSchema);

module.exports = Magzines;