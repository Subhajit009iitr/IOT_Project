import express from "express";

function checkGeoLocation(data) {
    let lat = data.at(-1).lat;
    let lon = data.at(-1).lon;
    if(lat > 0 && lat < 90 && lon > 0 && lon < 180) {
        return null;
    } else {
        console.log("Geo location alert");
        return "Geo location alert";
    }
}

function checkStats(data) {
    let minPressure = 1000000000;
    let maxPressure = 0;
    let minTemperature = 1000000000;
    let maxTemperature = 0;

    for(let i = 0; i < data.length; i++) {
        if(data[i].pressure < minPressure) {
            minPressure = data[i].pressure;
        }
        if(data[i].pressure > maxPressure) {
            maxPressure = data[i].pressure;
        }
        if(data[i].temperature < minTemperature) {
            minTemperature = data[i].temperature;
        }
        if(data[i].temperature > maxTemperature) {
            maxTemperature = data[i].temperature;
        }
    }

    if(maxPressure - minPressure > 100) {
        console.log("Pressure alert");
        return "Pressure alert";
    }

    if(maxTemperature - minTemperature > 5) {
        console.log("Temperature alert");
        return "Temperature alert";
    }

    return null;
}

function checkGyro(data) {
    let ax = data[0].ax;
    let ay = data[0].ay;
    let az = data[0].az;
    let gx = data[0].gx;
    let gy = data[0].gy;
    let gz = data[0].gz;

    for(let i = 0; i < data.length; i++) {
        if(Math.abs(data[i].ax - ax) > 10){
            console.log("Gyro alert");
            return "Gyro alert";
        }
        // if(Math.abs(data[i].ay - ay) > 10){
        //     console.log("Gyro alert");
        // }
        if(Math.abs(data[i].az - az) > 10){
            console.log("Gyro alert");
            return "Gyro alert";
        }
        // if(Math.abs(data[i].gx - gx) > 10){
        //     console.log("Gyro alert");
        // }
        // if(Math.abs(data[i].gy - gy) > 10){
        //     console.log("Gyro alert");
        // }
        // if(Math.abs(data[i].gz - gz) > 10){
        //     console.log("Gyro alert");
        // }
    }
}

function checkAlert(data){
    checkGeoLocation(data);
    checkStats(data);
    checkGyro(data);
}

export default checkAlert;