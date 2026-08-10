import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {

    return (

        <nav className="navbar">
            <div className="logo">
                <span className="truck-icon">
                    <img src="logo.png"/>
                </span>

                

            </div>

            <div className="menu">

                <Link to="/home">ראשי</Link>

                <Link to="/orders">רשימת הזמנות</Link>

                <Link to="/orders/new">הזמנה חדשה</Link>

                <Link to="/">התחברות</Link>

            </div>

        </nav>

    );

}

export default Navbar;