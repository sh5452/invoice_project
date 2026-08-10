import { useNavigate } from 'react-router-dom'
import { FaTruck, FaChartLine, FaCheckCircle, FaClock } from "react-icons/fa";
import './HomePage.css'
function HomePage(){
    const navigate = useNavigate()

 return (
  <div style={{padding:'20px'}}>

    <h1 className="main-title">
      מערכת <span className="smart-word">חכמה</span> להזמנות
    </h1>

    <h2>שום הזמנה לא הולכת לאיבוד. הכל במקום אחד</h2>

    <div>
      <p>ניהול מלא של ההזמנה מהלקוח ועד האספקה- הזמנה, תעודת משלוח, החזרות</p>
      <p>ומעקב אחר סטטוסים בצורה חכמה, יעילה ומסודרת</p>
    </div>

    <div className="hero">

      <div className="hero-content">

        <div className="features">

          <div className="feature-card">
            <FaChartLine className="icon" /> 
            <h4>שליטה ומעקב בזמן אמת</h4>
          </div>

          <div className="feature-card">
            <FaCheckCircle className="icon"/>  
            <h4>דיוק ומניעת טעויות</h4>
          </div>

          <div className="feature-card">
            <FaClock  className="icon" />
            <h4>חוסך זמן ומשאבים</h4>
          </div>

        </div>

        <div className="hero-buttons">
          <button className="primary-btn">הזמנה חדשה</button>
          <button className="secondary-btn">רשימת הזמנות</button>
        </div>

      </div>

      <div className="hero-image">
        <img src="/truck.png" alt="Truck" />
      </div>

    </div>

  </div>
)
}
export default HomePage;