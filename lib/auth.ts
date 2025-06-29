import { auth } from '@/app/firebaseConfig'
import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'

interface SignupFormInputs {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface LoginFormInputs {
  email: string
  password: string
}

export async function signUp(formData: SignupFormInputs) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
    // return { user: userCredential.user, error: null }
    // console.log(userCredential.user)
    if (userCredential.user){
      await updateProfile(userCredential.user, {displayName: `${formData.firstName} ${formData.lastName}`})
      await sendEmailVerification(userCredential.user)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { user: null, error: message }
  }
}

export async function logIn(formData: LoginFormInputs) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
    return { user: userCredential.user, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { user: null, error: message }
  }
}