import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom'
import { Heading, Table, Flex, Button, Box } from "@chakra-ui/react";
import { LuPlus, LuMinus } from "react-icons/lu"

import { auth } from '../../config/firebase' // deveria sair
import { onAuthStateChanged } from 'firebase/auth' // deveria sair
import Auth from '../auth' //deveria sair

import Sidebar from "../navbar";
import Loading from "../Loading";
import { getListaCompras, getAllCategorias, getAllProdutos } from "../Hooks/HooksDB";


function onReduzir(idProduto){
    
}



function EditarLista(){
    const params = useParams();
    const [isCategoriasLoading, setIsCategoriasLoading] = useState(true);
    const [isListaLoading, setIsListaLoading] = useState(true);
    const [isProdutosLoading, setIsProdutosLoading] = useState(true);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [user, setUser] = useState(null);

    const [lista, setLista] = useState({ produtos: [] });
    const [produtosDB, setProdutosDB] = useState([])
    const [produtos, setProdutos] = useState({})
    const [categorias, setCategorias] = useState([]);

    const [listaFinal, setListaFinal] = useState([]);

    // Verifica se usuário está logado
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            console.log(currentUser)
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    // Função para buscar listas
    const getListaDB = async () => {
        setIsListaLoading(true)
        try {
            setLista(await getListaCompras(params.dataLista));
            setIsListaLoading(false)
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setIsListaLoading(false)
        }
    };

    // Função para buscar listas
    const getProdutosDB = async () => {
        setIsProdutosLoading(true)
        try {
            setProdutosDB(await getAllProdutos());
            setIsProdutosLoading(false)
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setIsProdutosLoading(false)
        }
    };

    // Buscar categorias
    const getCategorias = async () => {
        setIsCategoriasLoading(true)
        try {
            setCategorias(await getAllCategorias());
            setIsCategoriasLoading(false)
        } catch(error) {
            console.error('Erro ao buscar dados:', error);
            setIsCategoriasLoading(false)
        }
    }

    const adicionarQuantidade = (idProduto) => {
        const prod = listaFinal.find((e) => e.id == idProduto)
        prod.quantidade += 1;
        
        listaFinal.map((e) =>
            e.id === idProduto ? { ...e, quantidade: e.quantidade + 1 } : e
        );

        console.log(listaFinal)
      };

    // Função para buscar categorias e produtos
    useEffect(() => {
        getCategorias();
        getListaDB();
        getProdutosDB();
    }, [])

    // listaFinal = [
    //     ...(lista.produtos || []).map(itemLista => {
    //       const produtoBanco = produtosDB.find(p => p.id === itemLista.id);
    //       return produtoBanco ? { ...produtoBanco, ...itemLista } : { ...itemLista };
    //     }),
    //     ...produtosDB.filter(p => !(lista.produtos || []).some(le => le.id === p.id))
    // ];

    // const adicionarQuantidade = useCallback((idProduto) => {
    //     setProdutos(produce(draft => {
    //         if (draft[idProduto]) {
    //         draft[idProduto].quantidade += 1;
    //         }
    //     }));
    // }, []);

    // const reduzirQuantidade = useCallback((idProduto) => {
    //     setProdutos(produce(draft => {
    //         if (draft[idProduto] && draft[idProduto].quantidade > 0) {
    //         draft[idProduto].quantidade -= 1;
    //         }
    //     }));
    // }, []);

    const isLoading = !isAuthReady || isCategoriasLoading || isListaLoading || isProdutosLoading;

    // Enquanto está verificando a autenticação, mostra o Loading
    if (isLoading) {
        return (<div><Sidebar /> <Loading /></div>);
    }

    // Se NÃO estiver logado, mostra apenas o Auth
    if (!user) {
        return <Auth />;
    }

    return (
        <div className="EditaLista">
            <Sidebar />
            <div className="ContentApp">
                {categorias
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .map((categoria) => (
                        <div key={categoria.id}> 
                        <Heading size={'2xl'} mt={'5'}>{categoria.nome}</Heading>
                        <Table.Root mt={'2'}>
                            <Table.Caption />
                            <Table.Body borderTopWidth="1px">
                                {listaFinal
                                    .filter((produto) => produto.id_categoria === categoria.id)
                                    .sort((a, b) => a.nome.localeCompare(b.nome))
                                    .map((produto) => (
                                        <Table.Row key={produto.id}>
                                        <Table.Cell fontSize="lg" py={8} px={0}>
                                            {produto.nome}
                                        </Table.Cell>

                                        <Table.Cell textAlign="end" width="150px" px={0}>
                                            <Flex align="center" justify="center" gap={1}>
                                            <Button
                                                size="md"
                                                variant="outline"
                                                onClick={() => adicionarQuantidade(produto.id)}
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
                                ))}
                            </Table.Body>
                        </Table.Root>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default EditarLista