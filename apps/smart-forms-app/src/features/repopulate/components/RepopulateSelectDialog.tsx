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

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import {
  repopulate,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import RepopulateList from './RepopulateList.tsx';
import { useMemo, useState } from 'react';
import {
  filterCheckedItemsToRepopulate,
  getRepopulatedItemTuplesByHeadings
} from '../utils/repopulateSorting.ts';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';
import { useSnackbar } from 'notistack';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';
import { flushSync } from 'react-dom';

interface RepopulateSelectDialogProps {
  itemsToRepopulate: Record<string, ItemToRepopulate>;
  onCloseDialog: () => void;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RepopulateSelectDialog(props: RepopulateSelectDialogProps) {
  const { itemsToRepopulate, onCloseDialog, onSpinnerChange } = props;

  const updatePopulatedProperties = useQuestionnaireStore(
    (state) => state.updatePopulatedProperties
  );

  const setUpdatableResponseAsPopulated = useQuestionnaireResponseStore(
    (state) => state.setUpdatableResponseAsPopulated
  );

  const { linkIds, itemsToRepopulateTuplesByHeadings } = useMemo(
    () => getRepopulatedItemTuplesByHeadings(itemsToRepopulate),
    [itemsToRepopulate]
  );

  const [checkedLinkIds, setCheckedLinkIds] = useState<string[]>(linkIds);

  const { enqueueSnackbar } = useSnackbar();

  function handleCheckItem(linkId: string) {
    const currentIndex = checkedLinkIds.indexOf(linkId);
    const newCheckedIds = [...checkedLinkIds];

    if (currentIndex === -1) {
      newCheckedIds.push(linkId);
    } else {
      newCheckedIds.splice(currentIndex, 1);
    }

    setCheckedLinkIds(newCheckedIds);
  }

  function handleConfirmRepopulate() {
    const checkedRepopulatedItems = filterCheckedItemsToRepopulate(
      itemsToRepopulate,
      checkedLinkIds
    );

    flushSync(() => {
      onSpinnerChange({
        isSpinning: true,
        status: 'repopulate-write',
        message: 'Re-populating form...'
      });
    });

    const repopulatedResponse = repopulate(checkedRepopulatedItems);
    const updatedResponse = updatePopulatedProperties(repopulatedResponse, true);
    setUpdatableResponseAsPopulated(updatedResponse);

    onCloseDialog();
    enqueueSnackbar('Questionnaire form re-populated', {
      preventDuplicate: true,
      action: <CloseSnackbar />
    });
    onSpinnerChange({ isSpinning: false, status: 'repopulated', message: '' });
  }

  return (
    <Dialog open={true} onClose={onCloseDialog} maxWidth="xl">
      <DialogTitle variant="h5">Select items to be re-populated</DialogTitle>
      <DialogContent>
        <RepopulateList
          itemsToRepopulateTuplesByHeadings={itemsToRepopulateTuplesByHeadings}
          checkedLinkIds={checkedLinkIds}
          onCheckItem={(linkId) => handleCheckItem(linkId)}
        />
      </DialogContent>
      <DialogActions>
        <Typography fontSize={10} color="text.secondary" sx={{ mx: 1.5 }}>
          This is still an experimental feature, you might encounter bugs.
        </Typography>
        <Box flexGrow={1} />
        <Button onClick={onCloseDialog}>Cancel</Button>
        <Button onClick={() => handleConfirmRepopulate()}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RepopulateSelectDialog;
