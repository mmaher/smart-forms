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

import { Box, Typography } from '@mui/material';
import { StyledAlert } from '../StyledComponents/Nav.styles';

interface Props {
  message: string;
}
function NavErrorAlert(props: Props) {
  const { message } = props;

  return (
    <Box sx={{ px: 2.5, py: 10 }}>
      <StyledAlert color="error">
        <Typography variant="subtitle2">{message}</Typography>
      </StyledAlert>
    </Box>
  );
}

export default NavErrorAlert;