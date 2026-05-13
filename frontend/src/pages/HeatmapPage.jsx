import { useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import ErrorBox from '@/components/ErrorBox';
import EmptyState from '@/components/EmptyState';
import HeatmapCanvas from '@/components/HeatmapCanvas';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useApi } from '@/hooks/useApi';
import { useSocket } from '@/contexts/SocketContext';
import { fetchPageUrls, fetchHeatmap } from '@/api';
import { Flame, MousePointerClick, Users, Link } from 'lucide-react';

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

export default function HeatmapPage() {
  const [selectedUrl, setSelectedUrl] = useState('');
  // liveClicks holds any clicks that arrived via socket after initial load
  const [liveClicks, setLiveClicks] = useState([]);

  // Fetch available page URLs
  const { data: urls, loading: urlsLoading, error: urlsError } = useApi(fetchPageUrls, []);

  // Fetch heatmap data when a URL is selected
  const {
    data: heatmapData,
    loading: heatLoading,
    error: heatError,
    refetch,
  } = useApi(
    () => {
      setLiveClicks([]); // reset live clicks when URL changes
      return selectedUrl ? fetchHeatmap(selectedUrl) : Promise.resolve(null);
    },
    [selectedUrl]
  );

  // ── Real-time updates ────────────────────────────────────────────────────
  const handleNewEvent = useCallback(({ event }) => {
    // Only append if it's a click on the currently selected URL
    if (
      event.event_type === 'click' &&
      event.page_url === selectedUrl &&
      event.x != null &&
      event.y != null
    ) {
      setLiveClicks((prev) => [
        ...prev,
        {
          _id:        event._id,
          session_id: event.session_id,
          x:          event.x,
          y:          event.y,
          timestamp:  event.timestamp,
        },
      ]);
    }
  }, [selectedUrl]);

  const { connected } = useSocket('new_event', handleNewEvent);
  // ─────────────────────────────────────────────────────────────────────────

  const storedClicks = heatmapData?.clicks ?? [];
  const clicks = [...storedClicks, ...liveClicks];
  const uniqueSessions = new Set(clicks.map((c) => c.session_id)).size;

  return (
    <Layout
      title="Click Heatmap"
      subtitle="Visual map of where users click across your pages"
      liveConnected={connected}
    >
      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Clicks"
          value={selectedUrl ? clicks.length : '—'}
          icon={MousePointerClick}
          loading={heatLoading && !!selectedUrl}
          color="primary"
        />
        <StatCard
          label="Unique Sessions"
          value={selectedUrl ? uniqueSessions : '—'}
          icon={Users}
          loading={heatLoading && !!selectedUrl}
          color="blue"
        />
        <StatCard
          label="Tracked Pages"
          value={urls?.length ?? '—'}
          icon={Link}
          loading={urlsLoading}
          color="emerald"
        />
      </div>

      {/* ── URL selector ── */}
      <Card className="mb-6 animate-fade-in">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            Select a Page
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {urlsError && <ErrorBox message={urlsError} />}
          {!urlsError && (
            <Select
              value={selectedUrl}
              onValueChange={setSelectedUrl}
              disabled={urlsLoading}
            >
              <SelectTrigger id="page-url-select" className="max-w-xl">
                <SelectValue placeholder={urlsLoading ? 'Loading pages…' : 'Pick a tracked page URL'} />
              </SelectTrigger>
              <SelectContent>
                {urls?.map((url) => (
                  <SelectItem key={url} value={url}>
                    {url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* ── Heatmap ── */}
      <Card className="animate-fade-in">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-primary" />
            Click Distribution
            {selectedUrl && (
              <span className="ml-auto">
                <LiveBadge connected={connected} />
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* No URL selected */}
          {!selectedUrl && (
            <EmptyState
              icon={Flame}
              title="Select a page above"
              description="Choose a tracked URL from the dropdown to visualize its click heatmap."
            />
          )}

          {/* Loading */}
          {selectedUrl && heatLoading && (
            <Skeleton className="w-full rounded-xl" style={{ aspectRatio: '16/9' }} />
          )}

          {/* Error */}
          {selectedUrl && heatError && (
            <ErrorBox message={heatError} onRetry={refetch} />
          )}

          {/* Empty clicks */}
          {selectedUrl && !heatLoading && !heatError && clicks.length === 0 && (
            <EmptyState
              icon={MousePointerClick}
              title="No clicks recorded"
              description="No click events have been tracked on this page yet."
            />
          )}

          {/* Heatmap canvas — re-renders whenever clicks (live or historical) change */}
          {selectedUrl && !heatLoading && !heatError && clicks.length > 0 && (
            <HeatmapCanvas clicks={clicks} width={1440} height={900} />
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
