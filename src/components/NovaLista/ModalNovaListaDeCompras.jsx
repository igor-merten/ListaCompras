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

const contactDialog = createOverlay((props) => {
  const { produtos, ...rest } = props
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false)

  const [nomeNovaListaCompras, setNomeNovaListaCompras] = useState(new Date().toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  }).replace(/^\w/, (c) => c.toUpperCase())
  )

  const [error, setError] = useState(null)

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
      
      // ✅ Tratamento de erro melhorado
      if (!navigator.onLine || error.message === 'timeout') {
        throw new Error('offline');
      }
      
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)
    setError(null) // ✅ Limpa erro anterior

    try {
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

      // ✅ Mensagens de erro padronizadas
      if (err.message === 'offline' || !navigator.onLine || err.message === 'timeout') {
        setError('Você está offline. Por favor, verifique sua conexão com a internet.');
      } else {
        setError('Ocorreu um erro ao cadastrar a lista. Verifique se você tem permissão de acesso e tente novamente em instantes.');
      }
    } finally {
      setCarregando(false)
    }
  }

  // ✅ Listeners de conexão
  useEffect(() => {
    const handleOffline = () => {
      setError('Você está offline. Por favor, verifique sua conexão com a internet.');
    };

    const handleOnline = () => {
      setError(null);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // ✅ Verifica imediatamente ao abrir o modal
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <Dialog.Root size={'xs'} {...rest}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            {carregando && <Loading />}
            <form onSubmit={handleSubmit}>
              <Dialog.Header>
                <Dialog.Title>Nova lista de compras</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  {error && (
                    <Box
                      bg="red.50"
                      border="1px solid"
                      borderColor="red.200"
                      color="red.700"
                      p="2"
                      borderRadius="md"
                    >
                      <Text fontSize="sm">{error}</Text>
                    </Box>
                  )}
                  <Input
                    value={nomeNovaListaCompras}
                    onChange={(e) => setNomeNovaListaCompras(e.target.value)}
                    placeholder="Insira o nome da lista de compras"
                    fontSize="16px"
                  />
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancelar</Button>
                </Dialog.ActionTrigger>
                <Button type="submit" colorPalette={'green'} disabled={carregando}>
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


const ModalNovaListaDeCompras = ({ onSubmit, produtos }) => {
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
      >
        <LuCheck /> Cadastrar lista de compras
      </Button>
      <contactDialog.Viewport />
    </>
  )
}

export default ModalNovaListaDeCompras