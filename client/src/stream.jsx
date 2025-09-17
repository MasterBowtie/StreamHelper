import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from "react-router-dom"
import AdBreak from './components/AdBreak.jsx'
import { StreamApp, StreamMenu } from './StreamApp.jsx'
import FollowGoal from './components/FollowGoal.jsx'
import { Vote } from './components/Vote.jsx'
import Chat from './components/Chat.jsx'
import "./css/index.css"

const router = createHashRouter([
    {path: "", element: <StreamApp/>, children: [
        {path: "", element: <StreamMenu/>},
        {path: "chat", element: <Chat/>},
        {path: "goal", element: <FollowGoal/>},
        {path: "vote", element: <Vote/>},
        {path: "ad", element: <AdBreak/>}
    ]},
])

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}/>
)