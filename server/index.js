const { log } = require('console')
const express=require('express')
const cors=require('cors')
const pool=require('./db')
const app=express()

app.use(cors())
app.use(express.json())

app.get('/test_db',async(req,res)=>{
    try{
        const result=await pool.query('SELECT NOW()')
        res.json(result.rows)
    }catch(err){
console.error(err)
res.status(500).send('DataBase error')
    }
   
})

app.post('/orders', async (req, res) => {
  try {
    const { order_number, customer_name, customer_phone, customer_address } = req.body

    const result = await pool.query(
      `INSERT INTO orders (order_number, customer_name, customer_phone, customer_address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [order_number, customer_name, customer_phone, customer_address]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Error creating order')
  }
})

app.get('/orders', async (req,res)=>{
    try{
        const result=await pool.query('SELECT * FROM orders')
        res.json(result.rows)
    }catch(err){
        console.error(err)
        res.status(500).send('Error fetching orders')
    }
})

app.post('/order-items', async(req,res)=>{
    try{
        const{order_id, product_name, sku, quantity, unit_type, price}=req.body
        const result=await pool.query(
            `INSERT INTO order_items(order_id, product_name, sku, quantity, unit_type, price)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING *`
            [order_id,product_name,sku, quantity, unit_type, price]
            
        )
        res.json(result.rows[0])
    }catch(err){
        console.error(err)
        res.status(500).send('ERROR addind item')
    }
})

app.listen(5000,()=>{
    console.log("Srever is running in port 5000")
})