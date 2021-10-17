import { useEffect, useState } from 'react'
//@ts-ignore
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom'
import './App.css'
//@ts-ignore
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
//@ts-ignore
import Splash from './components/Splash/Splash';
import MintPage from './pages/Mint';

const App = (props: any) => {
  const [isSplash, setIsSplash] = useState(false);
  const location = useLocation();


  const handleNotification = (type: "success" | "warning" | "info" | "error", title: string, msg: string) => {
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
    };
  };
  const routingComponent = (
    <Switch
      location={location}
    >
      <MintPage {...props} handleNotification={handleNotification} ></MintPage>
    </Switch>
)
  return (
    <>
      {
        isSplash &&
        <Splash
          text="Project Name"
          src='/assets/images/logo.png'
          style={{ height: '100vh' }}
        />
      }

      {
        !isSplash &&
        <>
          {
            routingComponent
          }

          <NotificationContainer />
        </>
      }

    </>
  )
}

export default App
