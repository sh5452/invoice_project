function OrderCard ({order}){
    return(
        <div>
            <h3>הזמנה {order.order_number} </h3>
            <p>לקוח {order.customer_name} </p>
            <p>סטטוס {order.status} </p>
            <hr />
        </div>
    )
}