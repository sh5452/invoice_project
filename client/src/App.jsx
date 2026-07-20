import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import OrdersList from './pages/OrdersList'
import OrdersPage from './pages/OrdersPage'
import OrderDetails from './pages/OrderDetails'

import './App.css'
import OrdersPage from './pages/OrdersPage'

function App() {
 return(
  <BrowserRouter>
  <div style={{padding:'20px'}}>
<h1>Orders System</h1>
<Routes>
 
<Route path='/' element={<OrdersPage/>}/>
<Route path='/orders/:id' element={<OrderDetails/>}/>
  
</Routes>
  </div>
  </BrowserRouter>
 )
}

export default App
