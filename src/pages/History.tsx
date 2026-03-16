import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SectionMarker from '../components/SectionMarker'
import Divider from '../components/Divider'

interface Response {
  id: string
  slot: number
  prompt_text: string
  response_text: string
  responded_at: string
}

interface GroupedResponses {
  date: string
  responses: Response[]
}

export default function History() {
  const [groups, setGroups] = useState<GroupedResponses[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResponses = async () => {
      const { data } = await supabase
        .from('responses')
        .select('*')
        .order('responded_at', { ascending: false })

      if (data) {
        const grouped = new Map<string, Response[]>()
        for (const r of data as Response[]) {
          const date = new Date(r.responded_at).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          if (!grouped.has(date)) grouped.set(date, [])
          grouped.get(date)!.push(r)
        }
        setGroups(Array.from(grouped, ([date, responses]) => ({ date, responses })))
      }
      setLoading(false)
    }
    fetchResponses()
  }, [])

  if (loading) return null

  return (
    <div className="page" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <SectionMarker label="History" />

      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 'var(--space-section)' }}>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-light)' }}>
            No responses yet.
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', marginTop: 'var(--space-line)' }}>
            Your reflections will appear here after you answer an interrupt.
          </p>
        </div>
      ) : (
        groups.map((group, gi) => (
          <div key={group.date}>
            <h3 style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-light)',
              borderBottom: '1px solid var(--parchment-dark)',
              paddingBottom: 'var(--space-line)',
              marginBottom: 'var(--space-paragraph)',
              marginTop: gi > 0 ? 'var(--space-section)' : 0,
            }}>
              {group.date}
            </h3>

            {group.responses.map((r, ri) => (
              <div key={r.id}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink-faint)',
                  marginBottom: 'var(--space-line)',
                }}>
                  {new Date(r.responded_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })} &middot; &sect;{r.slot}
                </div>

                <p style={{
                  fontStyle: 'italic',
                  fontSize: 'var(--text-base)',
                  color: 'var(--ink-light)',
                  marginBottom: 'var(--space-line)',
                }}>
                  &ldquo;{r.prompt_text}&rdquo;
                </p>

                <p style={{
                  fontSize: 'var(--text-base)',
                  lineHeight: 1.7,
                  marginBottom: 'var(--space-paragraph)',
                }}>
                  {r.response_text}
                </p>

                {ri < group.responses.length - 1 && <Divider variant="simple" />}
              </div>
            ))}

            <Divider variant="elaborate" />
          </div>
        ))
      )}
    </div>
  )
}
