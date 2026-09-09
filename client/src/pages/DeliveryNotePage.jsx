import { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './DeliveryNotePage.css'
function DeliveryNotePage(){

    const { orderId } = useParams();
    const navigate = useNavigate();

    const [deliveryNoteImage, setDeliveryNoteImage] = useState(null);

    const [deliveryNote, setDeliveryNote] = useState({
        delivery_note_number: "",
        received_by: "",
        notes: ""
    });

    async function handleSubmit(e) {
        e.preventDefault();

        try {
const formData = new FormData();

formData.append("order_id", orderId);
formData.append("delivery_note_number", deliveryNote.delivery_note_number);
formData.append("received_by", deliveryNote.received_by);
formData.append("notes", deliveryNote.notes);

if (deliveryNoteImage) {
    formData.append("delivery_note_image", deliveryNoteImage);
}
            await api.post('/delivery-notes',
               formData
            );

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
    <label>תעודת משלוח</label>

    <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => setDeliveryNoteImage(e.target.files[0])}
    />
</div>

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