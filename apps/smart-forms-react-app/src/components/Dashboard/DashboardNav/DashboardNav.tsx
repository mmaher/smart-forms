import React, { useContext } from 'react';
import { Box, Drawer } from '@mui/material';
import useResponsive from '../../../custom-hooks/useResponsive';
import Logo from '../../Misc/Logo';
import Scrollbar from '../../Scrollbar/Scrollbar';
import NavSection from './DashboardNavSection';
import { NAV_WIDTH } from '../../StyledComponents/Nav.styles';
import NavAccounts from '../../Nav/NavAccounts';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
import NavErrorAlert from '../../Nav/NavErrorAlert';
import CsiroLogo from '../../Misc/CsiroLogo';

interface Props {
  openNav: boolean;
  onCloseNav: () => void;
}

export default function DashboardNav(props: Props) {
  const { openNav, onCloseNav } = props;

  const { fhirClient } = useContext(LaunchContext);

  const isDesktop = useResponsive('up', 'lg');

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' }
      }}>
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Logo />
      </Box>

      <NavAccounts />

      <NavSection />

      <Box sx={{ flexGrow: 1 }} />

      {!fhirClient ? (
        <NavErrorAlert
          message={'Viewing responses are disabled when app is not launched from a CMS'}
        />
      ) : null}

      <Box sx={{ px: 2.5, pb: 2 }}>
        <CsiroLogo />
      </Box>
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH }
      }}>
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed'
            }
          }}>
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH }
          }}>
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
