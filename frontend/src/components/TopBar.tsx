import { Search, Bell } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="pl-9 pr-4 py-1.5 text-sm bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all w-56 text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center cursor-pointer hover:bg-indigo-200 transition-colors">
          <span className="text-xs font-semibold text-indigo-700">SA</span>
        </div>
      </div>
    </header>
  );
}
