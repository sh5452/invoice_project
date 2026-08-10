
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import OrderDetails from './pages/OrderDetails'
import Navbar from "./components/Navbar";
import './App.css'
import OrdersPage from './pages/OrdersPage'
import CreateOrder from './pages/CreateOrder'



function App() {
 return(
  <BrowserRouter>
  <div style={{padding:'20px'}}>
    <Navbar />
<Routes>
<Route path="/" element={<HomePage/>}/>

<Route path="/orders" element={<OrdersPage/>}/>

<Route path="/orders/new" element={<CreateOrder/>}/>

<Route path="/orders/:id" element={<OrderDetails/>}/>
  
</Routes>
  </div>
  </BrowserRouter>
 )
}

export default App;
