/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ListItemButton, ListItemText, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { StyledNavItemIcon } from '../../../../components/Nav/Nav.styles.ts';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import { SelectedQuestionnaireContext } from '../../contexts/SelectedQuestionnaireContext.tsx';

export interface DashboardNavItemProps {
  title: string;
  path: string;
  icon: ReactNode;
  disabled?: boolean;
  onCloseNav: () => void;
}

function DashboardNavItem(props: DashboardNavItemProps) {
  const { title, path, icon, disabled, onCloseNav } = props;

  const { setSelectedQuestionnaire } = useContext(SelectedQuestionnaireContext);
  const theme = useTheme();

  return (
    <ListItemButton
      component={NavLink}
      to={path}
      disableGutters
      disabled={disabled}
      data-test="list-button-dashboard-nav-page"
      onClick={() => {
        setSelectedQuestionnaire(null);
        onCloseNav();
      }}
      sx={{
        ...theme.typography.subtitle2,
        height: 48,
        textTransform: 'capitalize',
        color: theme.palette.text.secondary,
        borderRadius: Number(theme.shape.borderRadius) * 0.2,

        '&.active': {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.action.selected,
          fontWeight: theme.typography.fontWeightBold,
          '& .MuiListItemIcon-root': {
            color: theme.palette.primary.dark
          }
        }
      }}>
      <StyledNavItemIcon>{icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />
    </ListItemButton>
  );
}

export default DashboardNavItem;
