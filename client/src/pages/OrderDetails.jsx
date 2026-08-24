import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

function OrderDetails() {

    const { id } = useParams();

    const [orderData, setOrderData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
const [isEditingStatus, setIsEditingStatus] = useState(false);

    useEffect(() => {
        loadOrder();
    }, []);

    async function loadOrder() {

        try {

            const res = await api.get(`/orders/${id}`);

            console.log("SERVER RESPONSE:", res.data);

            setOrderData(res.data);
            setSelectedStatus(res.data.order.status);
            

        } catch (err) {

            console.error(err);

        }
    }

    function updateOrderField(field, value) {

        setOrderData({
            ...orderData,
            order: {
                ...orderData.order,
                [field]: value
            }
        });
    }

    function updateItem(index, field, value) {

        const updatedItems = [...orderData.items];

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };

        setOrderData({
            ...orderData,
            items: updatedItems
        });
    }
    async function deactivateOrder() {
    const confirmed = window.confirm(
        "האם אתה בטוח שברצונך להשבית את ההזמנה?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const res = await api.patch(
            `/orders/${id}/deactivate`
        );

        setOrderData({
            ...orderData,
            order: res.data
        });

        alert("ההזמנה הושבתה בהצלחה");

    } catch (err) {

        console.error(err);
        alert("שגיאה בהשבתת ההזמנה");

    }
}

    async function saveOrder() {

        try {

            // עדכון פרטי ההזמנה
            const orderResponse = await api.put(
                `/orders/${id}`,
                {
                    order_number: orderData.order.order_number,
                    customer_name: orderData.order.customer_name,
                    customer_phone: orderData.order.customer_phone,
                    customer_address: orderData.order.customer_address
                }
            );

            // עדכון המוצרים
            for (const item of orderData.items) {

                await api.put(
                    `/order-items/${item.id}`,
                    {
                        quantity: item.quantity,
                        price: item.price
                    }
                );

            }

            setOrderData({
                ...orderData,
                order: orderResponse.data
            });

            setIsEditing(false);

            alert("ההזמנה עודכנה בהצלחה");

        } catch (err) {

            console.error(err);

            alert("שגיאה בעדכון ההזמנה");

        }
    }

    if (!orderData) {
        return <p>טוען הזמנה...</p>;
    }
    async function updateStatus(newStatus) {
    try {

        const res = await api.patch(
            `/orders/${id}/status`,
            { status: newStatus }
        );

        setOrderData({
            ...orderData,
            order: {
                ...orderData.order,
                status: res.data.status
            }
        });

    } catch (err) {

        console.error(err);
        alert("שגיאה בעדכון סטטוס");

    }
}

async function saveStatus() {
    try {

        const res = await api.patch(
            `/orders/${id}/status`,
            { status: selectedStatus }
        );

        setOrderData({
            ...orderData,
            order: {
                ...orderData.order,
                status: res.data.status
            }
        });

        setIsEditingStatus(false);

    } catch (err) {

        console.error(err);
        alert("שגיאה בעדכון סטטוס");

    }
}

