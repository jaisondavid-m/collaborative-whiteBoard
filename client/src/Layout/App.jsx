import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "../Pages/Login.jsx"
import Register from '../Pages/Register.jsx'
import Home from "../Pages/Home.jsx"
import Rooms from "../Pages/Rooms.jsx"
import Whiteboard from '../Pages/Whiteboard.jsx'
import About from "../Pages/About.jsx"
import PrivacyPolicy from "../Pages/PrivacyPolicy.jsx"

import ProtectedRoute from "../routes/ProtectedRoute.jsx"
import AppLayout from "./AppLayout.jsx"

function App() {

  const token = localStorage.getItem("token")

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={token ? <Navigate to="/home" /> : <Login/> } />
        <Route path='/register' element={token ? <Navigate to="/home"/> : <Register/> } />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout/>
            </ProtectedRoute>
          }
        >
          <Route path='/home' element={<Home/>} />
          <Route path='/room' element={<Rooms/>} />
          <Route path='/about' element={<About/>} />
          <Route path='/privacypolicy' element={<PrivacyPolicy/>} />
          <Route path='/whiteboard/:roomId' element={<Whiteboard/>} />
        </Route>

        <Route path='/' element={<Navigate to={token ? "/home" : "/login"} />} />

        {/* <Route
          path='/home'
          element={
            <ProtectedRoute>
              <Home/>
            </ProtectedRoute>
          }
        />
        <Route
          path='/whiteboard/:roomId'
          element={
              <ProtectedRoute>
                <Whiteboard/>
              </ProtectedRoute>   
          }
        />
        <Route
          path='/room'
          element={
            <ProtectedRoute>
              <Rooms/>
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
        /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App