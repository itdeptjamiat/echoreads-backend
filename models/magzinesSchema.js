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
    audioFile:{
        type:String,
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
            userId: {
                type: Number,
                required: true
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            review: {
                type: String,
                default: ''
            },
            time: {
                type: Date,
                default: Date.now
            }
        },
    ],
    createdAt:{
        type:Date,
    
},
})

const Magzines = mongoose.model('Magzines',magzinesSchema);

module.exports = Magzines;