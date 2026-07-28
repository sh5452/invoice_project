
import { useEffect, useState } from 'react'
import OrderCard from '../components/OrderCard'
import api from '../services/api'
import { Link } from 'react-router-dom'

function OrdersPage(){
    const [orders,setOrders]=useState([])
    useEffect(()=>{
        loadOrders();
    },
[]);
  async function loadOrders(){
        try{
            const res= await api.get('/orders')
            setOrders(res.data);
        }catch(err){
            console.error(err);
        }
    }
    return(
        <div>
            <h1>רשימת הזמנות</h1>
            {
                orders.map((order)=>{
                    return(
                  <div  key={order.id}>
                      <OrderCard myOrder={order}></OrderCard>  
                  </div>
                    )
                })
            }
            <Link to="/orders/new">
    הוסף הזמנה חדשה
</Link>


        </div>

    )
}

export default OrdersPage