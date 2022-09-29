import React from 'react';
import { Stack, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
import { PatientData } from './Interfaces';
import NavBarGenderIcon from './NavBarGenderIcon';

interface Props {
  patientData: PatientData;
}

function NavBarPatientData(props: Props) {
  const { patientData } = props;

  if (patientData.patientName === '') {
    return (
      <Stack direction={'row'} spacing={1}>
        <AccountCircleIcon />
        <Typography>No Patient</Typography>
      </Stack>
    );
  } else {
    return (
      <Stack direction={'row'} spacing={4}>
        <Stack direction={'row'} spacing={1}>
          <AccountCircleIcon />
          <Typography>{patientData.patientName}</Typography>
        </Stack>
        <Stack direction={'row'} spacing={1}>
          <NavBarGenderIcon gender={patientData.gender} />
          <Typography sx={{ textTransform: 'capitalize' }}>{patientData.gender}</Typography>
        </Stack>
        <Stack direction={'row'} spacing={1}>
          <EventIcon />
          <Typography>{patientData.dateOfBirth}</Typography>
        </Stack>
      </Stack>
    );
  }
}

export default NavBarPatientData;