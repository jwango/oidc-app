import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function withLayout(InnerComponent) {
  return (props) => {
    const { logout, userInfo } = props;
    const { t } = useTranslation('common');
    const { locale } = useRouter();
    const nextLocale = locale === 'en' ? 'zh' : 'en';

    function renderPageActions() {
      return (userInfo) ? (<>
        <button onClick={logout}>{t('nav.logout')}</button>
        <Link href='/'><a>{t('nav.lobby')}</a></Link>
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
          <div className='content-wrapper no-wrap'>
            <Link href='/' locale={nextLocale}><a>{t('switchLocale')}</a></Link>
            {renderPageActions()}
          </div>
        </nav>
        <InnerComponent {...props} />
        <hr className="content-wrapper"></hr>
        <footer className='main__footer content-wrapper'>
          <p>{t('disclaimer')} &copy; 2021</p>
        </footer>
      </div>
    </span>
  }
}