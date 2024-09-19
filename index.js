const { URL_HUTANG } = require('./url-hutang');
const { URL_ULANG_TAHUN } = require('./url-ulang-tahun');
const cron = require('node-cron');
const axios = require('axios');
const https = require('https');
const dotenv = require('dotenv');
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


const express = require('express');
const app = express();
dotenv.config();

const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

cron.schedule(process.env.TIME_NOTIF_HUTANG, () => {
    const datetime = new Date().toISOString().split("T");
    const date = datetime[0];
    for (const uri of URL_HUTANG) {
        axiosInstance.post(uri, {tgl_system: date})
            .then((res) => {
                logToFile(res.data);
            })
            .catch((err) => {
                logToFile(err.response.data);
            })
    }
    logToFile("SEND NOTIF HUTANG");
});

cron.schedule(process.env.TIME_NOTIF_ULANG_TAHUN, () => {
    const datetime = new Date().toISOString().split("T");
    const date = datetime[0];
    for (const uri of URL_ULANG_TAHUN) {
        axiosInstance.post(uri, {tgl_system: date})
        .then((res) => {
            logToFile(res.data);
        })
        .catch((err) => {
            logToFile(err.response.data);
        })
    }
    logToFile("SEND NOTIF ULANG TAHUN EXECUTED");
});

// Server setup
app.get('/check-node-cron', (req, res) => {
    logToFile("Check Node-Cron");
  res.send('Node-cron Is Running');
});

app.listen(process.env.PORT, () => {
  console.log(`Server is Running On Port ${process.env.PORT}`);
});