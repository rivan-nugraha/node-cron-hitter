const { URL_HUTANG } = require('./url-hutang');
const { URL_ULANG_TAHUN } = require('./url-ulang-tahun');
const cron = require('node-cron');
const axios = require('axios');
const https = require('https');
const dotenv = require('dotenv');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '/logs/execution.log');

function logToFile(message) {
  const timeStampedMessage = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFile(logFilePath, timeStampedMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

function localDateString (date) {
    const tanggal = date ? new Date(date) : new Date();
    return moment.tz(tanggal, "Asia/Jakarta").format("YYYY-MM-DD");
}

const express = require('express');
const app = express();
dotenv.config();

const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

cron.schedule(process.env.TIME_NOTIF_HUTANG, () => {
    const datetime = localDateString();
    const date = datetime;
    for (const uri of URL_HUTANG) {
        axiosInstance.post(uri, {tgl_system: date})
            .then((res) => {
                console.log(res);
                logToFile(res.data);
            })
            .catch((err) => {
                console.log(res);
                logToFile(err.response.data);
            });
    }
    logToFile("SEND NOTIF HUTANG");
});

cron.schedule(process.env.TIME_NOTIF_ULANG_TAHUN, () => {
    const datetime = localDateString();
    const date = datetime;
    for (const uri of URL_ULANG_TAHUN) {
        axiosInstance.post(uri, {tgl_system: date})
        .then((res) => {
            console.log(res);
            logToFile(res.data);
        })
        .catch((err) => {
            console.log(res);
            logToFile(err.response.data);
        });
    }
    logToFile("SEND NOTIF ULANG TAHUN EXECUTED");
});

// Server Setup
app.get('/check-node-cron', (req, res) => {
    logToFile("Check Node-Cron");
    console.log(res);
    res.send('Node-cron Is Running');
});

app.get('/check-cron-hutang-script', (req, res) => {
    try {
        const datetime = localDateString();
        console.log(datetime);
        const date = datetime;
        for (const uri of URL_HUTANG) {
            axiosInstance.post(uri, {tgl_system: date})
                .then((res) => {
                    console.log(res);
                    logToFile(res.data);
                })
                .catch((err) => {
                    console.log(res);
                    logToFile(err.response.data);
                });
        }
        logToFile("SEND NOTIF HUTANG");
        res.send("Script Is Running");   
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is Running On Port ${process.env.PORT}`);
});