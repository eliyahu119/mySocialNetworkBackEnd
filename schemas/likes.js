const { default: mongoose } = require("mongoose");

const postSchema= new mongoose.Schema({
    userID :{type: mongoose.Types.ObjectId,ref: "user"},
    postCommentID : mongoose.Types.ObjectId,
})
module.exports=mongoose.model("post",postSchema)