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

import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type { ItemPopulationContext } from './Interfaces';
import type { OperationOutcomeIssue } from 'fhir/r4';
import { createWarningIssue } from './operationOutcome';

/**
 * Use FHIRPath.js to evaluate initialExpressions and generate its values to be populated into the questionnaireResponse.
 * There are some functions that are yet to be implemented in FHIRPath.js - these functions would be removed from the expressions to avoid errors.
 *
 * @author Sean Fong
 */
export function evaluateItemPopulationContexts(
  itemPopulationContexts: ItemPopulationContext[],
  contextMap: Record<string, any>,
  issues: OperationOutcomeIssue[]
): Record<string, any> {
  for (const linkId in itemPopulationContexts) {
    const itemPopulationContext = itemPopulationContexts[linkId];
    if (itemPopulationContext) {
      let evaluatedResult: any[];
      const expression = itemPopulationContext.expression;

      // Evaluate expression by LaunchPatient or PrePopQuery
      try {
        evaluatedResult = fhirpath.evaluate({}, expression, contextMap, fhirpath_r4_model);
      } catch (e) {
        if (e instanceof Error) {
          console.error(
            'Error: fhirpath evaluation for ItemPopulationContext failed. Details below:'
          );
          console.error(e);
          issues.push(createWarningIssue(e.message));
        }
        continue;
      }

      // Save evaluated item population context result into context object
      contextMap[itemPopulationContext.name] = evaluatedResult;
    }
  }

  return contextMap;
}
