const { default: mongoose } = require("mongoose");
const bcrypt =require('bcrypt')
const  users  = require("./schemas/users");
const Posts=require('./schemas/post');
const  jwt = require("jsonwebtoken");
const req = require("express/lib/request");
const comments = require("./schemas/comment");
const postAggregate = require("./schemas/postAggregate");
 




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
 *add  like to the post/comment.
 * @param {object} req 
 * @param {object} res 
 */
const addLike= async (req,res)=>{
    const userID =mongoose.Types.ObjectId(req.user.id)
    const {postCommentID,postOrComment } = req.body;
    //if true its post, false its a comment.
    if(postOrComment){
   try{
     await Posts.findByIdAndUpdate(postCommentID,{$addToSet:{likes:[userID]}})
     res.json({message:'added like'})
     }catch(e){
      res.status(500).json({message:e.message})
     }
   }else{
   try{
      await comments.findByIdAndUpdate(postCommentID,{$addToSet:{likes:[userID]}})
      res.json({message:'added like'})
   }catch(e){
      res.status(500).json({message:e.message})
      }
   }

}


/**
 * remove like from post/comment.
 * @param {object} req 
 * @param {object} res 
 */
const removeLike= (req,res)=>{
   const userID =mongoose.Types.ObjectId(req.user.id)
   const {postCommentID,postOrComment } = req.body;
  if(postOrComment){
     Posts.findByIdAndUpdate(postCommentID,{
         $pull:{likes:userID}}
        ).then(
       res.json({message:'removed like'})
     ).catch(
       e => res.status(500).json({message:e.message})
     )
  }else{
     comments.findByIdAndUpdate(postCommentID,{$pull:{likes:userID}}).then(
        res.json({message:'removed like'})
     ).catch(
       e => res.status(500).json({message:e.message})
     )
  }
}




/**
 export the dataManager
**/
 module.exports={
    /**
     *checks if post or comments exists
     */
   checkPostOrCommentsExists(req,res,next){
      const {postCommentID} =req.body
      Posts.exists({_id:postCommentID}).then(
      exists=>{
      if(exists)
      {
         req.body.postOrComment=true; //like
         next()
      }  
      else
         comments.exists({_id:postCommentID}).then(
      exists =>{  
         if(exists)
         {
            req.body.postOrComment=false; //comment
            next()
         }  
      else  
        res.status(403).json({meassage:"IVALID DATA"})
         //if there is like remove it, if not add it
      }
   
    )})},
    addLike,
    removeLike,
  
         
      
   

   /**
  set post function
   */ 
  setPost(req,res) {
   userID=req.user.id;
   const {content}=req.body

     const newPost= new Posts({
         userID : new mongoose.Types.ObjectId(userID),
         content : content
         })
      //TODO: MAKE THIS CRAP WORK WITH SAVE ONLY
        newPost.save().
        then(post=>Posts.findById(post.id)
        .populate({ path: 'userID',select:["-password"]})
        .exec())
          .then(post=>res.json(post))
          .catch(err=>res.json({error:err}))
     
 },
/**
 * add comment to post.
 */
  addComment(req,res) {
    userID=req.user.id;
   const {content,postID}=req.body
   const newComment= new comments({
      userID : new mongoose.Types.ObjectId(userID),
      content : content
      })
   Posts.exists({_id:postID}).lean().exec().then(
   exsist=> {
   if(exsist){
  let insertedCommentiD;
   newComment.save().
         then(com=>{
         insertedCommentiD=com._id.toString()
         //return the promis of the find
         return Posts.findByIdAndUpdate(postID,{$push:{commentsID:[insertedCommentiD]}})
         })
         // .then(()=> 
         // comment.findById('621fc5a898db7d65f61ca0f4').populate({ path: 'userID',select:["-password"]}).exec()
         // )
         .then((data)=>{
         //let id= insertedComment
         comments.findById(insertedCommentiD).populate({ path: 'userID',select:["-password"]}).exec()
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
    const data= await Posts.aggregate(postAggregate)
    return data
},


/**
 * cheks if the user is sign
 * 422 (Unprocessable Entity response) if userName or Email already been used.
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
async checkIfSignedIn(req,res,next){
  let {user,email}=req.body
  try{
   if (await users.exists().or([{email},{user}]))
   {
      res.status(422).json({message:"userName or Email already been used "});
   } 
   else
   next();
}
catch{
   res.status(500).json({message:'the'})
}
},

/**
the sign in function
sends 
500 if there is a internal server(db) error.
200 if all is well.
 **/
   async singIn(req,res){ 
   let {user,password,email,gender}=req.body
   password = await bcrypt.hash(password,10); //TODO: consider using salts instead of  rounds
   const dbUser=new users(
         {
            user ,
            password ,
            email,
            gender  //true is male, false female
         }
      );
   try{
     const SavedUser= await dbUser.save()
     res.status(200).json({message:`${SavedUser.user} has been added`});  
   }catch(err){
      err=>res.status(500).json({message:`there was an internal problem, ${err}`});
   }

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
    users.findOne({user}).lean().then(
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
 
    
    ).catch(
       (e)=>res.status(500).json({message:`There was an internal problem, ${e} `})
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
            return res.sendStatus(401)
         }
         req.user={id:decoded.id,user:decoded.user};
         next();
      })
   }
   else 
    return res.sendStatus(401)
}
 }
