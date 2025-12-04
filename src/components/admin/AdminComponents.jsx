export function StatsCard({ title, value, description, icon, color = "primary", trend = null }) {
  const colorClasses = {
    primary: "from-slate-700 to-slate-800",
    secondary: "from-slate-600 to-slate-700", 
    accent: "from-slate-800 to-slate-900",
    success: "from-emerald-700 to-emerald-800",
    warning: "from-amber-700 to-amber-800",
    info: "from-blue-700 to-blue-800"
  }

  return (
    <div className="admin-stats-card admin-card-enter relative overflow-hidden bg-[var(--card)] rounded-lg border border-[var(--border)] p-6 shadow-sm">
      {/* Background gradient mais sutil */}
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${colorClasses[color]} opacity-5 rounded-full -mr-8 -mt-8`} />
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} shadow-sm`}>
            <div className="text-white text-lg">
              {icon}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend.type === 'up' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' 
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }`}>
              <span className="text-xs">{trend.type === 'up' ? '↗' : '↘'}</span>
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

export function ActionCard({ title, description, href, icon, color = "primary", badge = null }) {
  const colorClasses = {
    primary: "from-[var(--primary)] to-slate-700 hover:from-slate-700 hover:to-slate-800",
    secondary: "from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800",
    accent: "from-[var(--accent)] to-blue-700 hover:from-blue-700 hover:to-blue-800",
    success: "from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
  }

  return (
    <a
      href={href}
      className={`admin-action-card admin-card-enter relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} rounded-lg p-6 text-white shadow-sm block border border-white/10`}
    >
      {/* Background pattern mais sutil */}
      <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl">
            {icon}
          </div>
          {badge && (
            <span className="admin-badge bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium border border-white/20">
              {badge}
            </span>
          )}
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-white/90 text-sm leading-relaxed">{description}</p>
        </div>
        
        <div className="flex items-center justify-end">
          <div className="opacity-75 hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      case 'news': return 'bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800/30 dark:text-slate-300 dark:border-slate-700'
      case 'project': return 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
      case 'service': return 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
      case 'user': return 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
      default: return 'bg-gray-50 text-gray-800 border border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700'
    }
  }

  return (
    <div className="admin-fade-in flex items-start space-x-4 p-4 hover:bg-[var(--section-alt-bg)] rounded-lg transition-all duration-200">
      <div className="flex-shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white text-sm">{activity.icon}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <p className="text-sm font-medium text-[var(--foreground)]">
                <span className="font-semibold text-[var(--primary)]">{activity.author}</span> {activity.action}
              </p>
              <span className={`admin-badge px-2 py-1 rounded-md text-xs font-medium ${getActivityColor(activity.type)}`}>
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