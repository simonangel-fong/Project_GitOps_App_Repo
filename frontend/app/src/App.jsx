import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [version, setVersion] = useState('loading...')

  useEffect(() => {
    fetch('/api')
      .then(res => {
        if (!res.ok) throw new Error(res.status)
        return res.json()
      })
      .then(data => setVersion(data.version))
      .catch(() => setVersion('unavailable'))
  }, [])

  return (
    <div className="page">
      <h1>GitOps Demo App - {version}</h1>
    </div>
  )
}

export default App
