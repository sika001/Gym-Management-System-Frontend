
import { Box, CircularProgress } from '@mui/material';

function Loader() {
    
    return (
        <>
            {
                <Box sx={{ position: 'absolute', margin: '40%', marginTop: '30%', zIndex: 100, width: 100, height: 100 }}>
                    <CircularProgress variant="indeterminate" color='success' disableShrink /> 
                    {/* disableShrink je potreban kad krene da se gubi loader animacija zbog opterećenosti */}
                </Box>
            }
        </>
    )
}

export default Loader;