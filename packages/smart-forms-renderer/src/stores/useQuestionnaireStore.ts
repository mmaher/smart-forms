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

import { create } from 'zustand';
import type {
  Coding,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type { Variables } from '../interfaces/variables.interface';
import type { LaunchContext } from '../interfaces/populate.interface';
import type { CalculatedExpression } from '../interfaces/calculatedExpression.interface';
import type { EnableWhenExpression, EnableWhenItems } from '../interfaces/enableWhen.interface';
import type { AnswerExpression } from '../interfaces/answerExpression.interface';
import type { Tabs } from '../interfaces/tab.interface';
import { updateItemAnswer } from '../utils/enableWhen';
import { evaluateUpdatedExpressions } from '../utils/fhirpath';
import {
  evaluateInitialCalculatedExpressions,
  initialiseCalculatedExpressionValues
} from '../utils/calculatedExpression';
import { createQuestionnaireModel } from '../utils/questionnaireStoreUtils/createQuestionaireModel';
import { initialiseFormFromResponse } from '../utils/initialiseForm';
import { emptyQuestionnaire, emptyResponse } from '../utils/emptyResource';
import cloneDeep from 'lodash.clonedeep';

export interface UseQuestionnaireStoreType {
  sourceQuestionnaire: Questionnaire;
  tabs: Tabs;
  currentTabIndex: number;
  variables: Variables;
  launchContexts: Record<string, LaunchContext>;
  enableWhenItems: EnableWhenItems;
  enableWhenLinkedQuestions: Record<string, string[]>;
  enableWhenIsActivated: boolean;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  calculatedExpressions: Record<string, CalculatedExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  processedValueSetCodings: Record<string, Coding[]>;
  processedValueSetUrls: Record<string, string>;
  cachedValueSetCodings: Record<string, Coding[]>;
  buildSourceQuestionnaire: (
    questionnaire: Questionnaire,
    questionnaireResponse?: QuestionnaireResponse,
    additionalVariables?: Record<string, object>
  ) => Promise<void>;
  destroySourceQuestionnaire: () => void;
  switchTab: (newTabIndex: number) => void;
  markTabAsComplete: (tabLinkId: string) => void;
  updateEnableWhenItem: (linkId: string, newAnswer: QuestionnaireResponseItemAnswer[]) => void;
  toggleEnableWhenActivation: (isActivated: boolean) => void;
  updateExpressions: (updatedResponse: QuestionnaireResponse) => void;
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) => void;
  updatePopulatedProperties: (populatedResponse: QuestionnaireResponse) => QuestionnaireResponse;
}

