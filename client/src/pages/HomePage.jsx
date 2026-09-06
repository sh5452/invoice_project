import './HomePage.css'
import {
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaShoppingCart,
  FaTruck,
  FaUndoAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";


function HomePage(){ 
  
  const navigate=useNavigate() 
 
  return ( 
    <div className="home-page"> 
   
      <h1 className="main-title"> 
        מערכת <span className="smart-word">חכמה</span> להזמנות 
      </h1> 
   
      <h2>שום הזמנה לא הולכת לאיבוד. הכל במקום אחד</h2> 
   
      <div className="home-intro"> 
        <h4>ניהול מלא של ההזמנה מהלקוח ועד האספקה- הזמנה, תעודת משלוח, החזרות</h4> 
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
              <FaCheckCircle className="icon" /> 
              <h4>דיוק ומניעת טעויות</h4> 
            </div> 
   
            <div className="feature-card"> 
              <FaClock className="icon" /> 
              <h4>חוסך זמן ומשאבים</h4> 
            </div> 
   
          </div> 
   
          <div className="hero-buttons"> 
            <button 
              className="primary-btn" 
              onClick={() => navigate("/orders/new")}
            > 
              הזמנה חדשה
            </button> 

            <button 
              className="secondary-btn" 
              onClick={() => navigate("/orders")} 
            >
              רשימת הזמנות
            </button> 
          </div> 
   
        </div> 
   
       
         
      </div>


      {/* הכרטיסיות החדשות */}

      <div className="system-features">

        <div className="system-card">

          <div className="card-icon">
            <FaShoppingCart />
          </div>

          <div className="card-content">
            <h3>הזמנות חכמות</h3>

            <p>
              הזמנות מדויקות, מעקב סטטוסים בזמן אמת והיסטוריה מלאה של כל הפעילות
            </p>
          </div>

        </div>


        <div className="system-card">

          <div className="card-icon">
            <FaTruck />
          </div>

          <div className="card-content">
            <h3>תעודת משלוח</h3>

            <p>
              יצירה, שליחה ומעקב אחר תעודת משלוח בלחיצת כפתור
            </p>
          </div>

        </div>


        <div className="system-card">

          <div className="card-icon">
            <FaUndoAlt />
          </div>

          <div className="card-content">
            <h3>החזרות מסודרות</h3>

            <p>
              ניהול החזרות בצורה פשוטה ומעקב מלא עד לסגירת הטיפול
            </p>
          </div>

        </div>

      </div>


      {/* הטקסט החדש */}

    <div className="closing-card">

    <p>
        כל המידע, כל המסמכים, כל הסטטוסים- במקום אחד.
        <br />
        יותר סדר, יותר שליטה, יותר <span>יעילות</span>
    </p>

    <div className="outline-star">✭</div>

</div>
   
    </div> 
  ) 
 
} 
 
export default HomePage