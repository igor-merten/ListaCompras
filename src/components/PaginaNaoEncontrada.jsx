import { Link } from 'react-router-dom'

function NotFoundPage() {
    return (
        <div>
            404 - Página não encontrada
            <Box mt={'5'}>
                <Link to="/"> Ir para página principal </Link>
            </Box>
        </div>
    )
}

export default NotFoundPage