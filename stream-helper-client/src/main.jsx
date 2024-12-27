import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Scripture from './Scripture.jsx'
import Start from './Start.jsx'
import Chat from './Chat.jsx'
import './index.css'
import { RouterProvider, createHashRouter } from 'react-router-dom'
const router = createHashRouter([
  {path: "", element: <App/>},
  {path: "scripture", element: <Scripture/>},
  {path: "start", element: <Start/>},
  {path: "chat", element: <Chat/>}
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)
