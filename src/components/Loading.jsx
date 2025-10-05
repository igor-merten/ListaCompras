import { Box, AbsoluteCenter, Spinner } from "@chakra-ui/react";

function Loading () {
    return(
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          bg="rgba(255, 255, 255, 0.5)"
          zIndex={9999}
        >
          <AbsoluteCenter axis="both">
            <Spinner size="lg" color="green.600" />
          </AbsoluteCenter>
        </Box>
    )
}

export default Loading;