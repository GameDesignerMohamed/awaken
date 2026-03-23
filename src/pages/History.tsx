import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, MOCK_MODE } from '../lib/supabase'
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

const SCHEDULE = [
  { slot: 1, time: '11:00', label: '11:00 AM' },
  { slot: 2, time: '13:30', label: '1:30 PM' },
  { slot: 3, time: '15:15', label: '3:15 PM' },
  { slot: 4, time: '17:00', label: '5:00 PM' },
  { slot: 5, time: '19:30', label: '7:30 PM' },
  { slot: 6, time: '21:00', label: '9:00 PM' },
]

const PROMPTS: Record<number, string> = {
  1: "What am I avoiding by doing what I'm doing?",
  2: 'If someone filmed the last two hours, what would they conclude I want?',
  3: 'Am I moving toward the life I hate or the life I want?',
  4: "What's the most important thing I'm pretending isn't important?",
  5: 'What did I do today from identity protection rather than genuine desire?',
  6: 'When did I feel most alive today? Most dead?',
}

function getMissedSlots(answeredSlots: Set<number>): typeof SCHEDULE {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  return SCHEDULE.filter(({ slot, time }) => {
    const [h, m] = time.split(':').map(Number)
    const slotMinutes = h * 60 + m
    return slotMinutes <= currentMinutes && !answeredSlots.has(slot)
  })
}

