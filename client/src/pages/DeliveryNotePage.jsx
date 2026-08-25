import { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './DeliveryNotePage.css'
function DeliveryNotePage(){

    const { orderId } = useParams();
    const navigate = useNavigate();

    const [deliveryNote, setDeliveryNote] = useState({
        delivery_note_number: "",
        received_by: "",
        notes: ""
    });

    async function handleSubmit(e) {
        e.preventDefault();

        try {

            await api.post('/delivery-notes', {
                order_id: orderId,
                delivery_note_number: deliveryNote.delivery_note_number,
                received_by: deliveryNote.received_by,
                notes: deliveryNote.notes
            });

            alert("תעודת המשלוח נשמרה בהצלחה");

            navigate(`/orders/${orderId}`);

        } catch (err) {

            console.error(err);
            console.error("RESPONSE:", err.response?.data);

            alert("שגיאה בשמירת תעודת המשלוח");

        }
    }
    return (
    <div className="delivery-note-page">

        <h1>תעודת משלוח</h1>

        <form onSubmit={handleSubmit}>

            <div className="form-group">
                <label>מספר תעודת משלוח</label>

                <input
                    type="text"
                    value={deliveryNote.delivery_note_number}
                    onChange={(e) =>
                        setDeliveryNote({
                            ...deliveryNote,
                            delivery_note_number: e.target.value
                        })
                    }
                />
            </div>

            <div className="form-group">
                <label>התקבל אצל</label>

                <input
                    type="text"
                    value={deliveryNote.received_by}
                    onChange={(e) =>
                        setDeliveryNote({
                            ...deliveryNote,
                            received_by: e.target.value
                        })
                    }
                />
            </div>

            <div className="form-group">
                <label>הערות</label>

                <textarea
                    value={deliveryNote.notes}
                    onChange={(e) =>
                        setDeliveryNote({
                            ...deliveryNote,
                            notes: e.target.value
                        })
                    }
                />
            </div>

            <button type="submit">
                שמור תעודת משלוח
            </button>

            <button
                type="button"
                onClick={() => navigate(`/orders/${orderId}`)}
            >
                ביטול
            </button>

        </form>

    </div>
);
}

export default DeliveryNotePage;