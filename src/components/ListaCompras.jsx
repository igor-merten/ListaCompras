import '../App.css'

import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Sidebar from './navbar/index'
import Auth from './auth'
import Loading from './Loading'

import { db, auth } from '../config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getDocs, collection, doc, updateDoc } from 'firebase/firestore'

import {
  Box,
  Heading,
  Text,
  Button,
  Table,
} from '@chakra-ui/react';

import { LuShoppingCart, LuPlus, LuCheck  } from 'react-icons/lu'

import { useStatusInternet } from './CheckInternet'


function ListaCompras() {
  // const [isLoading, setIsLoading] = useState(true);
  const isOnline = useStatusInternet();
  const [isCategoriasLoading, setIsCategoriasLoading] = useState(true);
  const [isListaLoading, setIsListaLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null)
  
  // Verifica se o usuário está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  
  const params = useParams();

  const [lista, setLista] = useState(null);
  const [categorias, setCategorias] = useState([]);

  const listasComprasRef = collection(db, 'ListasCompras');
  const categoriasListaRef = collection(db, 'Categorias');

  // Função para buscar listas
  const getListaDB = async () => {
    setIsListaLoading(true)
    try {
      const data = await getDocs(listasComprasRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      }));
      
      setLista(filteredData.find((l) => l.data == params.dataLista));
      setIsListaLoading(false);

      return filteredData;
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setIsListaLoading(false)
      // 💡 Verifica se é erro de conexão
      if (!navigator.onLine) {
        setError('Você está offline. Verifique sua conexão com a internet e tente novamente.');
      } else {
        setError('Ocorreu um erro ao carregar a lista. Verifique se você tem permissão de acesso.');
      }
      return [];
    }
  };

    // Buscar categorias
    const getCategorias = async () => {
      setIsCategoriasLoading(true)
      try {
        const data = await getDocs(categoriasListaRef);
        const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
        setCategorias(filteredData);
        setIsCategoriasLoading(false)
      } catch(err) {
        console.error(err);
        setIsCategoriasLoading(false)
      }
    }

      // Marcar produto como adicionado
  const marcarComoAdicionado = async (idProduto) => {
    const produtosAtualizados = lista.produtos.map(p => 
      p.id === idProduto ? { ...p, adicionado: !p.adicionado } : p
    );

    // Atualizar no estado local
    setLista({ ...lista, produtos: produtosAtualizados });

    // Atualizar no Firebase
    try {
      const listaDoc = doc(db, 'ListasCompras', lista.id);
      await updateDoc(listaDoc, { produtos: produtosAtualizados });
    } catch(err) {
      console.error(err);
    }
  };

  // Função para finalizar lista
  const finalizarLista = async () => {
    try {
      const listaDoc = doc(db, 'ListasCompras', lista.id);
      await updateDoc(listaDoc, { concluida: true });
      
      // Redireciona para a página inicial
      navigate('/');
    } catch(err) {
      console.error(err);
    }
  };


  // Função para buscar categorias e produtos
  useEffect(() => {
    getCategorias();
    getListaDB();
  }, [])

  const isLoading = !isAuthReady || isCategoriasLoading || isListaLoading;

  // Enquanto está verificando a autenticação, mostra o Loading
  if (isLoading) {
    return (<div><Sidebar /> <Loading /></div>);
  }

  // Se NÃO estiver logado, mostra apenas o Auth
  if (!user) {
    return <Auth />;
  }

  // Renderização do componente
  return (
    <div className='ListaCompras'>
        <Sidebar />
        <div className='ContentApp'>
        {error && (
          <Box
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            color="red.700"
            p="2"
            borderRadius="md"
            mt={3}
          >
            <Text fontSize="sm">{error}</Text>
          </Box>
        )}
          {/* Lista de categorias e produtos */}
        {categorias
          .filter(categoria => lista.produtos.some(p => p.id_categoria === categoria.id))
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((categoria) => {
            return (
              <div key={categoria.id}>
                {/* Título da categoria */}
                <Heading mt={'5'} size={'2xl'}>{categoria.nome}</Heading>
                
                {/* Tabela de produtos */}
                <Table.Root mt={'2'}>
                  <Table.Caption />
                  <Table.Body borderTopWidth="1px">
                    {/* Lista de produtos */}
                    {lista.produtos
                      .filter((produto) => produto.id_categoria == categoria.id)
                      .sort((a, b) => a.nome.localeCompare(b.nome))
                      .map((produto) => {
                        return (
                          <Table.Row 
                            key={produto.id}
                            opacity={produto.adicionado ? 0.5 : 1}
                            transition="all 0.2s"
                          >
                            <Table.Cell w={"20px"} py={8} pl={0} pr={0} mr={0}>
                              <Text
                                pl={0}
                                fontWeight="semibold"
                                fontSize="lg"
                                textDecoration={produto.adicionado ? 'line-through' : 'none'}
                              >
                                {produto.quantidade}
                              </Text>
                            </Table.Cell>
                            <Table.Cell pl={0} ml={0}>
                              <Text fontSize="lg" textAlign="left" textDecoration={produto.adicionado ? 'line-through' : 'none'}>
                                {produto.nome}
                              </Text>
                            </Table.Cell>
                            <Table.Cell textAlign="end" width={"130px"} px={0}>
                              {!lista.concluida && (
                                <Button 
                                  size={'lg'} 
                                  color={produto.adicionado ? 'gray' : 'green.500'}
                                  variant={produto.adicionado ? 'outline' : 'outline'}
                                  onClick={() => marcarComoAdicionado(produto.id)}
                                  width="100%"
                                  _active={{ transform: 'scale(0.95)', bg: 'gray.100' }}
                                  transition="all 0.05s"
                                >
                                  {produto.adicionado ? 'Desfazer' : <LuShoppingCart  /> }
                                </Button>
                              )}
                            </Table.Cell>
                          </Table.Row>
                        )
                      })}
                  </Table.Body>
                </Table.Root>
              </div>
            )
          })}

        {!lista.concluida && (
            <Button
              mt={5}
              width={'100%'}
              variant="solid" 
              colorPalette="green" 
              size="xl" 
              mb={'3'}
              onClick={finalizarLista}
              _active={{ transform: 'scale(0.98)' }}
              transition="all 0.05s"
              disabled={!isOnline}
              >
                <LuCheck  /> Finalizar lista
            </Button>
          )}
        </div>

  
    </div>
  )
}

export default ListaCompras