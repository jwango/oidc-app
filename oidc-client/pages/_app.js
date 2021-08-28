import '../styles/sass/main.scss'

import Link from 'next/link';

function MyApp({ Component, pageProps }) {
  return (
    <span className="app--default">
      <div className='container column'>
        <header className='main__header'>
          <div className='content-wrapper'>
            <h1>JWANGO</h1>
          </div>
        </header>
        <nav>
          <div className='content-wrapper'>
            <Link href='https://www.jwango.com'><a className='nav-link--active'>Main Site</a></Link>
          </div>
        </nav>
        <main className='content-wrapper'><Component {...pageProps} /></main>
        <footer className='main__footer content-wrapper'>
        </footer>
      </div>
    </span>
  )
}

export default MyApp
