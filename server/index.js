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

app.listen(5000,()=>{
    console.log("Srever is running in port 5000")
})