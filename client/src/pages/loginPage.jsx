import { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const user = {
        username: "test",
        password: "123456",
        role: "company_admin"
      };
    

    const handleLogin = (e) => {
        e.preventDefault();
          // זמני בלבד
          if (
            username === user.username &&
            password === user.password
          ) {
            navigate("/home");
          }
        
        }
    

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