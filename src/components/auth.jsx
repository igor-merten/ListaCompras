import { useState } from 'react';
import { auth, googleProvider } from '../config/firebase'
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import Loading from './Loading';

const Auth = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  // console.log(auth?.currentUser?.photoURL)

  const signIn = async () => {
    try{
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err){
      console.error(err)
    }
  };

  const signInWithGoogle = async () => {
    try{
      await signInWithPopup(auth, googleProvider);
    } catch (err){
      console.error(err)
    }
  };

  const logout = async() =>{
    try{
      await signOut(auth);
    } catch (err){
      console.error(err)
    }
  }

  return (
    <div>
        <input placeholder="Email..." onChange={(e) => setEmail(e.target.value) }/>
        <input type='password' placeholder="Senha..." onChange={(e) => setPassword(e.target.value) }/>

        <button onClick={signIn}>Entrar</button>

        <button onClick={signInWithGoogle}>Entrar com Google</button>

        <button onClick={logout}>Sair</button>
    </div>
  )
}

export default Auth