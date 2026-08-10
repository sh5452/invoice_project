import { useState } from 'react';
import './AddUserPage.css';

function AddUserPage() {
    const [user,setUser]=useState({
          username: "",
    fullName: "",
    email: "",
    company: "",
    role: ""
    })
    const handleSubmit = (e) => {
    e.preventDefault();

    console.log(user);
};

    return (
        <div className="add-user-page">

            <h1>הוספת משתמש</h1>

            <form onSubmit={handleSubmit}>

                <div className="form-group">
                    <label>שם משתמש</label>
                    <input type="text" value={user.username}  onChange={(e) =>
        setUser({ ...user, username: e.target.value })
    }/>
                </div>

                <div className="form-group">
                    <label>שם מלא</label>
                    <input type="text" value={user.fullName} onChange={(e) =>
                        setUser({...user,fullName:e.target.value})
                    }/>
                </div>

                <div className="form-group">
                    <label>כתובת מייל</label>
                    <input type="email" value={user.email} onChange={(e)=>
                        setUser({...user, email:e.target.value})
                    }/>
                </div>

                <div className="form-group">
                    <label>חברה</label>
                    <input type="text"  value={user.company}   onChange={(e) =>
        setUser({ ...user, company: e.target.value })
    }/>
                </div>

                <div className="form-group">
                    <label>תפקיד</label>

                    <select  value={user.role}
    onChange={(e) =>
        setUser({ ...user, role: e.target.value })
    }>
                        <option value="">בחר תפקיד</option>
                        <option value="company_admin">מנהל לקוח</option>
                        <option value="employee">עובד חברה</option>
                        <option value="driver">נהג</option>
                        <option value="customer">לקוח</option>
                    </select>

                </div>

                <button type="submit" >
                    הוסף משתמש
                </button>

            </form>

        </div>
    );
}

export default AddUserPage;
