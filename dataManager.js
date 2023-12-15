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
 async function addPostLike (req, res)  {
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
 async function removePostLike (req, res)  {
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

async function removCommentLike (req, res)  {
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
 * Retrieves latest X posts from the DB.
 * @param {number} numberOfPosts - Number of posts to retrieve.
 * @param {number} from - Start index.
 * @returns {Promise} - Promise with the retrieved posts.
 */
async function getLatestXPosts(numberOfPosts, from) {
  const data = await posts.aggregate(postAggregate);
  return data;
}

/**
 * Adds a comment to an existing post.
 * @param {object} req
 * @param {object} res
 */
async function addComment(req, res) {
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
      let insertedCommentID;
      const com = await newComment.save();
      insertedCommentID = com._id.toString();
      await posts.findByIdAndUpdate(postId, {
        $push: { commentsID: [insertedCommentID] },
      });
      let comment = await comments
        .findById(insertedCommentID)
        .populate({ path: "userID", select: ["-password"] })
        .exec();
      res.status(statusCodes.OK).json({ message: "success", data: comment });
    } else {
      res.status(statusCodes.NOT_FOUND).json({ message: "post wasn't found" });
    }
  } catch (err) {
    sendInternalErrorAsRespond(err, res);
  }
}

/**
 * Sets a new post.
 * @param {object} req
 * @param {object} res
 */
async function setPost(req, res) {
  try {
    const userID = req.user.id;
    const { content } = req.body;

    const newPost = new posts({
      userID: new mongoose.Types.ObjectId(userID),
      content: content,
    });

    let post = await newPost.save();
    post = await posts
      .findById(post.id)
      .populate({ path: "userID", select: ["-password"] })
      .exec();

    res.status(statusCodes.OK).json(post);
  } catch (err) {
    sendInternalErrorAsRespond(err, res);
  }
}

module.exports = {
  addPostLike,
  removePostLike,
  addCommentLike,
  removCommentLike,
  setPost,
  addComment,
  getLatestXPosts,
};

