import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connection } from "./config/dbconfig.js"
import cookieParser from "cookieparser"
import authRoutes from "./routes/authRoutes.js"

dotenv.config()

const app =express()

const port = process.env.port || 5000

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRoutes)
app.listen(port,(req,res)=>{
    console.log(`app is listening on port ${port}`)
})