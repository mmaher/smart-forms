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

import type {
  Encounter,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r4';
import { getLaunchContexts, getSourceQueries, getXFhirQueryVariables } from './getExtensions.ts';
import type { IssuesParameter, ResponseParameter } from '@aehrc/sdc-populate';
import { isInputParameters } from '@aehrc/sdc-populate';
import type Client from 'fhirclient/lib/Client';
import { createPopulateInputParameters } from './createInputParameters.ts';
import { requestPopulate } from '../api/requestPopulate.ts';

export interface PopulateResult {
  populated: QuestionnaireResponse;
  hasWarnings: boolean;
}
/**
 * Pre-populate questionnaire from CMS patient data to form a populated questionnaireResponse
 *
 * @author Sean Fong
 */
export async function populateQuestionnaire(
  questionnaire: Questionnaire,
  fhirClient: Client,
  patient: Patient,
  user: Practitioner,
  encounter: Encounter | null,
  fhirPathContext: Record<string, any>
): Promise<{
  populateSuccess: boolean;
  populateResult: PopulateResult | null;
}> {
  // Get launch contexts, source queries and questionnaire-level variables
  const launchContexts = getLaunchContexts(questionnaire);
  const sourceQueries = getSourceQueries(questionnaire);
  const questionnaireLevelVariables = getXFhirQueryVariables(questionnaire);

  if (
    launchContexts.length === 0 &&
    sourceQueries.length === 0 &&
    questionnaireLevelVariables.length === 0
  ) {
    return {
      populateSuccess: false,
      populateResult: null
    };
  }

  // Define population input parameters from launch contexts, source queries and questionnaire-level variables
  const inputParameters = createPopulateInputParameters(
    questionnaire,
    patient,
    user,
    encounter,
    launchContexts,
    sourceQueries,
    questionnaireLevelVariables,
    fhirPathContext
  );

  if (!inputParameters) {
    return {
      populateSuccess: false,
      populateResult: null
    };
  }

  if (!isInputParameters(inputParameters)) {
    return {
      populateSuccess: false,
      populateResult: null
    };
  }

  // Perform population if parameters satisfies input parameters
  const outputParameters = await requestPopulate(fhirClient, inputParameters);

  if (outputParameters.resourceType === 'OperationOutcome') {
    return {
      populateSuccess: false,
      populateResult: null
    };
  }

  const responseParameter = outputParameters.parameter.find(
    (param) => param.name === 'response'
  ) as ResponseParameter;
  const issuesParameter = outputParameters.parameter.find((param) => param.name === 'issues') as
    | IssuesParameter
    | undefined;

  if (issuesParameter) {
    for (const issue of issuesParameter.resource.issue) {
      if (issue.details?.text) {
        console.warn(issue.details.text);
      }
    }
    return {
      populateSuccess: true,
      populateResult: { populated: responseParameter.resource, hasWarnings: true }
    };
  }

  return {
    populateSuccess: true,
    populateResult: { populated: responseParameter.resource, hasWarnings: false }
  };
}
