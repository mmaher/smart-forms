import React, { useState, useEffect } from 'react';
import { Coding, QuestionnaireItem, ValueSet } from 'fhir/r5';
import { AnswerValueSet } from '../classes/AnswerValueSet';
import { ContainedValueSetContext } from '../components/QRenderer/QForm';

function useValueSetOptions(qItem: QuestionnaireItem) {
  const containedValueSetContext = React.useContext(ContainedValueSetContext);
  const [options, setOptions] = useState<Coding[]>([]);

  // get options from answerValueSet on render
  useEffect(() => {
    const valueSetUrl = qItem.answerValueSet;
    if (!valueSetUrl) return;

    // set options from cached answer options if present
    const cachedAnswerOptions = AnswerValueSet.cache[valueSetUrl];
    if (cachedAnswerOptions) {
      setOptions(cachedAnswerOptions);
      return;
    }

    if (valueSetUrl.startsWith('#')) {
      // get options from referenced valueSet
      const reference = valueSetUrl.slice(1);
      const valueSet = containedValueSetContext[reference];
      setOptionsFromValueSet(valueSetUrl, valueSet);
    } else {
      // get options from terminology server
      AnswerValueSet.expand(valueSetUrl, (valueSet: ValueSet) => {
        setOptionsFromValueSet(valueSetUrl, valueSet);
      });
    }
  }, [qItem]);

  function setOptionsFromValueSet(valueSetUrl: string, valueSet: ValueSet) {
    const contains = valueSet.expansion?.contains;
    if (contains) {
      const answerOptions = AnswerValueSet.getValueCodings(contains);
      AnswerValueSet.cache[valueSetUrl] = answerOptions;
      setOptions(answerOptions);
    }
  }

  return [options];
}

export default useValueSetOptions;
