import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { connection } from "../config/dbConfig.js"
dotenv.config()
export const SignUp = async(req,res)=>{
    try{
        const { name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const db = await connection();
        const collection = db.collection("users")

        const existingUser = collection.findOne({email})
        if(existingUser){
            return res.status(409).json({
                success: false,
                message: "An user already exists with this email"
            })
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = {
            name,
            email,
            password: hashedPassword,
            createdAt: new Date()
        }

        const result = await collection.insertOne(newUser)
        if(result.acknowledged){
            const tokenData = {
                _id: result.insertedId.toString(),
                email: email
            }

            const token = jwt.sign(tokenData,process.env.JWT_SECRET,{
                expiresIn: "5d"
            });

            res.cookie("token",token,{
                httpOnly: true,
                sameSite: "lax",
                secure: true,
                maxAge: 5 * 24 * 60 * 60 * 1000
            })

            return res.status(201).json({
                success: true,
                message: "User created successfully",
                user: {
                    id: result.insertedId,
                    email,
                    name
                }
            })
        }
    }
    catch(error){
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const Login = async(req,res)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const db = await connection();
        const collection = db.collection("users")

        const user = await collection.findOne({email})
        if(!user){
            return res.status(409).json({
                success: false,
                message: "No user exists with this email"
            })
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(401).json({
                message: "Invalid credentials",
                success: false
            })
        }

        const tokenData = {
            _id: user._id.toString(),
            email: user.email
        }

        const token = jwt.sign(tokenData,process.env.JWT_SECRET,{
            expiresIn: "5d"
        })
        
        res.cookie({
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            maxAge: 5 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            success: true,
            message: "Login successfull"
        })
    } 
    catch(error){
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Server error please try again later "
        })
    }
}