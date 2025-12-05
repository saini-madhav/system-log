import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import SystemLog from './components/pages/SystemLog'

function App() {
  const [count, setCount] = useState(0)

  return ( 
    <>
      <SystemLog />
    </>
  )
}

export default App
