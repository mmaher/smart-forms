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

import type { MutableRefObject } from 'react';
import React, { createContext, useState } from 'react';
import { Main, StyledRoot } from '../StyledComponents/Layout.styles';
import { Outlet } from 'react-router-dom';
import BackToTopButton from '../Misc/BackToTopButton';
import { Fab } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ViewerHeader from './ViewerHeader';
import ViewerNav from './ViewerNav/ViewerNav';
import type { PrintComponentRefContextType } from '../../interfaces/ContextTypes';

export const PrintComponentRefContext = createContext<PrintComponentRefContextType>({
  componentRef: null,
  setComponentRef: () => void 0
});

function ViewerLayout() {
  const [open, setOpen] = useState(false);

  const [componentRef, setComponentRef] = useState<MutableRefObject<null> | null>(null);

  return (
    <PrintComponentRefContext.Provider value={{ componentRef, setComponentRef }}>
      <StyledRoot>
        <ViewerHeader onOpenNav={() => setOpen(true)} />
        <ViewerNav openNav={open} onCloseNav={() => setOpen(false)} />

        <Main>
          <Outlet />
        </Main>
        <BackToTopButton>
          <Fab size="medium" sx={{ backgroundColor: 'pale.primary' }}>
            <KeyboardArrowUpIcon />
          </Fab>
        </BackToTopButton>
      </StyledRoot>
    </PrintComponentRefContext.Provider>
  );
}

export default ViewerLayout;
