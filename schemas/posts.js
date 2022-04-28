const { default: mongoose } = require("mongoose");
//the post schema. 
const postSchema= new mongoose.Schema({
    //the user written the post.
    userID : {type: mongoose.Types.ObjectId, ref: "users",required: true }, 
    //the content of the post.
    content : {type: String,required: true },
    //creation of the post
    date : {type : Date,default:()=>Date.now()},
    
    //chose to put a ref here because the project is small
    //and not going to be bigger in the future, so this is the best practice for this situation. 
    commentsID :[{type:mongoose.Types.ObjectId, ref:'comments' }],
    likes: [ {type:mongoose.Types.ObjectId , ref:'users' }]
})
module.exports=mongoose.model("posts",postSchema)