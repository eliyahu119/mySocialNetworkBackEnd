const { default: mongoose } = require("mongoose");
const users = require("./schemas/users");
const posts = require("./schemas/posts");
const comments = require("./schemas/comment");
const postAggregate = require("./schemas/postAggregate");
const {
  statusCodes,
  sendInternalErrorAsRespond,
} = require("./utils/httpUtils");
const ConnectionString = process.env.MONGO_CONNECT;

//connect to DB
mongoose.connect(
  ConnectionString,
  () => {
    console.log("connected");
  },
  (e) => {
    console.error(e);
  }
);

/**
 *add  like to the post
 *sends 403 if post doesnt exist.
 *sends 500 if there was an internal error.
 * @param {object} req
 * @param {object} res
 */
const addPostLike = async (req, res) => {
  const userID = mongoose.Types.ObjectId(req.user.id);
  const { postId } = req.params;
  //if true its post, false its a comment.
  try {
    const postExits = await posts.exists({ _id: postId });
    if (postExits) {
      await posts.findByIdAndUpdate(postId, { $addToSet: { likes: [userID] } });
      res.json({ message: "added like" });
    } else {
      res.status(statusCodes.BAD_REQUEST)({ message: "cannot add like" });
    }
  } catch (err) {
    sendInternalErrorAsRespond(res, error);
  }
};

/**
 *remove  like from the post
 *sends 403 if post doesnt exist.
 *sends 500 if there was an internal error.
 * @param {object} req
 * @param {object} res
 */
const removePostLike = async (req, res) => {
  const userID = mongoose.Types.ObjectId(req.user.id);
  const { postId } = req.params;
  try {
    await posts.findByIdAndUpdate(postId, {
      $pull: { likes: userID },
    });
    res.json({ message: "removed like" });
  } catch (err) {
    sendInternalErrorAsRespond(res, error);
  }
};

/**
 *remove  like from the comment
 *sends 403 if comment doesnt exist.
 *sends 500 if there was an internal error.
 * @param {object} req
 * @param {object} res
 */
async function addCommentLike(req, res) {
  const userID = mongoose.Types.ObjectId(req.user.id);
  const { commentId } = req.params;
  try {
    const commentExist = await comments.exists({ _id: commentId });
    if (!commentExist) {
      res
        .status(statusCodes.UNPROCESSABLE)
        .json({ message: "cannot add like" });
      return;
    }
    await comments.findByIdAndUpdate(commentId, {
      $addToSet: { likes: [userID] },
    });
    res.status(statusCodes.OK).json({ message: "added like" });
  } catch (err) {
    sendInternalErrorAsRespond(err, res);
  }
}

const removCommentLike = async (req, res) => {
  const userID = mongoose.Types.ObjectId(req.user.id);
  const { commentId } = req.params;
  try {
    await comments.findByIdAndUpdate(commentId, { $pull: { likes: userID } });
    res.json({ message: "removed like" });
  } catch (err) {
    sendInternalErrorAsRespond(err, res);
  }
};

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
  async setPost(req, res) {
    try {
      userID = req.user.id;
      const { content } = req.body;

      const newPost = new posts({
        userID: new mongoose.Types.ObjectId(userID),
        content: content,
      });
      //TODO: MAKE THIS CRAP WORK WITH SAVE ONLY
      let post = await newPost.save();
      post = await posts
        .findById(post.id)
        .populate({ path: "userID", select: ["-password"] })
        .exec();
      res.status(statusCodes.OK).json(post);
    } catch (err) {
      sendInternalErrorAsRespond(err, res);
    }
  },

  /**
   * add comment to existing post.
   * @param {object} req
   * @param {object} res
   */
  async addComment(req, res) {
    userID = req.user.id;
    const { postId } = req.params;
    const { content } = req.body;
    const newComment = new comments({
      userID: new mongoose.Types.ObjectId(userID),
      content: content,
    });
    try {
      const exists = await posts.exists({ _id: postId }).lean().exec();
      if (exists) {
        let insertedCommentiD;
        const com = await newComment.save();
        insertedCommentiD = com._id.toString();
        //return the promis of the find
        await posts.findByIdAndUpdate(postId, {
          $push: { commentsID: [insertedCommentiD] },
        });
        let comment = await comments
          .findById(insertedCommentiD)
          .populate({ path: "userID", select: ["-password"] })
          .exec();
        res.status(statusCodes.OK).json({ meassage: "success", data: comment });
      } else {
        res
          .status(statusCodes.NOT_FOUND)
          .json({ message: "post wasn't found" });
      }
    } catch (err) {
      sendInternalErrorAsRespond(err, res);
    }
  },

  /**
    get posts from the DB from index to index.
    */
  async getLatestXPosts(numberOfPosts, from) {
    const data = await posts.aggregate(postAggregate);
    return data;
  },
};
