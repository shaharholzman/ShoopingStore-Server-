const router = require('express').Router()
const jwt = require('jsonwebtoken');
const db = require('../sql')

// VT
const vt = (req,res,next)=>{
    let token = req.session.TK
       jwt.verify(token,'admin', function(err, decoded) {
           if(err){
               console.log(err)
               res.sendStatus(401)
           }else{
             let id = decoded.id 
             req.session.ID = id
             req.session.save()
             next()
       }
   });
}

// verify
router.get('/verify',(req,res)=>{
    let token = req.session.TK
       jwt.verify(token, 'admin', function(err, decoded) {
           if(err){
               console.log(err)
               res.sendStatus(401)
           }else{
             let id = decoded.id 
             req.session.ID = id
             req.session.save()
             res.json(decoded.userName)
       }
   });
})


// get categories(1)----------------------------------------------------------------<
router.get('/categories',vt,(req,res)=>{
    let q = 'select * from Categories order by name'
    db.query(q,(err,result,field)=>{
        if(err){
            console.log(err)
            res.sendStatus(500)
        }
        res.json(result)
    })
})

// get products by categories(2)----------------------------------------------------------------<
router.get('/categories/:id',vt,(req,res)=>{
    let q = `select * from Products where categories_id = ${req.params.id} order by name `
    db.query(q,(err,result,field)=>{
        if(err){
            console.log(err)
            res.sendStatus(500)
        }
        res.json(result)
    })
})

// Add product(3)----------------------------------------------------------------<
router.post('/product',vt,(req,res)=>{
    const {name,price,img,category} = req.body
    let q = `INSERT INTO products (name,categories_id,price,img)
    VALUES('${name}',${category},${price},'${img}')`
    db.query(q,(err,result,field)=>{
        if(err){
            console.log(err)
            res.sendStatus(500)
        }
        res.sendStatus(201)
    })

})

// Get Product by id(4)-----------------------------------------------------<
router.get('/product/:id',vt,(req,res)=>{
    let q = `select * from Products where id = ${req.params.id}`
    db.query(q,(err,result,field)=>{
        if(err){
            console.log(err)
            res.sendStatus(500)
        }
        res.json(result)
    })

})

// Update product(5)-----------------------------------------------------<
router.put('/product/update/:id',vt,(req,res)=>{
    const {name,categories_id,price,img} = req.body
    let q = `UPDATE products
    SET name = '${name}',categories_id = ${categories_id},price = ${price},img = '${img}'
    WHERE id = ${req.params.id} 
    `
    db.query(q,(err,result,field)=>{
        if(err){
            console.log(err)
            res.sendStatus(500)
        }
            res.sendStatus(200)
    })

})

// get product by name(6)----------------------------------------------------------------<
router.post('/search/product',vt,(req,res)=>{
    let q = `select * from Products where name like '%${req.body[0].name}%'`
    db.query(q,(err,result,field)=>{
        if(err){
            console.log(err)
            res.sendStatus(500)
        }
        res.json(result)
    })
})


module.exports = router