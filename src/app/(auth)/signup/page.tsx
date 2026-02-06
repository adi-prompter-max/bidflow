import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Sign Up - BidFlow',
  description: 'Create your BidFlow account',
}

export default function SignupPage() {
  return <SignupForm />
}
