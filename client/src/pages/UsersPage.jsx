import { useEffect, useState } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';

function UsersPage() {

    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [openCompanies, setOpenCompanies] = useState({});
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(
        localStorage.getItem('user') || 'null'
    );

    const isSuperAdmin = currentUser?.role === 'super_admin';

    const startEdit = (user) => {
        setEditingUser({
            ...user
        });
    };

    const saveUser = async () => {

        try {

            const response = await api.put(
                `/users/${editingUser.id}`,
                {
                    username: editingUser.username,
                    fullName: editingUser.full_name,
                    email: editingUser.email,
                    company: editingUser.company,
                    customerCompany: editingUser.customer_company,
                    role: editingUser.role
                }
            );

            setUsers(
                users.map(user =>
                    user.id === editingUser.id
                        ? response.data
                        : user
                )
            );

            setEditingUser(null);

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data ||
                "שגיאה בעדכון המשתמש"
            );

        }
    };

    const cancelEdit = () => {
        setEditingUser(null);
    };

    const deactivateUser = async (id) => {

        const confirmDeactivate = window.confirm(
            "האם את בטוחה שברצונך להשבית את המשתמש?"
        );

        if (!confirmDeactivate) {
            return;
        }

        try {

            const response = await api.patch(
                `/users/${id}/deactivate`
            );

            setUsers(
                users.map(user =>
                    user.id === id
                        ? response.data
                        : user
                )
            );

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data ||
                "שגיאה בהשבתת המשתמש"
            );

        }
    };

    const toggleCompany = (company) => {

        setOpenCompanies(prev => ({
            ...prev,
            [company]: !prev[company]
        }));

    };

    useEffect(() => {

        const fetchUsers = async () => {

            try {

                const response = await api.get('/users');

                setUsers(response.data);
                setLoading(false);

            } catch (err) {

                console.error(err);
                setLoading(false);

            }

        };

        fetchUsers();

    }, []);

    const companies = [
        ...new Set(
            users
                .filter(user => user.role !== 'super_admin')
                .map(user => user.company)
                .filter(Boolean)
        )
    ];

    const getCompanyUsers = (company) => {

        return users.filter(
            user =>
                user.company === company &&
                user.role !== 'super_admin'
        );

    };

    const getRoleName = (role) => {

        switch (role) {

            case 'super_admin':
                return 'מנהל מערכת';

            case 'company_admin':
                return 'מנהל חברה';

            case 'employee':
                return 'עובד חברה';

            case 'driver':
                return 'נהג';

            case 'customer':
                return 'לקוח';

            default:
                return role;

        }

    };

    const renderUser = (user) => {

        return (

            <div key={user.id}>

                {editingUser?.id === user.id ? (

                    <>

                        <p>
                            שם משתמש:

                            <input
                                value={editingUser.username}
                                onChange={(e) =>
                                    setEditingUser({
                                        ...editingUser,
                                        username: e.target.value
                                    })
                                }
                            />

                        </p>

                        <p>
                            שם מלא:

                            <input
                                value={editingUser.full_name}
                                onChange={(e) =>
                                    setEditingUser({
                                        ...editingUser,
                                        full_name: e.target.value
                                    })
                                }
                            />

                        </p>

                        <p>
                            מייל:

                            <input
                                value={editingUser.email}
                                onChange={(e) =>
                                    setEditingUser({
                                        ...editingUser,
                                        email: e.target.value
                                    })
                                }
                            />

                        </p>

                        {isSuperAdmin ? (

                            <p>
                                חברה:

                                <input
                                    value={editingUser.company}
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            company: e.target.value
                                        })
                                    }
                                />

                            </p>

                        ) : (

                            <p>
                                חברה: {editingUser.company}
                            </p>

                        )}

                        {editingUser.role === 'customer' && (

                            <p>
                                חברת הלקוח:

                                <input
                                    value={
                                        editingUser.customer_company || ''
                                    }
                                    onChange={(e) =>
                                        setEditingUser({
                                            ...editingUser,
                                            customer_company: e.target.value
                                        })
                                    }
                                />

                            </p>

                        )}

                        <p>

                            תפקיד:

                            <select
                                value={editingUser.role}
                                onChange={(e) =>
                                    setEditingUser({
                                        ...editingUser,
                                        role: e.target.value
                                    })
                                }
                            >

                                {isSuperAdmin && (

                                    <option value="company_admin">
                                        מנהל חברה
                                    </option>

                                )}

                                <option value="employee">
                                    עובד חברה
                                </option>

                                <option value="driver">
                                    נהג
                                </option>

                                <option value="customer">
                                    לקוח
                                </option>

                            </select>

                        </p>

                        <button onClick={saveUser}>
                            שמור
                        </button>

                        <button onClick={cancelEdit}>
                            ביטול
                        </button>

                    </>

                ) : (

                    <>

                        <p>
                            שם משתמש: {user.username}
                        </p>

                        <p>
                            שם מלא: {user.full_name}
                        </p>

                        <p>
                            מייל: {user.email}
                        </p>

                        <p>
                            תפקיד: {getRoleName(user.role)}
                        </p>

                        {user.role === 'customer' && (

                            <p>
                                חברת הלקוח:{' '}
                                {user.customer_company || 'לא הוגדרה'}
                            </p>

                        )}

                        <button
                            onClick={() => startEdit(user)}
                        >
                            עריכה
                        </button>

                        <button
                            onClick={() =>
                                deactivateUser(user.id)
                            }
                        >
                            השבתה
                        </button>

                        <p>
                            סטטוס:
                            {' '}
                            {user.is_active
                                ? "פעיל"
                                : "מושבת"
                            }
                        </p>

                    </>

                )}

                <hr />

            </div>

        );

    };

    return (

        <div>

            <h1>ניהול משתמשים</h1>

            {loading ? (

                <Loading />

            ) : (

                isSuperAdmin ? (

                    <div>

                        {companies.length === 0 ? (

                            <p>
                                עדיין לא נוספו חברות.
                            </p>

                        ) : (

                            companies.map(company => {

                                const companyUsers =
                                    getCompanyUsers(company);

                                const isOpen =
                                    openCompanies[company];

                                return (

                                    <div key={company}>

                                        <button
                                            className="company-button"
                                            onClick={() =>
                                                toggleCompany(company)
                                            }
                                        >

                                            {isOpen ? '▼' : '▶'}
                                            {' '}
                                            {company}
                                            {' '}
                                            ({companyUsers.length})

                                        </button>

                                        {isOpen && (

                                            <div>

                                                {companyUsers.map(
                                                    renderUser
                                                )}

                                            </div>

                                        )}

                                    </div>

                                );

                            })

                        )}

                    </div>

                ) : (

                    <div>

                        {users.map(renderUser)}

                    </div>

                )

            )}

        </div>

    );

}

export default UsersPage;