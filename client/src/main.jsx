import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Scripture from './components/Scripture.jsx'
import Start from './pages/Start.jsx'
import Chat from './components/Chat.jsx'
import "./css/index.css"
import { Route, RouterProvider, createHashRouter } from 'react-router-dom'
import { StyleHouse } from './components/HouseStyle.jsx'
import FollowGoal from './components/FollowGoal.jsx'
import { Vote } from './components/Vote.jsx'
import Intermission from './pages/Intermission.jsx'


const router = createHashRouter([
  {path: "", element: <App/>},
  {path: "scripture", element: <Scripture/>},
  {path: "start", element: <Start/>},
  {path: "chat", element: <Chat/>},
  {path: "house", element: <StyleHouse/>},
  {path: "goal", element: <FollowGoal/>},
  {path: "vote", element: <Vote/>},
  {path: "intermission", element: <Intermission/>},

]);

ReactDOM.createRoot(document.getElementById('root')).render(
      <RouterProvider router={router}/>
)
