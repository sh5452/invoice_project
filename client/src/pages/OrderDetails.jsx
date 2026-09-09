
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom'
import './OrderDetails.css';

function OrderDetails() {

    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const [orderData, setOrderData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [deliveryNoteImages, setDeliveryNoteImages] = useState({});

useEffect(() => {
    console.log("LOADING DRIVERS");

    loadOrder();

    if (currentUser?.role === "company_admin") {
        loadDrivers();
    }
}, []);
    async function loadOrder() {

        try {

            const res = await api.get(`/orders/${id}`);

            console.log("SERVER RESPONSE:", res.data);
            console.log("RETURNED ITEMS:", res.data.returned_items);
            console.log("RETURN PAGE RESPONSE:", res.data);
            console.log("ORDER:", res.data.order);
            console.log("ITEMS:", res.data.items);
            console.log(
    "DELIVERY NOTES FULL:",
    JSON.stringify(res.data.delivery_notes, null, 2)
);
            console.log("NOTES:", res.data.delivery_note?.notes);


            setOrderData(res.data);
            setSelectedStatus(res.data.order.status);
            setSelectedDriver(res.data.order.driver_id || "");
const images = {};

for (const note of res.data.delivery_notes || []) {
    if (note.delivery_note_image) {
        const imageRes = await api.get(
            `/delivery-notes/${note.id}/image`,
            { responseType: 'blob' }
        );

        images[note.id] = URL.createObjectURL(imageRes.data);
    }
}

setDeliveryNoteImages(images);

        } catch (err) {

            console.error(err);

        }
    }

    async function loadDrivers() {
        try {
            const res = await api.get('/drivers');

            console.log("DRIVERS:", res.data);

            setDrivers(res.data);

        } catch (err) {
            console.error(err);
        }
    }

    async function assignDriver() {
        if (!selectedDriver) {
            alert("יש לבחור נהג");
            return;
        }

        try {
            const res = await api.patch(
                `/orders/${id}/assign-driver`,
                {
                    driver_id: selectedDriver
                }
            );

            setOrderData({
                ...orderData,
                order: {
                    ...orderData.order,
                    driver_id: res.data.driver_id
                }
            });

            alert("הנהג שויך להזמנה בהצלחה");

        } catch (err) {
            console.error(err);
            alert("שגיאה בשיוך הנהג");
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

        <div className="order-details">

            <h2>
                פרטי הזמנה מספר {orderData.order.order_number}
            </h2>
{!isEditing && (
    <>
        {/* פעולות של לקוח בלבד */}
        {currentUser?.role === 'customer' && (
            <>
                <button onClick={() => setIsEditing(true)}>
                    עריכה
                </button>

                <button onClick={deactivateOrder}>
                    השבת הזמנה
                </button>

                <button
                    onClick={() => navigate(`/orders/${id}/return`)}
                >
                    הוספת החזרה
                </button>
            </>
        )}

        {/* תעודת משלוח - נהג בלבד */}
        {currentUser?.role === 'driver' && (
            <button
                onClick={() => navigate(`/delivery-notes/new/${id}`)}
            >
                הוספת תעודת משלוח
            </button>
        )}
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

        {/* מנהל ועובד חברה */}
        {(currentUser?.role === 'company_admin' ||
          currentUser?.role === 'employee') && (

            <button onClick={() => setIsEditingStatus(true)}>
                שינוי סטטוס
            </button>
        )}

        {/* נהג */}
        {currentUser?.role === 'driver' &&
         (orderData.order.status === 'בטיפול' ||
          orderData.order.status === 'נשלחה') && (

          <button onClick={() => {
    setSelectedStatus('סופקה');
    setIsEditingStatus(true);
}}>
    סימון כסופקה
</button>
        )}

    </div>

) : (

    <div>

        <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
        >

            {/* מנהל ועובד חברה */}
            {(currentUser?.role === 'company_admin' ||
              currentUser?.role === 'employee') && (

                <>
                    <option value="חדשה">חדשה</option>
                    <option value="בטיפול">בטיפול</option>
                    <option value="מחכה למלאי">מחכה למלאי</option>
                    <option value="נשלחה">נשלחה</option>
                </>
            )}

            {/* נהג */}
            {currentUser?.role === 'driver' && (
                <option value="סופקה">סופקה</option>
            )}

        </select>

        <button onClick={saveStatus}>
            שמור
        </button>

        <button onClick={cancelStatusEdit}>
            ביטול
        </button>

    </div>

)}
           {/* הקצאת נהג */}

{currentUser?.role === 'company_admin' && (
    <>
        <h3>נהג</h3>

        <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
        >
            <option value="">בחר נהג</option>

            {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                    {driver.full_name}
                </option>
            ))}
        </select>

        <button onClick={assignDriver}>
            שייך נהג
        </button>
    </>
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
            {orderData.delivery_notes &&
                orderData.delivery_notes.length > 0 && (

                    <>
                        <h3>תעודות משלוח</h3>

                        {orderData.delivery_notes.map((note, index) => (

                            <div key={note.id || index}>

                                <p>
                                    מספר: {note.delivery_note_number}
                                </p>

                                <p>
                                    התקבל אצל: {note.received_by}
                                </p>

                                <p>
                                    הערות: {note.notes}
                                </p>
    {deliveryNoteImages[note.id] && (
    <img
        src={deliveryNoteImages[note.id]}
        alt="תעודת משלוח"
        className="delivery-note-image"
    />
)}

                            </div>

                        ))}

                    </>




                )}
            {/* החזרות - צפייה בלבד */}

            {orderData.returns && orderData.returns.length > 0 && (

                <>
                    <h3>החזרות</h3>

                    {orderData.returns.map((returnItem, index) => (

                        <div key={returnItem.id || index}>

                            <p>
                                סיבת ההחזרה: {returnItem.reason}
                            </p>

                            <p>
                                תאריך: {returnItem.created_at}
                            </p>

                        </div>

                    ))}

                    <h4>פריטים שהוחזרו:</h4>

                    {orderData.returned_items &&
                        orderData.returned_items.length > 0 &&
                        orderData.returned_items.map((item, index) => (

                            <p 
    className="returned-item"
    key={`${item.return_id}-${item.order_item_id}-${index}`}>
                                {item.product_name}
                                {" | "}
                                מק"ט: {item.sku}
                                {" | "}
                                כמות שהוחזרה: {item.quantity_returned}
                            </p>

                        ))
                    }

                </>

            )}
            <p>
                מצב: {orderData.order.is_active ? "פעילה" : "מושבתת"}
            </p>

        </div>
    );
}

export default OrderDetails;