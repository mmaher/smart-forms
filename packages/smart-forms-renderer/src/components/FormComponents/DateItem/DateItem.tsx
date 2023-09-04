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

import React from 'react';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import DateField from './DateField';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface DateItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function DateItem(props: DateItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  // Get additional rendering extensions
  const { displayPrompt, displayInstructions, readOnly, entryFormat } =
    useRenderingExtensions(qItem);

  // Init input value
  let dateString: string | null = null;

  if (qrItem?.answer) {
    if (qrItem?.answer[0].valueDate) {
      dateString = qrItem.answer[0].valueDate;
    } else if (qrItem?.answer[0].valueDateTime) {
      dateString = qrItem.answer[0].valueDateTime;
    }
  }

  const dateDayJs = dateString ? dayjs(dateString) : null;

  // Event handlers
  function handleDateChange(newValue: Dayjs | null) {
    const emptyQrItem = createEmptyQrItem(qItem);
    if (newValue) {
      onQrItemChange({ ...emptyQrItem, answer: [{ valueDate: newValue.format('YYYY-MM-DD') }] });
    } else {
      onQrItemChange(emptyQrItem);
    }
  }

  if (isRepeated) {
    return (
      <DateField
        value={dateDayJs}
        displayPrompt={displayPrompt}
        entryFormat={entryFormat}
        readOnly={readOnly}
        onDateChange={handleDateChange}
        isTabled={isTabled}
      />
    );
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-date-box">
      <ItemFieldGrid qItem={qItem} displayInstructions={displayInstructions}>
        <DateField
          value={dateDayJs}
          displayPrompt={displayPrompt}
          entryFormat={entryFormat}
          readOnly={readOnly}
          onDateChange={handleDateChange}
          isTabled={isTabled}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default DateItem;
