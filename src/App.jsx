import './App.css'
import Layout from './components/Layout.jsx'
import Dashboard from './routes/dashboard.jsx'
import Profile from './routes/profile.jsx'
import Log from './routes/log.jsx'
import Search from './routes/search.jsx'
// import { BrowserRouter } from 'react-router'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from "react-hot-toast";



function App() {

  return (
    <BrowserRouter>
    <Toaster position="top-center" />
     <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="log" element={<Log />} />
        <Route path="profile" element={<Profile />} />
        <Route path="search" element={<Search/>} />
      </Route>
     </Routes>
    </BrowserRouter>
  )
}

export default App
