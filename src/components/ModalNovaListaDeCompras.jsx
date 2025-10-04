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
  import { LuPlus  } from "react-icons/lu"
  import { useState } from "react"
  import { getDocs, collection, doc } from 'firebase/firestore'
  import { db } from '../config/firebase'
  
  const contactDialog = createOverlay((props) => {
    const { ...rest } = props
  
    const [nomeNovaListaCompras, setNomeNovaListaCompras] = useState("")
    const [listasCadastradas, setListasCadastradas] = useState([])

    const listasComprasRef = collection(db, 'ListasCompras');

    const getListas = async () => {
        try {
            const data = await getDocs(listasComprasRef);

            setListasCadastradas(data)
        } catch (error) {
            console.error(error)
        }
    }
  
    const handleSubmit = (e, props) => {
      e.preventDefault()

      getListas()
        console.log(listasCadastradas)
      console.log(123)
      console.log(nomeNovaListaCompras)
  
      // Close dialog using injected `onOpenChange` prop
    //   props.onOpenChange?.({ open: false })
  
    //   setNomeListaCompras("")
    //   setCadastrarDb(true)
  
      // Envia apenas dados do cadastro e a flag separada como 2º argumento
    //   if (typeof props.onSubmit === "function") {
    //     props.onSubmit(
    //       { nome: NomeListaCompras, id_categoria: props.id_categoria },
    //       cadastrarDb
    //     )
    //   }
    }
  
    return (
      <Dialog.Root size={'xs'} {...rest}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <form onSubmit={e => handleSubmit(e, props)}>
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
  
  
  const ModalNovaListaDeCompras = ({ id_categoria, onSubmit }) => {
    return (
      <>
        <Button onClick={() => {
            contactDialog.open("form", { 
              id_categoria: id_categoria,  // Passando o valor para o dialog
              onSubmit: onSubmit
            })
          }}
          variant="solid" colorPalette="green" size="sm" my={'5'} w={'100%'}
        >
            <LuPlus /> Cadastrar lista de compras
        </Button>
        <contactDialog.Viewport />
      </>
    )
  }
  
  export default ModalNovaListaDeCompras