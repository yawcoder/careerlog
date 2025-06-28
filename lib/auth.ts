import { auth } from '@/app/firebaseConfig'
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth'

interface SignupFormInputs {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export async function signUp(formData: SignupFormInputs) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
    // return { user: userCredential.user, error: null }
    // console.log(userCredential.user)
    if (userCredential.user){
      await sendEmailVerification(userCredential.user)
    }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export async function logIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}
