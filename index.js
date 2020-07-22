const Telegrambot = require("node-telegram-bot-api")
const mysql = require("mysql")

const key = require("./Resource/Api.json")

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

var Telegram = new Telegrambot(key.Apikey, { polling: true })

function start(msg){
    console.log("load")
    connection.query(`SELECT * FROM Caduta WHERE ID = ${msg.chat.id}`, (err, res)=>{
        if(err) throw err;
        console.log(res.length)
        if(res.length > 0){
            return
        }
        connection.query(`INSERT INTO Caduta (ID) VALUES (?)`, [msg.from.id], err=>{
            if(err) throw err;
        })
    })
}

Telegram.on("text", msg =>{
    if(msg.text === "/start"){
        Telegram.sendMessage(msg.chat.id, "Benvenuto " + msg.from.first_name + ", questo bot conta quante volte a @SoldatoRusso è caduta la penna")
        start(msg)
    }
    if(msg.text === "/add" && msg.chat.id === 180923698){
        connection.query(`UPDATE Caduta SET Contatore = Contatore+1 WHERE ID = ${msg.from.id}`, err =>  {
            if (err) throw err
            Telegram.sendMessage(msg.chat.id, "Aggiunto con successo, ora sei un po' più rincoglionito Fioré")
        })
    }
    if(msg.text === "/reset" && msg.from.id === 180923698){
        connection.query(`UPDATE Caduta SET Contatore = 0 WHERE ID = ${msg.from.id}`, err =>  {
            if (err) throw err
            Telegram.sendMessage(msg.chat.id, "Tutti i tuoi peccati sono stati assolti")
        })
    }
    if(msg.text === "/show"){
        connection.query(`SELECT * FROM Caduta WHERE ID = 180923698`, (err, src) =>  {
            if (err) throw err
            console.log(src)
            Telegram.sendMessage(msg.chat.id, "Questo è il numero di volte nelle quali la penna è caduta: " + src[0].Contatore)
        })
    }
})