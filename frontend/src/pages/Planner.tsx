import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8am – 8pm

// Mock scheduled events
const events = [
  { day: 0, hour: 9, title: 'Web Dev Lecture', color: '#6366f1', duration: 2 },
  { day: 1, hour: 11, title: 'Data Structures Lab', color: '#f59e0b', duration: 2 },
  { day: 2, hour: 8, title: 'Linear Algebra', color: '#06b6d4', duration: 1 },
  { day: 2, hour: 14, title: 'Software Eng.', color: '#ef4444', duration: 2 },
  { day: 3, hour: 10, title: 'DB Systems', color: '#10b981', duration: 2 },
  { day: 4, hour: 9, title: 'Operating Systems', color: '#8b5cf6', duration: 2 },
];

export default function Planner() {
  const today = new Date();
  const todayDayOfWeek = (today.getDay() + 6) % 7; // Monday = 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planner</h1>
          <p className="text-gray-500 mt-0.5">Weekly schedule overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus size={16} />
            Add Event
          </button>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <h2 className="text-sm font-semibold text-gray-800 px-2">
            {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
        <button className="px-3 py-1.5 text-sm text-indigo-600 font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
          Today
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
          <div className="h-12 border-r border-gray-100" />
          {DAYS.map((day, i) => (
            <div
              key={day}
              className={`h-12 flex items-center justify-center border-r border-gray-100 last:border-0 ${
                i === todayDayOfWeek ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide">{SHORT_DAYS[i]}</p>
                <div
                  className={`text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full mx-auto ${
                    i === todayDayOfWeek
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {today.getDate() - todayDayOfWeek + i}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="overflow-y-auto" style={{ maxHeight: '520px' }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
              style={{ gridTemplateColumns: '56px repeat(7, 1fr)', minHeight: '56px' }}
            >
              {/* Hour label */}
              <div className="px-2 pt-2 border-r border-gray-100 flex-shrink-0">
                <span className="text-xs text-gray-400">
                  {hour > 12 ? `${hour - 12}pm` : hour === 12 ? '12pm' : `${hour}am`}
                </span>
              </div>

              {/* Day cells */}
              {DAYS.map((day, dayIdx) => {
                const event = events.find((e) => e.day === dayIdx && e.hour === hour);
                return (
                  <div
                    key={day}
                    className={`border-r border-gray-100 last:border-0 p-1 relative ${
                      dayIdx === todayDayOfWeek ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    {event && (
                      <div
                        className="rounded-md px-2 py-1 text-xs font-medium text-white cursor-pointer hover:opacity-90 transition-opacity"
                        style={{
                          backgroundColor: event.color,
                          minHeight: `${event.duration * 52}px`,
                        }}
                      >
                        {event.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
