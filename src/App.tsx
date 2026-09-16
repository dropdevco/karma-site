import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { Home } from '@/pages/Home'

// Home stays eager since it is the overwhelming majority of first visits;
// everything else splits so a phone on event-day cell service downloads less.
const Events = lazy(() => import('@/pages/Events').then((m) => ({ default: m.Events })))
const EventDetail = lazy(() =>
  import('@/pages/EventDetail').then((m) => ({ default: m.EventDetail })),
)
const About = lazy(() => import('@/pages/About').then((m) => ({ default: m.About })))
const Beneficiaries = lazy(() =>
  import('@/pages/Beneficiaries').then((m) => ({ default: m.Beneficiaries })),
)
const Join = lazy(() => import('@/pages/Join').then((m) => ({ default: m.Join })))
const Privacy = lazy(() => import('@/pages/Privacy').then((m) => ({ default: m.Privacy })))
const Terms = lazy(() => import('@/pages/Terms').then((m) => ({ default: m.Terms })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

function RouteFallback() {
  return <div className="min-h-[60vh]" aria-hidden="true" />
}

function lazyRoute(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/events', element: lazyRoute(<Events />) },
      { path: '/events/:slug', element: lazyRoute(<EventDetail />) },
      { path: '/about', element: lazyRoute(<About />) },
      { path: '/beneficiaries', element: lazyRoute(<Beneficiaries />) },
      { path: '/join', element: lazyRoute(<Join />) },
      { path: '/privacy', element: lazyRoute(<Privacy />) },
      { path: '/terms', element: lazyRoute(<Terms />) },
      { path: '*', element: lazyRoute(<NotFound />) },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
