import express from "express"
const app =express()
let port = 5000

app.use(express.json())

app.get("/",(req,res)=>{
    res.send("This is landing page")
})
app.listen(port,(req,res)=>{
    console.log(`app is listening on port ${port}`)
})