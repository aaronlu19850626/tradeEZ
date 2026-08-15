import { PlaceholderPage } from '@/components/common/PlaceholderPage'
import { MockHealthCheck } from '@/features/dev/MockHealthCheck'

export default function HomePage() {
  return (
    <>
      <PlaceholderPage titleKey="home" reqId="F-3" noteKey="home" />
      <MockHealthCheck />
    </>
  )
}
