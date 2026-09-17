import { useState } from "react";
import "./loginPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        if (loading) return;

        try {

            setLoading(true);

            const response = await axios.post(
                'https://invoice-project-3.onrender.com/login',
                {
                    username,
                    password
                }
            );

            console.log("LOGIN RESPONSE:", response.data);

            localStorage.setItem(
                'token',
                response.data.token
            );

            localStorage.setItem(
                'user',
                JSON.stringify(response.data.user)
            );

            window.dispatchEvent(new Event("login"));

            navigate('/home');

        } catch (err) {

            console.error(err);

            alert('שם משתמש או סיסמה שגויים');

            setLoading(false);

        }
    };


    return (

        <div className="login-page">

            <form className="login-card" onSubmit={handleLogin}>

                <h1>התחברות למערכת</h1>

                <input
                    type="text"
                    placeholder="שם משתמש"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                />

                <input
                    type="password"
                    placeholder="סיסמה"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "מתחבר..." : "התחבר"}
                </button>

            </form>

        </div>

    );

}

export default LoginPage;