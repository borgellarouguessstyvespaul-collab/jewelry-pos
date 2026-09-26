import { useEffect, useRef } from 'react'

/**
 * Custom hook to capture rapid keystrokes from USB / Bluetooth hardware barcode scanners.
 * @param {Function} onScan - Callback when a full barcode is scanned
 * @param {number} maxInterval - Max ms between keystrokes to be considered barcode input (default 50ms)
 */
export function useBarcode(onScan, maxInterval = 50) {
  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when focusing text inputs or textareas, unless needed
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : ''
      if (activeTag === 'textarea' || (activeTag === 'input' && document.activeElement.type !== 'search')) {
        return
      }

      const currentTime = Date.now()
      const diff = currentTime - lastKeyTimeRef.current

      if (e.key === 'Enter') {
        if (bufferRef.current.length >= 3) {
          onScan(bufferRef.current.trim())
        }
        bufferRef.current = ''
        return
      }

      // If typed character
      if (e.key.length === 1) {
        if (diff > maxInterval && bufferRef.current.length > 0) {
          // Reset if interval is too long
          bufferRef.current = ''
        }
        bufferRef.current += e.key
        lastKeyTimeRef.current = currentTime
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onScan, maxInterval])
}

export default useBarcode
