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
const cors=require('cors')
const app = express()
const port = process.env.PORT || 8080
const path=String.raw`C:\Users\eliyahu\Documents\פרויקטים\MyScoialNetwork\mysocialnetworkfrontend\public`
 
//for dev only TODO: DELETE
app.use(cors());
app.use(bodyParser.json())
app.use(express.json())
app.post('/signIn',validateSignin,dataManager.singIn); //

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

app.post('/like',dataManager.verifyJWT,valdatesAddLike,dataManager.addlike)//
//simple http server
app.use('/',express.static(path));

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})







