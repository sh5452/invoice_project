import { Link } from "react-router-dom";
function OrderCard ({myOrder}){
    return(
        <div>
            <h3>הזמנה {myOrder.order_number} </h3>
            <p>לקוח {myOrder.customer_name} </p>
            <p>סטטוס {myOrder.status} </p>
            <p>טלפון {myOrder.customer_phone}</p>
            <p>כתובת {myOrder.customer_address}</p>
            <p>נוצר ב: {myOrder.created_at}</p>
            <Link to={`/orders/${myOrder.id}`}>
            פתח הזמנה
            </Link>
            <hr />
        </div>
    )
}
export default OrderCard;