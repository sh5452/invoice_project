
import { useState } from 'react';
import './AddUserPage.css';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';


function AddUserPage() {

    const navigate = useNavigate();

    const currentUser = JSON.parse(
        localStorage.getItem('user') || 'null'
    );

    const isSuperAdmin = currentUser?.role === 'super_admin';


    const [user, setUser] = useState({
        username: "",
        fullName: "",
        email: "",
        company: "",
        role: "",
        password: "",
        customerCompany: ""
    });


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post(
                '/users',
                user
            );

            console.log(response.data);

            navigate('/users');

        } catch (err) {

            console.error(err);

            const message =
                err.response?.data ||
                'שגיאה בהוספת משתמש';

            alert(message);

        }
    };


    return (

        <div className="add-user-page">

            <h1>הוספת משתמש</h1>

            <form onSubmit={handleSubmit}>

                <div className="form-group">

                    <label>שם משתמש</label>

                    <input
                        type="text"
                        value={user.username}
                        onChange={(e) =>
                            setUser({
                                ...user,
                                username: e.target.value
                            })
                        }
                    />

                </div>


                <div className="form-group">

                    <label>שם מלא</label>

                    <input
                        type="text"
                        value={user.fullName}
                        onChange={(e) =>
                            setUser({
                                ...user,
                                fullName: e.target.value
                            })
                        }
                    />

                </div>


                <div className="form-group">

                    <label>סיסמה</label>

                    <input
                        type="password"
                        value={user.password}
                        onChange={(e) =>
                            setUser({
                                ...user,
                                password: e.target.value
                            })
                        }
                    />

                </div>


                <div className="form-group">

                    <label>כתובת מייל</label>

                    <input
                        type="email"
                        value={user.email}
                        onChange={(e) =>
                            setUser({
                                ...user,
                                email: e.target.value
                            })
                        }
                    />

                </div>


                <div className="form-group">

                    <label>חברה</label>

                    <input
                        type="text"
                        value={user.company}
                        onChange={(e) =>
                            setUser({
                                ...user,
                                company: e.target.value
                            })
                        }
                    />

                </div>
                {user.role === "customer" && (
    <div className="form-group">
        <label>חברת הלקוח</label>
        <input
            type="text"
            value={user.customerCompany}
            onChange={(e) =>
                setUser({
                    ...user,
                    customerCompany: e.target.value
                })
            }
        />
    </div>
)}


                <div className="form-group">

                    <label>תפקיד</label>

                    <select
                        value={user.role}
                        onChange={(e) =>
                            setUser({
                                ...user,
                                role: e.target.value
                            })
                        }
                    >

                        <option value="">
                            בחר תפקיד
                        </option>


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

                </div>


                <button type="submit">
                    הוסף משתמש
                </button>

            </form>

        </div>

    );
}


export default AddUserPage;

