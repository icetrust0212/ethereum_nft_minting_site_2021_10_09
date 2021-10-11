import { useEffect, useState } from 'react'
//@ts-ignore
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom'
import {adminRoutes} from './routes';
import './App.css'
import { useDispatch } from 'react-redux'
//@ts-ignore
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
//@ts-ignore
import Splash from './components/Splash/Splash';
import { RouteInterface } from './lib/types';

const App = (props: any) => {
  const [isSplash, setIsSplash] = useState(false);
  const routes =  adminRoutes;
  const location = useLocation();
  const routingComponent = (
      <Switch
        location={location}
      >
        {routes.map((route: RouteInterface, index: number) => {
          return (
            <Route
              key={index}
              path={route.path}
              component={() => <route.component {...props} handleNotification={handleNotification} routes={route.routes || []} />}
              exact={route.exact}
            >
              {
              route.redirect &&
                <Redirect
                  to={{
                    pathname: route.redirect,
                  }}
                />
              }

            </Route>
          )
        })}
      </Switch>
  )

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
