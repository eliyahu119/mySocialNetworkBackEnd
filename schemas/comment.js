const { default: mongoose } = require("mongoose");

const commentSchema= new mongoose.Schema({
    userID : {type: mongoose.Types.ObjectId,ref: "user"},
    postID:mongoose.Types.ObjectId,
    content : String,
    date :{type : Date,default:()=>Date.now()}
    
})
module.exports=mongoose.model("comment",commentSchema)