import { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

function LoginPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
   
    
const handleLogin = async (e) => {

    e.preventDefault();

    try {

        const response = await axios.post(
            'http://localhost:5000/login',
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

        navigate('/home');

    } catch (err) {

        console.error(err);

        alert('שם משתמש או סיסמה שגויים');

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
                    onChange={(e)=>setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="סיסמה"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />

                <button type="submit">
                    התחבר
                </button>

            </form>

        </div>

    );

}

export default LoginPage;