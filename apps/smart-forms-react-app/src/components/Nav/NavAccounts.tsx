import { Box } from '@mui/material';
import { StyledAccount } from '../StyledComponents/Nav.styles';
import FaceIcon from '@mui/icons-material/Face';
import React, { useContext } from 'react';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { constructName } from '../../functions/LaunchContextFunctions';
import dayjs from 'dayjs';
import { AccountDetailsTypography, AccountNameTypography } from '../Misc/Typography';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useTheme } from '@mui/material/styles';

dayjs.extend(localizedFormat);

function NavAccounts() {
  const { patient } = useContext(LaunchContext);

  const theme = useTheme();

  return (
    <Box sx={{ my: 4, mx: 2.5 }}>
      <StyledAccount>
        <FaceIcon fontSize="large" sx={{ color: theme.palette.primary.dark }} />

        <Box sx={{ ml: 2 }}>
          <AccountNameTypography name={patient ? constructName(patient.name) : 'No Patient'} />
          {patient ? (
            <>
              <AccountDetailsTypography details={patient ? `${patient.gender}` : ''} />
              <AccountDetailsTypography
                details={patient ? dayjs(patient.birthDate).format('LL') : ''}
              />
            </>
          ) : null}
        </Box>
      </StyledAccount>
    </Box>
  );
}

export default NavAccounts;