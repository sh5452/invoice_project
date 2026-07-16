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

app.post('/delivery-notes',async(req,res)=>{
  try{
    const{
      order_id,
      delivery_note_number,
      received_by,
      notes
    }=req.body
    const result=await pool.query(
      `
      INSERT INTO delivery_notes(
      order_id,
      delivery_note_number,
      delivery_at,
      received_by,
      notes

      )
      VALUES($1,$2,NOW(),$3,$4)
      RETURNING *
      `
      ,
      [order_id,
        delivery_note_number,
        received_by,
        notes

      ]

    )
    res.json(result.rows[0])
  }catch(err){
    console.error(err)
    res.status(500).send('ERROR creating delivery notes')
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
            `SELECT
    orders.id AS order_id,
    orders.order_number,
    orders.customer_name,
    orders.customer_phone,
    orders.customer_address,
    orders.status,

    order_items.product_name,
    order_items.quantity,
    order_items.price,

    delivery_notes.delivery_note_number,
    delivery_notes.received_by,
    delivery_notes.delivery_at,
    
    returns.id AS return_id,
    returns.reason,
    returns.created_at,

    returned_item.product_name AS returned_product,
    returned_item.sku,

    return_items.id AS return_items_id,
    return_items.quantity_returned
    

FROM orders

JOIN order_items
ON orders.id = order_items.order_id

LEFT JOIN delivery_notes
ON orders.id = delivery_notes.order_id

LEFT JOIN returns
ON orders.id=returns.order_id

LEFT JOIN return_items
ON returns.id=return_items.return_id

LEFT JOIN returns
ON returns.id = return_items.return_id

WHERE orders.id = $1
            `

            
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

       const delivery_note=
       {
        delivery_note_number:
        result.rows[0].delivery_note_number,
        received_by:
        result.rows[0].received_by,
        delivery_at:
        result.rows[0].delivery_at
       }

       const returned_items=result.rows
       .filter(row=>row.return_item_id)
       .map(row=>({
        product_name:row.returned_product,
        sku:row.sku,
        quantity_returned: row.quantity_returned
       }))
       const return_info=
       result.rows[0].return_id
       ?{
        id:result.rows[0].return_id,
        reason:result.rows[0].reason,
        created_at:result.rows[0].created_at,
        items:returned_items
       }:
       null
       res.json({
        order,
        items,
        delivery_note,
        return_info,
        order_items
       })
    }catch(err){
        console.error(err)
        res.status(500).send('Error fetching order')
    }
})
app.get('/delivery-notes', async(req,res)=>{
  try{

    const result = await pool.query(
      `
      SELECT *
      FROM delivery_notes
      `
    )

    res.json(result.rows)

  }catch(err){
    console.error(err)
    res.status(500).send('Error fetching delivery notes')
  }
})

app.get('/delivery-notes/:id',async(req, res)=>{
  try{
const {id}= req.params
const result=await pool.query(`
  SELECT * 
  FROM delivery_notes
  WHERE id=$1
  `,
[id])
res.json(result.rows[0])
  }
  catch(err){
    console.error(err)
    res.status(500).send('ERROR fetching delivery note')
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

app.post('/returns',async(req,res)=>{
  try{
    const {order_id,reason}=req.body
    const result=await pool.query(
      `
      INSERT INTO returns(
      order_id,
      reason
      )
      VALUES($1,$2)
      RETURNING *
      
      `,
      [order_id,reason]

    )
    res.json(result.rows[0])
  }catch(err){
    console.error(500).send('ERROR creating returns')
  }
})

app.post('/return-items', async(req,res)=>{
  try{
const {return_id, order_item_id,quantity_returned}=req.body
const result = await pool.query(
  `
  INSERT INTO return_items (
    return_id,
    order_item_id,
    quantity_returned
  )
  VALUES ($1, $2, $3)
  RETURNING *
  `,
  [return_id, order_item_id, quantity_returned]
)
res.json(result.rows[0])
  }catch (err) {
    console.error(err)
    res.status(500).send('ERROR creating return item')
  }
  
})

app.listen(5000,()=>{
    console.log("Srever is running in port 5000")
})