'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Loader2, ShieldAlert } from 'lucide-react'

import { Alert, AlertDescription } from '@/contexts/shared/interfaces/components/ui/alert'
import { buttonVariants } from '@/contexts/shared/interfaces/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/contexts/shared/interfaces/components/ui/card'
import { verifyMagicLinkAction } from '../actions/authentication.actions'

const storageKey = 'takodu.iam.session'

export function MagicLinkVerification({ token }: { token: string }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('We are verifying your access link.')

  useEffect(() => {
    let active = true
    verifyMagicLinkAction(token).then((result) => {
      if (!active) return
      if (result.session) {
        localStorage.setItem(storageKey, JSON.stringify(result.session))
        setStatus('success')
        setMessage('Your session is active. You can return to Takodu.')
      } else {
        setStatus('error')
        setMessage(result.message ?? 'The link has expired or has already been used.')
      }
    })

    return () => { active = false }
  }, [token])

  return <main className="flex min-h-screen items-center justify-center bg-muted/40 px-6 py-12">
    <Card className="w-full max-w-md shadow-xl shadow-slate-900/10">
      <CardHeader className="items-center text-center">
        <div className={`mb-2 grid size-14 place-items-center rounded-2xl ${status === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
          {status === 'loading' ? <Loader2 className="size-7 animate-spin" /> : status === 'success' ? <Check className="size-7" /> : <ShieldAlert className="size-7" />}
        </div>
        <CardTitle>{status === 'loading' ? 'Verifying access' : status === 'success' ? 'Access confirmed' : 'Invalid link'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-center">
        {status === 'error' ? <Alert variant="destructive"><AlertDescription>{message}</AlertDescription></Alert> : <p className="text-sm text-muted-foreground">{message}</p>}
        {status !== 'loading' ? <Link href="/" className={buttonVariants({ className: 'w-full' })}>Return to home</Link> : null}
      </CardContent>
    </Card>
  </main>
}
