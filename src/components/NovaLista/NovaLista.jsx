import { useEffect, useState } from 'react'
import '../../App.css'
import ModalNovoProduto from './ModalNovoProduto'
import Auth from '../auth'
import ModalNovaListaDeCompras from './ModalNovaListaDeCompras'
import Sidebar from '../navbar'
import Loading from '../Loading'

import { Table, Heading, Button, Grid, GridItem, VStack, Flex } from "@chakra-ui/react"
import { LuPlus, LuMinus  } from "react-icons/lu"


import { db, auth } from '../../config/firebase'
import { getDocs, collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'



function NovaLista() {

  // Estados para as categorias e produtos
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);

  // Referências para as coleções no Firebase
  const categoriasListaRef = collection(db, 'Categorias');
  const produtosListaRef = collection(db, 'Produtos');
  const listasComprasRef = collection(db, 'ListasCompras');

  // Função para buscar categorias
  const getCategorias = async () => {
    try {
      const data = await getDocs(categoriasListaRef)
      const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}))

      setCategorias(filteredData)
    } catch(err){
      console.error(err)
    }
  }

  // Função para buscar produtos
  const getProdutos = async () => {
    try {
      const data = await getDocs(produtosListaRef);
      const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id, quantidade: 0, adicionado: false}))

      setProdutos(filteredData)
    } catch(err){
      console.error(err)
    }
  }

  // Função para cadastrar produto
  const cadastrarProduto = async (props, cadastrarDb) => {

    if(cadastrarDb){
      try{
        await addDoc(produtosListaRef, props)

        getProdutos();
      } catch(err) {
        console.error(err)
      }
    }

    props.id = Date.now();
    setProdutos([...produtos, props])

  }

  // Função para adicionar quantidade de produto
  const adicionarQuantidade = (idProduto) => {
    const produtosAtualizados = produtos.map(p => p.id == idProduto ? 
      {...p, quantidade : p.quantidade + 1} :
      p
    )

    setProdutos(produtosAtualizados)
  }

  // Função para reduzir quantidade de produto
  const reduzirQuantidade = (idProduto) => {
    const produtosAtualizados = produtos.map(p => p.id == idProduto ? 
      {...p, quantidade : p.quantidade > 0 ? p.quantidade - 1 : p.quantidade} :
      p
    )

    setProdutos(produtosAtualizados)
  }
  
  // Função para deletar produto
  const deletarProduto = async(id) => {
    const produtoDoc = doc(db, 'Produtos', id);
    deleteDoc(produtoDoc)
    getProdutos();
  }

  // Função para atualizar produto
  const atualizarProduto = async(e, id) => {
    e.preventDefault();

    var produtoAtualizado = Object.fromEntries(new FormData(e.target));

    // return false;

    const produtoDoc = doc(db, 'Produtos', id);
    await updateDoc(produtoDoc, produtoAtualizado)
    getProdutos();
  }

  // Função para buscar categorias e produtos
  useEffect(() => {
    getCategorias();
    getProdutos();
  }, [])





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
    <div className='NovaLista'>
      <Sidebar />
      <div className='ContentApp'>
          {/* Lista de categorias e produtos */}
          {categorias
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((categoria) => {
            return (
              <div key={categoria.id}>
                {/* Título da categoria */}
                <Heading mt={'5'}>{categoria.nome}</Heading>
                {/* Tabela de produtos */}
                <Table.Root mt={'2'} key={categoria.id}>
                  <Table.Caption />
                  <Table.Body borderTopWidth="1px" key={categoria.id}>
                    {/* Lista de produtos */}
                    { produtos
                    .filter((produto) => produto.id_categoria == categoria.id)
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .map((produto) => {
                    return (
                      <Table.Row key={produto.id}>
                        <Table.Cell>
                          {produto.nome} 
                        </Table.Cell>
                        <Table.Cell textAlign="end" width={"200px"}>
                          <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(10, 1fr)" alignItems={'center'} gap={'1'}>
                            <GridItem colSpan={4}>
                              <Button size={'sm'} variant={'outline'} onClick={() => reduzirQuantidade(produto.id)}><LuMinus /></Button>
                            </GridItem>
                            <GridItem colSpan={2}>
                              {produto.quantidade}
                            </GridItem>
                            <GridItem colSpan={4}>
                              <Button size={'sm'} variant={'outline'} onClick={() => adicionarQuantidade(produto.id)}><LuPlus /></Button>
                            </GridItem>
                          </Grid>
                        </Table.Cell>
                      </Table.Row>
                    )})}
                  </Table.Body>
                </Table.Root>
                
                {/* Modal para cadastrar produto */}
                <div>
                  <ModalNovoProduto
                    id_categoria={categoria.id}
                    onSubmit={(dados, cadastrarDb) => {
                      cadastrarProduto(dados, cadastrarDb)
                    }}
                  />
                </div>
              </div>
            )
          })}

          {/* Modal para cadastrar lista de compras */}
          <div>
              <ModalNovaListaDeCompras
                produtos={produtos.filter(p => p.quantidade > 0)}
              />
          </div>
          
        </div>
      </div>
  )
}

export default NovaLista