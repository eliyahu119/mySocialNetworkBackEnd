const express = require('express')
const app = express()
const port = 8080
const path=String.raw`C:\Users\eliyahu\Documents\פרויקטים\MyScoialNetwork\mysocialnetworkfrontend\public`

//simple http server
app.use('/',express.static(path))


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

