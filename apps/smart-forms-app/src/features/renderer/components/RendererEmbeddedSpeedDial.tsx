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

import { SpeedDial, SpeedDialAction } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import useConfigStore from '../../../stores/useConfigStore.ts';
import useQuestionnaireStore from '../../../stores/useQuestionnaireStore.ts';
import cloneDeep from 'lodash.clonedeep';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../save/api/saveQr.ts';
import useQuestionnaireResponseStore from '../../../stores/useQuestionnaireResponseStore.ts';
import SaveIcon from '@mui/icons-material/Save';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useState } from 'react';
import RendererSaveAsFinalDialog from './RendererNav/SaveAsFinal/RendererSaveAsFinalDialog.tsx';
import HomeIcon from '@mui/icons-material/Home';
import GradingIcon from '@mui/icons-material/Grading';

interface RendererEmbeddedSpeedDialProps {
  isPopulating: boolean;
}

function RendererEmbeddedSpeedDial(props: RendererEmbeddedSpeedDialProps) {
  const { isPopulating } = props;

  const smartClient = useConfigStore((state) => state.smartClient);
  const patient = useConfigStore((state) => state.patient);
  const user = useConfigStore((state) => state.user);
  const launchQuestionnaire = useConfigStore((state) => state.launchQuestionnaire);

  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);
  const enableWhenIsActivated = useQuestionnaireStore((state) => state.enableWhenIsActivated);
  const enableWhenItems = useQuestionnaireStore((state) => state.enableWhenItems);
  const enableWhenExpressions = useQuestionnaireStore((state) => state.enableWhenExpressions);

  const updatableResponse = useQuestionnaireResponseStore((state) => state.updatableResponse);
  const saveResponse = useQuestionnaireResponseStore((state) => state.saveResponse);

  const [saveAsFinalDialogOpen, setSaveAsFinalDialogOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();
  const { closeSnackbar } = useSnackbar();

  function handlePreview() {
    if (location.pathname === '/renderer/preview') {
      navigate('/renderer');
    } else {
      navigate('/renderer/preview');
    }
  }

  function handleSaveAsDraft() {
    if (!(smartClient && patient && user)) {
      return;
    }

    let responseToSave = cloneDeep(updatableResponse);
    responseToSave = removeHiddenAnswers({
      questionnaire: sourceQuestionnaire,
      questionnaireResponse: responseToSave,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    });

    responseToSave.status = 'in-progress';
    saveQuestionnaireResponse(smartClient, patient, user, sourceQuestionnaire, responseToSave)
      .then((savedResponse) => {
        saveResponse(savedResponse);
        enqueueSnackbar('Response saved as draft', { variant: 'success' });
      })
      .catch((error) => {
        console.error(error);
        enqueueSnackbar('An error occurred while saving. Try again later.', {
          variant: 'error'
        });
      });
  }

  function handleSaveAsFinal() {
    if (smartClient) {
      setSaveAsFinalDialogOpen(true);
    }
  }

  const showSaveButtons = smartClient && sourceQuestionnaire.item;
  const launchQuestionnaireExists = !!launchQuestionnaire;

  if (isPopulating) {
    return null;
  }

  return (
    <>
      <SpeedDial
        ariaLabel="Form operations"
        sx={{
          position: 'fixed',
          bottom: 12,
          right: 8,
          '& .MuiFab-primary': { width: 46, height: 46 }
        }}
        icon={<BuildIcon />}>
        {launchQuestionnaireExists ? (
          <SpeedDialAction
            icon={<GradingIcon />}
            tooltipTitle="View Existing Responses"
            tooltipOpen
            onClick={() => {
              closeSnackbar();
              navigate('/dashboard/existing');
            }}
          />
        ) : (
          <SpeedDialAction
            icon={<HomeIcon />}
            tooltipTitle="Back to Home"
            tooltipOpen
            onClick={() => {
              closeSnackbar();
              navigate('/dashboard/questionnaires');
            }}
          />
        )}
        <SpeedDialAction
          icon={location.pathname === '/renderer/preview' ? <EditIcon /> : <VisibilityIcon />}
          tooltipTitle={location.pathname === '/renderer/preview' ? 'Editor' : 'Preview'}
          tooltipOpen
          onClick={handlePreview}
        />

        {showSaveButtons && (
          <SpeedDialAction
            icon={<SaveIcon />}
            tooltipTitle={'Save as Draft'}
            tooltipOpen
            onClick={handleSaveAsDraft}
          />
        )}

        {showSaveButtons && (
          <SpeedDialAction
            icon={<TaskAltIcon />}
            tooltipTitle={'Save as Final'}
            tooltipOpen
            onClick={handleSaveAsFinal}
          />
        )}
      </SpeedDial>
      <RendererSaveAsFinalDialog
        open={saveAsFinalDialogOpen}
        closeDialog={() => setSaveAsFinalDialogOpen(false)}
      />
    </>
  );
}

export default RendererEmbeddedSpeedDial;