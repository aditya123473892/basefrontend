import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Fleet Management SaaS
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Welcome to your logistics fleet management system
        </p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="block w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
