import { useState, useEffect } from 'react';
import './AddUserPage.css';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './UserPage.css'


function AddUserPage() {

    const navigate = useNavigate();

    const currentUser = JSON.parse(
        localStorage.getItem('user') || 'null'
    );

    const isSuperAdmin =
        currentUser?.role === 'super_admin';


    const [companies, setCompanies] = useState([]);

    const [user, setUser] = useState({
        username: "",
        fullName: "",
        email: "",
        companyId: "",
        customerCompanyId: "",
        role: "",
        password: ""
    });


    // =========================
    // טעינת חברות
    // =========================

    useEffect(() => {

        const fetchCompanies = async () => {

            try {

                const response = await api.get('/companies');

                setCompanies(response.data);

            } catch (err) {

                console.error(err);

                alert(
                    err.response?.data ||
                    'שגיאה בטעינת החברות'
                );

            }

        };

        fetchCompanies();

    }, []);


    // =========================
    // חברה של Company Admin
    // =========================

    useEffect(() => {

        if (
            !isSuperAdmin &&
            currentUser?.company_id
        ) {

            setUser(prev => ({
                ...prev,
                companyId: currentUser.company_id
            }));

        }

    }, [isSuperAdmin, currentUser?.company_id]);


    // =========================
    // שליחת הטופס
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post(
                '/users',
                {
                    username: user.username,
                    fullName: user.fullName,
                    email: user.email,

                    companyId:
                        isSuperAdmin
                            ? user.companyId
                            : currentUser.company_id,

                    customerCompanyId:
                        user.role === 'customer'
                            ? user.customerCompanyId || null
                            : null,

                    role: user.role,
                    password: user.password
                }
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


                {/* שם משתמש */}

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


                {/* שם מלא */}

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


                {/* סיסמה */}

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


                {/* מייל */}

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


                {/* חברה */}

                <div className="form-group">

                    <label>חברה</label>

                    {isSuperAdmin ? (

                        <select
                            value={user.companyId}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    companyId: e.target.value
                                })
                            }
                        >

                            <option value="">
                                בחר חברה
                            </option>

                            {companies
                                .filter(
                                    company =>
                                        company.name !== 'SYSTEM'
                                )
                                .map(company => (

                                    <option
                                        key={company.id}
                                        value={company.id}
                                    >
                                        {company.name}
                                    </option>

                                ))}

                        </select>

                    ) : (

                        <input
                            type="text"
                            value={
                                companies.find(
                                    company =>
                                        company.id ===
                                        Number(user.companyId)
                                )?.name || ''
                            }
                            readOnly
                        />

                    )}

                </div>


                {/* חברת הלקוח */}

                {user.role === "customer" && (

                    <div className="form-group">

                        <label>חברת הלקוח</label>

                        <select
                            value={user.customerCompanyId}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    customerCompanyId:
                                        e.target.value
                                })
                            }
                        >

                            <option value="">
                                בחר חברת לקוח
                            </option>

                            {companies
                                .filter(
                                    company =>
                                        company.name !== 'SYSTEM'
                                )
                                .map(company => (

                                    <option
                                        key={company.id}
                                        value={company.id}
                                    >
                                        {company.name}
                                    </option>

                                ))}

                        </select>

                    </div>

                )}


                {/* תפקיד */}

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