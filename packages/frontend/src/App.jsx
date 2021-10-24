import { useRef, useEffect } from 'react';
import { useLocation, Switch } from 'react-router-dom';
import AppRoute from './utils/AppRoute';
import ScrollReveal from './utils/ScrollReveal';

// Layouts
import LayoutDefault from './layouts/LayoutDefault';

// Views 
import Home from './views/Home';
//@ts-ignore
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import MintPage from './pages/Mint';

const App = () => {

  const childRef = useRef();
  let location = useLocation();

  useEffect(() => {
    const page = location.pathname;
    document.body.classList.add('is-loaded')
    childRef?.current?.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
  
  const handleNotification = (type, title, msg) => {
    let duration = 3000;
    switch (type) {
      case 'info':
        NotificationManager.info(msg, title, duration);
        break;
      case 'success':
        NotificationManager.success(msg, title, duration);
        break;
      case 'warning':
        NotificationManager.warning(msg, title, duration);
        break;
      case 'error':
        NotificationManager.error(msg, title, duration);
        break;
      default:
        break;
    };
  };

  return (

    <>
        <>
          {
            <ScrollReveal
              ref={childRef}
              children={() => (
                <Switch location={location}>
                  <AppRoute exact path="/" component={Home} layout={LayoutDefault}  handleNotification={handleNotification}/>
                  <AppRoute exact path="/mint" component={MintPage} layout={LayoutDefault}  handleNotification={handleNotification}/>
                </Switch>
              )} />

          }
          <NotificationContainer />
        </>

    </>
  );
}

export default App;