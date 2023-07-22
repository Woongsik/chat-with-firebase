import React from 'react'
import { Route, Routes } from 'react-router-dom';

import RegisterPage from './components/RegisterPage/RegisterPage';
import LoginPage from './components/LoginPage/LoginPage';
import ChatPage from './components/ChatPage/ChatPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />}></Route> 
      <Route path="/login" element={<LoginPage />}></Route> 
      <Route path="/register" element={<RegisterPage />}></Route>
    </Routes>
  )
}

export default App;