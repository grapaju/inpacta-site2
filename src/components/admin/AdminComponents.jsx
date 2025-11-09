export function StatsCard({ title, value, description, icon, color = "blue", trend = null }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-indigo-600"
  }

  return (
    <div className="admin-stats-card admin-card-enter relative overflow-hidden bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm group">
      {/* Background gradient */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-10 -mt-10 transition-all duration-300 group-hover:scale-110`} />
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg transform transition-transform group-hover:scale-110`}>
            <div className="text-white text-xl">
              {icon}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
              trend.type === 'up' 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              <span className="text-sm">{trend.type === 'up' ? '📈' : '📉'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="text-2xl font-bold text-[var(--foreground)] mb-1">
            {value}
          </div>
          <div className="text-sm font-medium text-[var(--foreground)]">
            {title}
          </div>
          <div className="text-xs text-[var(--muted)] mt-1">
            {description}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ActionCard({ title, description, href, icon, color = "blue", badge = null }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
  }

  return (
    <a
      href={href}
      className={`admin-action-card admin-card-enter relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 text-white shadow-lg group block`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-all duration-500 group-hover:scale-150 group-hover:bg-white/10" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl transform transition-transform group-hover:scale-110 group-hover:rotate-3">
            {icon}
          </div>
          {badge && (
            <span className="admin-badge bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20">
              {badge}
            </span>
          )}
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">{title}</h3>
          <p className="text-white/80 text-sm leading-relaxed group-hover:text-white/90 transition-colors">{description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="w-8 h-1 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors"></div>
          <div className="opacity-50 group-hover:opacity-100 transition-all group-hover:translate-x-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  )
}

export function ActivityCard({ activity }) {
  const getActivityColor = (type) => {
    switch (type) {
      case 'news': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'project': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'service': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'user': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
    }
  }

  return (
    <div className="admin-fade-in flex items-start space-x-4 p-4 hover:bg-[var(--section-alt-bg)] rounded-xl transition-all duration-200 group">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
          <span className="text-white text-lg">{activity.icon}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <p className="text-sm font-medium text-[var(--foreground)]">
                <span className="font-semibold text-[var(--primary)]">{activity.author}</span> {activity.action}
              </p>
              <span className={`admin-badge px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                {activity.type}
              </span>
            </div>
            <p className="text-sm text-[var(--foreground)] font-medium mb-1 group-hover:text-[var(--primary)] transition-colors">
              {activity.title}
            </p>
            <p className="text-xs text-[var(--muted)] flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {activity.timeAgo}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}