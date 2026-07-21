'use client'

import { useEffect, useState, useTransition } from 'react'
import { useActionState } from 'react'
import { Check, Loader2, RefreshCw } from 'lucide-react'

import {
  confirmEmailSignInAction,
  initialAuthenticationActionState,
  refreshSessionAction,
  requestEmailSignInAction,
  signOutAction,
  type AuthenticationActionState,
} from '../actions/authentication.actions'
import { GoogleIcon } from './icons/google'

type StoredSession = NonNullable<AuthenticationActionState['session']>

const storageKey = 'takodu.iam.session'

function saveSession(session: StoredSession | null) {
  if (session) localStorage.setItem(storageKey, JSON.stringify(session))
  else localStorage.removeItem(storageKey)
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? 'null') as StoredSession | null
  } catch {
    return null
  }
}

export function EmailAuthentication() {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'email' | 'code' | 'session'>('email')
  const [session, setSession] = useState<StoredSession | null>(null)
  const [requestState, requestAction, requestPending] = useActionState(requestEmailSignInAction, initialAuthenticationActionState)
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmEmailSignInAction, initialAuthenticationActionState)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const stored = readSession()
    if (stored) {
      window.setTimeout(() => {
        setSession(stored)
        setStep('session')
      }, 0)
    }
  }, [])

  useEffect(() => {
    if (confirmState.session) saveSession(confirmState.session)
  }, [confirmState.session])

  function handleRefresh() {
    const activeSession = session ?? confirmState.session
    if (!activeSession) return
    startTransition(async () => {
      const result = await refreshSessionAction(activeSession.refreshToken)
      if (result.session) {
        setSession(result.session)
        saveSession(result.session)
      } else {
        setSession(null)
        saveSession(null)
        setStep('email')
      }
    })
  }

  function handleSignOut() {
    const activeSession = session ?? confirmState.session
    startTransition(async () => {
      await signOutAction(activeSession?.accessToken, activeSession?.refreshToken)
      setSession(null)
      saveSession(null)
      setStep('email')
    })
  }

  const activeSession = session ?? confirmState.session
  const visibleStep = activeSession ? 'session' : requestState.status === 'success' ? 'code' : step
  const message = requestState.message ?? confirmState.message
  const error = requestState.status === 'error' ? requestState.message : confirmState.status === 'error' ? confirmState.message : null

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#f7f9fb] px-5 py-3 text-[#121a2f]">
      <div className="w-full max-w-[600px] text-center">
        <h1 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.02em]">Continue to Takodu</h1>
        <p className="mt-2 text-[16px] leading-6 text-[#607493]">Sign in or create your account with Google or email.</p>

        <section className="mx-auto mt-7 w-full max-w-[524px] rounded-[19px] border border-[#c9c9c9] bg-white px-[34px] py-[34px] text-left">
          {visibleStep === 'email' ? <>
            <button type="button" className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[11px] border border-[#121a2f] bg-white text-[16px] font-medium text-[#121a2f] transition-colors hover:bg-[#f7f9fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16bb7d]"><GoogleIcon /><span>Continue with Google</span></button>

            <div className="my-[28px] flex items-center gap-[13px] text-[14px] text-[#121a2f]"><span className="h-px flex-1 bg-[#121a2f]" /><span>OR</span><span className="h-px flex-1 bg-[#121a2f]" /></div>

            {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
            <form action={requestAction}>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-[52px] w-full rounded-[11px] border border-[#121a2f] bg-white px-[15px] text-[16px] text-[#121a2f] outline-none placeholder:text-[#121a2f] focus-visible:ring-2 focus-visible:ring-[#16bb7d]" />
              <button type="submit" disabled={requestPending} className="mt-[20px] flex h-[52px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#16bb7d] text-[16px] font-semibold text-white transition-colors hover:bg-[#12a96f] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121a2f]">{requestPending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}Continue with email</button>
            </form>

            <p className="mt-[19px] text-center text-[13px] leading-5 text-[#607493]">By continuing, you agree to our <a href="#" className="font-semibold underline-offset-2 hover:underline">Terms and Privacy Policy.</a></p>
          </> : null}

          {visibleStep === 'code' ? <form action={confirmAction} className="text-left">
            <input type="hidden" name="email" value={email} />
            <h2 className="text-2xl font-semibold">Check your email</h2>
            <p className="mt-2 text-sm text-[#607493]">We sent a 6-digit code to {email}.</p>
            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            <label htmlFor="code" className="sr-only">Access code</label>
            <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" autoFocus required className="mt-6 h-[52px] w-full rounded-[11px] border border-[#121a2f] px-[15px] text-center text-xl tracking-[0.45em] outline-none focus-visible:ring-2 focus-visible:ring-[#16bb7d]" />
            <button type="submit" disabled={confirmPending} className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#16bb7d] font-semibold text-white disabled:opacity-70">{confirmPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}Verify code</button>
            {message && !error ? <p className="mt-4 text-center text-sm text-emerald-700">{message}</p> : null}
            <button type="button" className="mx-auto mt-4 block text-sm text-[#607493] underline-offset-4 hover:underline" onClick={() => setStep('email')}>Use a different email</button>
          </form> : null}

          {visibleStep === 'session' ? <div className="text-left">
            <h2 className="text-2xl font-semibold">Active session</h2>
            <p className="mt-2 text-sm text-[#607493]">Your identity is verified and you can continue with your account.</p>
            <div className="mt-6 rounded-[11px] bg-[#e9faf3] p-4 text-sm text-[#087a52]">Authentication confirmed successfully.</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" disabled={isPending} onClick={handleRefresh} className="flex h-11 items-center justify-center gap-2 rounded-[11px] border border-[#121a2f] text-sm"><RefreshCw className="h-4 w-4" />Refresh session</button><button type="button" disabled={isPending} onClick={handleSignOut} className="h-11 rounded-[11px] bg-[#121a2f] text-sm text-white">Sign out</button></div>
          </div> : null}
        </section>
      </div>
    </main>
  )
}
