import { Link } from 'react-router'
import { Home } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { copy } from '../lib/copy'

export function NotFoundPage() {
  return (
    <div className="container-main flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-8xl font-bold text-brand-green/20 mb-4">404</p>
      <h1 className="text-2xl font-bold text-brand-dark mb-2">{copy.notFound.title}</h1>
      <p className="text-slate-500 mb-8">{copy.notFound.message}</p>
      <Link to="/">
        <Button>
          <Home className="h-4 w-4" />
          {copy.notFound.backHome}
        </Button>
      </Link>
    </div>
  )
}