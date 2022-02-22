const { default: mongoose } = require("mongoose");

const postSchema= new mongoose.Schema({
    userID : {type: mongoose.Types.ObjectId, ref: "User",required: true }, 
    content : {type: String,required: true },
    date : {type : Date,default:()=>Date.now()},
    commentsID :[{type:mongoose.Types.ObjectId, ref:'comment' }]
})
smodule.exports=mongoose.model("post",postSchema)