import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Scripture, ScriptureView, ScriptureCrud } from './components/Scripture.jsx'
import Start from './pages/Start.jsx'
import "./css/index.css"
import { Route, RouterProvider, createHashRouter } from 'react-router-dom'
import { StyleHouse } from './components/HouseStyle.jsx'

import Intermission from './pages/Intermission.jsx'
import MainDashboard from './pages/MainDashboard.jsx'
import { WebSocketProvider } from './contexts/WebSocketContext.jsx'
import { Settings } from './pages/Settings.jsx'



const router = createHashRouter([
    {path: "", element: <MainDashboard/>},
    {path: "settings", element: <Settings/>}
    // {path: "scripture", element: <Scripture/>, children: [
    //     {path: "crud", element: <ScriptureCrud/>},
    //     {path: "view", element: <ScriptureView/>}
    // ]},
    // {path: "start", element: <Start/>},
    // {path: "house", element: <StyleHouse/>},
    // {path: "intermission", element: <Intermission/>},

]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <WebSocketProvider>
        <RouterProvider router={router}/>
    </WebSocketProvider>
)
