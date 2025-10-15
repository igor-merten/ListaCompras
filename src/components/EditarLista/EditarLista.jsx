import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Text } from "@chakra-ui/react";

import { db, auth } from '../../config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {getDocs, collection, doc} from 'firebase/firestore'

import Sidebar from "../navbar";
import Loading from "../Loading";


function EditarLista(){
    const params = useParams();
    const [error, setError] = useState(null)
    const [isCategoriasLoading, setIsCategoriasLoading] = useState(true);
    const [isListaLoading, setIsListaLoading] = useState(true);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [user, setUser] = useState(null);

    const [lista, setLista] = useState([])
    const [categorias, setCategorias] = useState([])

    const listasComprasRef = collection(db, 'ListasCompras');
    const categoriasListaRef = collection(db, 'Categorias');

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

    return (
        <div className="EditaLista">
            <Sidebar />
            <div className="ContentApp">
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
                {params.dataLista}

            </div>
        </div>
    )
}

export default EditarLista