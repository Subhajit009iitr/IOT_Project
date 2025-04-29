import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import { sensorDataModel } from "../db/models.mjs";
import {isAdmin} from "../middleware/auth.mjs";

const router = express.Router();

const isValidEmail = (email) => {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
};

router.post("/wifi-data" ,async (req, res) => {
    console.log("triggered wifi-data");
    let data = req.body;
    data.time = new Date();

    let newEntry = new sensorDataModel({
        device_id: "device_1",
        lat: data.gps.lat,
        lon: data.gps.lon,
        alt: data.gps.alt,
        temperature: data.bmp.temp,
        pressure: data.bmp.pres,
        ax: data.mpu.ax,
        ay: data.mpu.ay,
        az: data.mpu.az,
        gx: data.mpu.gx,
        gy: data.mpu.gy,
        gz: data.mpu.gz,
        time: data.time
    });

    try {
        newEntry.save();
        console.log("Data saved to database");
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(403);
    }
});

router.post("/admin-login",isAdmin, async (req, res) => {
    let data = req.body;
    // sanity check
    if(!data.email || !data.password || !data.name || !isValidEmail(data.email)) {
        res.send("invalid data")
        res.sendStatus(403);
        return;
    }

    if(user) {
        if(user.password == data.password) {
            if(!req.headers.cookie?.split("token=")[1]) {
                // generate token
                const token = jwt.sign({email: user.email}, process.env.JWT_SECRET);
                res.cookie("token", token, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
                })
            }
            res.send({status: "success"});
        } else {
            res.sendStatus(403);
        }
    } else {
      res.sendStatus(403);
    }
});

router.post("/admin-logout", isAdmin, async (req, res) => {
    res.clearCookie("token");
    res.send({status: "success"});
});

router.post("/send-alert", isAdmin, async (req, res) => {
    let data = req.body;
    console.log("message: ", data.message);
    const token = req.cookies.token;
    if (!token) return res.status(401).send('No token found');
    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(403).send('Invalid token');
        console.log("Token : ", decoded);
        // Add logic to send alert to the device using smtp
    });
});


router.get("/", async (req, res) => {
    res.send("Hello World!");
});



export default router;