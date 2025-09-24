import { useEffect, useState } from 'react'
import './App.css'

import Auth from './components/auth'
import { db } from './config/firebase'
import { getDocs, collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'


function App() {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const categoriasListaRef = collection(db, 'Categorias');
  const produtosListaRef = collection(db, 'Produtos')

  // const [atualizarProduto, setAtualizarProduto] = useState("");

  const getCategorias = async () => {
    try {
      const data = await getDocs(categoriasListaRef)
      const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}))

      setCategorias(filteredData)
    } catch(err){
      console.error(err)
    }
  }

  const getProdutos = async () => {
    try {
      const data = await getDocs(produtosListaRef);
      const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}))

      setProdutos(filteredData)
    } catch(err){
      console.error(err)
    }
  }

  const cadastrarProduto = async (e, idCategoria) => {
    // não permite que o formulario seja enviado da maneira tradicional
    e.preventDefault();

    // pega campos do formulário
    var novoProduto = Object.fromEntries(new FormData(e.target));
    novoProduto['id_categoria'] = idCategoria;

    try{
      await addDoc(produtosListaRef, novoProduto)

      getProdutos();
      // limpa form
      e.target.reset();
    } catch(err) {
      console.error(err)
    }

  }
  
  const deletarProduto = async(id) => {
    const produtoDoc = doc(db, 'Produtos', id);
    deleteDoc(produtoDoc)
    getProdutos();
  }

  const atualizarProduto = async(e, id) => {
    e.preventDefault();

    var produtoAtualizado = Object.fromEntries(new FormData(e.target));

    // return false;

    const produtoDoc = doc(db, 'Produtos', id);
    await updateDoc(produtoDoc, produtoAtualizado)
    getProdutos();
  }

  useEffect(() => {
    getCategorias();
    getProdutos();
  }, [])
  
  return (
    <div className='App'>
      <Auth />

      <div>
        {categorias
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((categoria) => {
          return (
            <div key={categoria.id}>
              <h1>{categoria.nome}</h1>
              {
                produtos
                .filter((produto) => produto.id_categoria == categoria.id)
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map((produto) => {
                  return (
                    <div key={produto.id} >
                      <div> 
                        {produto.nome} <button onClick={() => deletarProduto(produto.id)}>X</button> 
                        <form onSubmit={(e) => atualizarProduto(e, produto.id)}><input type="text" name='nome' /> <button>Atualizar</button></form>
                      </div>
                      
                    </div>
                  )
                })
              }

              <div>
                <form onSubmit={(e) => cadastrarProduto(e, categoria.id)}>
                  <input type="text" placeholder='Nome do produto' name='nome' />
                  <button>Enviar</button>
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
