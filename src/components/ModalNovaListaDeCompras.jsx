import {
  Field,
  Button,
  Dialog,
  Input,
  Portal,
  Stack,
  createOverlay,
  Group,
  RadioCard
} from "@chakra-ui/react"
import { LuPlus } from "react-icons/lu"
import { useState, useEffect } from "react"
import { getDocs, collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const contactDialog = createOverlay((props) => {
  const { produtos, ...rest } = props // ✅ Recebe produtos das props

  const [nomeNovaListaCompras, setNomeNovaListaCompras] = useState(new Date().toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  }).replace(/^\w/, (c) => c.toUpperCase())
  )
  const [listasCadastradas, setListasCadastradas] = useState([])

  const listasComprasRef = collection(db, 'ListasCompras');

  // Função para buscar listas
  const getListas = async () => {
    try {
      const data = await getDocs(listasComprasRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data()
      }));
      
      setListasCadastradas(filteredData);
      return filteredData;
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ✅ AGUARDA getListas terminar
    const listas = await getListas();
    
    // Agora você tem os dados e pode fazer suas checagens
    console.log('Dados recebidos:', listas);
    console.log('Produtos:', produtos); // ✅ produtos agora existe aqui

    listas.forEach(l => {
      console.log(l.nome)
    })

    // Verifica se o nome já existe e adiciona contador se necessário
    let nomeAtualizado = nomeNovaListaCompras.trim(); // Remove espaços em branco
    let count = 1;
    let novaLista = {}

    // Enquanto existir um nome igual, incrementa o contador
    while (listas.some(l => l.nome.toUpperCase() === nomeAtualizado.toUpperCase())) {
      count++;
      nomeAtualizado = `${nomeNovaListaCompras} (${count})`;
    }

    // Atualiza o estado
    novaLista.nome = nomeAtualizado;
    novaLista.produtos = produtos;
    novaLista.data = Date.parse(new Date())
    novaLista.concluida = false;

    console.log(novaLista)

    try{
      await addDoc(listasComprasRef, novaLista)

    } catch(err){
      console.error(err)
    }

    // Fecha o dialog
    props.onOpenChange?.({ open: false })

    // Limpa o campo
    setNomeNovaListaCompras("")
  }

  return (
    <Dialog.Root size={'xs'} {...rest}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <form onSubmit={handleSubmit}> {/* ✅ Sem parâmetros aqui */}
              <Dialog.Header>
                <Dialog.Title>Nova lista de compras</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Input
                    value={nomeNovaListaCompras}
                    onChange={(e) => setNomeNovaListaCompras(e.target.value)}
                    placeholder="Insira o nome da lista de compras"
                  />
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancelar</Button>
                </Dialog.ActionTrigger>
                <Button type="submit" colorPalette={'green'}>Cadastrar</Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
})


const ModalNovaListaDeCompras = ({ onSubmit, produtos }) => { // ✅ Recebe produtos
  return (
    <>
      <Button 
        onClick={() => {
          contactDialog.open("form", { 
            produtos: produtos, // ✅ Passa produtos pro dialog
            onSubmit: onSubmit  // ✅ Passa onSubmit do pai
          })
        }}
        variant="solid" 
        colorPalette="green" 
        size="sm" 
        my={'5'} 
        w={'100%'}
      >
        <LuPlus /> Cadastrar lista de compras
      </Button>
      <contactDialog.Viewport />
    </>
  )
}

export default ModalNovaListaDeCompras