import { useState } from 'react'
import './App.css'
import Layout from './components/Layout.jsx'
import Dashboard from './routes/dashboard.jsx'
import Profile from './routes/profile.jsx'
// import { BrowserRouter } from 'react-router'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
     <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
      </Route>
     </Routes>
    </BrowserRouter>
  )
}

export default App
