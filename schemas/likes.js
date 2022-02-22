const { default: mongoose } = require("mongoose");

const postSchema= new mongoose.Schema({
    userID : {type: mongoose.Types.ObjectId, ref: "user",required: true },
    postCommentID : {type: mongoose.Types.ObjectId ,required: true } //can be both a comment or a post
})
module.exports=mongoose.model("post",postSchema)