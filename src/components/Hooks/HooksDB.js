import { useEffect, useState } from 'react';
import { db } from '../../config/firebase'
import { collection, getDocs, doc } from 'firebase/firestore';

export async function getListaCompras(data){
    const listasComprasRef = collection(db, 'ListasCompras');
    
    const dados = await getDocs(listasComprasRef);
    const dadosFiltrados = dados.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
    }));

    // console.log(data)
    // console.log(dadosFiltrados.find((l) => l.data == data))

    return dadosFiltrados.find((l) => l.data == data);
}

export async function getAllCategorias(){
    const categoriasListaRef = collection(db, 'Categorias');
    
    const dados = await getDocs(categoriasListaRef);
    const dadosFiltrados = dados.docs.map((doc) => ({...doc.data(), id: doc.id}));

    return dadosFiltrados;
}

export async function getAllProdutos(){
    const produtosListaRef = collection(db, 'Produtos');

    const dados = await getDocs(produtosListaRef)
    const dadosFiltrados = dados.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id, 
        quantidade: 0, 
        adicionado: false
    }))

    // console.log(dadosFiltrados)
    return dadosFiltrados;
}