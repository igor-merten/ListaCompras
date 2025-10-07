import { useEffect, useState } from 'react'
import './App.css'

import Sidebar from './components/navbar/index'
import Auth from './components/auth'
import Loading from './components/Loading'

import { db, auth } from './config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getDocs, collection, doc } from 'firebase/firestore'

import { Tabs, AbsoluteCenter, Heading, Button, Card, Text, Box, Container, Flex, IconButton, VStack, HStack } from "@chakra-ui/react"
import { div } from 'framer-motion/client'
import { LuSearch, LuPlus, LuChevronRight, LuCheck, LuList } from 'react-icons/lu'

import { Link } from 'react-router-dom'

const ListCard = ({ nome, data, concluida = false, icon: IconComponent }) => (
  <Box
    bg="white"
    borderRadius="xl"
    border={'1px solid #ddd'}
    p={4}
    mb={0}
    cursor="pointer"
  >
    <HStack spacing={4} justify="space-between">
      <HStack spacing={4}>
        <Box
          bg={concluida ? 'gray.100' : 'green.100'}
          p={3}
          borderRadius="lg"
        >
          <IconComponent
            size={24}
            color={concluida ? '#718096' : '#16a34a'}
          />
        </Box>
        <Box>
          <Text
            textAlign={'left'}
            fontSize="lg"
            fontWeight="semibold"
            color={concluida ? 'gray.400' : 'gray.800'}
            textDecoration={concluida ? 'line-through' : 'none'}
          >
            {nome}
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign={'left'}>
            Criada em {new Date(data).toLocaleDateString('pt-BR', {day: 'numeric', month: 'long', year: 'numeric'})}
          </Text>
        </Box>
      </HStack>
      <LuChevronRight size={24} color="#A0AEC0" />
    </HStack>
  </Box>
);

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
        <Heading mt={'5'} size={'md'}>Minhas Listas</Heading>

        {/* Lista pendentes  */}
        <Heading mt={'3'} mb={"2"} size={'xl'} textAlign={'left'}>Pendentes</Heading>
        <VStack align="stretch" spacing={4} mb={2}>
          {listas
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .filter((lista) => !lista.concluida)
          .map((list, index) => (
            <Link key={list.id} to={`Lista/${list.data}`}>
              <ListCard border={'1px solid'}
                key={index}
                nome={list.nome}
                data={list.data}
                icon={LuList}
              />
            </Link>
          ))}
        </VStack>

        {/* Listas Concluídas */}
        <Heading mt={'5'} mb={"2"} size={'xl'} textAlign={'left'}>Concluídas</Heading>
        <VStack align="stretch" spacing={4} mb={2}>
        {listas
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .filter((lista) => lista.concluida)
          .map((list, index) => (
          <Link key={list.id} to={`Lista/${list.data}`}>
            <ListCard
              key={index}
              nome={list.nome}
              data={list.data}
              icon={LuCheck}
              concluida={true}
            />
          </Link>
        ))}
        </VStack>

        <Link to={'/NovaLista'}>
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
