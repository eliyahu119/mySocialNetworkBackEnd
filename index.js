require('dotenv').config(); 
const express = require('express');
const dataManager=require('./dataManager');
const bodyParser=require('body-parser')
const {
    validateSignin,
    validatesLogin,
    valdatesAddLike,
    valdatesComment,
    validtaePost
} =require('./validation')
//TODO DELETE
const cors=require('cors');
const path = require('path');



const app = express()
const port = process.env.PORT || 8080


//for dev only TODO: DELETE
app.use(cors());
app.use(bodyParser.json())
app.use(express.json())





app.post('/signIn',validateSignin,dataManager.checkIfSignedIn,dataManager.singIn); //

app.post('/login',validatesLogin,dataManager.logIn);  // 

app.post('/comment',dataManager.verifyJWT,valdatesComment,dataManager.addComment)
app.get('/getData',dataManager.verifyJWT,(req, res)=>{
    dataManager.getLatestXPosts(5,0).then(data=>{
    res.json(data);
    })
})
app.get('/isUserAuth',dataManager.verifyJWT,(req, res)=>{
    res.status(200).json({isLoggedIn:true})
})

app.post('/post',dataManager.verifyJWT,validtaePost,dataManager.setPost);//

app.post('/like',dataManager.verifyJWT,valdatesAddLike,dataManager.checkPostOrCommentsExists,dataManager.addLike)//
app.post('/rlike',dataManager.verifyJWT,valdatesAddLike,dataManager.checkPostOrCommentsExists,dataManager.removeLike)//

//simple http server
//const path='./build'

app.use('/',express.static(path.resolve('./build')));
app.get('*', (req,res) =>{
    res.sendFile(path.resolve('./build/index.html'));
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})







