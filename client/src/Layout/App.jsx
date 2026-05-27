import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "../Pages/Login.jsx"
import Register from '../Pages/Register.jsx'
import Home from "../Pages/Home.jsx"

import ProtectedRoute from "../routes/ProtectedRoute.jsx"

function App() {

  const token = localStorage.getItem("token")

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={token ? <Navigate to="/home" /> : <Login/> } />
        <Route path='/register' element={token ? <Navigate to="/home"/> : <Register/> } />
        <Route
          path='/home'
          element={
            <ProtectedRoute>
              <Home/>
            </ProtectedRoute>
          }
        />
        <Route
          path='/'
          element={
            <Navigate
              to={
                token ? "/home" : "/login"
              }
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App