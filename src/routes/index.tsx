import { createFileRoute } from '@tanstack/react-router'
import { TeslaBookmarkManager } from '~/components/tesla-bookmark-manager'
export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <TeslaBookmarkManager />
  )
}
