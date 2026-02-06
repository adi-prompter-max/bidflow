'use server'

import bcrypt from 'bcryptjs'
import { signIn, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { SignupSchema, LoginSchema, type AuthActionState } from '@/types/auth'

export async function signup(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  // Parse and validate form data
  const validatedFields = SignupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  // On validation failure, return field errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validatedFields.data

  // Check for existing user by email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return {
      errors: {
        email: ['An account with this email already exists'],
      },
    }
  }

  // Hash password with bcryptjs (10 salt rounds)
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user via prisma
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  // Sign in automatically
  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        message: 'Account created but sign-in failed. Please try logging in.',
      }
    }
    throw error // Re-throw non-auth errors (including NEXT_REDIRECT)
  }
}

export async function login(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  // Parse and validate form data
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  // On validation failure, return field errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  // Call signIn with credentials
  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            message: 'Invalid email or password',
          }
        default:
          return {
            message: 'Something went wrong. Please try again.',
          }
      }
    }
    throw error // Re-throw non-auth errors (including NEXT_REDIRECT)
  }
}

export async function logout() {
  await signOut({ redirectTo: '/' })
}
