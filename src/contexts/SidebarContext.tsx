import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'alcacrea-sidebar-collapsed'
const WIDTH_EXPANDED = '13rem'
const WIDTH_COLLAPSED = '5.5rem'

interface SidebarContextValue {
  collapsed: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

function applySidebarWidth(collapsed: boolean) {
  document.documentElement.style.setProperty(
    '--sidebar-width',
    collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED,
  )
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    applySidebarWidth(collapsed)
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      /* private mode */
    }
  }, [collapsed])

  const toggleSidebar = useCallback(() => {
    setCollapsed((value) => !value)
  }, [])

  const value = useMemo(() => ({ collapsed, toggleSidebar }), [collapsed, toggleSidebar])

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