const MOCK_RESPONSES: Response[] = [
  {
    id: '1',
    slot: 1,
    prompt_text: "What am I avoiding by doing what I'm doing?",
    response_text: "I've been scrolling instead of writing the proposal. I think I'm afraid it won't be good enough — that the ideas I have aren't original enough to justify putting them out there. The scrolling feels productive because I'm \"researching\" but I know that's a lie I tell myself. The research is a ritual to avoid the terrifying blankness of the page.",
    responded_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    slot: 2,
    prompt_text: 'If someone filmed the last two hours, what would they conclude I want?',
    response_text: "They'd conclude I want comfort and distraction. I kept opening the fridge, checking my phone, reorganizing my desk. Anything to avoid the blank page. The observer would see someone who is afraid of their own ambitions, someone who has chosen the path of least resistance so many times it has become a highway.",
    responded_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    slot: 3,
    prompt_text: 'Am I moving toward the life I hate or the life I want?',
    response_text: "Honestly, toward the life I hate. The comfortable one. The one where I never risk anything and end up wondering what could have been. Every hour I spend avoiding the work is another step toward the person I promised myself I would never become. The gap between who I am and who I could be grows wider with each comfortable decision.",
    responded_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    slot: 1,
    prompt_text: "What am I avoiding by doing what I'm doing?",
    response_text: "I spent the morning in meetings that didn't need me. I volunteered for them. It felt productive but it was hiding — from the hard creative work I said I'd do this week. The meetings are a socially acceptable excuse for cowardice. Nobody questions a full calendar.",
    responded_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    slot: 4,
    prompt_text: "What's the most important thing I'm pretending isn't important?",
    response_text: "My health. I keep saying I'll start exercising next week. It's been months of next weeks. My body is the vehicle for everything I want to accomplish and I'm treating it like it's disposable. I treat my laptop better than my body.",
    responded_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    slot: 6,
    prompt_text: 'When did I feel most alive today? Most dead?',
    response_text: "Most alive: the 20 minutes I spent playing guitar before dinner. My fingers remembered things my mind had forgotten. Most dead: the two hours of doom-scrolling after lunch. The contrast is so obvious it's embarrassing to write down. The guitar requires me to be present. The phone requires me to be absent.",
    responded_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function History() {
  const [groups, setGroups] = useState<GroupedResponses[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchResponses = async () => {
      let data: Response[]

      if (MOCK_MODE) {
        data = MOCK_RESPONSES
      } else {
        try {
          const result = await supabase
            .from('responses')
            .select('*')
            .order('responded_at', { ascending: false })
          data = (result.data as Response[]) || []
        } catch {
          setError(true)
          setLoading(false)
          return
        }
      }

      const grouped = new Map<string, Response[]>()
      for (const r of data) {
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
      setLoading(false)
    }
    fetchResponses()
  }, [])

  if (loading) return (
    <main className="page" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <SectionMarker label="H" pageNum={1} />
      <Divider variant="medium" />
      <p className="mono-meta" style={{ textAlign: 'center' }}>
        loading reflections...
      </p>
    </main>
  )

  if (error) return (
    <main className="page" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <SectionMarker label="H" pageNum={1} />
      <p className="drop-cap" style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>
        Unable to load your reflections. Check your connection and refresh the page.
      </p>
      <Divider variant="footer" />
    </main>
  )

  return (
    <main className="page" aria-label="Response history" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <SectionMarker label="H" pageNum={1} />

      <div style={{ textAlign: 'right', marginBottom: 'var(--space-paragraph)' }}>
        <Link to="/onboard" className="nav-link">&sect; edit schedule</Link>
      </div>

      {(() => {
        const todayAnswered = new Set<number>()
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        for (const g of groups) {
          if (g.date === today) {
            for (const r of g.responses) todayAnswered.add(r.slot)
          }
        }
        const missed = getMissedSlots(todayAnswered)
        if (missed.length === 0) return null
        return (
          <div style={{ marginBottom: 'var(--space-section)' }}>
            <Divider variant="dashed" />
            <p className="mono-meta" style={{ marginBottom: 'var(--space-paragraph)' }}>
              {missed.length} interrupt{missed.length > 1 ? 's' : ''} passed today — catch up now
            </p>
            {missed.map(({ slot, label }) => (
              <Link
                key={slot}
                to={`/respond?slot=${slot}`}
                style={{
                  display: 'block',
                  padding: '14px 0',
                  borderBottom: '1px solid var(--parchment-dark)',
                  textDecoration: 'none',
                  color: 'var(--ink)',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                }}>
                  &sect;{slot}
                </span>
                <span className="mono-meta" style={{ marginLeft: '12px' }}>
                  {label}
                </span>
                <p style={{
                  fontStyle: 'italic',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--ink-faint)',
                  marginTop: '4px',
                }}>
                  &ldquo;{PROMPTS[slot]}&rdquo;
                </p>
              </Link>
            ))}
            <Divider variant="medium" />
          </div>
        )
      })()}

      {MOCK_MODE && (
        <div className="mock-nav">
          mock mode — sample data
          <div style={{ marginTop: '6px' }}>
            {[1, 2, 3, 4, 5, 6].map(s => (
              <Link key={s} to={`/respond?slot=${s}`}>&sect;{s}</Link>
            ))}
            <Link to="/onboard">onboard</Link>
            <Link to="/">landing</Link>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div>
          <p className="drop-cap" style={{
            fontSize: 'var(--text-base)',
            fontWeight: 600,
          }}>
            No responses yet. Your reflections will appear here after you answer
            an interrupt. The page will fill with evidence of your attention —
            a record of every time you chose to see instead of look away.
          </p>
        </div>
      ) : (
        groups.map((group, gi) => (
          <div key={group.date}>
            <h3 className="history-date-rule" style={{
              marginTop: gi > 0 ? 'var(--space-section)' : 0,
            }}>
              {group.date}
            </h3>

            {group.responses.map((r, ri) => (
              <div key={r.id}>
                <div className="mono-meta" style={{ marginBottom: 'var(--space-line)' }}>
                  {new Date(r.responded_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })} &middot; &sect;{r.slot}
                </div>

                <p className="history-prompt">
                  &ldquo;{r.prompt_text}&rdquo;
                </p>

                <p className="history-response">
                  {r.response_text}
                </p>

                {ri < group.responses.length - 1 && <Divider variant="simple" />}
              </div>
            ))}

            {gi < groups.length - 1 && <Divider variant="medium" />}
          </div>
        ))
      )}

      <Divider variant="footer" />
    </main>
  )
}
