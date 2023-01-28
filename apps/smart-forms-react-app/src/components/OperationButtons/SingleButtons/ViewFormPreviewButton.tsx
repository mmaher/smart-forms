import React from 'react';
import { Box, ListItemButton, Tooltip, Typography } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import { SideBarIconButton } from '../../SideBar/SideBarBottom.styles';
import { SideBarContext } from '../../../custom-contexts/SideBarContext';

interface Props {
  isChip?: boolean;
  togglePreviewMode: () => unknown;
}

function ViewFormPreviewButton(props: Props) {
  const { isChip, togglePreviewMode } = props;
  const sideBar = React.useContext(SideBarContext);

  function handleClick() {
    togglePreviewMode();
  }

  const buttonTitle = 'View Preview';

  const renderButton = (
    <ListItemButton onClick={handleClick}>
      <Visibility sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            {buttonTitle}
          </Typography>
        }
      />
    </ListItemButton>
  );

  const renderChip = (
    <OperationChip
      icon={<Visibility fontSize="small" />}
      label={buttonTitle}
      clickable
      onClick={handleClick}
    />
  );

  const renderIconButton = (
    <Box sx={{ m: 0.5 }}>
      <Tooltip title={buttonTitle} placement="right">
        <span>
          <SideBarIconButton onClick={handleClick}>
            <Visibility />
          </SideBarIconButton>
        </span>
      </Tooltip>
    </Box>
  );

  return <>{isChip ? renderChip : sideBar.isExpanded ? renderButton : renderIconButton}</>;
}

export default ViewFormPreviewButton;
