import {useParams} from 'react-router-dom'
import {useState,useEffect} from 'react'
import api from '../services/api'

function OrderDetails(){
const {id}=useParams()
const [orderData,setOrderData]=useState(null)
useEffect(()=>{
    loadOrder()
},[])
async function loadOrder(){
    try{
        const res=await api.get(`/orders/${id}`);
        setOrderData(res.data);
        console.log(res.data);
    }catch(err){
        console.error(err)
    }
}
return(
    <div>
 <h2>פרטי הזמנה מספר {id}</h2>
</div>
)
}
export default OrderDetails