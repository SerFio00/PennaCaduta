const Telegrambot = require("node-telegram-bot-api")
const mysql = require("mysql")

const key = require("./Resource/Api.json")

const Credits = require("./Credits.json")
const lingua = require("./lingua.json")
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Root",
    database: "penna"
})

connection.connect(err => {
    if (err) throw err
    console.log("Connected to Database")
})

var Telegram = new Telegrambot(key.Apikey, {
    polling: true
})

function getLanguage(msg) {
    return new Promise((resolve, reject) => {
        let lanCode = msg.from.language_code
        if (lanCode === 'en' || lanCode === 'it') {
            resolve(lanCode)
            return
        }
        resolve('en')
    })
}

function start(msg) {
    getLanguage(msg).then(code => {
        let lang = lingua[code]
        console.log("load")
        connection.query(`SELECT * FROM Caduta WHERE ID = ${msg.chat.id}`, (err, res) => {
            if (err) throw err;
            console.log(res.length)
            if (res.length > 0) {
                Telegram.sendMessage(msg.chat.id, lang.registro)
                return
            }
            connection.query(`INSERT INTO Caduta (ID) VALUES (?)`, [msg.from.id], err => {
                if (err) throw err;
                Telegram.sendMessage(msg.chat.id, lang.welcome.saluto + msg.from.first_name + lang.welcome.continuo)
            })
        })
    })
}

Telegram.on("text", msg => {
    getLanguage(msg).then(code => {
        let lang = lingua[code]
        if (msg.text === "/start") {
            start(msg)
        }
        if (msg.text === "/add" && msg.chat.id === 180923698) {
            connection.query(`UPDATE Caduta SET Contatore = Contatore+1 WHERE ID = ${msg.from.id}`, err => {
                if (err) throw err
                Telegram.sendMessage(msg.chat.id, lang.aggiunto)
            })
        }
        if (msg.text === "/reset" && msg.from.id === 180923698) {
            connection.query(`UPDATE Caduta SET Contatore = 0 WHERE ID = ${msg.from.id}`, err => {
                if (err) throw err
                Telegram.sendMessage(msg.chat.id, lang.redenzione)
            })
        }
        if (msg.text === "/show") {
            connection.query(`SELECT * FROM caduta WHERE ID = 180923698`, (err, src) => {
                if (err) throw err
                console.log(src)
                Telegram.sendMessage(msg.chat.id, lang.caduta + src[0].Contatore)
            })
        }
        if (msg.text === "/credits") {
            Telegram.sendMessage(msg.chat.id, lang.crediti.inizio + Credits.Fiorenzo + "\n \n \n" + lang.crediti.picchiare + "\n \n \n" + lang.crediti.scusa + Credits.Stefano, {
                parse_mode: "HTML",
            })
        }
    })
})