import React from 'react'
import ReactDOM from 'react-dom/client'
import { Scripture, ScriptureView, ScriptureCrud } from './components/Scripture.jsx'
import Start from './pages/Start.jsx'
import "./css/index.css"
import { Route, RouterProvider, createHashRouter } from 'react-router-dom'
import { StyleHouse } from './components/HouseStyle.jsx'

import Intermission from './pages/Intermission.jsx'
import MainDashboard from './pages/MainDashboard.jsx'
import { WebSocketProvider } from './contexts/WebSocketContext.jsx'
import { Settings } from './pages/Settings.jsx'
import Layout from './pages/Layout.jsx'
import Draw from './pages/Draw.jsx'
import { Vote } from './components/Vote.jsx'
import AlertContainer from './components/alerts/AlertContainer.jsx'
import { AlertProvider } from './contexts/AlertContext.jsx'
import { BasicAlert } from './components/alerts/BasicAlert.jsx'

const router = createHashRouter([
    {path: "/", element: <Layout/>, children: [
        {index: true, element: <MainDashboard/>},
        {path: "settings", element: <Settings/>},
        {path: "widgets", children: [
            {path: "draw", element: <Draw/>},
            {path: "vote", element: <Vote/>}
        ]}
    ]},
    {path: "/stream", children: [
        {path: "vote", element: <Vote/>},
        {path: "alert", element: <AlertProvider><AlertContainer/></AlertProvider>},
        {path: "follow", element: <BasicAlert/>}
    ]} 

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
