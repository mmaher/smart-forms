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
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import Slider from '@mui/material/Slider';
import { getSliderMarks } from '../../../utils/slider';

interface SliderFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  value: number;
  minValue: number;
  minLabel: string;
  maxValue: number;
  maxLabel: string;
  stepValue: number;
  readOnly: boolean;
  onValueChange: (newValue: number) => void;
}

function SliderField(props: SliderFieldProps) {
  const {
    linkId,
    value,
    minValue,
    maxValue,
    stepValue,
    minLabel,
    maxLabel,
    readOnly,
    isTabled,
    onValueChange
  } = props;

  const sliderMarks = getSliderMarks(minValue, maxValue, minLabel, maxLabel, stepValue);

  return (
    <Slider
      id={linkId}
      value={value}
      min={minValue}
      max={maxValue}
      step={stepValue}
      marks={sliderMarks}
      sx={{
        maxWidth: !isTabled ? 280 : 3000,
        minWidth: 160
      }}
      onChange={(_, newValue) => {
        if (typeof newValue === 'number') {
          onValueChange(newValue);
        }
      }}
      disabled={readOnly}
      valueLabelDisplay="auto"
      data-test="q-item-slider-field"
    />
  );
}

export default SliderField;