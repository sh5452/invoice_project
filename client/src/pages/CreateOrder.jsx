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





return(
<div>

<h2>יצירת הזמנה</h2>

{
items.map((item,index)=>(

<div key={index}>

<select
value={item.quantity}
>
{
item.packSize &&
createQuantityOptions(item.packSize)
.map(q=>(
<option key={q}>
{q}
</option>
))
}
</select>

<p>מק"ט: {item.sku}</p>

<p>מחיר: {item.price}</p>

</div>

))
}

<button onClick={addProduct}>
הוסף מוצר נוסף
</button>

</div>
)

}

export default CreateOrder;