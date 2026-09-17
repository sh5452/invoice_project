import { useState, useEffect } from 'react';
import './AddUserPage.css';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './UserPage.css';
import Loading from '../components/Loading';


function AddUserPage() {

    const navigate = useNavigate();

    const currentUser = JSON.parse(
        localStorage.getItem('user') || 'null'
    );

    const isSuperAdmin =
        currentUser?.role === 'super_admin';


    const [companies, setCompanies] = useState([]);

    const [showNewCompanyFor, setShowNewCompanyFor] =
        useState(null);

    const [newCompanyName, setNewCompanyName] =
        useState('');

    const [loadingCompanies, setLoadingCompanies] =
        useState(true);

    const [addingCompany, setAddingCompany] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);


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

            } finally {

                setLoadingCompanies(false);

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
    // הוספת חברה חדשה
    // =========================

    const handleAddCompany = async (type) => {

        if (!newCompanyName.trim()) {

            alert('יש להזין שם חברה');

            return;
        }

        if (addingCompany) {
            return;
        }

        setAddingCompany(true);

        try {

            let isParentCompany = false;
            let parentCompanyId = null;

            // =========================
            // הוספת חברה ראשית
            // =========================

            if (type === 'company') {

                isParentCompany = true;
                parentCompanyId = null;

            }

            // =========================
            // הוספת חברת לקוח
            // =========================

            if (type === 'customerCompany') {

                isParentCompany = false;

                parentCompanyId =
                    user.companyId;

                if (!parentCompanyId) {

                    alert(
                        'יש לבחור חברה ראשית לפני הוספת חברת לקוח'
                    );

                    setAddingCompany(false);

                    return;
                }
            }

            const response = await api.post(
                '/companies',
                {
                    name: newCompanyName.trim(),
                    isParentCompany,
                    parentCompanyId
                }
            );

            const newCompany = response.data;

            setCompanies(prev => [
                ...prev,
                newCompany
            ]);

            // אם זו החברה הראשית של המשתמש
            if (type === 'company') {

                setUser(prev => ({
                    ...prev,
                    companyId: newCompany.id
                }));

            }

            // אם זו חברת הלקוח
            if (type === 'customerCompany') {

                setUser(prev => ({
                    ...prev,
                    customerCompanyId: newCompany.id
                }));

            }

            setNewCompanyName('');
            setShowNewCompanyFor(null);

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data ||
                'שגיאה בהוספת החברה'
            );

        } finally {

            setAddingCompany(false);

        }

    };


    // =========================
    // שליחת הטופס
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (submitting) {
            return;
        }

        setSubmitting(true);

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

            setSubmitting(false);

        }

    };


    // =========================
    // טעינת חברות
    // =========================

    if (loadingCompanies) {
        return <Loading />;
    }


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

                    <div className="company-select-row">

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


                        <button
                            type="button"
                            className="add-company-button"
                            onClick={() => {

                                setShowNewCompanyFor('company');
                                setNewCompanyName('');

                            }}
                            disabled={addingCompany}
                        >
                            +
                        </button>

                    </div>


                    {showNewCompanyFor === 'company' && (

                        <div className="new-company-box">

                            <input
                                type="text"
                                placeholder="שם החברה החדשה"
                                value={newCompanyName}
                                onChange={(e) =>
                                    setNewCompanyName(
                                        e.target.value
                                    )
                                }
                                disabled={addingCompany}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    handleAddCompany('company')
                                }
                                disabled={addingCompany}
                            >
                                {addingCompany
                                    ? 'מוסיף...'
                                    : 'הוסף חברה'}
                            </button>

                        </div>

                    )}

                </div>


                {/* חברת הלקוח */}

                {user.role === "customer" && (

                    <div className="form-group">

                        <label>חברת הלקוח</label>

                        <div className="company-select-row">

                            <select
                                value={
                                    user.customerCompanyId
                                }
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


                            <button
                                type="button"
                                className="add-company-button"
                                onClick={() => {

                                    setShowNewCompanyFor(
                                        'customerCompany'
                                    );

                                    setNewCompanyName('');

                                }}
                                disabled={addingCompany}
                            >
                                +
                            </button>

                        </div>


                        {showNewCompanyFor ===
                            'customerCompany' && (

                            <div className="new-company-box">

                                <input
                                    type="text"
                                    placeholder="שם החברה החדשה"
                                    value={newCompanyName}
                                    onChange={(e) =>
                                        setNewCompanyName(
                                            e.target.value
                                        )
                                    }
                                    disabled={addingCompany}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleAddCompany(
                                            'customerCompany'
                                        )
                                    }
                                    disabled={addingCompany}
                                >
                                    {addingCompany
                                        ? 'מוסיף...'
                                        : 'הוסף חברה'}
                                </button>

                            </div>

                        )}

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


                <button
                    type="submit"
                    disabled={submitting}
                >
                    {submitting
                        ? 'יוצר משתמש...'
                        : 'הוסף משתמש'}
                </button>


            </form>


            {/* טעינה בזמן יצירת המשתמש */}

            {submitting && <Loading />}

        </div>

    );

}


export default AddUserPage;