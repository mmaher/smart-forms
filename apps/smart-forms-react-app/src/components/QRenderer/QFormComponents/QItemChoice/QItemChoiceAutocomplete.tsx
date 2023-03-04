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

import type { SyntheticEvent } from 'react';
import React, { memo, useState } from 'react';
import { Autocomplete, CircularProgress, Fade, Grid, Tooltip } from '@mui/material';
import type { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';

import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { createEmptyQrItem } from '../../../../functions/QrItemFunctions';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { StandardTextField } from '../../../StyledComponents/Textfield.styles';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';
import SearchIcon from '@mui/icons-material/Search';
import useDebounce from '../../../../custom-hooks/useDebounce';
import useOntoserverQuery from '../../../../custom-hooks/useOntoserverQuery';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceAutocomplete(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;
  const qrChoice = qrItem ?? createEmptyQrItem(qItem);

  let valueCoding: Coding | undefined;
  if (qrChoice['answer']) {
    valueCoding = qrChoice['answer'][0].valueCoding;
  }

  const answerValueSetUrl = qItem.answerValueSet;
  const maxList = 10;

  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, 200);

  const { options, loading, feedback } = useOntoserverQuery(
    answerValueSetUrl,
    maxList,
    input,
    debouncedInput
  );

  if (!answerValueSetUrl) return null;

  function handleValueChange(event: SyntheticEvent<Element, Event>, newValue: Coding | null) {
    if (newValue === null) {
      setInput('');
      onQrItemChange(createEmptyQrItem(qItem));
      return;
    }

    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: [{ valueCoding: newValue }]
    });
  }

  const choiceAutocomplete = (
    <>
      <Autocomplete
        id={qItem.id}
        value={valueCoding ?? null}
        options={options}
        getOptionLabel={(option) => `${option.display}`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={loading}
        loadingText={'Fetching results...'}
        clearOnEscape
        autoHighlight
        fullWidth
        onChange={handleValueChange}
        filterOptions={(x) => x}
        renderInput={(params) => (
          <StandardTextField
            {...params}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            isTabled={isTabled}
            InputProps={{
              ...params.InputProps,

              startAdornment: (
                <>
                  {!valueCoding ? <SearchIcon fontSize="small" sx={{ ml: 0.5 }} /> : null}
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : feedback ? (
                    <Fade in={!!feedback} timeout={300}>
                      <Tooltip title={feedback.message} arrow sx={{ ml: 1 }}>
                        {
                          {
                            info: <InfoIcon fontSize="small" color="info" />,
                            warning: <WarningAmberIcon fontSize="small" color="warning" />,
                            success: <DoneIcon fontSize="small" color="success" />,
                            error: <ErrorIcon fontSize="small" color="error" />
                          }[feedback.color]
                        }
                      </Tooltip>
                    </Fade>
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />
    </>
  );

  const renderQItemChoiceAutocomplete = isRepeated ? (
    <>{choiceAutocomplete}</>
  ) : (
    <FullWidthFormComponentBox>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {choiceAutocomplete}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemChoiceAutocomplete}</>;
}

export default memo(QItemChoiceAutocomplete);
