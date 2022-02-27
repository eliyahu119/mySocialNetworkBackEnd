const { default: mongoose } = require("mongoose");
const bcrypt =require('bcrypt')
const  User  = require("./schemas/User");
const Post=require('./schemas/post');
const  jwt = require("jsonwebtoken");
const req = require("express/lib/request");




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
  setPost(req,res) {
   userID=req.user.id;
   const {content}=req.body
   if(content&&typeof content === "string"){
     const newPost= new Post({
         userID : new mongoose.Types.ObjectId(userID),
         content : content
         })
      //TODO: MAKE THIS CRAP WORK WITH SAVE ONLY
        newPost.save().
        then(post=>Post.findById(post.id)
        .populate({ path: 'userID',select:["-password"]})
        .exec())

         //  .then( 
         //     post=>
         //     {post.populate( { path: 'userID',select:["-password"]})
         //     .exec()
         //     console.log(pst)
         //    }
         //     )
          .then(post=>res.json(post))
          .catch(err=>res.json({error:err}))
      }else{
         res.sendStatus(403)
      }
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

/**
the sign in function
sends 
422 if userName or Email already been used.
500 if there is a internal server(db) error.
200 if all is well.
 **/
   async singIn(req,res){
   let {user,password,email,gender}=req.body
   if (await User.exists().or([{email},{user}]))
   {
      res.status(422).json({message:"userName or Email already been used "});
   }
   password = await bcrypt.hash(password,10); //TODO: consider using salts instead of  rounds
   const dbUser=new User(
         {
            user ,
            password ,
            email,
            gender  //true is male, false female
         }
      );
      dbUser.save()
      .then(user=>res.status(200).json({message:`${user.user} has been added`}))
      .catch(err=>res.status(500).json({message:`there was an internal problem, ${err}`})); //internal error
   },

   /**

    **/
   logIn(req,res){
   const{ user, password } =req.body;
    User.findOne({user}).then(
    DBuser=>{
       if(!DBuser)
          return res.status(400).json({message:'Invalid username or password'});
          bcrypt.compare(password,DBuser.password).then(
          isCorrect=>{
             if(isCorrect){
                const payload={
                   id:DBuser._id,
                   user:DBuser.user,
                   gender:DBuser.gender
                  }
                  jwt.sign(payload,
                  process.env.JWT_SECRET,
                  {expiresIn:86400*30}, //for 30 days
                  (err,token)=>{
                  if(err) return res.status(500).json({message:err})
                  return res.status(200).json({
                     message:"Success",
                     token: "Bearer " + token
                  })
                  }
                  )

             }
             else{
               return res.status(400).json({message:'Invalid username or password'});
             }
          }
       )
    }
 
    
    ).catch(
       e=>console.log(e)
    )
   },

verifyJWT(req,res,next){
   const token=req.headers['x-access-token']?.split(' ')[1]
   if(token){
      jwt.verify(token, process.env.JWT_SECRET,(err,decoded)=>
      {
         if(err){
            return res.sendStatus(403)
         }
         req.user={id:decoded.id,user:decoded.user};
         next();
      })
   }
   else 
    return res.sendStatus(401)
}
 }