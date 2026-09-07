import { useState, useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import OrderDetails from "./pages/OrderDetails";
import Navbar from "./components/Navbar";
import OrdersPage from "./pages/OrdersPage";
import CreateOrder from "./pages/CreateOrder";
import AddUserPage from "./pages/AddUserPage";
import LoginPage from "./pages/loginPage";
import UsersPage from "./pages/UsersPage";
import DeliveryNotePage from "./pages/DeliveryNotePage";
import ReturnOrder from "./pages/ReturnOrder";

import "./App.css";


function App() {
   console.log("USER IN APP:", JSON.parse(localStorage.getItem("user") || "null"));

    const [showSessionWarning, setShowSessionWarning] = useState(false);
const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
);

    // הפעלת טיימר לפי תוקף הטוקן
    const startSessionTimer = (token) => {

        if (!token) {
            return null;
        }

        try {

            const payload = JSON.parse(
                atob(token.split(".")[1])
            );

            const expirationTime = payload.exp * 1000;

            // התראה 30 שניות לפני פקיעת הטוקן
            const warningTime = expirationTime - 30 * 1000;

            const delay = warningTime - Date.now();

            console.log("DELAY:", delay);

            if (delay <= 0) {

                setShowSessionWarning(true);

                return null;
            }

            const timer = setTimeout(() => {

                setShowSessionWarning(true);

            }, delay);

            return timer;

        } catch (error) {

            console.error("Invalid token:", error);

            return null;
        }
    };


    // התחברות / טעינת האפליקציה
    useEffect(() => {

        let timer;

        const token = localStorage.getItem("token");

        if (token) {
            timer = startSessionTimer(token);
        }


        // כאשר מתבצעת התחברות חדשה
        const handleLogin = () => {

            console.log("LOGIN EVENT RECEIVED");

            const newToken = localStorage.getItem("token");

            console.log("TOKEN:", newToken);
const savedUser = localStorage.getItem("user");
setUser(savedUser ? JSON.parse(savedUser) : null);
            if (timer) {
                clearTimeout(timer);
            }

            if (newToken) {
                timer = startSessionTimer(newToken);
            }
        };


        window.addEventListener("login", handleLogin);


        return () => {

            if (timer) {
                clearTimeout(timer);
            }

            window.removeEventListener("login", handleLogin);

        };

    }, []);


    // הישאר מחובר
    const handleStayLoggedIn = async () => {

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No token found");
            }


            const response = await fetch(
                "http://localhost:5000/refresh-token",
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {
                throw new Error("Failed to refresh token");
            }


            const data = await response.json();


            // שמירת הטוקן החדש
            localStorage.setItem("token", data.token);


            // סגירת חלון ההתראה
            setShowSessionWarning(false);


            // הפעלת טיימר חדש
            startSessionTimer(data.token);


            console.log("TOKEN REFRESHED SUCCESSFULLY");


        } catch (error) {

            console.error("Refresh token error:", error);

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "/";

        }
    };


    // התנתקות
    const handleSessionLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setShowSessionWarning(false);

        window.location.href = "/";

    };


    return (

        <BrowserRouter>

            <div style={{ padding: "2px", margin:0 }}>

                <Navbar />


                <Routes>

                    <Route
                        path="/"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/home"
                        element={<HomePage />}
                    />

                    <Route
                        path="/orders"
                        element={<OrdersPage />}
                    />

                  <Route
    path="/orders/new"
    element={
        user?.role === "customer"
            ? <CreateOrder />
            : <Navigate to="/orders" />
    }
/>

                    <Route
                        path="/orders/:id"
                        element={<OrderDetails />}
                    />

                    <Route
                        path="/add-user"
                        element={<AddUserPage />}
                    />

                    <Route
                        path="/users"
                        element={<UsersPage />}
                    />

                    <Route
                        path="/delivery-notes/new/:orderId"
                        element={<DeliveryNotePage />}
                    />

                    <Route
                        path="/orders/:id/return"
                        element={<ReturnOrder />}
                    />

                </Routes>


                {/* חלון התראת פקיעת התחברות */}

                {showSessionWarning && (

                    <div className="session-overlay">

                        <div className="session-modal">

                            <div className="session-icon">
                                🔒
                            </div>

                            <h2>
                                ההתחברות עומדת להסתיים
                            </h2>

                            <p>
                                ההתחברות שלך עומדת להסתיים בעוד
                                <strong> 30 שניות</strong>.
                            </p>

                            <p>
                                האם ברצונך להישאר מחובר?
                            </p>

                            <div className="session-buttons">

                                <button
                                    className="stay-button"
                                    onClick={handleStayLoggedIn}
                                >
                                    הישאר מחובר
                                </button>

                                <button
                                    className="logout-button"
                                    onClick={handleSessionLogout}
                                >
                                    התנתק
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </BrowserRouter>

    );
}


export default App;