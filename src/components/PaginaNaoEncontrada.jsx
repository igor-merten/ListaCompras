import { Link } from 'react-router-dom'
// import { Box } from 'chakra-ui/react'

function NotFoundPage() {
    return (
        <div>
            404 - Página não encontrada
            {/* <Box mt={'5'}> */}
                <Link to="/"> Ir para página principal </Link>
            {/* </Box> */}
        </div>
    )
}

export default NotFoundPage