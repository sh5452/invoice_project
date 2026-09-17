import { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Loading';
import './DeliveryNotePage.css';

function DeliveryNotePage() {

    const { orderId } = useParams();
    const navigate = useNavigate();

    const [deliveryNoteImage, setDeliveryNoteImage] = useState(null);

    const [deliveryNote, setDeliveryNote] = useState({
        delivery_note_number: "",
        received_by: "",
        notes: ""
    });

    const [submitting, setSubmitting] = useState(false);


    async function handleSubmit(e) {

        e.preventDefault();

        if (submitting) {
            return;
        }

        setSubmitting(true);

        try {

            const formData = new FormData();

            formData.append("order_id", orderId);
            formData.append(
                "delivery_note_number",
                deliveryNote.delivery_note_number
            );
            formData.append(
                "received_by",
                deliveryNote.received_by
            );
            formData.append(
                "notes",
                deliveryNote.notes
            );

            if (deliveryNoteImage) {
                formData.append(
                    "delivery_note_image",
                    deliveryNoteImage
                );
            }

            await api.post(
                '/delivery-notes',
                formData
            );

            alert("תעודת המשלוח נשמרה בהצלחה");

            navigate(`/orders/${orderId}`);

        } catch (err) {

            console.error(err);
            console.error("RESPONSE:", err.response?.data);

            alert("שגיאה בשמירת תעודת המשלוח");

            setSubmitting(false);

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
                        onChange={(e) =>
                            setDeliveryNoteImage(
                                e.target.files[0]
                            )
                        }
                        disabled={submitting}
                    />

                </div>


                <div className="form-group">

                    <label>מספר תעודת משלוח</label>

                    <input
                        type="text"
                        value={
                            deliveryNote.delivery_note_number
                        }
                        onChange={(e) =>
                            setDeliveryNote({
                                ...deliveryNote,
                                delivery_note_number:
                                    e.target.value
                            })
                        }
                        disabled={submitting}
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
                                received_by:
                                    e.target.value
                            })
                        }
                        disabled={submitting}
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
                        disabled={submitting}
                    />

                </div>


                <button
                    type="submit"
                    disabled={submitting}
                >
                    {submitting
                        ? "שומר..."
                        : "שמור תעודת משלוח"}
                </button>


                <button
                    type="button"
                    onClick={() =>
                        navigate(`/orders/${orderId}`)
                    }
                    disabled={submitting}
                >
                    ביטול
                </button>

            </form>


            {submitting && <Loading />}

        </div>
    );
}

export default DeliveryNotePage;