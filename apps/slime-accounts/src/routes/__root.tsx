import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Devtools } from '../util/Devtools'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-dvh">
        <div className='max-w-96'>
          <Outlet />
        </div>
      </div>
      <Devtools />
    </>
  )
}
