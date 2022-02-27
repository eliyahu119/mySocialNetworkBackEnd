const { default: mongoose } = require("mongoose");
const bcrypt =require('bcrypt')
const  User  = require("./schemas/User");
const Post=require('./schemas/post');

const  ConnectionString = "mongodb+srv://Eliyahu299:EL1234EL@cluster0.goiyy.mongodb.net/MySocialNetwork?retryWrites=true&w=majority";
//connect to DB
mongoose.connect(ConnectionString,()=>
{
console.log("connected")
},e=>{
console.error(e)
}
)

/**
 export the dataManager
**/
 module.exports={
   
//set post function
  setPost(userID,content) {
     const newPost= new Post({
         userID : new mongoose.Types.ObjectId(userID),
         content : content,
         }
       )
    newPost.save().then(()=>console.log(newPost))
 },

 //get posts from the DB from index to index.
async getLatestXPosts(numberOfPosts,from){
    const data= await (
        Post.find()
        .skip(from*numberOfPosts)
        .limit((from*numberOfPosts)+numberOfPosts)
        .populate( { path: 'userID',select:["-password"]}) //remove password from the select
        .exec()
        )
        return data


 },


//  async singIn(userName,password,Email,gender){
//    if (await User.exists().or([{email:Email},{user:userName}]))
//       return [false,'Email,or userName already exsists.'];
//       password = await bcrypt.hash(password,10) //TODO: consider using salts instead of  rounds
//       const dbUser=new User(
//          {
//             user : userName,
//             password : password,
//             email: Email,
//             gender : gender  //true is male, false female
//          }
//       )
//       dbUser.save()
//       return [true,"success"]

//  }
}