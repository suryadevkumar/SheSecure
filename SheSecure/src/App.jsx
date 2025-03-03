import { useState } from 'react'
import HomePage from './components/Home'
import Signup from './components/Signup'

function App() {

  return (
    <>
      <div className='text-6xl text-green-400 font-bold text-center m-2'>Hello Community</div>
      <HomePage/>
      <Signup/>
    </>
  )
}

export default App
