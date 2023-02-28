import React, { useContext, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  Container,
  Fade,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import {
  ResponseListItem,
  SelectedResponse,
  TableAttributes
} from '../../../interfaces/Interfaces';
import {
  applySortFilter,
  getClientBundlePromise,
  getComparator,
  getResponseListItems
} from '../../../functions/DashboardFunctions';
import { useQuery } from '@tanstack/react-query';
import { Bundle, QuestionnaireResponse } from 'fhir/r5';
import { SourceContext } from '../../../Router';
import { SelectedQuestionnaireContext } from '../../../custom-contexts/SelectedQuestionnaireContext';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ResponseListToolbar from './ResponsesPageComponents/ResponseListToolbar';
import ResponseListHead from './ResponsesPageComponents/ResponseListHead';
import ResponseLabel from './ResponseLabel';
import ResponseListFeedback from './ResponsesPageComponents/ResponseListFeedback';
import Scrollbar from '../../Scrollbar/Scrollbar';
import { constructBundle } from '../../../functions/LoadServerResourceFunctions';
import dayjs from 'dayjs';
import BackToQuestionnairesButton from './ResponsesPageComponents/BackToQuestionnairesButton';
import OpenResponseButton from './ResponsesPageComponents/OpenResponseButton';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
import useDebounce from '../../../custom-hooks/useDebounce';

const tableHeaders: TableAttributes[] = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'author', label: 'Author', alignRight: false },
  { id: 'authored', label: 'Authored On', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false }
];

function ResponsesPage() {
  const { fhirClient } = useContext(LaunchContext);
  const { source } = useContext(SourceContext);
  const { existingResponses } = useContext(SelectedQuestionnaireContext);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResponse, setSelectedResponse] = useState<SelectedResponse | null>(null);
  const [orderBy, setOrderBy] = useState<keyof ResponseListItem>('authored');
  const [searchInput, setSearchInput] = useState('');

  // search responses
  const debouncedInput = useDebounce(searchInput, 300);
  const numOfSearchEntries = 50;

  let queryUrl = `/QuestionnaireResponse?_count=${numOfSearchEntries}&`;
  if (debouncedInput) {
    queryUrl += 'questionnaire.title:contains=' + debouncedInput;
  }

  const { data, status, error } = useQuery<Bundle>(
    ['response', queryUrl],
    () => getClientBundlePromise(fhirClient!, queryUrl),
    {
      enabled: source === 'remote' && !!fhirClient && debouncedInput === searchInput
    }
  );

  // create existing responses from a selectedResponse questionnaire if exists
  const existingResponseBundle: Bundle = useMemo(
    () => constructBundle(existingResponses),
    [existingResponses]
  );

  // construct response list items for data display
  const responseListItems: ResponseListItem[] = useMemo(
    () => getResponseListItems(existingResponses.length === 0 ? data : existingResponseBundle),
    [data, existingResponseBundle, existingResponses.length]
  );

  const emptyRows: number = useMemo(
    () => (page > 0 ? Math.max(0, (1 + page) * rowsPerPage - responseListItems.length) : 0),
    [page, responseListItems.length, rowsPerPage]
  );

  // sort or perform client-side filtering or items
  const filteredListItems: ResponseListItem[] = useMemo(
    () =>
      applySortFilter(
        responseListItems,
        getComparator(order, orderBy, 'response'),
        source
      ) as ResponseListItem[],
    [order, orderBy, responseListItems, source]
  );

  const isEmpty = filteredListItems.length === 0 && status !== 'loading';

  // Event handlers
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof ResponseListItem
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (id: string) => {
    const selectedItem = filteredListItems.find((item) => item.id === id);

    if (selectedItem) {
      if (selectedItem.id === selectedResponse?.listItem.id) {
        setSelectedResponse(null);
      } else {
        const resource = data?.entry?.find((entry) => entry.resource?.id === id)?.resource;

        if (resource) {
          setSelectedResponse({
            listItem: selectedItem,
            resource: resource as QuestionnaireResponse
          });
        } else {
          setSelectedResponse(null);
        }
      }
    }
  };

  return (
    <Fade in={true}>
      <Container>
        <Stack direction="row" alignItems="center" mb={3}>
          <Typography variant="h3" gutterBottom>
            Responses
          </Typography>
        </Stack>

        <Card>
          <ResponseListToolbar
            selected={selectedResponse?.listItem}
            searchInput={searchInput}
            clearSelection={() => setSelectedResponse(null)}
            onSearch={(input) => {
              setPage(0);
              setSearchInput(input);
            }}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 600 }}>
              <Table>
                <ResponseListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={tableHeaders}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filteredListItems
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { id, title, avatarColor, author, authored, status } = row;
                      const isSelected = selectedResponse?.listItem.id === id;

                      return (
                        <TableRow
                          hover
                          key={id}
                          tabIndex={-1}
                          selected={isSelected}
                          onClick={() => handleRowClick(row.id)}>
                          <TableCell padding="checkbox">
                            <Avatar
                              sx={{
                                bgcolor: avatarColor,
                                ml: 1,
                                my: 2.25,
                                width: 36,
                                height: 36
                              }}>
                              <AssignmentIcon />
                            </Avatar>
                          </TableCell>

                          <TableCell scope="row" sx={{ maxWidth: 240 }}>
                            <Typography variant="subtitle2" sx={{ textTransform: 'Capitalize' }}>
                              {title}
                            </Typography>
                          </TableCell>

                          <TableCell align="left" sx={{ textTransform: 'Capitalize' }}>
                            {author}
                          </TableCell>

                          <TableCell align="left" sx={{ textTransform: 'Capitalize' }}>
                            {dayjs(authored).format('LLL')}
                          </TableCell>

                          <TableCell align="left">
                            <ResponseLabel color={status}>{status}</ResponseLabel>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {(isEmpty || status === 'error' || status === 'loading') &&
                filteredListItems.length === 0 ? (
                  <ResponseListFeedback
                    isEmpty={isEmpty}
                    status={status}
                    searchInput={searchInput}
                    error={error}
                  />
                ) : null}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredListItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value));
              setPage(0);
            }}
          />
        </Card>

        <Stack direction="row" alignItems="center" my={5}>
          <BackToQuestionnairesButton />
          <Box sx={{ flexGrow: 1 }} />
          <OpenResponseButton selectedResponse={selectedResponse} />
        </Stack>
      </Container>
    </Fade>
  );
}

export default ResponsesPage;
