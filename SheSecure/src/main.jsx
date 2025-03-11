import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, Outlet, RouterProvider} from 'react-router-dom'
import HomePage from './components/Home'
import Signup from './components/Signup'
import Error from './components/Error'
import './index.css'
import MapShow from './components/MapView'
import PoliceStation from './components/PoliceStation'

function Front(){
  return (
    <>
      <Outlet/>
    </>
  )
}

const appRouter=createBrowserRouter([
  {
    path: "/",
    element: <Front/>,
    errorElement: <Error/>,
    children:([
      {
        path:"/",
        element: <HomePage/>
      },
      {
        path:"signup",
        element: <Signup/>
      },
      {
        path:"location",
        element: <MapShow/>
      },
      {
        path:"police",
        element: <PoliceStation/>
      }
    ])
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={appRouter}/>
  </StrictMode>,
)