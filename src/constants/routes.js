import About from '../components/about/about.jsx'
import Posts from '../components/posts/posts.jsx'
import Activity from '../components/activity/activity.jsx'
import Guestbook from '../components/guestbook/guestbook.jsx'

export const GUESTBOOK_SUCCESS_PATH = 'thanks'

export const ROUTES = {
  posts: {
    href: '/posts',
    label: 'Feed',
    enabled: true,
    renderer: Posts,
  },
  about: {
    href: '/about',
    label: 'About',
    enabled: true,
    renderer: About
  },
  activity: {
    href: '/activity',
    label: 'Activity',
    enabled: false,
    renderer: Activity,
  },
  guestbook: {
    href: '/guestbook',
    label: 'Guestbook',
    enabled: true,
    renderer: Guestbook,
  }
}

export const getRoutes = key => {
  const newRoutes = Object.keys(ROUTES).reduce((acc, cur) => {
    acc.push({
      ...ROUTES[cur],
      active: (!key && cur === ROUTES.posts.href.slice(1)) || key.indexOf(cur) !== -1
    })
    return acc
  }, [])
  return newRoutes
}