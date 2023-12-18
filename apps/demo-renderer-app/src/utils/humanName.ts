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

import { HumanName } from 'fhir/r4';

export function getDisplayName(name: HumanName[] | undefined): string {
  if (name?.[0]['text']) {
    return `${name?.[0].text}`;
  }

  const prefix = name?.[0].prefix?.[0] ?? '';
  const givenName = name?.[0].given?.[0] ?? '';
  const familyName = name?.[0].family ?? '';

  const fullName = `${prefix} ${givenName} ${familyName}`;

  if (fullName.length === 0) {
    return 'null';
  }

  return fullName;
}