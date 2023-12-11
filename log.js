const { default: mongoose } = require("mongoose");
const users = require("./schemas/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  statusCodes,
  sendInternalErrorAsRespond,
} = require("./utils/httpUtils");
const { milisecondTo } = require("./utils");


/**
 * Registers a new user.
 * Sends 500 if there is an internal server (db) error, 200 if successful.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
async function signIn(req, res) {
  const { user, password, email, gender } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new users({
      user,
      password: hashedPassword,
      email,
      gender, //true is male, false female
    });

    const savedUser = await newUser.save();

    res.status(200).json({ message: `${savedUser.user} has been added` });
  } catch (error) {
    sendInternalErrorAsRespond(res, error);
  }
}

/**
 * Logs in a user and sends a JWT to the client.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
async function logIn(req, res) {
  const { user, password } = req.body;

  try {
    const DBUser = await users.findOne({ user }).lean();

    if (!DBUser) {
      return res
        .status(statusCodes.BAD_REQUEST)
        .json({ message: 'Invalid username or password' });
    }

    const { password: DBPassword, ...userInfo } = DBUser;

    const isCorrect = await bcrypt.compare(password, DBPassword);

    if (!isCorrect) {
      return res
        .status(statusCodes.BAD_REQUEST)
        .json({ message: 'Invalid username or password' });
    }

    const payload = {
      id: DBUser._id,
      user: DBUser.user,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: milisecondTo.MONTH }, //for 30 days
      (err, token) => {
        if (err) {
          sendInternalErrorAsRespond(res, err);
        }
        res.status(statusCodes.OK).json({
          message: 'Success',
          token: `Bearer ${token}`,
          userInfo,
        });
      }
    );
  } catch (error) {
    sendInternalErrorAsRespond(res, error);
  }  
}

/**
 * Checks if the user is already signed in.
 * Sends 422 (Unprocessable Entity response) if userName or Email already used.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
async function checkIfSignedIn(req, res, next) {
  const { user, email } = req.body;

  try {
    if (await users.exists().or([{ email }, { user }])) {
      res.status(422).json({ message: 'userName or Email already been used' });
    } else {
      next();
    }
  } catch (error) {
    sendInternalErrorAsRespond(res, error);
  }
}


/**
 * Middleware to verify the validity of a JWT.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
function verifyJWT(req, res, next) {
  try {
    const token = req.headers['x-access-token']?.split(' ')[1];
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.sendStatus(statusCodes.UNAUTHORIZED);
        }
        req.user = { id: decoded.id, user: decoded.user };
        next();
      });
    } else {
      return res.sendStatus(statusCodes.UNAUTHORIZED);
    }
  } catch (error) {
    sendInternalErrorAsRespond(res, error);
  }
}



module.exports = {
 signIn,
 logIn,
 checkIfSignedIn,
 verifyJWT
};
