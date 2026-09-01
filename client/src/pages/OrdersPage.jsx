import { useEffect, useState } from 'react';
import OrderCard from '../components/OrderCard';
import api from '../services/api';
import { Link } from 'react-router-dom';

function OrdersPage() {

    const [orders, setOrders] = useState([]);

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

        }
    }

    const canCreateOrder =
        user?.role === 'company_admin' ||
        user?.role === 'employee' ||
        user?.role === 'customer';

    return (
        <div>

            <h1>רשימת הזמנות</h1>

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

        </div>
    );
}

export default OrdersPage;