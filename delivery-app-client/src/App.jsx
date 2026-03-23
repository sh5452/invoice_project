import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import OrdersList from './pages/OrdersList'
import CreateOrder from './pages/CreateOrder'
import OrderDetails from './pages/OrderDetails'

import './App.css'

function App() {
 return(
  <BrowserRouter>
  <div style={{padding:'20px'}}>
<h1>Delivery Order System</h1>
<Routes>
  <Route path='/' element={<OrdersList/>}/>
<Route path='/create' element={<CreateOrder/>}/>
<Route path='/orders/:id' element={<OrderDetails/>}/>
  
</Routes>
  </div>
  </BrowserRouter>
 )
}

export default App
