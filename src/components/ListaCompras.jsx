import '../App.css'

import { useParams } from 'react-router-dom'
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




function ListaCompras() {
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

  
  const params = useParams();

  const [lista, setLista] = useState(null);
  const [categorias, setCategorias] = useState([]);

  const listasComprasRef = collection(db, 'ListasCompras');
  const categoriasListaRef = collection(db, 'Categorias');

  // Função para buscar listas
  const getListaDB = async () => {
    setIsLoading(true)
    try {
      const data = await getDocs(listasComprasRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      }));
      
      setLista(filteredData.find((l) => l.data == params.dataLista));
      setIsLoading(false);

      return filteredData;
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return [];
    }
  };

    // Buscar categorias
    const getCategorias = async () => {
      setIsLoading(true)
      try {
        const data = await getDocs(categoriasListaRef);
        const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
        setCategorias(filteredData);
      } catch(err) {
        console.error(err);
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


  // Função para buscar categorias e produtos
  useEffect(() => {
    getCategorias();
    getListaDB();
  }, [])

  // Enquanto está verificando a autenticação, mostra o Loading
  if (isLoading || !lista) {
    return <Loading />;
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
          {/* Lista de categorias e produtos */}
        {categorias
          .filter(categoria => lista.produtos.some(p => p.id_categoria === categoria.id))
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((categoria) => {
            return (
              <div key={categoria.id}>
                {/* Título da categoria */}
                <Heading mt={'5'}>{categoria.nome}</Heading>
                
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
                            <Table.Cell width={"60px"}>
                              <Text
                                fontWeight="semibold"
                                fontSize="md"
                                textDecoration={produto.adicionado ? 'line-through' : 'none'}
                              >
                                {produto.quantidade}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="md" textDecoration={produto.adicionado ? 'line-through' : 'none'}>
                                {produto.nome}
                              </Text>
                            </Table.Cell>
                            <Table.Cell textAlign="end" width={"110px"}>
                              <Button 
                                size={'sm'} 
                                color={produto.adicionado ? 'gray' : 'green.500'}
                                variant={produto.adicionado ? 'outline' : 'outline'}
                                onClick={() => marcarComoAdicionado(produto.id)}
                                width="100%"
                              >
                                {produto.adicionado ? 'Desfazer' : <LuShoppingCart  /> }
                              </Button>
                            </Table.Cell>
                          </Table.Row>
                        )
                      })}
                  </Table.Body>
                </Table.Root>
              </div>
            )
          })}

          
        <Button
        mt={5}
            width={'100%'}
            variant="solid" 
            colorPalette="green" 
            size="sm" 
            mb={'3'}
          >
            <LuCheck  /> Finalizar lista
          </Button>
        </div>

  
    </div>
  )
}

export default ListaCompras
