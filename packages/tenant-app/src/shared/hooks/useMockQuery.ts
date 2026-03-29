import { useState, useEffect } from 'react'

/**
 * Simulates an async data fetch with a configurable delay.
 * Useful for rendering realistic skeleton loading states.
 */
export function useMockQuery<T>(data: T, delayMs = 800): { data: T | null; isLoading: boolean } {
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState<T | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setResult(data)
      setIsLoading(false)
    }, delayMs)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data: result, isLoading }
}
