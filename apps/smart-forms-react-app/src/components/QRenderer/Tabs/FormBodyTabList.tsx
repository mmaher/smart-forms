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

import React, { memo, useContext } from 'react';
import { Box, Card, Collapse } from '@mui/material';
import { PrimarySelectableList } from '../../StyledComponents/Lists.styles';
import { TransitionGroup } from 'react-transition-group';
import { isTab } from '../../../functions/TabFunctions';
import { isHidden } from '../../../functions/QItemFunctions';
import { getShortText } from '../../../functions/ItemControlFunctions';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import type { QuestionnaireItem } from 'fhir/r5';
import FormBodySingleTab from './FormBodySingleTab';

interface Props {
  qFormItems: QuestionnaireItem[];
  currentTabIndex: number;
  tabs: Record<string, { tabIndex: number; isComplete: boolean }>;
}

function FormBodyTabList(props: Props) {
  const { qFormItems, currentTabIndex, tabs } = props;

  const enableWhenContext = useContext(EnableWhenContext);

  return (
    <Card sx={{ p: 0.75, mb: 2 }}>
      <Box sx={{ flexGrow: 1 }}>
        <PrimarySelectableList dense disablePadding sx={{ my: 1 }} data-test="renderer-tab-list">
          <TransitionGroup>
            {qFormItems.map((qItem, i) => {
              if (!isTab(qItem) || isHidden(qItem, enableWhenContext)) {
                return null;
              }

              return (
                <Collapse key={qItem.linkId} timeout={100}>
                  <FormBodySingleTab
                    selected={currentTabIndex.toString() === i.toString()}
                    tabText={getShortText(qItem) ?? qItem.text + ''}
                    listIndex={i}
                    markedAsComplete={tabs[qItem.linkId].isComplete ?? false}
                  />
                </Collapse>
              );
            })}
          </TransitionGroup>
        </PrimarySelectableList>
      </Box>
    </Card>
  );
}

export default memo(FormBodyTabList);
