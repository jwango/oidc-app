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
            <Link href='https://www.jwango.com'><a className='nav-link--active'>Blog</a></Link>
          </div>
        </nav>
        <main className='content-wrapper'><Component {...pageProps} /></main>
        <footer className='main__footer content-wrapper'>
          <p>Hello! As a disclaimer, this site makes use of 3rd party cookies to maintain your session cookies.
            If you use a browser that blocks such cookies, you won't be able to use this site until you disable that setting or until the session resolver is on the same domain.</p>
        </footer>
      </div>
    </span>
  )
}

export default MyApp
