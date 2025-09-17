import { createHashRouter } from "react-router-dom"
import AdBreak from './pages/AdBreak.jsx'
import { StreamApp } from './StreamApp.jsx'
import FollowGoal from './components/FollowGoal.jsx'
import { Vote } from './components/Vote.jsx'
import Chat from './components/Chat.jsx'

const router = createHashRouter([
    {path: "stream", element: <StreamApp/>, children: [
        {path: "chat", element: <Chat/>},
        {path: "goal", element: <FollowGoal/>},
        {path: "vote", element: <Vote/>},
        {path: "ad", element: <AdBreak/>}
    ]},
])

ReactDOM.createRoot(document.getElementById('root')).render(
      <RouterProvider router={router}/>
)