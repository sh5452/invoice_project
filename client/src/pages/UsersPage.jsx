import { useEffect, useState } from 'react';
import axios from 'axios';

function UsersPage() {

    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    const startEdit = (user) => {
        setEditingUser({ ...user });
    };

    const saveUser = async () => {
        try {

            const response = await axios.put(
                `http://localhost:5000/users/${editingUser.id}`,
                {
                    username: editingUser.username,
                    fullName: editingUser.full_name,
                    email: editingUser.email,
                    company: editingUser.company,
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
            alert("שגיאה בעדכון המשתמש");

        }
    };

    const cancelEdit = () => {
        setEditingUser(null);
    };

    const deleteUser = async (id) => {

    const confirmDelete = window.confirm(
        "האם את בטוחה שברצונך למחוק את המשתמש?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        await axios.delete(
            `http://localhost:5000/users/${id}`
        );

        setUsers(
            users.filter(user => user.id !== id)
        );

    } catch (err) {

        console.error(err);
        alert("שגיאה במחיקת המשתמש");

    }
};
    useEffect(() => {

        const fetchUsers = async () => {
            try {

                const response = await axios.get(
                    'http://localhost:5000/users'
                );

                setUsers(response.data);

            } catch (err) {

                console.error(err);
            }
        };

        fetchUsers();

    }, []);

    return (
        <div>

            <h1>רשימת משתמשים</h1>

            {users.map((user) => (

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
                                    <option value="company_admin">
                                        מנהל לקוח
                                    </option>

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
                            <p>שם משתמש: {user.username}</p>

                            <p>שם מלא: {user.full_name}</p>

                            <p>מייל: {user.email}</p>

                            <p>חברה: {user.company}</p>

                            <p>תפקיד: {user.role}</p>

                            <button onClick={() => startEdit(user)}>
                                עריכה
                            </button>

                            <button  onClick={() => deleteUser(user.id)}>
                                מחיקה
                            </button>

                        </>
                    )}

                    <hr />

                </div>
            ))}

        </div>
    );
}

export default UsersPage;