import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Loading from '../components/Loading'
import './CreateOrder.css'

function CreateOrder() {

    const navigate = useNavigate()

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [items, setItems] = useState([
        {
            product_name: "",
            sku: "",
            price: "",
            quantity: "",
            packSize: ""
        }
    ])

    const [order, setOrder] = useState({
        order_number: "",
        customer_name: "",
        customer_phone: "",
        customer_address: "",
        status: "חדשה"
    });


    useEffect(() => {

        async function fetchProducts() {

            try {

                const response = await api.get('/products');

                setProducts(response.data);

            } catch (err) {

                console.error("ERROR FETCHING PRODUCTS:", err);

            } finally {

                setLoadingProducts(false);

            }

        }

        fetchProducts();

    }, []);


    function addProduct() {

        setItems([
            ...items,
            {
                product_name: "",
                sku: "",
                price: "",
                quantity: "",
                packSize: ""
            }
        ])

    }


    function handleProductChange(index, productName) {

        const selectedProduct = products.find(
            product => product.name === productName
        );

        const updatedItems = [...items];

        updatedItems[index] = {
            product_name: selectedProduct.name,
            sku: selectedProduct.sku,
            price: selectedProduct.price,
            quantity: selectedProduct.pack_size,
            packSize: selectedProduct.pack_size
        };

        setItems(updatedItems);

    }


    function createQuantityOptions(packSize) {

        const quantities = [];

        if (packSize === 1) {

            for (let i = 1; i <= 100; i++) {
                quantities.push(i);
            }

        } else {

            for (let i = 1; i <= 50; i++) {
                quantities.push(i * packSize);
            }

        }

        return quantities;

    }


    async function handleSubmit(e) {

        e.preventDefault();

        if (submitting) {
            return;
        }

        setSubmitting(true);

        try {

            const orderResponse = await api.post(
                '/orders',
                order
            );

            const createdOrder = orderResponse.data;

            for (const item of items) {

                await api.post(
                    '/order-items',
                    {
                        order_id: createdOrder.id,
                        product_name: item.product_name,
                        sku: item.sku,
                        quantity: item.quantity,
                        unit_type: "יחידה",
                        price: item.price
                    }
                );

            }

            navigate('/orders');

        } catch (err) {

            console.error(
                "========== CREATE ORDER ERROR =========="
            );

            console.error(err);
            console.error("STATUS:", err.response?.status);
            console.error("DATA:", err.response?.data);

            console.error(
                "========================================"
            );

            alert(
                "שגיאה: " +
                (err.response?.data || err.message)
            );

            setSubmitting(false);

        }

    }


    if (loadingProducts) {
        return <Loading />;
    }


    return (

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
                items.map((item, index) => (

                    <div key={index}>

                        <select
                            value={item.product_name}
                            onChange={(e) =>
                                handleProductChange(
                                    index,
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                בחר מוצר
                            </option>


                            {
                                products.map(product => (

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
                            onChange={(e) => {

                                const updatedItems = [...items];

                                updatedItems[index].quantity =
                                    Number(e.target.value);

                                setItems(updatedItems);

                            }}
                        >

                            {
                                item.packSize &&
                                createQuantityOptions(
                                    item.packSize
                                ).map(q => (

                                    <option
                                        key={q}
                                        value={q}
                                    >
                                        {q}
                                    </option>

                                ))
                            }

                        </select>


                        <p>
                            מק"ט: {item.sku}
                        </p>

<div className='price_item'>
    <label >
        מחיר ליחידה:
    </label>

    <input 
        type="number"
        min="0"
        step="0.01"
        value={item.price}
        onChange={(e) => {

            const updatedItems = [...items];

            updatedItems[index].price =
                e.target.value;

            setItems(updatedItems);

        }}
    />

    {" "}₪
</div>


                        <p>
                            סה"כ למוצר:
                            {" "}
                            {
                                Number(item.price) *
                                Number(item.quantity)
                            }
                            {" "}₪
                        </p>

                    </div>

                ))
            }


            <p>

                <strong>

                    סה"כ לתשלום:
                    {" "}

                    {
                        items.reduce(
                            (total, item) =>
                                total +
                                (
                                    Number(item.price) *
                                    Number(item.quantity || 0)
                                ),
                            0
                        )
                    }

                    {" "}₪

                </strong>

            </p>


            <button
                type="submit"
                disabled={submitting}
            >
                {submitting
                    ? "יוצר הזמנה..."
                    : "צור הזמנה"
                }
            </button>


            <button
                type="button"
                onClick={addProduct}
                disabled={submitting}
            >
                הוסף מוצר נוסף
            </button>


            {submitting && <Loading />}

        </form>

    )

}

export default CreateOrder;