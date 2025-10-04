import './App.css'
import NovaLista from './components/NovaLista'
import Sidebar from './components/navbar/index'

import Auth from './components/auth'
import { db } from './config/firebase'
import { getDocs, collection, doc } from 'firebase/firestore'


function App() {
  
  // Renderização do componente
  return (
    <div className='App'>
      <Sidebar />
      <Auth />
      <NovaLista />
  
    </div>
  )
}

export default App
