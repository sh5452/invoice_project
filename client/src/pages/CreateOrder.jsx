import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { products } from '../data/products'

function CreateOrder(){
    const navigate = useNavigate()

const [items,setItems] = useState([
    {
        product_name:"",
        sku:"",
        price:"",
        quantity:"",
        packSize:""
    }
])
const [order, setOrder] = useState({
    order_number: "",
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    status: "חדשה"
});

function addProduct(){
    setItems([
        ...items,
        {
            product_name:"",
            sku:"",
            price:"",
            quantity:"",
            packSize:""
        }
    ])
}

function handleProductChange(index, productName){

    const selectedProduct = products.find(
        product => product.name === productName
    );

    const updatedItems = [...items];

    updatedItems[index] = {
        product_name: selectedProduct.name,
        sku: selectedProduct.sku,
        price: selectedProduct.price,
        quantity: selectedProduct.packSize,
        packSize:selectedProduct.packSize
    };

    setItems(updatedItems);
}

function createQuantityOptions(packSize){

    const quantities=[];

    if(packSize===1){
        for(let i=1;i<=100;i++){
            quantities.push(i);
        }
    }
    else{
        for(let i=1;i<=50;i++){
            quantities.push(i*packSize);
        }
    }

    return quantities;
}

async function handleSubmit(e) {
    e.preventDefault();

    try {

        const orderResponse = await api.post('/orders', order);

        const createdOrder = orderResponse.data;

        for (const item of items) {

            await api.post('/order-items', {
                order_id: createdOrder.id,
                product_name: item.product_name,
                sku: item.sku,
                quantity: item.quantity,
                unit_type: "יחידה",
                price: item.price
            });

        }

        navigate('/orders');

    } catch (err) {

        console.error(err);
        console.error("ERROR:", err);
console.error("RESPONSE:", err.response?.data);
console.error("STATUS:", err.response?.status);
        alert("שגיאה ביצירת ההזמנה");

    }
}



return(
<form onSubmit={handleSubmit}>

<h2>יצירת הזמנה</h2>
<input
    type="text"
    placeholder="מספר הזמנה"
    value={order.order_number}
    onChange={(e) =>
        setOrder({
            ...order,
            order_number: e.target.value
        })
    }
/>

<input
    type="text"
    placeholder="שם לקוח"
    value={order.customer_name}
    onChange={(e) =>
        setOrder({
            ...order,
            customer_name: e.target.value
        })
    }
/>

<input
    type="text"
    placeholder="טלפון"
    value={order.customer_phone}
    onChange={(e) =>
        setOrder({
            ...order,
            customer_phone: e.target.value
        })
    }
/>

<input
    type="text"
    placeholder="כתובת"
    value={order.customer_address}
    onChange={(e) =>
        setOrder({
            ...order,
            customer_address: e.target.value
        })
    }
/>

{
items.map((item,index)=>(

<div key={index}>

<select
value={item.product_name}
onChange={(e)=>handleProductChange(index,e.target.value)}
>
<option value="">בחר מוצר</option>

{
products.map(product=>(
<option 
key={product.sku}
value={product.name}
>
{product.name}
</option>
))
}

</select>
<select
value={item.quantity}
onChange={(e)=>{
const updatedItems=[...items];
updatedItems[index].quantity=Number(e.target.value);
setItems(updatedItems);
}}
>

{
item.packSize &&
createQuantityOptions(item.packSize)
.map(q=>(
<option key={q} value={q}>
{q}
</option>
))
}

</select>

<p>מק"ט: {item.sku}</p>

<p>מחיר ליחידה: {item.price} ₪</p>

<p>
    סה"כ למוצר: {Number(item.price) *Number(item.quantity) } ₪
</p>



</div>

))
}
<p>
    <strong>
        סה"כ לתשלום:{" "}
        {items.reduce(
            (total, item) =>
                total +
                (Number(item.price) * Number(item.quantity || 0)),
            0
        )} ₪
    </strong>
</p>
<button type='submit'>צור הזמנה </button>
<button type="button" onClick={addProduct}>
    הוסף מוצר נוסף
</button>


</form>
)

}

export default CreateOrder;