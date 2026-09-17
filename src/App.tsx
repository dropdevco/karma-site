import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { AuthProvider } from '@/auth/AuthProvider'
import { RequireAuth, RequireStaff } from '@/auth/guards'
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

const SignIn = lazy(() => import('@/pages/SignIn').then((m) => ({ default: m.SignIn })))
const AuthCallback = lazy(() =>
  import('@/pages/AuthCallback').then((m) => ({ default: m.AuthCallback })),
)
const Account = lazy(() => import('@/pages/Account').then((m) => ({ default: m.Account })))
const AccountQr = lazy(() => import('@/pages/AccountQr').then((m) => ({ default: m.AccountQr })))
const MyEvents = lazy(() => import('@/pages/MyEvents').then((m) => ({ default: m.MyEvents })))

const StaffHome = lazy(() => import('@/pages/StaffHome').then((m) => ({ default: m.StaffHome })))
const StaffEventForm = lazy(() =>
  import('@/pages/StaffEventForm').then((m) => ({ default: m.StaffEventForm })),
)
const StaffScanner = lazy(() =>
  import('@/pages/StaffScanner').then((m) => ({ default: m.StaffScanner })),
)
const StaffWalkIn = lazy(() =>
  import('@/pages/StaffWalkIn').then((m) => ({ default: m.StaffWalkIn })),
)

function RouteFallback() {
  return <div className="min-h-[60vh]" aria-hidden="true" />
}

function page(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

function memberPage(element: ReactNode) {
  return page(<RequireAuth>{element}</RequireAuth>)
}

function staffPage(element: ReactNode) {
  return page(<RequireStaff>{element}</RequireStaff>)
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/events', element: page(<Events />) },
      { path: '/events/:slug', element: page(<EventDetail />) },
      { path: '/about', element: page(<About />) },
      { path: '/beneficiaries', element: page(<Beneficiaries />) },
      { path: '/join', element: page(<Join />) },
      { path: '/signin', element: page(<SignIn />) },
      { path: '/auth/callback', element: page(<AuthCallback />) },
      { path: '/privacy', element: page(<Privacy />) },
      { path: '/terms', element: page(<Terms />) },

      { path: '/account', element: memberPage(<Account />) },
      { path: '/account/qr', element: memberPage(<AccountQr />) },
      { path: '/account/events', element: memberPage(<MyEvents />) },

      { path: '/staff', element: staffPage(<StaffHome />) },
      { path: '/staff/events/new', element: staffPage(<StaffEventForm />) },
      { path: '/staff/events/:id/edit', element: staffPage(<StaffEventForm />) },
      { path: '/staff/events/:id/scan', element: staffPage(<StaffScanner />) },
      { path: '/staff/events/:id/walk-in', element: staffPage(<StaffWalkIn />) },

      { path: '*', element: page(<NotFound />) },
    ],
  },
])

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
