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

import ResponseListToolbar from './TableComponents/ResponseListToolbar.tsx';
import { Fade, Table as MuiTable, TableBody, TableContainer, Typography } from '@mui/material';
import DashboardTableHead from '../DashboardTableHead.tsx';
import ResponseTableRow from './TableComponents/ResponseTableRow.tsx';
import ResponseListFeedback from './TableComponents/ResponseListFeedback.tsx';
import DashboardTablePagination from '../DashboardTablePagination.tsx';
import type { ResponseListItem, SelectedResponse } from '../../../types/list.interface.ts';
import type { Table } from '@tanstack/react-table';

interface ResponsesTableViewProps {
  table: Table<ResponseListItem>;
  searchInput: string;
  debouncedInput: string;
  fetchStatus: 'error' | 'success' | 'loading';
  isFetching: boolean;
  fetchError: unknown;
  selectedResponse: SelectedResponse | null;
  onSearch: (input: string) => void;
  onRowClick: (id: string) => void;
  onSelectResponse: (selected: SelectedResponse | null) => void;
}

function ResponsesTableView(props: ResponsesTableViewProps) {
  const {
    table,
    searchInput,
    debouncedInput,
    fetchStatus,
    isFetching,
    fetchError,
    selectedResponse,
    onSearch,
    onRowClick,
    onSelectResponse
  } = props;

  const headers = table.getHeaderGroups()[0].headers;

  const isEmpty =
    table.getRowModel().rows.length === 0 && !!debouncedInput && fetchStatus !== 'loading';

  return (
    <>
      <ResponseListToolbar
        selectedResponse={selectedResponse}
        searchInput={searchInput}
        isFetching={isFetching}
        onClearSelection={() => onSelectResponse(null)}
        onSearch={onSearch}
      />

      <TableContainer sx={{ minWidth: 575 }}>
        <MuiTable>
          <DashboardTableHead headers={headers} />
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const rowData = row.original;
              const isSelected = selectedResponse?.listItem.id === rowData.id;

              return (
                <ResponseTableRow
                  key={rowData.id}
                  row={rowData}
                  isSelected={isSelected}
                  onRowClick={() => onRowClick(rowData.id)}
                />
              );
            })}
          </TableBody>

          {(isEmpty || fetchStatus === 'error' || fetchStatus === 'loading') &&
          table.getRowModel().rows.length === 0 ? (
            <ResponseListFeedback
              isEmpty={isEmpty}
              status={fetchStatus}
              searchInput={searchInput}
              error={fetchError}
            />
          ) : null}
        </MuiTable>
      </TableContainer>

      <DashboardTablePagination table={table}>
        <Fade in={isFetching}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ p: 2 }}>
            Updating...
          </Typography>
        </Fade>
      </DashboardTablePagination>
    </>
  );
}

export default ResponsesTableView;
