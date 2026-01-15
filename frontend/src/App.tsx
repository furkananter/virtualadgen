import { useState } from 'react'
import { Button } from './components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className='text-3xl font-bold underline text-red-500'>Vite + React</h1>
      <Button>Button</Button>
    </>
  )
}

export default App
