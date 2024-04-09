/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import type { RegexValidation } from '../interfaces/regex.interface';
import { getInputInvalidType } from '../utils/validateQuestionnaire';

function useValidationFeedback(
  input: string,
  regexValidation: RegexValidation | null,
  minLength: number | null,
  maxLength: number | null
): string {
  const invalidType = getInputInvalidType(input, regexValidation, minLength, maxLength);

  if (!invalidType) {
    return '';
  }

  if (invalidType === 'regex' && regexValidation) {
    return `Input should match the specified regex ${regexValidation.expression}`;
  }

  // Test min character limit
  if (invalidType === 'minLength' && minLength) {
    return `Enter at least ${minLength} characters.`;
  }

  // Test max character limit
  if (invalidType === 'maxLength' && maxLength) {
    return `Input exceeds maximum character limit of ${maxLength}.`;
  }

  return '';
}

export default useValidationFeedback;
