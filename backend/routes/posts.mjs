import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken";
import { sensorDataModel, userDataModel } from "../db/models.mjs";
import {isAdmin} from "../middleware/auth.mjs";
import nodemailer from "nodemailer";
import checkAlert from "../alert.mjs";

const router = express.Router();

const isValidEmail = (email) => {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
};

const isRequiredData = (data) => {
    // if(!data.gps || !data.gps.lat || !data.gps.lon || !data.gps.alt){
    //     return false;
    // }
    if(!data.bmp || !data.bmp.temp || !data.bmp.pres){
        return false;
    }
    if(!data.mpu || !data.mpu.ax || !data.mpu.ay || !data.mpu.az || !data.mpu.gx || !data.mpu.gy || !data.mpu.gz){
        return false;
    }
    return true;
}

function sendAlertViaSocket(payload) {
    const client = new net.Socket();
  
    client.connect(4010, "3.108.63.6", () => {
      console.log("Connected to alert socket server !!!");
      client.write(payload);
      client.end();
    });
  
    client.on("error", (err) => {
      console.error("Socket connection error:", err.message);
    });
  
    client.on("close", () => {
      console.log("Connection closed");
    });
}

router.post("/wifi-data" ,async (req, res) => {
    console.log("triggered wifi-data");
    let data = req.body;
    data.time = new Date();
    // isRequiredData(data);

    let newEntry = new sensorDataModel({
        device_id: "device_1",
        lat: data.gps.lat,
        lon: data.gps.lng,
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
        console.log(newEntry);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(403);
    }
});

router.post("/admin-login", async (req, res) => {
    let data = req.body;
    // sanity check
    console.log(data);
    console.log(data.email, data.password);
    if(!data.email || !data.password ) {
        console.log("triggered admin-login");
        res.send("invalid data")
        res.sendStatus(403);
        return;
    }
    let user = await userDataModel.findOne({email: data.email});
    if(user) {
        if(user.password == data.password) {
            console.log("triggered admin-login2", user);
            const token = jwt.sign({email: user.email}, process.env.JWT_SECRET);
            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            })
            
            res.send({status: "success", token: token});
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

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(403).send('Invalid token');
        const alertPayload = JSON.stringify({
          Auth: "327d9d71f503e6083c8989bf20425c40cea6ad77f5809d2e160d06f4ab55078d",
          Subject: "Alert",
          To: "s_biswas@cs.iitr.ac.in",
          Content: data.message || "Default message from server",
        });
      
        sendAlertViaSocket(alertPayload);
        res.send({ status: "alert sent attempt made" });
    });
});


router.get("/", async (req, res) => {
    res.send("Hello World!");
});

router.get("/getdata", async (req, res) => {
    try {
        const latestData = await sensorDataModel.find({})
        .sort({ time: -1 })
        .limit(5);
        console.log(latestData);
        checkAlert(latestData);
      res.status(200).json(latestData);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    }
});

export default router;