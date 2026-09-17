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


    // =========================
    // קיבוץ הזמנות לסופר אדמין
    // =========================

    const groupedOrders = {};

    if (user?.role === 'super_admin') {

        orders.forEach((order) => {

            const parentId =
                order.parent_company_id || 'no-parent';

            const customerCompanyId =
                order.customer_company_id || 'no-customer-company';


            if (!groupedOrders[parentId]) {

                groupedOrders[parentId] = {
                    parent_company_name:
                        order.parent_company_name || 'ללא חברה ראשית',

                    customers: {}
                };

            }


            if (
                !groupedOrders[parentId]
                    .customers[customerCompanyId]
            ) {

                groupedOrders[parentId]
                    .customers[customerCompanyId] = {
                        customer_company_name:
                            order.customer_company_name ||
                            'ללא חברת לקוח',

                        orders: []
                    };

            }


            groupedOrders[parentId]
                .customers[customerCompanyId]
                .orders
                .push(order);

        });

    }


    return (
        <div>

            <h1>רשימת הזמנות</h1>

            {loading ? (

                <Loading />

            ) : (

                <>

                    {/* =========================
                        סופר אדמין
                    ========================= */}

                    {user?.role === 'super_admin' ? (

                        Object.values(groupedOrders).map(
                            (parentCompany) => (

                                <div
                                    key={parentCompany.parent_company_name}
                                    className="orders-company-group"
                                >

                                    <h2>
                                        {parentCompany.parent_company_name}
                                    </h2>


                                    {Object.values(
                                        parentCompany.customers
                                    ).map((customerCompany) => (

                                        <div
                                            key={
                                                customerCompany.customer_company_name
                                            }
                                            className="orders-customer-group"
                                        >

                                            <h3>
                                                {customerCompany.customer_company_name}
                                            </h3>


                                            {customerCompany.orders.map(
                                                (order) => (

                                                    <div
                                                        key={order.id}
                                                    >
                                                        <OrderCard
                                                            myOrder={order}
                                                        />
                                                    </div>

                                                )
                                            )}

                                        </div>

                                    ))}

                                </div>

                            )
                        )

                    ) : (

                        /* =========================
                           שאר המשתמשים
                        ========================= */

                        orders.map((order) => (

                            <div key={order.id}>
                                <OrderCard myOrder={order} />
                            </div>

                        ))

                    )}


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