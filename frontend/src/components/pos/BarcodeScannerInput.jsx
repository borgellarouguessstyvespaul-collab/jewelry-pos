import { useState, useRef, useEffect } from 'react'

export default function BarcodeScannerInput({ onScan }) {
  const [barcode, setBarcode] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    // Keep focus for rapid scanning if desired
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (barcode.trim()) {
      onScan(barcode.trim())
      setBarcode('')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', width: '100%' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          ref={inputRef}
          type="text"
          className="input"
          placeholder="Scanner code-barres (USB/Laser) ou saisir..."
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          style={{ paddingLeft: '36px', height: '42px', fontSize: '13px' }}
        />
        <span
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '16px',
            pointerEvents: 'none',
          }}
        >
        </span>
      </div>
      <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '42px' }}>
        Scanner
      </button>
    </form>
  )
}
