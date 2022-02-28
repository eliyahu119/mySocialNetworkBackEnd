require('dotenv').config(); 
const express = require('express');
const dataManager=require('./dataManager');
//TODO DELETE
const cors=require('cors')
const app = express()
const port = process.env.PORT || 8080
const path=String.raw`C:\Users\eliyahu\Documents\פרויקטים\MyScoialNetwork\mysocialnetworkfrontend\public`
 
//for dev only TODO: DELETE
app.use(cors());

app.use(express.json())
app.post('/signIn',dataManager.singIn);

app.post('/login',dataManager.logIn);

app.post('/comment',dataManager.verifyJWT,dataManager.setComment)
app.get('/getData',dataManager.verifyJWT,(req, res)=>{
    dataManager.getLatestXPosts(5,0).then(data=>{
    res.json(data);
    })
})

app.post('/post',dataManager.verifyJWT,dataManager.setPost);

app.post('/like',dataManager.verifyJWT,dataManager.addlike)
//simple http server
app.use('/',express.static(path));

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})







