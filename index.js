require('dotenv').config(); 
const express = require('express');
const dataManager=require('./dataManager');
const log=require('./log')
const bodyParser=require('body-parser')
const {
    validateSignin,
    validatesLogin,
    validatePostLike,
    valdatesComment,
    validtaePost,
    validateCommentLike
} =require('./validation')

const path = require('path');



const app = express()
const port = process.env.PORT || 8080


app.use(bodyParser.json())
app.use(express.json())





app.post('/signIn',validateSignin,log.checkIfSignedIn,log.singIn); //

app.post('/login',validatesLogin,log.logIn);  // 
app.get('/isUserAuth',log.verifyJWT,(req, res)=>{
    res.status(200).json({isLoggedIn:true})
})


app.get('/post',log.verifyJWT,(req, res)=>{
    dataManager.getLatestXPosts(5,0).then(data=>{
    res.json(data);
    })
}) //
app.post('/post',log.verifyJWT,validtaePost,dataManager.setPost);//


app.post('/post/:postId/like',log.verifyJWT,validatePostLike,dataManager.addPostLike)//
app.delete('/post/:postId/like',log.verifyJWT,validatePostLike,dataManager.removePostLike)//

app.post('/post/:postId/comment',log.verifyJWT,valdatesComment,dataManager.addComment)//

app.post('/post/:postId/comment/:commentId/like',log.verifyJWT,validateCommentLike,dataManager.addCommentLike)//
app.delete('/post/:postId/comment/:commentId/like',log.verifyJWT,validateCommentLike,dataManager.removCommentLike)//





//simple http server
//const path='./build'
const source=path.resolve('./')
app.use('/',express.static(path.join(source,'public')));
app.get('*', (req,res) =>{
    res.sendFile(path.join(source,'public/index.html'));
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})







