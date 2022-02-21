const { default: mongoose } = require("mongoose");

const postSchema= new mongoose.Schema({
    userID : {type: mongoose.Types.ObjectId,ref: "user"},
    content : String,
    date : {type : Date,default:()=>Date.now()} 
})
module.exports=mongoose.model("post",postSchema)