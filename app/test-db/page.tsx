'use client'

import { useState } from 'react'

interface DBTestResponse {
  status: string
  message: string
  timestamp: string
  data?: {
    serverTime: string
    sqlVersion: string
  }
  error?: string
}

export default function TestDBPage() {
  const [result, setResult] = useState<DBTestResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:4000/api/test-db')
      const data: DBTestResponse = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || 'Failed to test database connection')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Database Connection Test
          </h1>

          <button
            onClick={testConnection}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
          >
            {loading ? 'Testing...' : 'Test Database Connection'}
          </button>

          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4 mb-4">
              <div className="text-red-800 dark:text-red-200">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {result && (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-4">
              <div className="text-green-800 dark:text-green-200">
                <strong>✅ {result.message}</strong>
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                <p><strong>Status:</strong> {result.status}</p>
                <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>
                {result.data && (
                  <>
                    <p><strong>Server Time:</strong> {new Date(result.data.serverTime).toLocaleString()}</p>
                    <p><strong>SQL Version:</strong> {result.data.sqlVersion}</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>This page tests the connection to the SQL Server database.</p>
            <p>Backend API: http://localhost:4000/api/test-db</p>
          </div>
        </div>
      </div>
    </div>
  )
}
