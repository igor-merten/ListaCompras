import React from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import './index.css'

import App from './App.jsx'
import ListaCompras from './components/ListaCompras.jsx'
import NotFoundPage from './components/PaginaNaoEncontrada.jsx'
import NovaLista from './components/NovaLista/NovaLista.jsx'
import { Toaster } from './components/ui/toaster.jsx'

import {CheckInternet} from './components/CheckInternet.js'


import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />
  },
  {
    path: '/NovaLista',
    element: <NovaLista />,
    errorElement: <NotFoundPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }, 
  {
    path: '/Lista/:dataLista',
    element: <ListaCompras />,
    errorElement: <NotFoundPage />
  }
], {
  basename: import.meta.env.BASE_URL
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <Toaster />
      <CheckInternet />
      <RouterProvider router = {router} />
    </ChakraProvider>
  </React.StrictMode>
)