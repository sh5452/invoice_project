import OrderCard from '../components/OrderCard'
import { useEffect, useState } from 'react'
import api from '../services/api'

function OrdersPage(){
    const [order,setOrder]=usestate([])
    useEffect(()=>{
loadOrders()
    },[])
    async function loadOrders(){
try{
    const res= await api.get("/orders");
    setOrder(res.data);
}catch(err){
    console.error(err)
}
    }
}
<OrderCard order={order}></OrderCard>
export default OrdersPage