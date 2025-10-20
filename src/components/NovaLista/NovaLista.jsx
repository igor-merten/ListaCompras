import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { produce } from 'immer'
import '../../App.css'
import ModalNovoProduto from './ModalNovoProduto'
import Auth from '../auth'
import ModalNovaListaDeCompras from './ModalNovaListaDeCompras'
import Sidebar from '../navbar'
import Loading from '../Loading'

import {CheckInternet, useStatusInternet} from '../Hooks/CheckInternet'

import { Table, Heading, Button, Grid, GridItem, Box, Text, Flex } from "@chakra-ui/react"
// import { toaster } from "@/components/ui/toaster"
import { LuPlus, LuMinus } from "react-icons/lu"

import { db, auth } from '../../config/firebase'
import { getDocs, collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

// Componente otimizado da linha do produto
const ProdutoRow = memo(({ produto, onAdicionar, onReduzir }) => {
  return (
    <Table.Row>
      <Table.Cell fontSize="lg" py={8} px={0}>
        {produto.nome}
      </Table.Cell>

      <Table.Cell textAlign="end" width="150px" px={0}>
        <Flex align="center" justify="center" gap={1}>
          <Button
            size="md"
            variant="outline"
            onClick={() => onAdicionar(produto.id)}
            _active={{ transform: 'scale(0.95)', bg: 'gray.100' }}
            transition="all 0.05s"
          >
            <LuPlus />
          </Button>

          <Box fontSize="lg" minW="40px" textAlign="center">
            {produto.quantidade}
          </Box>

          <Button
            size="md"
            variant="outline"
            onClick={() => onReduzir(produto.id)}
            _active={{ transform: 'scale(0.95)', bg: 'gray.100' }}
            disabled={produto.quantidade === 0}
            transition="all 0.05s"
          >
            <LuMinus />
          </Button>
        </Flex>
      </Table.Cell>
    </Table.Row>
  );
});

// Componente otimizado da categoria
const CategoriaSection = memo(({ categoria, produtos, onAdicionar, onReduzir, onCadastrarProduto }) => {
  // Filtra e ordena produtos apenas quando necessário
  const produtosFiltrados = useMemo(() => {
    return produtos
      .filter((produto) => produto.id_categoria === categoria.id)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [produtos, categoria.id]);

  return (
    <div>
      <Heading size={'2xl'} mt={'5'}>{categoria.nome}</Heading>
      <Table.Root mt={'2'}>
        <Table.Caption />
        <Table.Body borderTopWidth="1px">
          {produtosFiltrados.map((produto) => (
            <ProdutoRow
              key={produto.id}
              produto={produto}
              onAdicionar={onAdicionar}
              onReduzir={onReduzir}
            />
          ))}
        </Table.Body>
      </Table.Root>
      
      <div>
        <ModalNovoProduto
          id_categoria={categoria.id}
          onSubmit={onCadastrarProduto}
        />
      </div>
    </div>
  );
});

function NovaLista() {
  const isOnline = useStatusInternet();
  // useCheckInternet();
  
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState({});
  const [isCategoriasLoading, setIsCategoriasLoading] = useState(true);
  const [isProdutosLoading, setIsProdutosLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null)

  const categoriasListaRef = collection(db, 'Categorias');
  const produtosListaRef = collection(db, 'Produtos');

  const getCategorias = async () => {
    setIsCategoriasLoading(true)
    try {
      const data = await getDocs(categoriasListaRef)
      const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}))
      setCategorias(filteredData)
      setIsCategoriasLoading(false)
    } catch(err){
      console.error(err)
      setIsCategoriasLoading(false)
    }
  }

  const getProdutos = async () => {
    setIsProdutosLoading(true)
    try {
      const data = await getDocs(produtosListaRef);
      const produtosObj = {};
      
      data.docs.forEach((doc) => {
        produtosObj[doc.id] = {
          ...doc.data(), 
          id: doc.id, 
          quantidade: 0, 
          adicionado: false
        };
      });

      setProdutos(produtosObj);
      setIsProdutosLoading(false)
    } catch(err){
      console.error(err)
      setIsProdutosLoading(false)

      // 💡 Verifica se é erro de conexão
      if (!navigator.onLine) {
        setError('Você está offline. Verifique sua conexão com a internet e tente novamente.');
      } else {
        setError('Ocorreu um erro ao carregar os produtos. Verifique se você tem permissão de acesso.');
      }
    }
  }

  const cadastrarProduto = useCallback(async (props, cadastrarDb) => {
    if(cadastrarDb){
      try{
        await addDoc(produtosListaRef, props)
        // Não busca do DB novamente
      } catch(err) {
        console.error(err)

        // 💡 Verifica se é erro de conexão
        if (!navigator.onLine) {
          setError('Você está offline. Verifique sua conexão com a internet e tente novamente.');
        } else {
          setError('Ocorreu um erro ao carregar os produtos. Verifique se você tem permissão de acesso.');
        }
      }
    }
    
    const newId = Date.now().toString();
    setProdutos(produce(draft => {
      draft[newId] = {
        ...props,
        id: newId,
        quantidade: 0,
        adicionado: false
      };
    }));
  }, []);

  // Funções otimizadas com Immer - SUPER RÁPIDO!
  const adicionarQuantidade = useCallback((idProduto) => {
    setProdutos(produce(draft => {
      if (draft[idProduto]) {
        draft[idProduto].quantidade += 1;
      }
    }));
  }, []);

  const reduzirQuantidade = useCallback((idProduto) => {
    setProdutos(produce(draft => {
      if (draft[idProduto] && draft[idProduto].quantidade > 0) {
        draft[idProduto].quantidade -= 1;
      }
    }));
  }, []);

  useEffect(() => {
    getCategorias();
    getProdutos();
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Converte produtos para array e memoriza
  const produtosArray = useMemo(() => Object.values(produtos), [produtos]);
  
  // Memoriza produtos com quantidade > 0
  const produtosComQuantidade = useMemo(() => 
    produtosArray.filter(p => p.quantidade > 0), 
    [produtosArray]
  );

  // Ordena categorias apenas uma vez
  const categoriasOrdenadas = useMemo(() => 
    [...categorias].sort((a, b) => a.nome.localeCompare(b.nome)),
    [categorias]
  );

  const isLoading = !isAuthReady || isCategoriasLoading || isProdutosLoading;

  if (isLoading) {
    return (<div><Sidebar /> <Loading /></div>);
  }

  if (!user) {
    return <Auth />;
  }


  return (
    <div className='NovaLista'>
      <Sidebar />
      {/* <CheckInternet /> */}
      
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
        {categoriasOrdenadas.map((categoria) => (
          <CategoriaSection
            key={categoria.id}
            categoria={categoria}
            produtos={produtosArray}
            onAdicionar={adicionarQuantidade}
            onReduzir={reduzirQuantidade}
            onCadastrarProduto={cadastrarProduto}
          />
        ))}

        <div>
          <ModalNovaListaDeCompras
            produtos={produtosComQuantidade}
            isOnline={isOnline}
          />
        </div>
      </div>
    </div>
  )
}

export default NovaLista