function cancelStatusEdit() {
    setSelectedStatus(orderData.order.status);
    setIsEditingStatus(false);
}

    return (

        <div>

            <h2>
                פרטי הזמנה מספר {orderData.order.order_number}
            </h2>

            {!isEditing && (
                 <>
        <button onClick={() => setIsEditing(true)}>
            עריכה
        </button>

        <button onClick={deactivateOrder}>
            השבת הזמנה
        </button>
    </>
            )}

            {isEditing && (
                <>
                    <button onClick={saveOrder}>
                        שמור שינויים
                    </button>

                    <button onClick={() => {
                        setIsEditing(false);
                        loadOrder();
                    }}>
                        ביטול
                    </button>
                
                </>
            )}

            {/* פרטי לקוח */}

            <h3>פרטי לקוח</h3>

            {isEditing ? (

                <>
                    <p>
                        שם:
                        <input
                            value={orderData.order.customer_name}
                            onChange={(e) =>
                                updateOrderField(
                                    'customer_name',
                                    e.target.value
                                )
                            }
                        />
                    </p>

                    <p>
                        טלפון:
                        <input
                            value={orderData.order.customer_phone}
                            onChange={(e) =>
                                updateOrderField(
                                    'customer_phone',
                                    e.target.value
                                )
                            }
                        />
                    </p>

                    <p>
                        כתובת:
                        <input
                            value={orderData.order.customer_address}
                            onChange={(e) =>
                                updateOrderField(
                                    'customer_address',
                                    e.target.value
                                )
                            }
                        />
                    </p>
                </>

            ) : (

                <>
                    <p>
                        שם: {orderData.order.customer_name}
                    </p>

                    <p>
                        טלפון: {orderData.order.customer_phone}
                    </p>

                    <p>
                        כתובת: {orderData.order.customer_address}
                    </p>
                </>

            )}

            {/* פרטי הזמנה */}

            <h3>הזמנה</h3>

            {isEditing ? (

                <p>
                    מספר הזמנה:
                    <input
                        value={orderData.order.order_number}
                        onChange={(e) =>
                            updateOrderField(
                                'order_number',
                                e.target.value
                            )
                        }
                    />
                </p>

            ) : (

                <p>
                    מספר הזמנה: {orderData.order.order_number}
                </p>

            )}

  <h3>סטטוס הזמנה</h3>

{!isEditingStatus ? (

    <div>
        <p>
            סטטוס: {orderData.order.status}
        </p>

        <button onClick={() => setIsEditingStatus(true)}>
            שינוי סטטוס
        </button>
    </div>

) : (

    <div>

        <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
        >
            <option value="חדשה">חדשה</option>
            <option value="בטיפול">בטיפול</option>
            <option value="מחכה למלאי">מחכה למלאי</option>
            <option value="נשלחה">נשלחה</option>
            <option value="סופקה">סופקה</option>
        </select>

        <button onClick={saveStatus}>
            שמור
        </button>

        <button onClick={cancelStatusEdit}>
            ביטול
        </button>

    </div>

)}

            {/* מוצרים */}

            <h3>מוצרים</h3>

            {orderData.items.map((item, index) => (

                <div key={item.id || index}>

                    <p>
                        {item.product_name}
                    </p>

                    <p>
                        מק"ט: {item.sku}
                    </p>

                    {isEditing ? (

                        <>
                            <label>
                                כמות:
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            'quantity',
                                            e.target.value
                                        )
                                    }
                                />
                            </label>

                            <label>
                                מחיר:
                                <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            'price',
                                            e.target.value
                                        )
                                    }
                                />
                            </label>
                        </>

                    ) : (

                        <>
                            <p>
                                כמות: {item.quantity}
                            </p>

                            <p>
                                מחיר: {item.price}
                            </p>
                        </>

                    )}

                    <hr />

                </div>

            ))}

            {/* תעודת משלוח - צפייה בלבד */}

            {orderData.delivery_note?.delivery_note_number && (

                <>
                    <h3>תעודת משלוח</h3>

                    <p>
                        מספר:
                        {orderData.delivery_note.delivery_note_number}
                    </p>

                    <p>
                        התקבל אצל:
                        {orderData.delivery_note.received_by}
                    </p>
                </>

            )}

            {/* החזרה - צפייה בלבד */}

            {orderData.return_info && (

                <>
                    <h3>החזרה</h3>

                    <p>
                        סיבה:
                        {orderData.return_info.reason}
                    </p>

                    {orderData.return_info.items.map(
                        (item, index) => (

                            <p key={index}>
                                {item.product_name} -
                                הוחזר: {item.quantity_returned}
                            </p>

                        )
                    )}
    

                </>

            )}
                            <p>
    מצב: {orderData.order.is_active ? "פעילה" : "מושבתת"}
</p>

        </div>
    );
}

export default OrderDetails;