import { useState } from 'react';
import { auth, googleProvider } from '../config/firebase'
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import Loading from './Loading';
import { FcGoogle } from "react-icons/fc";

import { Box, Button, Heading, Input, Stack, Text, Flex, Image } from '@chakra-ui/react'
import Logo from '../assets/images/Logo.png'

const Auth = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  // console.log(auth?.currentUser?.photoURL)

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const signIn = async () => {
    try{
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err){
      console.error(err)
    }
  };

  const signInWithGoogle = async () => {
    try{
      await signInWithPopup(auth, googleProvider);
    } catch (err){
      console.error(err)
    }
  };

  const logout = async() =>{
    try{
      await signOut(auth);
    } catch (err){
      console.error(err)
    }
  }

  const handleEmailPasswordSignIn = async () => {
    if (!email || !password) {
      setError('Informe email e senha.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged no App controla a navegação/render
    } catch (err) {
      setError('Falha ao entrar. Verifique suas credenciais.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Falha ao entrar com Google.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEmailPasswordSignIn();
    }
  };

  return (
    <div>
        <Box minH={'100vh'} display={'flex'} alignItems={'center'} justifyContent={'center'} bg={'gray.50'} p={'4'}>
          <Stack spacing={4}>
            {/* <Heading size={'md'} textAlign={'center'}>Entrar</Heading> */}

            {error && (
              <Box bg={'red.50'} color={'red.600'} p={'2'} borderRadius={'md'} border={'1px solid'} borderColor={'red.200'}>
                <Text fontSize={'sm'}>{error}</Text>
              </Box>
            )}

            

            <Box position="relative" left="50%" transform="translateX(-50%)">
              <Image src={Logo} maxW={"300px"} w={"100%"} />
            </Box>

            

            <Button
              onClick={handleGoogleSignIn}
              isDisabled={isSubmitting}
              variant="outline"
              w="100%"
              h="44px"
              justifyContent="center"
              border="1px solid"
              borderColor="gray.300"
              bg="white"
              _hover={{ bg: 'gray.50' }}
              _active={{ bg: 'gray.100' }}
              mt={10}
            >
              <Flex align="center" gap={2}>
                <FcGoogle size={20} />
                <Text fontWeight="medium" color="gray.700">
                  Entrar com Google
                </Text>
              </Flex>
            </Button>

          </Stack>
    </Box>
    </div>
  )
}

export default Auth