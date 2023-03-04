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

import React, { memo, useState } from 'react';
import { Grid } from '@mui/material';
import { QItemChoiceOrientation } from '../../../../interfaces/Enums';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createEmptyQrItem } from '../../../../functions/QrItemFunctions';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../interfaces/Interfaces';
import { getOpenLabelText } from '../../../../functions/ItemControlFunctions';
import { QRadioGroup } from '../../../StyledComponents/Item.styles';
import QItemDisplayInstructions from '../QItemSimple/QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { getOldOpenLabelAnswer } from '../../../../functions/OpenChoiceFunctions';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';
import QItemChoiceRadioSingle from '../QItemChoice/QItemChoiceRadioSingle';
import { findInAnswerOptions, getQrChoiceValue } from '../../../../functions/ChoiceFunctions';
import QItemRadioButtonWithOpenLabel from '../QItemParts/QItemRadioButtonWithOpenLabel';

interface QItemOpenChoiceRadioProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemOpenChoiceRadioAnswerOption(props: QItemOpenChoiceRadioProps) {
  const { qItem, qrItem, onQrItemChange, orientation } = props;

  const qrOpenChoiceRadio = qrItem ? qrItem : createEmptyQrItem(qItem);
  let valueRadio: string | null = getQrChoiceValue(qrOpenChoiceRadio, true);

  // initialisation for empty open label
  const answers = qrOpenChoiceRadio['answer'] ? qrOpenChoiceRadio['answer'] : [];
  const answerOptions = qItem.answerOption;

  const openLabelText = getOpenLabelText(qItem);

  let initialOpenLabelValue = '';
  let initialOpenLabelSelected = false;
  if (answerOptions) {
    const oldLabelAnswer = getOldOpenLabelAnswer(answers, answerOptions);
    if (oldLabelAnswer && oldLabelAnswer.valueString) {
      initialOpenLabelValue = oldLabelAnswer.valueString;
      initialOpenLabelSelected = true;
      valueRadio = initialOpenLabelValue;
    }
  }

  const [openLabelValue, setOpenLabelValue] = useState<string | null>(initialOpenLabelValue);
  const [openLabelSelected, setOpenLabelSelected] = useState(initialOpenLabelSelected);

  // Allow open label to remain selected even if its input was cleared
  if (openLabelSelected && valueRadio === null) {
    valueRadio = '';
  }

  function handleValueChange(
    changedOptionValue: string | null,
    changedOpenLabelValue: string | null
  ) {
    if (!answerOptions) return null;

    if (changedOptionValue !== null) {
      if (qItem.answerOption) {
        const qrAnswer = findInAnswerOptions(qItem.answerOption, changedOptionValue);

        // If selected answer can be found in options, it is a non-open label selection
        if (qrAnswer) {
          onQrItemChange({ ...createEmptyQrItem(qItem), answer: [qrAnswer] });
          setOpenLabelSelected(false);
        } else {
          // Otherwise, it is an open-label selection
          onQrItemChange({
            ...createEmptyQrItem(qItem),
            answer: [{ valueString: changedOptionValue }]
          });
          setOpenLabelValue(changedOptionValue);
          setOpenLabelSelected(true);
        }
      }
    }

    if (changedOpenLabelValue !== null) {
      setOpenLabelValue(changedOpenLabelValue);

      if (changedOpenLabelValue === '') {
        onQrItemChange(createEmptyQrItem(qItem));
      } else {
        setOpenLabelValue(changedOpenLabelValue);
        onQrItemChange({
          ...createEmptyQrItem(qItem),
          answer: [{ valueString: changedOpenLabelValue }]
        });
      }
    }
  }

  const openChoiceRadio = (
    <QRadioGroup
      row={orientation === QItemChoiceOrientation.Horizontal}
      name={qItem.text}
      id={qItem.id}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleValueChange(e.target.value, null)}
      value={valueRadio}
      data-test="q-item-radio-group">
      {qItem.answerOption?.map((option) => {
        if (option['valueCoding']) {
          return (
            <QItemChoiceRadioSingle
              key={option.valueCoding.code ?? ''}
              value={option.valueCoding.code ?? ''}
              label={option.valueCoding.display ?? `${option.valueCoding.code}`}
            />
          );
        } else if (option['valueString']) {
          return (
            <QItemChoiceRadioSingle
              key={option.valueString}
              value={option.valueString}
              label={option.valueString}
            />
          );
        } else if (option['valueInteger']) {
          return (
            <QItemChoiceRadioSingle
              key={option.valueInteger}
              value={option.valueInteger.toString()}
              label={option.valueInteger.toString()}
            />
          );
        } else {
          return null;
        }
      })}

      {openLabelText ? (
        <QItemRadioButtonWithOpenLabel
          value={openLabelValue}
          label={openLabelText}
          isSelected={openLabelSelected}
          onInputChange={(input) => handleValueChange(null, input)}
        />
      ) : null}
    </QRadioGroup>
  );

  return (
    <FullWidthFormComponentBox data-test="q-item-open-choice-radio-answer-option-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {openChoiceRadio}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
}

export default memo(QItemOpenChoiceRadioAnswerOption);
