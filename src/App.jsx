import { useEffect, useState } from 'react'
import './App.css'

// import NovaLista from './components/NovaLista/NovaLista'
import Sidebar from './components/navbar/index'
import Auth from './components/auth'
import Loading from './components/Loading'

import { db, auth } from './config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getDocs, collection, doc } from 'firebase/firestore'

import { Tabs, AbsoluteCenter, Heading, Button, Card, Text, Box } from "@chakra-ui/react"
import { div } from 'framer-motion/client'
import { LuPlus } from 'react-icons/lu'

import { Link } from 'react-router-dom'


function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Verifica se o usuário está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [listas, setListas] = useState([])

  const listasComprasRef = collection(db, 'ListasCompras');

  // Função para buscar listas
  const getListas = async () => {
    try {
      const data = await getDocs(listasComprasRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      }));
      
      setListas(filteredData);
      console.log(filteredData)
      return filteredData;
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return [];
    }
  };

  // getListas()

    // Função para buscar categorias e produtos
  useEffect(() => {
    getListas();
  }, [])

  // Enquanto está verificando a autenticação, mostra o Loading
  if (isLoading) {
    return <Loading />;
  }

  // Se NÃO estiver logado, mostra apenas o Auth
  if (!user) {
    return <Auth />;
  }

  // Renderização do componente
  return (
    <div className='App'>
      {/* {isLoading && <Loading />} */}
      <Sidebar />

      <div className='ContentApp'>
        <Heading mt={'5'}>Listas de feira</Heading>
        <Tabs.Root defaultValue="ListToDo" mt={'5'}>
          <Tabs.List justifyContent="center">
            <Tabs.Trigger value="ListToDo">
              {/* <LuUser /> */}
              A fazer
            </Tabs.Trigger>
            <Tabs.Trigger value="ListDone">
              {/* <LuSquareCheck /> */}
              Feitas
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="ListToDo">
            {listas
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .filter((lista) => !lista.concluida)
            .map((l) => {
              return(
                <Card.Root variant={'outline'} key={l.id} mb={'2'}>
                  <Card.Body gap="2">
                    <Card.Title mb="2">{l.nome}</Card.Title>
                    <Card.Description>
                      {l.produtos.length} produtos <br /> 
                      Criada em {new Date(l.data).toLocaleDateString()}
                    </Card.Description>
                  </Card.Body>
                </Card.Root>
              )
            })}
          </Tabs.Content>
          <Tabs.Content value="ListDone">
            {listas
              .sort((a, b) => a.nome.localeCompare(b.nome))
              .filter((lista) => lista.concluida)
              .map((l) => {
                return(
                  <Card.Root variant={'outline'} key={l.id} mb={'2'}>
                  <Card.Body gap="2">
                    <Card.Title mb="2">{l.nome}</Card.Title>
                    <Card.Description>
                      {l.produtos.length} produtos <br /> 
                      Criada em {new Date(l.data).toLocaleDateString()}
                    </Card.Description>
                  </Card.Body>
                </Card.Root>
                )
            })}
          </Tabs.Content>
        </Tabs.Root>
        <Link to={'/teste'}>
          <Button
            width={'100%'}
            variant="solid" 
            colorPalette="green" 
            size="sm" 
            my={'3'}
          >
            <LuPlus  /> Nova lista
          </Button>
        </Link>
      </div>
  
    </div>
  )
}

export default App
