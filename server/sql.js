const mysql = require('mysql')


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'',
    database:'store2'
})

db.connect(err =>{
    if(err)throw err
    console.log('connected to my sql')
})

module.exports = db