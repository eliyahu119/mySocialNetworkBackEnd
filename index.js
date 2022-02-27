const express = require('express')
const dataManager=require('./dataManager')
const cors=require('cors')
const app = express()
const port = process.env.PORT || 8080
const path=String.raw`C:\Users\eliyahu\Documents\פרויקטים\MyScoialNetwork\mysocialnetworkfrontend\public`
 
//for dev only TODO: DELETE
app.use(cors());

//simple http server
app.use('/',express.static(path));

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

app.get('/getData',(req, res)=>{

    dataManager.getLatestXPosts(5,0).then(data=>{
    res.json(data);
    })
})






