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

import { Extension, Parameters, Questionnaire } from 'fhir/r5';
import assemble, { isAssembleInputParameters } from 'sdc-assemble';
import Client from 'fhirclient/lib/Client';
import FHIR from 'fhirclient/lib/entry/browser';
import { headers } from './LoadServerResourceFunctions';

export function assemblyIsRequired(questionnaire: Questionnaire): boolean {
  return !!questionnaire.extension?.find(
    (extension: Extension) =>
      extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation' &&
      extension.valueCode === 'assemble-root'
  );
}

function defineAssembleParameters(questionnaire: Questionnaire): Parameters {
  return {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'questionnaire',
        resource: questionnaire
      }
    ]
  };
}

export async function assembleQuestionnaire(questionnaire: Questionnaire): Promise<Questionnaire> {
  const formsServerEndpoint =
    'http://csiro-csiro-14iep6fgtigke-1594922365.ap-southeast-2.elb.amazonaws.com/fhir';

  const parameters = defineAssembleParameters(questionnaire);
  if (isAssembleInputParameters(parameters)) {
    const outputAssembleParams = await assemble(parameters, formsServerEndpoint);
    if (outputAssembleParams.parameter[0].resource.resourceType === 'Questionnaire') {
      return outputAssembleParams.parameter[0].resource;
    } else {
      console.warn('Assemble fail');
      console.warn(outputAssembleParams.parameter[0].resource);
    }
  }

  return questionnaire;
}

export function updateAssembledQuestionnaire(client: Client, questionnaire: Questionnaire) {
  const endpointUrl =
    process.env.REACT_APP_FORMS_SERVER_URL ??
    'http://csiro-csiro-14iep6fgtigke-1594922365.ap-southeast-2.elb.amazonaws.com/fhir';

  return FHIR.client(endpointUrl).request({
    url: `Questionnaire/${questionnaire.id}`,
    method: 'PUT',
    body: JSON.stringify(questionnaire),
    headers: headers
  });
}
