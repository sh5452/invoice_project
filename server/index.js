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
    const { order_number, customer_name, customer_phone, customer_address,status } = req.body

    const result = await pool.query(
      `INSERT INTO orders (order_number, customer_name, customer_phone, customer_address,status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [order_number, customer_name, customer_phone, customer_address,status]
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

app.post('/order-items', async (req, res) => {
  try {
    const { order_id, product_name, sku, quantity, unit_type, price } = req.body

    const result = await pool.query(
      `INSERT INTO order_items (order_id, product_name, sku, quantity, unit_type, price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [order_id, product_name, sku, quantity, unit_type, price]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Error adding item')
  }
})
app.patch('/orders/:id/status',async(req,res)=>{
  try{
    const {id}=req.params
    const {status}=req.body
    const validStatuses=[
      'חדשה',
      'בטיפול',
      'מחכה למלאי',
      'נשלחה',
      'סופקה'
    ]
   if(!validStatuses.includes(status)){
    return res.status(500).send('invalid status')
   }
    const result=await pool.query(
      `
      UPDATE orders SET status=$1
      WHERE id=$2
      RETURNING *
      `
     ,
    [status,id] 
    )
    res.json(result.rows[0])
  }
  catch(err){
    console.error(err)
    res.status(500).send('Error updating status')
  }
})

app.get('/orders/:id',async(req,res)=>{
    try{
        const{id}=req.params
        const result=await pool.query(
            `SELECT orders.id AS order_id,
            orders.order_number,
            orders.customer_name,
            orders.customer_phone,
            orders.customer_address,
            orders.status,
            order_items.product_name,
            order_items.quantity,
            order_items.price
            
            FROM orders
            
            JOIN order_items
            ON orders.id=order_items.order_id
            WHERE orders.id=$1`
            ,
            [id]
        )
       const order={
        id: result.rows[0].order_id,
        order_number: result.rows[0].order_number,
        customer_name: result.rows[0].customer_name,
        customer_phone:result.rows[0].customer_phone,
        customer_address:result.rows[0].customer_address,
        status:result.rows[0].status
       }
       const items=result.rows.map(item=>({
        product_name:item.product_name,
        quantity:item.quantity,
        price:item.price
       }))
       res.json({
        order,
        items
       })
    }catch(err){
        console.error(err)
        res.status(500).fetch('Error fetching order')
    }
})

app.put('/order-items/:id', async(req,res)=>{
  const {id}=req.params
  const {quantity}=req.body
  const result=await pool.query(
    `
    UPDATE order_items
    SET quantity =$1
    WHERE id=$2
    RETURNING
    *
    `
    ,
    [quantity,id]
  )
  res.json(result.rows[0])
})

app.listen(5000,()=>{
    console.log("Srever is running in port 5000")
})