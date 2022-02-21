const { default: mongoose } = require("mongoose");
const  User  = require("./schemas/User");
const Post=require('./schemas/post')

const  ConnectionString = "mongodb+srv://Eliyahu299:EL1234EL@cluster0.goiyy.mongodb.net/MySocialNetwork?retryWrites=true&w=majority";


//connect to DB
mongoose.connect(ConnectionString,()=>
{
console.log("connected")
},e=>{
console.error(e)
}
)





// setPost();
// async function setPost() {
//     const newPost= new Post({
//         userID : new mongoose.Types.ObjectId('6213637e057cbfbeec9fd0dd'),
//         content : "אניייי אוהבבבבב BackEnd!!!",
//         }
//       )
//      await newPost.save()
//      console.log(newPost)
// }

// setUsers();
// async function setUsers() {
//     const newUser= new User({
//             user : "Eliyahu",
//             password : "13456789A", //TODO ADD PASSWORD HASH.
//             gender : true
//         }
//       )
//      await newUser.save()
//      console.log(newUser)
// }