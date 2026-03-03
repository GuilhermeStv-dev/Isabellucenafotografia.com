import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { smoothScrollToTop } from '../lib/smoothScroll'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    smoothScrollToTop()
  }, [pathname])

  return null
}
