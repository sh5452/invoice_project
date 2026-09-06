import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {

    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user") || "null")
    );
    useEffect(() => {
    const savedUser = localStorage.getItem("user");

    setUser(
        savedUser ? JSON.parse(savedUser) : null
    );
}, [location.pathname]);

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);

        navigate('/home');
    };

    return (

        <nav className="navbar">

            <div className="logo">

                <span className="truck-icon">
                    <img src="logo.png" />
                </span>

            </div>

            <div className="menu">

                {user?.role === "company_admin" && (
                    <Link to="/add-user">
                        הוספת משתמש
                    </Link>
                )}
                {user?.role === "company_admin" && (
                <Link to='/users'>
                רשימת משתמשים
                </Link>
)}
                {user && (
                    <>
                        

                        <Link to="/orders">
                            רשימת הזמנות
                        </Link>

                           {user.role === "customer" && (
            <Link to="/orders/new">
                הזמנה חדשה
            </Link>
        )}
                    </>
                )}

                <Link to="/home">
                    ראשי
                </Link>

                {user ? (
              <div className="user-section">
    <Link to="/" onClick={handleLogout}>
        התנתקות
    </Link>

    <span className="user-name">
        שלום, {user.full_name || user.username}
    </span>
</div>
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