const express = require('express')
const session = require('express-session')
const cors = require('cors')
const app = express()

// MW------------------------------------------------------------------------------------------>
app.set('trust proxy',1)
app.use(cors({credentials:true,origin:'http://localhost:4200'}))
app.use(session({secret: 'keyboard cat', cookie: {maxAge:7200000,secure:false,saveUninitialized:true,resave:true }}))
app.use(express.json())
app.use('/users',require('./routes/users'))
app.use('/admin',require('./routes/admin'))

app.listen(3000,console.log('we are on 3000 port'))