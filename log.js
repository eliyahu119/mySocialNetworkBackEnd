const { default: mongoose } = require("mongoose");
const users = require("./schemas/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  statusCodes,
  sendInternalErrorAsRespond,
} = require("./utils/httpUtils");
const {milisecondTo}=require('./utils')
module.exports = {
  /**
   the sign in function
   sends 
   500 if there is a internal server(db) error.
   200 if all is well.
    **/
  async singIn(req, res) {
    let { user, password, email, gender } = req.body;
    password = await bcrypt.hash(password, 10); //TODO: consider using salts instead of  rounds
    const dbUser = new users({
      user,
      password,
      email,
      gender, //true is male, false female
    });
    try {
      const SavedUser = await dbUser.save();
      res.status(200).json({ message: `${SavedUser.user} has been added` });
    } catch (err) {
      sendInternalErrorAsRespond(res, err);
    }
  },

  /**
 login to the page
 and sents jwt to the client
 **/
  async logIn(req, res) {
    const { user, password } = req.body;
    //check if password or user is not string
    /*
    HERE
    */
    try {
      const DBuser = await users.findOne({ user }).lean();
      if (!DBuser) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json({ message: "Invalid username or password" });
      }
      const { password: DBpassword, ...userInfo } = DBuser;
      const isCorrect = await bcrypt.compare(password, DBpassword);
      if (!isCorrect) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json({ message: "Invalid username or password" });
      }
      const payload = {
        id: DBuser._id,
        user: DBuser.user,
      };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: milisecondTo.MONTH }, //for 30 days
        (err, token) => {
          if (err) {
            sendInternalErrorAsRespond(res, err);
          }
          return res.status(statusCode.OK).json({
            message: "Success",
            token: `Bearer ${token}`,
            userInfo,
          });
        }
      );
    } catch (err) {
      sendInternalErrorAsRespond(res, err);
    }
  },
  /**
   * cheks if the user is sign
   * 422 (Unprocessable Entity response) if userName or Email already been used.
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async checkIfSignedIn(req, res, next) {
    let { user, email } = req.body;
    try {
      if (await users.exists().or([{ email }, { user }])) {
        res
          .status(422)
          .json({ message: "userName or Email already been used " });
      } else next();
    } catch {
      sendInternalErrorAsRespond(res, err);
    }
  },

  /**
     the mittleware of the pogram, checks if
     the jwt is valid.
      */
  verifyJWT(req, res, next) {
    try {
      const token = req.headers["x-access-token"]?.split(" ")[1];
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
            return res.sendStatus(statusCodes.UNAUTHORIZED);
          }
          req.user = { id: decoded.id, user: decoded.user };
          next();
        });
      } else return res.sendStatus(statusCodes.UNAUTHORIZED);
    } catch (error) {
      sendInternalErrorAsRespond(res, err);
    }
  },
};
