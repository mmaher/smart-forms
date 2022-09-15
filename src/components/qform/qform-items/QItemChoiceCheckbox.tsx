import React from 'react';
import { Container, FormControl, FormGroup, Grid, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, QItemChoiceOrientation } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { updateQrChoiceCheckboxAnswers } from './QItemChoiceFunctions';
import QItemChoiceCheckboxSingle from './QItemChoiceCheckboxSingle';

interface QItemChoiceCheckboxProps extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  orientation: QItemChoiceOrientation;
}

function QItemChoiceCheckbox(props: QItemChoiceCheckboxProps) {
  const { qItem, qrItem, onQrItemChange, orientation } = props;

  const qrChoiceCheckbox = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const answers = qrChoiceCheckbox['answer'] ? qrChoiceCheckbox['answer'] : [];

  function handleCheckedChange(changedValue: string) {
    const answerOptions = qItem.answerOption;
    if (!answerOptions) return null;

    const updatedQrChoiceCheckbox = updateQrChoiceCheckboxAnswers(
      changedValue,
      answers,
      answerOptions,
      qrChoiceCheckbox
    );

    if (updatedQrChoiceCheckbox) {
      onQrItemChange(updatedQrChoiceCheckbox);
    }
  }

  return (
    <FormControl fullWidth sx={{ m: 1, p: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>
            <FormGroup row={orientation === QItemChoiceOrientation.Horizontal}>
              {qItem.answerOption?.map((option) => {
                if (option['valueCoding']) {
                  return (
                    <QItemChoiceCheckboxSingle
                      key={option.valueCoding.code ?? ''}
                      value={option.valueCoding.code ?? ''}
                      label={option.valueCoding.display ?? ''}
                      isChecked={answers.some(
                        (answer) => JSON.stringify(answer) === JSON.stringify(option)
                      )}
                      onCheckedChange={handleCheckedChange}
                    />
                  );
                } else if (option['valueString']) {
                  return (
                    <QItemChoiceCheckboxSingle
                      key={option.valueString}
                      value={option.valueString}
                      label={option.valueString}
                      isChecked={answers.some(
                        (answer) => answer.valueString === option.valueString
                      )}
                      onCheckedChange={handleCheckedChange}
                    />
                  );
                } else if (option['valueInteger']) {
                  return (
                    <QItemChoiceCheckboxSingle
                      key={option.valueInteger}
                      value={option.valueInteger.toString()}
                      label={option.valueInteger.toString()}
                      isChecked={answers.some(
                        (answer) => answer.valueInteger === option.valueInteger
                      )}
                      onCheckedChange={handleCheckedChange}
                    />
                  );
                }
              })}
            </FormGroup>
          </Container>
        </Grid>
      </Grid>
    </FormControl>
  );
}

export default QItemChoiceCheckbox;
