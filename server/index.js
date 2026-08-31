const { log } = require('console')
const express=require('express')
const cors=require('cors')
const pool=require('./db')
const app=express()
const bcrypt = require('bcrypt');

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

app.get('/orders', async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                orders.*,
                COALESCE(
                    SUM(order_items.price * order_items.quantity),
                    0
                ) AS total_price
            FROM orders
            LEFT JOIN order_items
                ON orders.id = order_items.order_id
            GROUP BY orders.id
            ORDER BY orders.id DESC
        `)

        res.json(result.rows)

    } catch (err) {

        console.error(err)
        res.status(500).send('Error fetching orders')

    }
})


app.post('/users', async (req, res) => {

    try {

        const {
            username,
            fullName,
            email,
            company,
            role,
            password
        } = req.body;

        if (!username || !fullName || !email || !company || !role || !password) {
            return res.status(400).send('כל השדות הם חובה');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `
            INSERT INTO users
            (
                username,
                full_name,
                email,
                company,
                role,
                password_hash
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id,
                username,
                full_name,
                email,
                company,
                role,
                created_at,
                is_active
            `,
            [
                username,
                fullName,
                email,
                company,
                role,
                passwordHash
            ]
        );

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);
        res.status(500).send('Error creating user');

    }
});

app.put('/orders/:id', async (req, res) => {
    try {

        const { id } = req.params;

        const {
            order_number,
            customer_name,
            customer_phone,
            customer_address
        } = req.body;

        const result = await pool.query(
            `UPDATE orders
             SET order_number = $1,
                 customer_name = $2,
                 customer_phone = $3,
                 customer_address = $4
             WHERE id = $5
             RETURNING *`,
            [
                order_number,
                customer_name,
                customer_phone,
                customer_address,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Order not found');
        }

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);
        res.status(500).send('Error updating order');

    }
});

app.get('/users', async (req, res) => {
    try {

        const result = await pool.query(
            `SELECT *
             FROM users
             ORDER BY created_at DESC`
        )

        res.json(result.rows)

    } catch (err) {

        console.error(err)
        res.status(500).send('Error fetching users')

    }
})
app.put('/users/:id', async (req, res) => {
    try {

        const { id } = req.params

        const {
            username,
            fullName,
            email,
            company,
            role
        } = req.body

        const result = await pool.query(
            `UPDATE users
             SET username = $1,
                 full_name = $2,
                 email = $3,
                 company = $4,
                 role = $5
             WHERE id = $6
             RETURNING *`,
            [username, fullName, email, company, role, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).send('User not found')
        }

        res.json(result.rows[0])

    } catch (err) {

        console.error(err)
        res.status(500).send('Error updating user')
    }
})

app.patch('/users/:id/deactivate', async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `UPDATE users
             SET is_active = FALSE
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);
        res.status(500).send('Error deactivating user');

    }
});

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

app.get('/orders/:id', async (req, res) => {

    try {

        const { id } = req.params;

        // =========================
        // 1. פרטי ההזמנה
        // =========================

        const orderResult = await pool.query(
            `
            SELECT
                id,
                order_number,
                customer_name,
                customer_phone,
                customer_address,
                status,
                is_active
            FROM orders
            WHERE id = $1
            `,
            [id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).send('Order not found');
        }

        const order = orderResult.rows[0];


        // =========================
        // 2. פריטי ההזמנה
        // =========================

        const itemsResult = await pool.query(
            `
            SELECT
                id,
                product_name,
                quantity,
                price,
                sku
            FROM order_items
            WHERE order_id = $1
            ORDER BY id
            `,
            [id]
        );

        const items = itemsResult.rows;


        // =========================
        // 3. כל תעודות המשלוח
        // =========================

        const deliveryNotesResult = await pool.query(
            `
            SELECT
                id,
                delivery_note_number,
                received_by,
                delivery_at,
                notes
            FROM delivery_notes
            WHERE order_id = $1
            ORDER BY delivery_at
            `,
            [id]
        );

        const delivery_notes = deliveryNotesResult.rows;


        // =========================
        // 4. כל ההחזרות
        // =========================

        const returnsResult = await pool.query(
            `
            SELECT
                id AS return_id,
                reason,
                created_at
            FROM returns
            WHERE order_id = $1
            ORDER BY created_at
            `,
            [id]
        );

        const returns = returnsResult.rows;


        // =========================
        // 5. פריטי ההחזרה
        // =========================

        const returnedItemsResult = await pool.query(
            `
            SELECT
                return_items.id AS return_item_id,
                return_items.return_id,
                return_items.order_item_id,
                order_items.product_name,
                order_items.sku,
                return_items.quantity_returned
            FROM return_items

            JOIN returns
                ON returns.id = return_items.return_id

            JOIN order_items
                ON order_items.id = return_items.order_item_id

            WHERE returns.order_id = $1

            ORDER BY return_items.id
            `,
            [id]
        );

        const returned_items = returnedItemsResult.rows;


        // =========================
        // DEBUG
        // =========================

        console.log("ORDER:", order);

        console.log("ITEMS:", items);

        console.log(
            "DELIVERY NOTES:",
            delivery_notes
        );

        console.log(
            "RETURNS:",
            returns
        );

        console.log(
            "RETURNED ITEMS:",
            returned_items
        );


        // =========================
        // RESPONSE
        // =========================

        res.json({

            order: {
                id: order.id,
                order_number: order.order_number,
                customer_name: order.customer_name,
                customer_phone: order.customer_phone,
                customer_address: order.customer_address,
                status: order.status,
                is_active: order.is_active
            },

            items,

            delivery_notes,

            returns,

            returned_items

        });


    } catch (err) {

        console.error(err);

        res.status(500).send('Error fetching order');

    }

});
app.patch('/orders/:id/deactivate', async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `UPDATE orders
             SET is_active = FALSE
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Order not found');
        }

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);
        res.status(500).send('Error deactivating order');

    }
});
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

app.post('/returns', async (req, res) => {
  
    try {
console.log("RETURN BODY:", req.body);
        const { order_id, reason, items } = req.body;

        // יצירת ההחזרה
        const returnResult = await pool.query(
            `
            INSERT INTO returns (
                order_id,
                reason
            )
            VALUES ($1, $2)
            RETURNING *
            `,
            [order_id, reason]
        );

        const return_id = returnResult.rows[0].id;

        // שמירת פריטי ההחזרה
        for (const item of items) {

            await pool.query(
                `
                INSERT INTO return_items (
                    return_id,
                    order_item_id,
                    quantity_returned
                )
                VALUES ($1, $2, $3)
                `,
                [
                    return_id,
                    item.order_item_id,
                    item.quantity_returned
                ]
            );

        }

        res.json({
            return: returnResult.rows[0],
            items
        });

    } catch (err) {

        console.error(err);
        res.status(500).send('ERROR creating return');

    }
});

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