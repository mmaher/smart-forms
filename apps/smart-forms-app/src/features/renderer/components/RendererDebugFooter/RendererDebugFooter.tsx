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

import { StyledRoot } from '../../../../components/DebugFooter/DebugFooter.styles.ts';
import { useState } from 'react';
import DebugResponse from './DebugResponse.tsx';
import type { QuestionnaireResponseItem } from 'fhir/r4';
import RendererDebugBar from './RendererDebugBar.tsx';
import useQuestionnaireStore from '../../../../stores/useQuestionnaireStore.ts';
import useQuestionnaireResponseStore from '../../../../stores/useQuestionnaireResponseStore.ts';

const clearTopLevelQRItem: QuestionnaireResponseItem = {
  linkId: 'clearedItem',
  text: 'Cleared',
  item: []
};

function RendererDebugFooter() {
  const [isHidden, setIsHidden] = useState(true);

  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);
  const updatableResponse = useQuestionnaireResponseStore((state) => state.updatableResponse);
  const clearResponse = useQuestionnaireResponseStore((state) => state.clearResponse);

  function handleClearExistingResponse() {
    if (!updatableResponse.item || updatableResponse.item.length === 0) {
      return;
    }

    const clearTopLevelQRItems: QuestionnaireResponseItem[] = Array(
      updatableResponse.item.length
    ).fill(clearTopLevelQRItem);

    clearResponse({
      ...updatableResponse,
      item: clearTopLevelQRItems
    });
  }

  return (
    <>
      {isHidden ? null : (
        <DebugResponse
          questionnaire={sourceQuestionnaire}
          questionnaireResponse={updatableResponse}
          clearQResponse={() => handleClearExistingResponse()}
        />
      )}
      <StyledRoot>
        <RendererDebugBar isHidden={isHidden} toggleIsHidden={(checked) => setIsHidden(checked)} />
      </StyledRoot>
    </>
  );
}

export default RendererDebugFooter;