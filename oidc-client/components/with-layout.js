import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function withLayout(InnerComponent) {
  return (props) => {
    const { logout, userInfo } = props;
    const { t } = useTranslation('common');

    function renderPageActions() {
      return (userInfo) ? (<>
        <Link href='/'><a>{t('nav.lobby')}</a></Link>
        <button onClick={logout}>{t('nav.logout')}</button>
      </>) : null;
    }

    return <span className="app--default">
      <div className='container column'>
        <header className='main__header'>
          <div className='content-wrapper'>
            <h1>JWANGO</h1>
          </div>
        </header>
        <nav>
          <div className='content-wrapper'>
            <Link href='https://www.jwango.com'><a>{t('nav.blog')}</a></Link>
            {renderPageActions()}
          </div>
        </nav>
        <InnerComponent {...props} />
        <hr className="content-wrapper"></hr>
        <footer className='main__footer content-wrapper'>
          <p>{t('disclaimer')}</p>
        </footer>
      </div>
    </span>
  }
}