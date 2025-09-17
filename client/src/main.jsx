import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Scripture, ScriptureView, ScriptureCrud } from './components/Scripture.jsx'
import Start from './pages/Start.jsx'
import "./css/index.css"
import { Route, RouterProvider, createHashRouter } from 'react-router-dom'
import { StyleHouse } from './components/HouseStyle.jsx'

import Intermission from './pages/Intermission.jsx'



const router = createHashRouter([
  {path: "", element: <App/>},
  {path: "scripture", element: <Scripture/>, children: [
    {path: "crud", element: <ScriptureCrud/>},
    {path: "view", element: <ScriptureView/>}
  ]},
  {path: "start", element: <Start/>},
  {path: "house", element: <StyleHouse/>},
  {path: "intermission", element: <Intermission/>},

]);

ReactDOM.createRoot(document.getElementById('root')).render(
      <RouterProvider router={router}/>
)
