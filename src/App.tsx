import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { Home } from '@/pages/Home'
import { Events } from '@/pages/Events'
import { EventDetail } from '@/pages/EventDetail'
import { About } from '@/pages/About'
import { Beneficiaries } from '@/pages/Beneficiaries'
import { Join } from '@/pages/Join'
import { Privacy } from '@/pages/Privacy'
import { Terms } from '@/pages/Terms'
import { NotFound } from '@/pages/NotFound'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/events', element: <Events /> },
      { path: '/events/:slug', element: <EventDetail /> },
      { path: '/about', element: <About /> },
      { path: '/beneficiaries', element: <Beneficiaries /> },
      { path: '/join', element: <Join /> },
      { path: '/privacy', element: <Privacy /> },
      { path: '/terms', element: <Terms /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
