import { Link,  useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/');
};

    return (

        <nav className="navbar">
            <div className="logo">
                <span className="truck-icon">
                    <img src="logo.png"/>
                </span>

                

            </div>

            <div className="menu">

                {JSON.parse(localStorage.getItem('user'))?.role === 'company_admin' && (
    <Link to="/add-user">הוספת משתמש</Link>
)}

                <Link to="/delivery-note">תעודת משלוח</Link>

                <Link to="/orders">רשימת הזמנות</Link>

                <Link to="/orders/new">הזמנה חדשה</Link>

                <Link to="/home">ראשי</Link>

                {localStorage.getItem('token') ? (
    <button onClick={handleLogout}>
        התנתקות
    </button>
) : (
    <Link to="/">
        התחברות
    </Link>
)}

            </div>

        </nav>

    );

}

export default Navbar;