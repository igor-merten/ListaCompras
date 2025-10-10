import {
  Field,
  Button,
  Dialog,
  Input,
  Portal,
  Stack,
  createOverlay,
  Group,
  RadioCard,
  Box,
  Text
} from "@chakra-ui/react"
import { LuPlus, LuCheck } from "react-icons/lu"
import { useState, useEffect } from "react"
import { getDocs, collection, addDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useNavigate } from "react-router-dom"
import Loading from "../Loading"
import { useStatusInternet } from '../CheckInternet'

const contactDialog = createOverlay((props) => {
  const isOnline = useStatusInternet();
  const { produtos, ...rest } = props
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false)
  const [erroNome, setErroNome] = useState("")

  const [nomeNovaListaCompras, setNomeNovaListaCompras] = useState(new Date().toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  }).replace(/^\w/, (c) => c.toUpperCase())
  )

  const listasComprasRef = collection(db, 'ListasCompras');

  // ✅ Função com timeout de 10 segundos
  const getListas = async () => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), 10000)
    );

    try {
      const data = await Promise.race([
        getDocs(listasComprasRef),
        timeoutPromise
      ]);
      
      const filteredData = data.docs.map((doc) => ({
        ...doc.data()
      }));
      
      return filteredData;
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)

    try {
      if(nomeNovaListaCompras.trim() == ""){
        setErroNome("Por favor, insira o nome da lista de compras.")
        return;
      }

      setErroNome("")

      // ✅ Busca listas com timeout
      const listas = await getListas();
      
      // Verifica se o nome já existe e adiciona contador se necessário
      let nomeAtualizado = nomeNovaListaCompras.trim();
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

      // ✅ Timeout também no addDoc (10 segundos)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 10000)
      );

      await Promise.race([
        addDoc(listasComprasRef, novaLista),
        timeoutPromise
      ]);

      // ✅ Sucesso! Navega e fecha
      navigate('/') 
      props.onOpenChange?.({ open: false });
      setNomeNovaListaCompras("");

    } catch(err) {
      console.error(err)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Dialog.Root size={'xs'} {...rest}>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.300" />
        <Dialog.Positioner>
          <Dialog.Content>
            {carregando && <Loading />}
            <form onSubmit={handleSubmit}>
              <Dialog.Header>
                <Dialog.Title>Nova lista de compras</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root invalid={!!erroNome}>
                    <Input
                      value={nomeNovaListaCompras}
                      onChange={(e) => setNomeNovaListaCompras(e.target.value)}
                      placeholder="Insira o nome da lista de compras"
                      fontSize="16px"
                    />
                    {erroNome && (
                      <Field.ErrorText>{erroNome}</Field.ErrorText>
                    )}
                  </Field.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancelar</Button>
                </Dialog.ActionTrigger>
                <Button type="submit" colorPalette={'green'} disabled={!isOnline}>
                  Cadastrar
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
})


const ModalNovaListaDeCompras = ({ onSubmit, produtos, isOnline }) => {
  return (
    <>
      <Button 
        onClick={() => {
          contactDialog.open("form", { 
            produtos: produtos,
            onSubmit: onSubmit
          })
        }}
        variant="solid" 
        colorPalette="green" 
        size="lg" 
        my={'5'} 
        w={'100%'}
        disabled={!isOnline}
      >
        <LuCheck /> Cadastrar lista de compras
      </Button>
      <contactDialog.Viewport />
    </>
  )
}

export default ModalNovaListaDeCompras