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
        
        console.log("SERVER RESPONSE:", res.data);
        setOrderData(res.data);
    }catch(err){
        console.error(err)
    }
}
return(
    <div>

 <h2>פרטי הזמנה מספר {id}</h2>
 {orderData&&(
    <div>
         <h3>פרטי לקוח</h3>
                <p>שם: {orderData.order.customer_name}</p>
                <p>טלפון: {orderData.order.customer_phone}</p>
                <p>כתובת: {orderData.order.customer_address}</p>
                 <h3>הזמנה</h3>
                <p>מספר הזמנה: {orderData.order.order_number}</p>
                <p>סטטוס: {orderData.order.status}</p>
                   <h3>מוצרים</h3>
                {orderData.items.map((item,index)=>(
                    <div key={index}>
                        <p>
                            {item.product_name} |
                            כמות: {item.quantity} |
                            מחיר: {item.price}
                        </p>
                    </div>
                ))}
                {orderData.delivery_note?.delivery_note_number && (
    <>
        <h3>תעודת משלוח</h3>
        <p>
          מספר: {orderData.delivery_note.delivery_note_number}
        </p>
        <p>
          התקבל אצל: {orderData.delivery_note.received_by}
        </p>
    </>
)}
{orderData.return_info && (
    <>
        <h3>החזרה</h3>
        <p>סיבה: {orderData.return_info.reason}</p>

        {orderData.return_info.items.map((item,index)=>(
            <p key={index}>
                {item.product_name} -
                הוחזר: {item.quantity_returned}
            </p>
        ))}
    </>
)}
    </div>
 )}


</div>
)
}
export default OrderDetails;