import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

export default function CenteredTabs(props) {

  const handleChange = (event, currentTabNumber) => {
    props.handleCurrentTabNumber(currentTabNumber); //redni broj taba koji se kliknut
  };

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper'}}>
        <Tabs value={props.currentTab} onChange={handleChange} centered >
            {props.tabs.map((tab, index) => {
              console.log("TAB", tab);
                //kreira tabove koji se nalaze u props.tabs (tabovi su stringovi)
                return <Tab label={tab[0]} icon={tab[1]} key={index} sx={{display: 'flex', flexDirection: 'row'}} />; 
            })}
        </Tabs>
    </Box>
  );
}