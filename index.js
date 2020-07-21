const Telegrambot = require("node-telegram-bot-api")
const mysql = require("mysql")

const key = require("./Resource/Api.json")

let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Root",
    database: ""
})

connection.connect(err => {
    if (err) throw err
    console.log("Connected to Database")
})

let Telegram = new Telegrambot(api.Apikey, { polling: true })