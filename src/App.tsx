import NewsMap from './components/NewsMap'
import './assets/newsmap.css'

export default function App() {
  return (
    <>
      <header>
        <div className="wrapper">
          <h1><a href="/">Hot Bubbles</a></h1>
        </div>
      </header>
      <main>
        <NewsMap />
      </main>
    </>
  )
}
