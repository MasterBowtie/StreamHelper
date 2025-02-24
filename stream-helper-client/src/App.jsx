import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Chat from './components/Chat'
import FollowGoal from './components/FollowGoal'
import Title from './components/Title'
import { StyleHouse } from './components/HouseStyle'
import { Spinner } from './components/Spinner'

function App() {
  return (
    <>
      <a href="/#/start">Start</a>
      <br></br><a href="/#/house">House Styles</a>
      <br></br><a href="/#/goal">Follower Goal</a>
      <p>Follow Testing</p>
      <Spinner colors={["red", 'blue', "green"]}/>
    </>
  )
}

export default App
