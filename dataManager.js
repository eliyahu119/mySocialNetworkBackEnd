const { default: mongoose } = require("mongoose");
const bcrypt =require('bcrypt')
const  User  = require("./schemas/User");
const Post=require('./schemas/post');
const  jwt = require("jsonwebtoken");
const req = require("express/lib/request");
const likes = require("./schemas/likes");
const comment = require("./schemas/comment");
const { promise } = require("bcrypt/promises");




const  ConnectionString = process.env.MONGO_CONNECT

//connect to DB
mongoose.connect(ConnectionString,()=>
{
console.log("connected")
},e=>{
console.error(e)
}
)

/**
 *add or remove like from the DB.
 */
const addOrRemoveLike= (res,req,userID,postCommentID)=>{
   likes.findOneAndDelete({ userID, postCommentID }).then(
      document => {
         if (document) {
            res.json({ message: "removed like" })
         }
         else {
            const like = new likes({
               userID,
               postCommentID
            })
            like.save().then(
               res.json({ message: "added like" })
            )
         }
}
)

}

/**
 search all the like for comment or post id
 * */ 
  const getLikes=async (id)=>{
   return await likes.find().where('postCommentID').equals(id).distinct("userID").exec()
 }
/**
 export the dataManager
**/
 module.exports={
    /**
     * add likes to the comment or post
     */
   addlike(req,res){
      const userID=req.user.id;
      const {postCommentID} =req.body
      //TODO::data validtion
      if(!(postCommentID&&typeof postCommentID === "string"))
      {
         res.status(403).json({meassage:"IVALID DATA"})
      }
      Post.exists({_id:postCommentID}).then(
      exists=>{
      if(exists)
         addOrRemoveLike(res,req,userID,postCommentID)
      else
      comment.exists({_id:postCommentID}).then(
      exists =>{  
         if(exists)
         addOrRemoveLike(res,req,userID,postCommentID)
      else  
        res.status(403).json({meassage:"IVALID DATA"})
            //if there is like remove it, if not add it
         }
   
    )})},
      
         
      
   

   /**
  set post function
   */ 
  setPost(req,res) {
   userID=req.user.id;
   const {content}=req.body
   //TODO ADD MORE DATA validation
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
/**
 * add comment to post.
 */
  addComment(req,res) {
    userID=req.user.id;
    const {content,postID}=req.body
    //TODO ADD MORE DATA validation
    if(!(content&&typeof content === "string")&&(postID&&typeof postID === "string" )){
      res.status(403) 
   }
  
   const newComment= new comment({
      userID : new mongoose.Types.ObjectId(userID),
      content : content
      })
   Post.exists({_id:postID}).lean().exec().then(
   exsist=> {
   if(exsist){
  let insertedCommentiD;
   newComment.save().
         then(com=>{
         insertedCommentiD=com._id.toString()
         //return the promis of the find
         return Post.findByIdAndUpdate(postID,{$push:{commentsID:[insertedCommentiD]}})
         })
         // .then(()=> 
         // comment.findById('621fc5a898db7d65f61ca0f4').populate({ path: 'userID',select:["-password"]}).exec()
         // )
         .then((data)=>{
         //let id= insertedComment
         comment.findById(insertedCommentiD).populate({ path: 'userID',select:["-password"]}).exec()
         .then(
         data=>res.status(200).json({meassage:"success",data:data})
         ) 
      })
         .catch(err=>res.status(500).json({error:"here"}))
   }else{
      res.status(404).json({message:"post wasn't found"})
   }
}
  ).catch(e=>res.status(500).json({message:"the problem is here"}))
       
 },

 /**
  get posts from the DB from index to index.
  */
async getLatestXPosts(numberOfPosts,from){
    const data= await (
        Post.find()
        .skip(from*numberOfPosts)
        .limit((from*numberOfPosts)+numberOfPosts)
        .populate({path: 'userID',select:["-password"]})
        .populate({path:'commentsID',options:{sort:{_id:-1}}})
        .sort({'_id': -1})
        .lean()
        .exec()
        )
         //HEAVY CODE
         console.time('HEAVY')  //use time cause profile doesnt work in vs code
        // let result=data;
         let result =  await Promise.all( data.map(
           async x =>{
              //add likes and comments to the post  
             x?.commentsID&&(await Promise.all(
             x.commentsID.map(
               async c=> {
               const userObject =  await  User.findById(c.userID).select(["-password"])
               c.userID =userObject
               c.likes = await getLikes(c._id)
               return c
               }
             ))) 
            x.likes = await getLikes(x._id)
         
            return x
         })
         )
         //HEAVY CODE 
         console.timeEnd('HEAVY')
      return result;
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
   //TODO:: credbeility check. joi?
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
   login to the page
   and sents jwt to the client
   **/
   logIn(req,res){
   const { user, password } =req.body;
   //check if password or user is not string
   /*
   HERE
   */
    User.findOne({user}).lean().then(
    DBuser=>{
       if(!DBuser)
          return res.status(400).json({message:'Invalid username or password'});
          const {password : DBpassword , ...userInfo} =DBuser
          bcrypt.compare(password,DBpassword).then(
          isCorrect=>{
             if(isCorrect){
                const payload={
                   id:DBuser._id,
                   user:DBuser.user, 
                  }
                  jwt.sign(payload,
                  process.env.JWT_SECRET,
                  {expiresIn:86400*30}, //for 30 days
                  (err,token)=>{
                  if(err) return res.status(500).json({message:err})
                  return res.status(200).json({
                     message:"Success",
                     token: `Bearer ${token}`,
                     userInfo 
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
 
    
    ).catch((e)=>res.status(500).json({message:`Error ${e} `})
    )
   },
/**
the mittleware of the pogram, checks if
the jwt is valid.
 */
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
