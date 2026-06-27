import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "../Pages/Login.jsx"
import Register from '../Pages/Register.jsx'
import Home from "../Pages/Home.jsx"
import Rooms from "../Pages/Rooms.jsx"
import Whiteboard from '../Pages/Whiteboard.jsx'
import AdminPage from "../Pages/AdminPage.jsx"
import About from "../Pages/About.jsx"
import PrivacyPolicy from "../Pages/PrivacyPolicy.jsx"
import Profile from "../Pages/Profile.jsx"
import Friends from "../Pages/Friends.jsx"
import Chat from "../Pages/Chat.jsx"
import Audit from "../Pages/Audit.jsx"
import CursorSettings from '../Components/ui/cursors/Cursorsettings.jsx'
import NotFound from "../Pages/NotFound.jsx"

import useCursor from "../hooks/useCursor.js"

import Cursor1 from "../Components/ui/cursors/Cursor1.jsx"
import Cursor2 from "../Components/ui/cursors/Cursor2.jsx"

import ProtectedRoute from "../routes/ProtectedRoute.jsx"
import AppLayout from "./AppLayout.jsx"
import RootRedirect from "../utils/RootRedirect.jsx"
import GuestRoute from "../routes/GuestRoute.jsx"

import { AuthProvider } from "../context/AuthContext.jsx"

function App() {

  // const token = localStorage.getItem("token")
  const cursorStyle = useCursor()

  return (
    <AuthProvider>
      <BrowserRouter>
        {cursorStyle === "cursor1" && <Cursor1 />}
        {cursorStyle === "cursor2" && <Cursor2 />}
        <Routes>
          <Route path='/login' element={<GuestRoute><Login /></GuestRoute>} />
          <Route path='/register' element={<GuestRoute><Register /></GuestRoute>} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path='/home' element={<Home />} />
            <Route path='/room' element={<Rooms />} />
            <Route path='/about' element={<About />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/setting' element={<CursorSettings />} />
            <Route path='/admin' element={<AdminPage />} />
            <Route path='chat' element={<Chat />} />
            <Route path='/friends' element={<Friends />} />
            <Route path='/audit-logs' element={<Audit />} />
            <Route path='/privacypolicy' element={<PrivacyPolicy />} />
            <Route path='/whiteboard/:roomId' element={<Whiteboard />} />
          </Route>
          <Route path='*' element={<NotFound />} />
          <Route path='/' element={<RootRedirect/>} />
          {/* <Route path='/setting' element={<CursorSettings/>} /> */}

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
    </AuthProvider>

  )
}

export default App