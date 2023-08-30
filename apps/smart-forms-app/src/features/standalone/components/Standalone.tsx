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

import QTestGridJson from '../data/QTestGrid.json';
import RTestGridJson from '../data/RTestGrid.json';
import AVarsTestGridJson from '../data/AddVariablesTestGrid.json';
import { SmartFormsRenderer } from 'smart-forms-renderer';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { Stack } from '@mui/material';

function Standalone() {
  const questionnaireTestGrid = QTestGridJson as Questionnaire;
  const responseTestGrid = RTestGridJson as QuestionnaireResponse;
  const additionalVarsTestGrid = AVarsTestGridJson as Record<string, object>;
  // const questionnaire715 = Q715Json as Questionnaire;
  // const response715 = R715Json as QuestionnaireResponse;
  //
  // const [questionnaireId, setQuestionnaireId] = useState(questionnaireTestGrid.id!);

  return (
    <Stack m={3}>
      {/*<FormControl>*/}
      {/*  <InputLabel>Select questionnaire</InputLabel>*/}
      {/*  <Select*/}
      {/*    value={questionnaireId}*/}
      {/*    onChange={(e) => {*/}
      {/*      setQuestionnaireId(e.target.value as string);*/}
      {/*    }}>*/}
      {/*    <MenuItem value={questionnaireTestGrid.id!}>{questionnaireTestGrid.name!}</MenuItem>*/}
      {/*    <MenuItem value={questionnaire715.id!}>{questionnaire715.name!}</MenuItem>*/}
      {/*  </Select>*/}
      {/*</FormControl>*/}
      <SmartFormsRenderer
        questionnaire={questionnaireTestGrid}
        questionnaireResponse={responseTestGrid}
        additionalVariables={additionalVarsTestGrid}
      />
    </Stack>
  );
}

export default Standalone;
