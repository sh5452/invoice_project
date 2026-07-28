
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import OrderDetails from './pages/OrderDetails'
import Navbar from "./components/Navbar";
import './App.css'
import OrdersPage from './pages/OrdersPage'
import CreateOrder from './pages/CreateOrder'
import HomePage from './pages/HomePage'

function App() {
 return(
  <BrowserRouter>
  <div style={{padding:'20px'}}>
    <Navbar />
<h1 className="main-title"> מערכת <span>חכמה</span> להזמנות</h1>
<h2>שום הזמנה לא הולכת לאיבוד. הכל במקום אחד</h2>
<h3>ניהול מלא של ההזמנה מהלקוח ועד האספקה- הזמנה, תעודת משלוח, החזרות</h3>
<h3>ומעקב אחר סטטוסים בצורה חכמה, יעילה ומסודרת</h3>
<Routes>
 <Route path='/' element={<HomePage/>}/>
<Route path='/orders' element={<OrdersPage/>}/>
<Route path='/orders/:id' element={<OrderDetails/>}/>
<Route path='/orders/new' element={<CreateOrder/>}/>
  
</Routes>
  </div>
  </BrowserRouter>
 )
}

export default App;
