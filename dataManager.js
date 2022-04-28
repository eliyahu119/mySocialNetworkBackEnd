const { default: mongoose } = require("mongoose");
const bcrypt = require('bcrypt')
const users = require("./schemas/users");
const posts = require('./schemas/posts');
const jwt = require("jsonwebtoken");
const req = require("express/lib/request");
const comments = require("./schemas/comment");
const postAggregate = require("./schemas/postAggregate");





const ConnectionString = process.env.MONGO_CONNECT

//connect to DB
mongoose.connect(ConnectionString, () => {
   console.log("connected")
}, e => {
   console.error(e)
}
)


/**
 *add  like to the post
 *sends 403 if post doesnt exist.
 *sends 500 if there was an internal error.
 * @param {object} req 
 * @param {object} res 
 */
const addPostLike = async (req, res) => {
   const userID = mongoose.Types.ObjectId(req.user.id)
   const { postId } = req.params;
   //if true its post, false its a comment.
   try {
         const postExits = await posts.exists({ _id: postId })
         if (postExits) {
            await posts.findByIdAndUpdate(postId, { $addToSet: { likes: [userID] } })
            res.json({ message: 'added like' });
         }
         else {
            res.status(403)({ message: "cannot add like" });
         }
   } catch (e) {
      res.status(500).json({ message: e.message })
   }


}

/**
 *remove  like from the post
 *sends 403 if post doesnt exist.
 *sends 500 if there was an internal error.
 * @param {object} req 
 * @param {object} res 
 */
 const removePostLike = async (req, res) => {
   const userID = mongoose.Types.ObjectId(req.user.id)
   const { postId } = req.params;
   try {
      await posts.findByIdAndUpdate(postId, {
         $pull: { likes: userID }
      })
      res.json({ message: 'removed like' })
   }
   catch (e) {
      res.status(500).json({ message: e.message })
   }
}


/**
 *remove  like from the comment
 *sends 403 if comment doesnt exist.
 *sends 500 if there was an internal error.
 * @param {object} req 
 * @param {object} res 
 */
async function addCommentLike(req,res) {
   const userID = mongoose.Types.ObjectId(req.user.id)
   const { commentId } = req.params;
   try {
      const commentExist = await comments.exists({ _id: commentId });
      if (commentExist) {
         await comments.findByIdAndUpdate(commentId, { $addToSet: { likes: [userID] } });
         res.json({ message: 'added like' });
      }
      else {
         res.status(403).json({ message: "cannot add like" });
      }
   }
   catch (e) {
      res.status(500).json({ message: e.message })

   }
}

const removCommentLike = async (req, res) => {
   const userID = mongoose.Types.ObjectId(req.user.id)
   const { commentId } = req.params;
   try {
      await comments.findByIdAndUpdate(commentId, { $pull: { likes: userID } })
      res.json({ message: 'removed like' })
   }
   catch (e) {
      res.status(500).json({ message: e.message })
   }
}



/**
 export the dataManager
**/
module.exports = {
   addPostLike,
   addCommentLike,
   removePostLike,
   removCommentLike,




   /**
  set post function
   */
   setPost(req, res) {
      userID = req.user.id;
      const { content } = req.body

      const newPost = new posts({
         userID: new mongoose.Types.ObjectId(userID),
         content: content
      })
      //TODO: MAKE THIS CRAP WORK WITH SAVE ONLY
      newPost.save().
         then(post => posts.findById(post.id)
            .populate({ path: 'userID', select: ["-password"] })
            .exec())
         .then(post => res.json(post))
         .catch(err => res.json({ error: err }))

   },

   /**
    * add comment to existing post.
    * sends 200 if the request has Succeeded.
    * sends 404 if the post wasn't found.
    * sends 500 if there was an internal error.
    * @param {object} req 
    * @param {object} res 
    */
   async addComment(req, res) {
      userID = req.user.id;
      const { postId } = req.params;
      const { content } = req.body
      const newComment = new comments({
         userID: new mongoose.Types.ObjectId(userID),
         content: content
      })
      try {
         const exists = await posts.exists({ _id: postId }).lean().exec()
         if (exists) {
            let insertedCommentiD;
            const com = await newComment.save()
            insertedCommentiD = com._id.toString()
            //return the promis of the find
            await posts.findByIdAndUpdate(postId, { $push: { commentsID: [insertedCommentiD] } })
            let comment = await comments.findById(insertedCommentiD).populate({ path: 'userID', select: ["-password"] }).exec()
            res.status(200).json({ meassage: "success", data: comment })
         } else {
            res.status(404).json({ message: "post wasn't found" })
         }
      } catch (e) {
         res.status(500).json({ message: err.meassage })
      }

   },

   /**
    get posts from the DB from index to index.
    */
   async getLatestXPosts(numberOfPosts, from) {
      const data = await posts.aggregate(postAggregate)
      return data
   },


   /**
    * cheks if the user is sign
    * 422 (Unprocessable Entity response) if userName or Email already been used.
    * @param {object} req 
    * @param {object} res 
    * @param {function} next 
    */
   async checkIfSignedIn(req, res, next) {
      let { user, email } = req.body
      try {
         if (await users.exists().or([{ email }, { user }])) {
            res.status(422).json({ message: "userName or Email already been used " });
         }
         else
            next();
      }
      catch {
         res.status(500).json({ message: 'the' })
      }
   },

   /**
   the sign in function
   sends 
   500 if there is a internal server(db) error.
   200 if all is well.
    **/
   async singIn(req, res) {
      let { user, password, email, gender } = req.body
      password = await bcrypt.hash(password, 10); //TODO: consider using salts instead of  rounds
      const dbUser = new users(
         {
            user,
            password,
            email,
            gender  //true is male, false female
         }
      );
      try {
         const SavedUser = await dbUser.save()
         res.status(200).json({ message: `${SavedUser.user} has been added` });
      } catch (err) {
         err => res.status(500).json({ message: `there was an internal problem, ${err}` });
      }

   },

   /**
   login to the page
   and sents jwt to the client
   **/
   logIn(req, res) {
      const { user, password } = req.body;
      //check if password or user is not string
      /*
      HERE
      */
      users.findOne({ user }).lean().then(
         DBuser => {
            if (!DBuser)
               return res.status(400).json({ message: 'Invalid username or password' });
            const { password: DBpassword, ...userInfo } = DBuser
            bcrypt.compare(password, DBpassword).then(
               isCorrect => {
                  if (isCorrect) {
                     const payload = {
                        id: DBuser._id,
                        user: DBuser.user,
                     }
                     jwt.sign(payload,
                        process.env.JWT_SECRET,
                        { expiresIn: 86400 * 30 }, //for 30 days
                        (err, token) => {
                           if (err) return res.status(500).json({ message: err })
                           return res.status(200).json({
                              message: "Success",
                              token: `Bearer ${token}`,
                              userInfo
                           })
                        }
                     )

                  }
                  else {
                     return res.status(400).json({ message: 'Invalid username or password' });
                  }
               }
            )
         }


      ).catch(
         (e) => res.status(500).json({ message: `There was an internal problem, ${e} ` })
      )
   },
   /**
   the mittleware of the pogram, checks if
   the jwt is valid.
    */
   verifyJWT(req, res, next) {
      const token = req.headers['x-access-token']?.split(' ')[1]
      if (token) {
         jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
               return res.sendStatus(401)
            }
            req.user = { id: decoded.id, user: decoded.user };
            next();
         })
      }
      else
         return res.sendStatus(401)
   }
}


