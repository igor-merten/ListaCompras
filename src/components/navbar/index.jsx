import React, { useState } from 'react';
import { auth } from '../../config/firebase'
import { signOut } from 'firebase/auth'
import {
  Box,
  Text,
  Flex,
  Button,
  Image,
  useBreakpointValue
} from '@chakra-ui/react';
import Logo from '../../assets/images/Logo.png'
import { LuListTodo } from "react-icons/lu";
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
      {/* ===== MOBILE HEADER ===== */}
      {isMobile ? (
        <>
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
            minH="80px"
          >
            <Box position="absolute" left="50%" transform="translateX(-50%)">
              <Image src={Logo} maxW="400px" w="200px" />
            </Box>

            <Button
              onClick={toggleSidebar}
              variant="ghost"
              fontSize="lg"
              p="2"
              position="absolute"
              right="4"
              _hover={{ bg: "gray.100", transform: "scale(1.05)" }}
              _active={{ transform: "scale(0.95)" }}
            >
              ☰
            </Button>
          </Box>

          {/* Overlay */}
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
            />
          )}

          {/* Sidebar */}
          <Box
            bg="white"
            w="250px"
            h="100dvh"
            position="fixed"
            right={isSidebarOpen ? "0" : "-250px"}
            top="0"
            borderLeft="1px solid"
            borderColor="gray.200"
            p="4"
            zIndex="1000"
            transition="right 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            boxShadow={isSidebarOpen ? "2xl" : "none"}
          >
            <Flex justify="space-between" align="center" mb="8">
              <Text fontSize="xl" fontWeight="bold" color="blue.600"></Text>
              <Button
                onClick={toggleSidebar}
                variant="ghost"
                fontSize="lg"
                p="2"
                _hover={{ bg: "red.50", color: "red.500", transform: "rotate(90deg)" }}
                _active={{ transform: "rotate(90deg) scale(0.9)" }}
              >
                ✕
              </Button>
            </Flex>

            {/* Menu Items */}
            <Box>
              <NavLink to="/">
                <MenuItem
                  label="Listas de compras"
                  icon={<LuListTodo />}
                  isActive={location.pathname === '/'}
                />
              </NavLink>
            </Box>

            {/* Logout */}
            <Box position="absolute" left="4" right="4" bottom="4">
              <Button width="100%" variant="outline" colorScheme="red" onClick={handleLogout}>
                Sair
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        /* ===== DESKTOP NAVBAR ===== */
        <Flex
          as="nav"
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          align="center"
          justify="space-between"
          p="4"
          position="fixed"
          top="0"
          left="0"
          right="0"
          zIndex="1000"
          boxShadow="sm"
        >
          {/* Logo */}
          <Flex align="center" gap="3">
            <Image src={Logo} w="140px" alt="Logo" />
          </Flex>

          {/* Menu horizontal */}
          <Flex align="center" gap="6">
            <NavLink to="/">
              <MenuItem
                label="Listas de compras"
                icon={<LuListTodo />}
                isActive={location.pathname === '/'}
              />
            </NavLink>

            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleLogout}
              size="sm"
            >
              Sair
            </Button>
          </Flex>
        </Flex>
      )}
    </>
  );
};

const MenuItem = ({ label, isActive, badge, icon }) => (
  <Flex
    align="center"
    gap="2"
    p="2"
    borderRadius="lg"
    cursor="pointer"
    bg={isActive ? 'blue.50' : 'transparent'}
    color={isActive ? 'blue.600' : 'gray.600'}
    fontWeight={isActive ? 'semibold' : 'medium'}
    _hover={{
      bg: 'gray.100',
      transform: "translateY(-1px)",
    }}
    transition="all 0.2s ease"
  >
    {icon && <Box>{icon}</Box>}
    <Text>{label}</Text>
    {badge && (
      <Box
        bg="blue.100"
        color="blue.600"
        px="2"
        py="1"
        borderRadius="full"
        fontSize="xs"
        fontWeight="bold"
      >
        {badge}
      </Box>
    )}
  </Flex>
);

export default Sidebar;
