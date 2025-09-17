import { Outlet } from "react-router-dom"

function StreamMenu() {
    return (
    <div>
      <a href="/">Main Menu</a>
      <br></br><a href="/stream/#/goal">Follower Goal</a>
      <br></br><a href="/stream/#/vote">Vote</a>
      <br></br><a href="/stream/#/chat">Chat</a>
    </div>
    )
}

function StreamApp() {
  return (
    <Outlet/>
  )
}

export { StreamApp, StreamMenu }