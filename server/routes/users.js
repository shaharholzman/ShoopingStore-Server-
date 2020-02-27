const router = require('express').Router()
const db = require('../sql')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')

// VT
const vt = (req,res,next)=>{
    let token = req.session.TK
       jwt.verify(token, 'user', function(err, decoded) {
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
       jwt.verify(token, 'user', function(err, decoded) {
           if(err){
               console.log(err)
               res.sendStatus(401)
           }else{
             let id = decoded.id 
             req.session.ID = id
             req.session.save()
             let a = req.session.CartID
             let b = decoded.id 
             let c = decoded.userName
             let data = [{a},{b},{c}]
             res.json(data)
       }
   });

})

// Register_A
router.post('/register_A',(req,res)=>{
    const {personal_id,userName} = req.body
    if(personal_id,userName){
       let q = `select * from Users where personal_id = ${personal_id}` 
       db.query(q,(err,result,field)=>{
           if(err){
               res.sendStatus(500)
           }
           if(result.length === 0){
               let p = `select * from Users where userName = '${userName}'`
               db.query(p,(err1,result1,field1)=>{
                   if(err1){
                       res.sendStatus(500)
                   }
                   if(result1.length === 0){
                    res.sendStatus(200)
                   }else{
                    let myError = 'The username you entered already exists in the system, please try another name'
                    res.send(myError)
                   }
               }) 
            }else{
                let myError = 'This ID already exists in the system, new user cannot be created'
                res.send(myError)
            }
        })
    }else{
        res.sendStatus(500)
    }
})


// Register (1) --------------------------------------------------------------->
router.post('/register',(req,res)=>{
    const {personal_id,userName,password} = req.body.form_A
    const {city,first_name,last_name,street} = req.body.form_B
   if(personal_id,userName,password,city,first_name,last_name,street){
        bcrypt.genSalt(10,(err,salt)=>{
            if(err){
                res.sendStatus(500)
            }else{
                bcrypt.hash(password,salt,async(err,hash)=>{
                    if (err){
                        res.sendStatus(500)
                    }else{
                        let q = `INSERT INTO Users (personal_id,first_name,last_name,userName,password,city,street)
                        VALUES('${personal_id}','${first_name}','${last_name}','${userName}','${hash}','${city}','${street}')`
                        db.query(q,(err,result,field)=>{
                            if(err){
                                console.log(err)
                                res.sendStatus(500)
                            }else{
                                let b = `select * from Users where userName = '${userName}'` 
                                db.query(b,(err1,result1,field1)=>{
                                    if(err1){
                                        res.sendStatus(500)
                                    }
                                    let id = result1[0].id
                                    jwt.sign({id,userName},'user',{ expiresIn: '2h' },(err,token)=>{
                                        if(err){
                                            res.sendStatus(500)
                                        }else{
                                            // בדיקה---------------------
                                            req.session.TK = token
                                            req.session.ID = `${id}`
                                            req.session.logedin = true
                                            req.session.save()
                                            // בדיקה-------------------
                                            res.json(result1).sendStatus(200)
                                        }
                                    })  
                                })
                                }    
                            })
                        }
                 })
               }
             })         
    }else{
       res.sendStatus(500)
   }
})

// Login (2) ----------------------------------------------------------------------->
router.post('/login',(req,res)=>{
    const {userName,password} = req.body
    if(userName,password){
        let q = `select * from Users where userName = '${userName}'` 
        db.query(q,(err,result,field)=>{
            if(err){
                res.sendStatus(500)
            }
            if(result.length > 0){
               bcrypt.compare(password,result[0].password,(err,isOkay)=>{
                    if(isOkay){
                        let id = result[0].id
                        if(result[0].idAdmin === 0){
                            jwt.sign({id,userName},'user',{ expiresIn: '2h' },(err,token)=>{
                                if(err){
                                    res.sendStatus(500)
                                }else{
                                    // בדיקה---------------------
                                    req.session.TK = token
                                    req.session.ID = `${id}`
                                    req.session.logedin = true
                                    req.session.save()
                                    // בדיקה-------------------
                                    res.json(result).sendStatus(200)
                                }
                            })
                        }else{ 
                            jwt.sign({id,userName},'admin',{ expiresIn: '2h' },(err,token)=>{
                                if(err){
                                    res.sendStatus(500)
                                }else{
                                    // בדיקה---------------------
                                    req.session.TK = token
                                    req.session.ID = `${id}`
                                    req.session.logedin = true
                                    req.session.admin = true
                                    req.session.save()
                                    console.log(req.session)
                                    // בדיקה-------------------
                                    res.json(result).sendStatus(200)
                                }
                            })
                        }
                    }else{
                        console.log(err)
                        res.sendStatus(500)
                    }
                })
            }else{
                res.sendStatus(400)
            }
        })
        
    }else{
        res.sendStatus(500)
    }
})

// Get Products(3)----------------------------------------------------------------------->
router.get('/products',(req,res)=>{
    let q = 'select * from Products order by name'
    db.query(q,(err,result,field)=>{
        if(err){
            console.log(err)
            res.sendStatus(500)
        }
        res.json(result)
    })
})

// Get Orders(4)----------------------------------------------------------------------->
router.get('/orders',(req,res)=>{
    let q = 'select * from Orders ORDER BY id DESC LIMIT 9999999'
    db.query(q,(err,result,field)=>{
        if(err){
            res.sendStatus(500)
        }
        res.json(result)
    })
})

// get cart of user(5)------------------------------------------------------------------------->
router.get('/cart/user',vt,(req,res)=>{
    let q = `select * from Cart where costomer_id = ${req.session.ID}`
    db.query(q,(err,result,field)=>{
        if(err){
            console.log(err)
            res.sendStatus(500)
        }
        if(result.length === 0){
            res.json(result)
        }else{
            req.session.CartID = result[0].id
            req.session.save()
            res.json(result)
        }
    })
})

// get order of user(6)------------------------------------------------------------------------->
router.get('/order/:id',vt,(req,res)=>{
    let q = `select * from Orders where id = ${req.params.id}`
    db.query(q,(err,result,field)=>{
        if(err){
            res.sendStatus(500)
        }
        res.json(result)
    })
})

// get categories(7)----------------------------------------------------------------<
router.get('/categories',vt,(req,res)=>{
    let q = 'select * from Categories order by name'
    db.query(q,(err,result,field)=>{
        if(err){
            res.sendStatus(500)
        }
        res.json(result)
    })
})

// get products by categories(8)----------------------------------------------------------------<
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

// get product by name(9)----------------------------------------------------------------<
router.post('/product',vt,(req,res)=>{
    let q = `select * from Products where name like '%${req.body[0].name}%'`
    db.query(q,(err,result,field)=>{
        if(err){
            res.sendStatus(500)
        }
        res.json(result)
    })
})

// add cart for cart of user(10)------------------------------------------------------>
router.get('/cart',(req,res)=>{
    let costomer_id = req.session.ID
    let q = `INSERT INTO Cart (costomer_id)
    VALUES(${costomer_id})`
    let s = `select * from Cart where costomer_id = '${costomer_id}'`
    db.query(q,(err,result,field)=>{
        if(err){
            res.sendStatus(500)
        }
        db.query(s,(err1,result1,field1)=>{
            if(err1){
                res.sendStatus(500)
            }
            res.json(result1)
        })
    })
})

// add product for cart of user(11)------------------------------------------------------>
router.post('/product/:id',vt,(req,res)=>{
    let cart_id = req.params.id
    const {amount,total_price,product_id} = req.body
    let q = `INSERT INTO Product_Cart (product_id,amount,total_price,cart_id)
    VALUES(${product_id},${amount},${total_price},${cart_id})`
    let i = `SELECT
    Product_Cart.id,
    Product_Cart.amount,
    Product_Cart.total_price,
    Products.id as ID,
    Products.name,
    Products.img
    FROM Product_Cart
    inner join Products on Products.id = Product_Cart.product_id
    WHERE Product_Cart.cart_id = ${cart_id}`
    db.query(q,(err,result,field)=>{
        if(err){
            console.log(err)
            res.sendStatus(500)
        }
        db.query(i,(err1,result1,field1)=>{
            if(err1){
                console.log(err)
             res.sendStatus(500)
         }
         res.json(result1)
     })
    })
})

//  get products of cart(12)-------------------------------------------------->
router.get('/product/:id',vt,(req,res)=>{
    let cart_id = req.params.id
    let q = `SELECT
    Product_Cart.id,
    Product_Cart.amount,
    Product_Cart.total_price,
    Products.id as ID,
    Products.name,
    Products.img
    FROM Product_Cart
    inner join Products on Products.id = Product_Cart.product_id
    WHERE Product_Cart.cart_id = ${cart_id}`
    db.query(q,(err,result,field)=>{
        if(err){
            console.log(err)
            res.sendStatus(500)
        }
        res.json(result)
    })
})

// Delete Product from Cart(13)------------------------------------------------>
router.put('/product/delete/:id',vt,(req,res)=>{
    let q = `delete from Product_Cart where id = ${req.params.id} and Cart_id = ${req.body.id} `
    db.query(q,(err,result,field)=>{
        if(err){
            console.log(err)
            res.sendStatus(500)
    }
    res.sendStatus(200)
})
})

// Delete all Products from Cart(14)------------------------------------------------>
router.delete('/product/delete/all/:id',vt,(req,res)=>{
    let q = `delete from Product_Cart where Cart_id = ${req.params.id} `
    db.query(q,(err,result,field)=>{
        if(err){
            console.log(err)
            res.sendStatus(500)
        }
        res.sendStatus(200)
    })
})

// Serch Products of order(15)------------------------------------------------>
router.get('/order/product/:name',vt,(req,res)=>{
    let name = req.params.name
    let q = `SELECT *
    FROM Products
    WHERE name Like '${req.params.name}%'`
   if(name){
     db.query(q,(err,result,field)=>{
         if(err){
             console.log(err)
             res.sendStatus(500)
         }
         res.json(result)
     })
   }else{
       res.sendStatus(500)
   }
})

// add order of user and delete all Details of product_cart and cart of user (16)------------------------------------------------------>
router.post('/orders/:cart',vt,(req,res)=>{
    let user_id = req.session.ID
    let cart_id = parseInt(req.params.cart)
    const {city,street,credit} = req.body.form
    const {total_price,newDate} = req.body
    let q = `INSERT INTO Orders (user_id,total_price,city,street,DeliveryDate,credit)
    VALUES (${user_id},${total_price},'${city}','${street}','${newDate}',${credit})`
    let d = `delete from cart where id = ${cart_id}`
    let d2 = `delete from Product_Cart where cart_id = ${cart_id}`
    if(cart_id,total_price,city,street,newDate,credit){
        db.query(q,(err,result,field)=>{
            if(err){
                console.log(err)
                res.sendStatus(500)
            }else{
                db.query(d2,(err1,result1,field1)=>{
                    if(err1){
                        console.log(err1)
                        res.sendStatus(500)
                    }else{
                        console.log(result1)
                        db.query(d,(err2,result2,field2)=>{
                            if(err){
                                console.log(err2)
                                res.sendStatus(500)
                            }else{
                                res.sendStatus(201)

                            }
                        })
                    }
                })
            }
        })
    }else{
        res.sendStatus(500)
    }
})


module.exports = router