import { Outlet } from "react-router-dom"

function StreamMenu() {
    return (
    <div>
      <br></br><a href="/#/goal">Follower Goal</a>
      <br></br><a href="/#/vote">Vote</a>
      <br></br><a href="/#/chat">Chat</a>
    </div>
    )
}

function StreamApp() {
  return (
    <Outlet/>
  )
}

export { StreamApp }