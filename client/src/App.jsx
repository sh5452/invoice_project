
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import OrderDetails from './pages/OrderDetails'
import Navbar from "./components/Navbar";
import './App.css'
import OrdersPage from './pages/OrdersPage'
import CreateOrder from './pages/CreateOrder'
import AddUserPage from './pages/AddUserPage';
import LoginPage from "./pages/LoginPage";


function App() {
 return(
  <BrowserRouter>
  <div style={{padding:'20px'}}>
    <Navbar />
<Routes>
<Route path="/" element={<LoginPage />} />

<Route path="/home" element={<HomePage/>}/>

<Route path="/orders" element={<OrdersPage/>}/>

<Route path="/orders/new" element={<CreateOrder/>}/>

<Route path="/orders/:id" element={<OrderDetails/>}/>

<Route path='/add-user'element={<AddUserPage />}/>
  
</Routes>
  </div>
  </BrowserRouter>
 )
}

export default App;
