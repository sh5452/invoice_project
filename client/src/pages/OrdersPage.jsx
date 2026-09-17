import { useEffect, useState } from 'react';
import OrderCard from '../components/OrderCard';
import api from '../services/api';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';

function OrdersPage() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {

            const res = await api.get('/orders');

            setOrders(res.data);

            console.log("ORDERS:", res.data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }
    }

    const canCreateOrder =
        user?.role === 'customer';

    return (
        <div>

            <h1>רשימת הזמנות</h1>

            {loading ? (

                <Loading />

            ) : (

                <>
                    {
                        orders.map((order) => (
                            <div key={order.id}>
                                <OrderCard myOrder={order} />
                            </div>
                        ))
                    }

                    {canCreateOrder && (
                        <Link
                            className="primary-button"
                            to="/orders/new"
                        >
                            הוסף הזמנה חדשה
                        </Link>
                    )}
                </>

            )}

        </div>
    );
}

export default OrdersPage;