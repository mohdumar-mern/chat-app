
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom'
import Login from './page/Login'
import Register from './page/RegisterUser'
import Home from './page/Home'
import Chat from './page/Chat'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat/:id" element={<Chat />} />
      </Routes>
    </Router>

  )
}

export default App
