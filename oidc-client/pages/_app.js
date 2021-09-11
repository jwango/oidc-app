import '../styles/sass/main.scss';

function MyApp({ Component, pageProps }) {
  return (
    <span className="app--default">
      <div className='container column'>
        <Component {...pageProps} />
        <hr className="content-wrapper"></hr>
        <footer className='main__footer content-wrapper'>
          <p>Hello! As a disclaimer, this site makes use of 3rd party cookies to maintain your session cookies.
            If you use a browser that blocks such cookies, you won't be able to use this site until you disable that setting or until the session resolver is on the same domain.</p>
        </footer>
      </div>
    </span>
  )
}

export default MyApp
