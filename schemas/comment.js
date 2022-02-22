const { default: mongoose } = require("mongoose");

const commentSchema= new mongoose.Schema({
    userID : {type: mongoose.Types.ObjectId, ref: "user",required: true },
   // postID:{type:mongoose.Types.ObjectId,required: true },
    content : {type: String,required: true },
    date :{type : Date,default:()=>Date.now()} 
})
module.exports=mongoose.model("comment",commentSchema)