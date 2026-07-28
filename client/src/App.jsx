import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import OrderDetails from './pages/OrderDetails'
import './App.css'
import OrdersPage from './pages/OrdersPage'
import CreateOrder from './pages/CreateOrder'

function App() {
 return(
  <BrowserRouter>
  <div style={{padding:'20px'}}>
<h1 className="main-title">Orders System</h1>
<Routes>
 
<Route path='/' element={<OrdersPage/>}/>
<Route path='/orders/:id' element={<OrderDetails/>}/>
<Route path='/orders/new' element={<CreateOrder/>}/>
  
</Routes>
  </div>
  </BrowserRouter>
 )
}

export default App
