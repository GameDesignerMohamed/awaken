import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import Landing from './pages/Landing'
import Onboard from './pages/Onboard'
import Respond from './pages/Respond'
import History from './pages/History'

function ProtectedRoute({ session, children }: { session: Session | null; children: React.ReactNode }) {
  if (!session) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session && location.pathname === '/') {
        supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            navigate(data ? '/history' : '/onboard', { replace: true })
          })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return null
  }

  return (
    <Routes>
      <Route path="/" element={session ? <Navigate to="/history" replace /> : <Landing />} />
      <Route path="/onboard" element={
        <ProtectedRoute session={session}>
          <Onboard />
        </ProtectedRoute>
      } />
      <Route path="/respond" element={
        <ProtectedRoute session={session}>
          <Respond />
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute session={session}>
          <History />
        </ProtectedRoute>
      } />
    </Routes>
  )
}
