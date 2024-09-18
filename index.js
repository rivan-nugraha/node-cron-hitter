const { URL_HUTANG } = require('./url-hutang');
const { URL_ULANG_TAHUN } = require('./url-ulang-tahun');
const cron = require('node-cron');
const axios = require('axios');
const https = require('https');
const dotenv = require('dotenv');

// Import module lain yang diperlukan
const express = require('express');
const app = express();
dotenv.config();

const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

cron.schedule('30 2 * * *', () => {
    console.log("Hit Endpoint Hutang");
    const datetime = new Date().toISOString().split("T");
    const date = datetime[0];
    for (const uri of URL) {
        axiosInstance.post(uri, {tgl_system: date})
            .then((res) => {
                console.log(res.data);
            })
            .catch((err) => {
                console.log(err.message);
            })
    }
});

cron.schedule('* 17 * * *', () => {
    console.log("Hit Endpoint Ulang Tahun");
    const datetime = new Date().toISOString().split("T");
    const date = datetime[0];
    for (const uri of URL_ULANG_TAHUN) {
        axiosInstance.post(uri, {tgl_system: date})
            .then((res) => {
                console.log(res.data);
            })
            .catch((err) => {
                console.log(err);
            })
    }
});

// Server setup
app.get('/', (req, res) => {
  res.send('Node-cron is running');
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});