import React, { useState } from 'react';
import { auth } from '../../config/firebase'
import { signOut } from 'firebase/auth'
import {
  Box,
  Text,
  Flex,
  Button,
  Image
} from '@chakra-ui/react';
import Logo from '../../assets/images/Logo.png'
import { FaClipboardList } from "react-icons/fa";
import { LuShoppingCart, LuListTodo  } from "react-icons/lu";
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsSidebarOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Header - Sempre visível */}
      <Box
        bg="white"
        p="4"
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        w="100%"
        minH={'80px'}
      >
        <Box position="absolute" left="50%" transform="translateX(-50%)">
          <Image src={Logo} maxW={"400px"} w={"200px"} />
        </Box>
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          fontSize="lg"
          p="2"
          transition="all 0.2s ease"
          _hover={{ 
            bg: "gray.100",
            transform: "scale(1.05)" 
          }}
          _active={{ 
            transform: "scale(0.95)" 
          }}
          position="absolute"
          right="4"
        >
          ☰
        </Button>
      </Box>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex="999"
          onClick={toggleSidebar}
          animation="fadeIn 0.3s ease-out"
          sx={{
            "@keyframes fadeIn": {
              "0%": { opacity: 0 },
              "100%": { opacity: 1 }
            }
          }}
        />
      )}

      {/* Sidebar */}
      <Box
        bg="white"
        w="250px"
        h="100vh"
        position="fixed"
        right={isSidebarOpen ? "0" : "-250px"}
        top="0"
        borderLeft="1px solid"
        borderColor="gray.200"
        p="4"
        zIndex="1000"
        transition="right 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        boxShadow={isSidebarOpen ? "2xl" : { base: "none", md: "lg" }}
        overflow="hidden"
      >
        {/* Logo */}
        <Flex alignItems="center" justifyContent="space-between" mb="8">
          <Text fontSize="xl" fontWeight="bold" color="blue.600">
            
          </Text>
          {/* Close button */}
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            fontSize="lg"
            p="2"
            transition="all 0.2s ease"
            _hover={{ 
              bg: "red.50",
              color: "red.500",
              transform: "rotate(90deg)" 
            }}
            _active={{ 
              transform: "rotate(90deg) scale(0.9)" 
            }}
          >
            ✕
          </Button>
        </Flex>

        {/* Menu Items */}
        <Box>
          <NavLink to={'/'} 
          > 
            <MenuItem label="Listas de compras" icon={<LuListTodo  />} isActive={location.pathname === '/'} />
          </NavLink>
          {/* <NavLink label="Usuários" badge="12" icon={<FaClipboardList />} > </NavLink> */}
          {/* <NavLink to={'Produtos'}> 
            <MenuItem  label="Produtos" icon={<LuShoppingCart />} isActive={location.pathname === '/Produtos'} />
          </NavLink> */}
        </Box>
        {/* Logout button fixed at bottom */}
        <Box position="absolute" left="4" right="4" bottom="4">
          <Button
            width="100%"
            variant="outline"
            colorPalette="red"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </Box>
        
      </Box>
    </>
  );
};

const MenuItem = ({ label, isActive, badge, icon }) => {
  return (
    <Box
      p="3"
      mb="1"
      borderRadius="lg"
      cursor="pointer"
      bg={isActive ? 'blue.50' : 'transparent'}
      color={isActive ? 'blue.600' : 'gray.600'}
      _hover={{
        bg: isActive ? 'blue.50' : 'gray.100',
        transform: "translateX(-2px)",
        boxShadow: "md"
      }}
      transition="all 0.2s ease"
      transform="translateX(0)"
    >
      <Flex align="center" justify="space-between">
      <Flex align="center" gap="2">
          {icon && <Box>{icon}</Box>}
          <Text fontWeight={isActive ? 'semibold' : 'medium'}>
            {label}
          </Text>
        </Flex>
        {badge && (
          <Box
            bg="blue.100"
            color="blue.600"
            px="2"
            py="1"
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
            transition="all 0.2s ease"
            _hover={{
              transform: "scale(1.1)"
            }}
          >
            {badge}
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default Sidebar;