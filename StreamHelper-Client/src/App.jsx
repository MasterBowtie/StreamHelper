import { Outlet } from 'react-router-dom'
import { Timer } from './components/Timer'
import WebSocketLog from './components/status/WebSocketLog'



function App() {
  return (
    <div>
      <a href="/#/start">Start</a>
      <br></br><a href="/stream">Stream Menu</a>
      <br></br><a href="/#/scripture/crud">Scripture</a>
      <br></br><a href="/#/house">House Styles</a>
      <div>Testing Area 
        <WebSocketLog/>
        <Timer/>
      </div>
    </div>
  )
}

export default App
