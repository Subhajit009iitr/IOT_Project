import { mongo } from "mongoose";
import { userDataModel } from "../db/models.mjs";
import jwt from "jsonwebtoken";


export const isAdmin = async (req, res, next) => {
    // get jwt from header
    let token = req.headers.cookie?.split("token=")[1];
    if(!token) {
        res.sendStatus(403);
        return;
    }
    // get email by decoding jwt
    let email = jwt.verify(token, process.env.JWT_SECRET).email;
    let isUser = await userDataModel.findOne({email: email});
    if(isUser) {
        next();
    } else {
        res.send("invalid user")
        res.sendStatus(403);
    }
}

export default isAdmin;