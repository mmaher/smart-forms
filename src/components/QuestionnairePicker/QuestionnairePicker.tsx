import React, { useEffect, useState } from 'react';
import { Box, Container, Grid } from '@mui/material';
import {
  getQResponsesFromBundle,
  loadQuestionnaireResponsesFromServer
} from '../../functions/LoadServerResourceFunctions';
import { Patient, Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import QuestionnairePickerForm from './QuestionnairePickerForm';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import QuestionnaireResponsePickerForm from './QuestionnaireResponsePickerForm';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import { getPatient } from '../../functions/LaunchFunctions';
import NoQuestionnaireErrorPage from '../ErrorPages/NoQuestionnaireErrorPage';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function QuestionnairePicker(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;
  const fhirClient = React.useContext(LaunchContext).fhirClient;

  const [firstLaunch, setFirstLaunch] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [qResponses, setQResponses] = useState<QuestionnaireResponse[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [selectedQResponse, setSelectedQResponse] = useState<QuestionnaireResponse | null>(null);
  const [qrIsSearching, setQrIsSearching] = useState(false);

  useEffect(() => {
    if (!fhirClient) return;

    // request patient details
    getPatient(fhirClient).then((patient) => {
      setPatient(patient);
    });
  }, []);

  function selectQuestionnaireByIndex(index: number) {
    const selectedQuestionnaire = questionnaires[index];
    const selectedQuestionnaireId = selectedQuestionnaire.id;

    if (!selectedQuestionnaireId) return null;

    if (fhirClient) {
      setQrIsSearching(true);
      loadQuestionnaireResponsesFromServer(fhirClient, patient, selectedQuestionnaireId)
        .then((bundle) => {
          setQResponses(bundle.entry ? getQResponsesFromBundle(bundle) : []);
          setQrIsSearching(false);
        })
        .catch((error) => {
          console.log(error);
          setQrIsSearching(false);
        });
    }
    setSelectedQuestionnaire(selectedQuestionnaire);
  }

  function selectQResponseByIndex(index: number) {
    const selectedQResponse = qResponses[index];

    if (selectedQResponse.id) {
      setSelectedQResponse(selectedQResponse);
    }
  }

  const renderQuestionnairePicker = (
    <Container maxWidth="lg">
      <Box display="flex" flexDirection="column" justifyContent="center" height="90vh">
        <Grid container spacing={8}>
          <Grid item xs={6}>
            <QuestionnairePickerForm
              questionnaires={questionnaires}
              questionnaireProvider={questionnaireProvider}
              questionnaireResponseProvider={questionnaireResponseProvider}
              setQuestionnaires={setQuestionnaires}
              setQuestionnaireResponses={setQResponses}
              onQSelectedIndexChange={selectQuestionnaireByIndex}
            />
          </Grid>

          <Grid item xs={6}>
            <QuestionnaireResponsePickerForm
              fhirClient={fhirClient}
              questionnaireResponses={qResponses}
              qrIsSearching={qrIsSearching}
              selectedQuestionnaire={selectedQuestionnaire}
              questionnaireProvider={questionnaireProvider}
              questionnaireResponseProvider={questionnaireResponseProvider}
              onQrSelectedIndexChange={selectQResponseByIndex}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );

  if (firstLaunch) {
    return <NoQuestionnaireErrorPage goToPicker={() => setFirstLaunch(false)} />;
  } else {
    return <>{renderQuestionnairePicker}</>;
  }
}

export default QuestionnairePicker;
