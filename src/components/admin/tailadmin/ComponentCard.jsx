'use client'

const ComponentCard = ({ title, children, className = '' }) => {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      {title && (
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
        </div>
      )}
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  )
}

export default ComponentCard