const useQuestionnaireStore = create<UseQuestionnaireStoreType>()((set, get) => ({
  sourceQuestionnaire: cloneDeep(emptyQuestionnaire),
  tabs: {},
  currentTabIndex: 0,
  variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
  launchContexts: {},
  calculatedExpressions: {},
  enableWhenExpressions: {},
  answerExpressions: {},
  enableWhenItems: {},
  enableWhenLinkedQuestions: {},
  enableWhenIsActivated: true,
  processedValueSetCodings: {},
  processedValueSetUrls: {},
  cachedValueSetCodings: {},
  buildSourceQuestionnaire: async (
    questionnaire,
    questionnaireResponse = cloneDeep(emptyResponse),
    additionalVariables = {}
  ) => {
    const questionnaireModel = await createQuestionnaireModel(questionnaire, additionalVariables);

    const {
      initialEnableWhenItems,
      initialEnableWhenLinkedQuestions,
      initialEnableWhenExpressions,
      initialCalculatedExpressions,
      firstVisibleTab
    } = initialiseFormFromResponse({
      questionnaireResponse,
      enableWhenItems: questionnaireModel.enableWhenItems,
      enableWhenExpressions: questionnaireModel.enableWhenExpressions,
      calculatedExpressions: questionnaireModel.calculatedExpressions,
      variablesFhirPath: questionnaireModel.variables.fhirPathVariables,
      tabs: questionnaireModel.tabs
    });

    set({
      sourceQuestionnaire: questionnaire,
      tabs: questionnaireModel.tabs,
      currentTabIndex: firstVisibleTab,
      variables: questionnaireModel.variables,
      launchContexts: questionnaireModel.launchContexts,
      enableWhenItems: initialEnableWhenItems,
      enableWhenLinkedQuestions: initialEnableWhenLinkedQuestions,
      enableWhenExpressions: initialEnableWhenExpressions,
      calculatedExpressions: initialCalculatedExpressions,
      answerExpressions: questionnaireModel.answerExpressions,
      processedValueSetCodings: questionnaireModel.processedValueSetCodings,
      processedValueSetUrls: questionnaireModel.processedValueSetUrls
    });
  },
  destroySourceQuestionnaire: () =>
    set({
      sourceQuestionnaire: cloneDeep(emptyQuestionnaire),
      tabs: {},
      currentTabIndex: 0,
      variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
      launchContexts: {},
      enableWhenItems: {},
      enableWhenLinkedQuestions: {},
      enableWhenExpressions: {},
      calculatedExpressions: {},
      answerExpressions: {},
      processedValueSetCodings: {},
      processedValueSetUrls: {}
    }),
  switchTab: (newTabIndex: number) => set(() => ({ currentTabIndex: newTabIndex })),
  markTabAsComplete: (tabLinkId: string) => {
    const tabs = get().tabs;
    set(() => ({
      tabs: {
        ...tabs,
        [tabLinkId]: { ...tabs[tabLinkId], isComplete: !tabs[tabLinkId].isComplete }
      }
    }));
  },
  updateEnableWhenItem: (linkId: string, newAnswer: QuestionnaireResponseItemAnswer[]) => {
    const enableWhenLinkedQuestions = get().enableWhenLinkedQuestions;
    const enableWhenItems = get().enableWhenItems;
    if (!enableWhenLinkedQuestions[linkId]) {
      return;
    }

    const itemLinkedQuestions = enableWhenLinkedQuestions[linkId];
    const updatedEnableWhenItems = updateItemAnswer(
      { ...enableWhenItems },
      itemLinkedQuestions,
      linkId,
      newAnswer
    );

    set(() => ({
      enableWhenItems: updatedEnableWhenItems
    }));
  },
  toggleEnableWhenActivation: (isActivated: boolean) =>
    set(() => ({ enableWhenIsActivated: isActivated })),
  updateExpressions: (updatedResponse: QuestionnaireResponse) => {
    const { isUpdated, updatedCalculatedExpressions, updatedEnableWhenExpressions } =
      evaluateUpdatedExpressions({
        updatedResponse: updatedResponse,
        enableWhenExpressions: get().enableWhenExpressions,
        calculatedExpressions: get().calculatedExpressions,
        variablesFhirPath: get().variables.fhirPathVariables
      });

    if (isUpdated) {
      set(() => ({
        enableWhenExpressions: updatedEnableWhenExpressions,
        calculatedExpressions: updatedCalculatedExpressions
      }));
    }
  },
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) =>
    set(() => ({
      cachedValueSetCodings: {
        ...get().cachedValueSetCodings,
        [valueSetUrl]: codings
      }
    })),
  updatePopulatedProperties: (populatedResponse: QuestionnaireResponse) => {
    const initialCalculatedExpressions = evaluateInitialCalculatedExpressions({
      initialResponse: populatedResponse,
      calculatedExpressions: get().calculatedExpressions,
      variablesFhirPath: get().variables.fhirPathVariables
    });

    const updatedResponse = initialiseCalculatedExpressionValues(
      get().sourceQuestionnaire,
      populatedResponse,
      initialCalculatedExpressions
    );

    const {
      initialEnableWhenItems,
      initialEnableWhenLinkedQuestions,
      initialEnableWhenExpressions,
      firstVisibleTab
    } = initialiseFormFromResponse({
      questionnaireResponse: updatedResponse,
      enableWhenItems: get().enableWhenItems,
      enableWhenExpressions: get().enableWhenExpressions,
      calculatedExpressions: initialCalculatedExpressions,
      variablesFhirPath: get().variables.fhirPathVariables,
      tabs: get().tabs
    });

    set(() => ({
      enableWhenItems: initialEnableWhenItems,
      enableWhenLinkedQuestions: initialEnableWhenLinkedQuestions,
      enableWhenExpressions: initialEnableWhenExpressions,
      calculatedExpressions: initialCalculatedExpressions,
      currentTabIndex: firstVisibleTab
    }));

    return updatedResponse;
  }
}));

export default useQuestionnaireStore;