import { APP_NAME } from '../config.js'

export default function Footer() {
  return (
    <footer className="footer">
      {APP_NAME} · Data-quality dashboard · UI inspired by{' '}
      <a href="https://www.creative-tim.com/product/black-dashboard-react" target="_blank" rel="noreferrer">
        Black Dashboard React (MIT © Creative Tim)
      </a>{' '}
      · ported to Vite.
    </footer>
  )
}
