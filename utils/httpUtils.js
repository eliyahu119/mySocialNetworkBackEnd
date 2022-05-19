
const statusCodes={
     INTERNAL_ERROR:500,
     UNAUTHORIZED:401,
     UNPROCESSABLE:422,
     BAD_REQUEST:400,
     OK:200,
     NOT_FOUND:404
};



/**
 * sends an internal error to the user
 * @param {*} respond 
 */
function sendInternalErrorAsRespond(respond,error){
    respond.status(statusCodes.INTERNAL_ERROR).json({ message: `There was an internal problem, ${error} ` });
}


module.exports={statusCodes,sendInternalErrorAsRespond}

