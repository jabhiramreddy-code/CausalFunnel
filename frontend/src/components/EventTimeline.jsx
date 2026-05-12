import { MousePointerClick, Eye, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const EVENT_CONFIG = {
  click: {
    icon: MousePointerClick,
    label: 'Click',
    variant: 'click',
    lineColor: 'bg-blue-500/40',
    dotColor: 'bg-blue-500 ring-blue-500/30',
  },
  page_view: {
    icon: Eye,
    label: 'Page View',
    variant: 'page_view',
    lineColor: 'bg-emerald-500/40',
    dotColor: 'bg-emerald-500 ring-emerald-500/30',
  },
};

const DEFAULT_CONFIG = {
  icon: Clock,
  label: 'Event',
  variant: 'outline',
  lineColor: 'bg-border',
  dotColor: 'bg-muted-foreground ring-muted/30',
};

/**
 * EventTimeline — renders an ordered list of session events as a vertical timeline.
 * Reused in the session detail panel.
 */
export default function EventTimeline({ events }) {
  if (!events?.length) return null;

  return (
    <ol className="space-y-0">
      {events.map((evt, idx) => {
        const config = EVENT_CONFIG[evt.event_type] ?? DEFAULT_CONFIG;
        const Icon = config.icon;
        const isLast = idx === events.length - 1;

        return (
          <li key={evt._id ?? idx} className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
            {/* Vertical line */}
            {!isLast && (
              <div className={`absolute left-[18px] top-9 bottom-0 w-0.5 ${config.lineColor}`} />
            )}

            {/* Dot */}
            <div className={`relative z-10 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ${config.dotColor}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={config.variant}>{config.label}</Badge>
                <span className="text-xs text-muted-foreground">{formatDate(evt.timestamp)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground truncate max-w-xs" title={evt.page_url}>
                {evt.page_url}
              </p>
              {evt.event_type === 'click' && evt.x != null && (
                <p className="mt-0.5 text-xs font-mono text-primary/70">
                  ({Math.round(evt.x)}, {Math.round(evt.y)})
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
