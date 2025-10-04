import {
  Button,
  Dialog,
  Input,
  Portal,
  Stack,
  createOverlay,
  Group,
  RadioCard
} from "@chakra-ui/react"
import { LuCirclePlus  } from "react-icons/lu"
import { useState } from "react"

const contactDialog = createOverlay((props) => {
  const { ...rest } = props

  const [name, setName] = useState("")
  const [cadastrarDb, setCadastrarDb] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()

    // Close dialog using injected `onOpenChange` prop
    props.onOpenChange?.({ open: false })

    setName("")
    setCadastrarDb(true)

    // Envia apenas dados do cadastro e a flag separada como 2º argumento
    if (typeof props.onSubmit === "function") {
      props.onSubmit(
        { nome: name, id_categoria: props.id_categoria },
        cadastrarDb
      )
    }
  }

  return (
    <Dialog.Root size={'xs'} {...rest}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <form onSubmit={e => handleSubmit(e, props)}>
                <Dialog.Header>
                  <Dialog.Title>Novo Produto</Dialog.Title>
                </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Insira o nome do produto"
                  />
                </Stack>
                {/* Radio para saber se produto deve ser mostrado em todas as listas */}
                <RadioCard.Root maxW="sm" variant={'outline'} colorPalette="teal" defaultValue="true" mt={'5'} mb={'0'}>
                  <RadioCard.Label>Mostrar produto em todas as listas?</RadioCard.Label>
                  <Group attached orientation="vertical" mt={'0'}>    
                      <RadioCard.Item key="true" value="true" width="full">
                        <RadioCard.ItemHiddenInput />
                        <RadioCard.ItemControl onClick={() => setCadastrarDb(true)}>
                          <RadioCard.ItemIndicator />
                          <RadioCard.ItemContent>
                            <RadioCard.ItemText>Todas</RadioCard.ItemText>
                            <RadioCard.ItemDescription>
                              Mostrar produto nas próximas listas
                            </RadioCard.ItemDescription>
                          </RadioCard.ItemContent>
                        </RadioCard.ItemControl>
                      </RadioCard.Item>

                      <RadioCard.Item key="false" value="false" width="full">
                        <RadioCard.ItemHiddenInput />
                        <RadioCard.ItemControl onClick={() => setCadastrarDb(false)}>
                          <RadioCard.ItemIndicator />
                          <RadioCard.ItemContent>
                            <RadioCard.ItemText>Apenas atual</RadioCard.ItemText>
                            <RadioCard.ItemDescription>
                              Mostrar produto apenas nessa lista, sem necessidade para futuras listas
                            </RadioCard.ItemDescription>
                          </RadioCard.ItemContent>
                        </RadioCard.ItemControl>
                      </RadioCard.Item>
                  </Group>
                </RadioCard.Root>
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


const ModalNovoProduto = ({ id_categoria, onSubmit }) => {
  return (
    <>
      <Button
        onClick={() => {
          contactDialog.open("form", { 
            id_categoria: id_categoria,  // Passando o valor para o dialog
            onSubmit: onSubmit
          })
        }}
        width={'100%'}
        variant="plain"
        color="green.500"
        size={'sm'}
      >
        <LuCirclePlus  /> Novo Produto
      </Button>
      <contactDialog.Viewport />
    </>
  )
}

export default ModalNovoProduto