import { useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import ErrorBox from '@/components/ErrorBox';
import EmptyState from '@/components/EmptyState';
import EventTimeline from '@/components/EventTimeline';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import { useSocket } from '@/hooks/useSocket';
import { fetchSessions, fetchSessionEvents } from '@/api';
import { LayoutDashboard, Users, Activity, Clock, X, ChevronRight } from 'lucide-react';
import { formatDate, truncate, duration } from '@/lib/utils';

/* ── Skeleton rows while loading ────────────────────────────────────────── */
function TableSkeleton({ rows = 6 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <TableRow key={i} className="pointer-events-none">
      {[140, 60, 110, 110, 50].map((w, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4" style={{ width: w }} />
        </TableCell>
      ))}
    </TableRow>
  ));
}

/* ── Live badge ─────────────────────────────────────────────────────────── */
function LiveBadge({ connected }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
        connected
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          : 'bg-muted text-muted-foreground border border-border'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          connected ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground'
        }`}
      />
      {connected ? 'Live' : 'Connecting…'}
    </span>
  );
}

/* ── Session detail drawer ──────────────────────────────────────────────── */
function SessionDrawer({ sessionId, onClose }) {
  const { data: events, loading, error, refetch } = useApi(
    () => fetchSessionEvents(sessionId),
    [sessionId]
  );

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <aside className="w-[420px] max-w-full h-full overflow-y-auto border-l border-border bg-card flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Session Journey</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{truncate(sessionId, 32)}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 flex-1">
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && <ErrorBox message={error} onRetry={refetch} />}
          {events && (
            <>
              <div className="flex items-center gap-2 mb-5">
                <Badge variant="outline">{events.length} events</Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {duration(events[0]?.timestamp, events[events.length - 1]?.timestamp)}
                </Badge>
              </div>
              <EventTimeline events={events} />
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */
export default function SessionsPage() {
  const [selectedSession, setSelectedSession] = useState(null);
  const { data: sessions, loading, error, refetch, setData: setSessions } = useApi(fetchSessions, []);

  // ── Real-time updates ────────────────────────────────────────────────────
  const handleNewEvent = useCallback(({ session }) => {
    if (!session) return;
    setSessions((prev) => {
      if (!prev) return prev;
      const idx = prev.findIndex((s) => s.session_id === session.session_id);
      if (idx !== -1) {
        // Update existing session in-place and move to top
        const updated = [...prev];
        updated.splice(idx, 1);
        return [session, ...updated];
      }
      // Brand-new session — prepend
      return [session, ...prev];
    });
  }, [setSessions]);

  const { connected } = useSocket('new_event', handleNewEvent);
  // ─────────────────────────────────────────────────────────────────────────

  const totalEvents = sessions?.reduce((acc, s) => acc + s.event_count, 0) ?? 0;
  const avgEvents = sessions?.length
    ? (totalEvents / sessions.length).toFixed(1)
    : 0;

  return (
    <Layout
      title="Sessions"
      subtitle="Every unique visitor session tracked on your pages"
      liveConnected={connected}
    >
      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Sessions" value={sessions?.length} icon={Users} loading={loading} color="primary" />
        <StatCard label="Total Events" value={totalEvents} icon={Activity} loading={loading} color="blue" />
        <StatCard label="Avg Events / Session" value={avgEvents} icon={LayoutDashboard} loading={loading} color="emerald" />
      </div>

      {/* ── Table ── */}
      <Card className="animate-fade-in">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            All Sessions
            <span className="ml-auto">
              <LiveBadge connected={connected} />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && <ErrorBox message={error} onRetry={refetch} />}

          {!error && (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent cursor-default">
                  <TableHead>Session ID</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>First Seen</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && <TableSkeleton />}

                {!loading && sessions?.length === 0 && (
                  <TableRow className="hover:bg-transparent cursor-default">
                    <TableCell colSpan={6}>
                      <EmptyState
                        icon={LayoutDashboard}
                        title="No sessions yet"
                        description="Open the demo page and interact with it to generate your first session."
                      />
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  sessions?.map((s) => (
                    <TableRow
                      key={s.session_id}
                      onClick={() => setSelectedSession(s.session_id)}
                      className="group"
                    >
                      <TableCell>
                        <span className="font-mono text-xs text-primary/80">{truncate(s.session_id, 20)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{s.event_count}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(s.first_seen)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(s.last_seen)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.pages_visited}</TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Session drawer ── */}
      {selectedSession && (
        <SessionDrawer sessionId={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </Layout>
  );
}
