const { default: mongoose } = require("mongoose");
const bcrypt =require('bcrypt')
const  users  = require("./schemas/users");
const Posts=require('./schemas/post');
const  jwt = require("jsonwebtoken");
const likes = require("./schemas/likes");
const comment = require("./schemas/comment");
const { promise } = require("bcrypt/promises");
const res = require("express/lib/response");
const postAggregate = require("./schemas/postAggregate");
 







module.exports={
    /**
     * checks if  userName or Email already been used.
     * if used sends 422 
     */
checkIfSignedIn(req,res,next){
    if (await users.exists().or([{email},{user}]))
   {
      res.status(422).json({message:"userName or Email already been used "});
      
   }
   else
    next();
},

/**
the sign in function
sends 
500 if there is a internal server(db) error.
200 if all is well.
 **/
   async singIn(req,res){
    let {user,password,email,gender}=req.body
  
   //TODO:: credbeility check. joi?
   password = await bcrypt.hash(password,10); //TODO: consider using salts instead of  rounds
   const dbUser=new users(
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