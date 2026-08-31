import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

function ReturnOrder() {

    const { id } = useParams()
    const navigate = useNavigate()

    const [orderData, setOrderData] = useState(null)
    const [selectedItems, setSelectedItems] = useState({})
    const [reason, setReason] = useState("")

    useEffect(() => {
        loadOrder()
    }, [])

    async function loadOrder() {
        try {

            const res = await api.get(`/orders/${id}`)
            console.log("RETURN PAGE:", res.data)
console.log("RETURN PAGE ITEMS:", res.data.items)

            setOrderData(res.data)

        } catch (err) {

            console.error(err)

        }
    }

    function toggleItem(itemId) {

        setSelectedItems(prev => {

            const updated = { ...prev }

            if (updated[itemId]) {

                delete updated[itemId]

            } else {

                updated[itemId] = {
                    quantity: 1
                }

            }

            return updated

        })
    }

    function changeQuantity(itemId, quantity) {

        setSelectedItems(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                quantity: Number(quantity)
            }
        }))

    }

  async function handleSubmit(e) {

    e.preventDefault()

    const returnedItems = Object.entries(selectedItems).map(
        ([order_item_id, data]) => ({
            order_item_id: Number(order_item_id),
            quantity_returned: data.quantity
        })
    )

    if (returnedItems.length === 0) {

        alert("יש לבחור לפחות מוצר אחד להחזרה")
        return

    }

    if (!reason.trim()) {

        alert("יש להזין סיבת החזרה")
        return

    }

    try {

        console.log("SENDING RETURN:", {
            order_id: Number(id),
            reason,
            items: returnedItems
        })

        await api.post('/returns', {
            order_id: Number(id),
            reason,
            items: returnedItems
        })

        alert("ההחזרה נשמרה בהצלחה")

        navigate(`/orders/${id}`)

    } catch (err) {

        console.error(err)
        alert("שגיאה ביצירת ההחזרה")

    }
}

    if (!orderData) {

        return <p>טוען הזמנה...</p>

    }

    return (

        <div>

            <h1>החזרת מוצרים</h1>

            <h3>
                הזמנה מספר {orderData.order.order_number}
            </h3>

            <h3>בחר את המוצרים שהוחזרו:</h3>

            <form onSubmit={handleSubmit}>
{orderData.items.map(item => (

    <div key={item.id}>

        <label>

            <input
                type="checkbox"
                checked={!!selectedItems[item.id]}
                onChange={() => toggleItem(item.id)}
            />

            {item.product_name}
            {" | "}
            מק"ט: {item.sku}
            {" | "}
            הוזמן: {item.quantity}

        </label>

        {selectedItems[item.id] && (

            <select
                value={selectedItems[item.id].quantity}
                onChange={(e) =>
                    changeQuantity(
                        item.id,
                        e.target.value
                    )
                }
            >

                {Array.from(
                    { length: item.quantity },
                    (_, index) => index + 1
                ).map(quantity => (

                    <option
                        key={quantity}
                        value={quantity}
                    >
                        {quantity}
                    </option>

                ))}

            </select>

        )}

    </div>



                ))}

                <div>

                    <label>
                        סיבת ההחזרה:
                    </label>

                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="כתוב את סיבת ההחזרה"
                    />

                </div>

                <button type="submit">
                    שליחת החזרה
                </button>

                <button
                    type="button"
                    onClick={() => navigate(`/orders/${id}`)}
                >
                    ביטול
                </button>

            </form>

        </div>

    )
}

export default ReturnOrder