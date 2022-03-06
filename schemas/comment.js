const { default: mongoose } = require("mongoose");

const commentSchema= new mongoose.Schema({
    userID : {type: mongoose.Types.ObjectId, ref: "User",required: true },
   // postID:{type:mongoose.Types.ObjectId,required: true },
    content : {type: String,required: true },
    date :{type : Date,default:()=>Date.now()} ,
    //explained why i chose to do it embeded in 'post.js'.
     likes: [ {type:mongoose.Types.ObjectId , ref:'User'}]    
})
module.exports=mongoose.model("comment",commentSchema)