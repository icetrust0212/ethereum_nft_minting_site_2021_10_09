import { RouteInterface } from '../lib/types';
import Home from '../pages/Home';

export const adminRoutes:RouteInterface[] = [
  {
    path: '/',
    redirect: '/home',
    exact: true
  },
  {
    path: '/home',
    component: Home,
    exact: true
  }
]
