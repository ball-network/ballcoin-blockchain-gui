import { TransactionType, TransactionTypeFilterMode } from '@ball-network/api';
import { Color, TableControlledRow, useDarkMode } from '@ball-network/core';
import { Trans } from '@lingui/macro';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { TableCell, TableRow, Chip } from '@mui/material';
import React, { useState, ReactNode } from 'react';

import useWalletTransactions from '../../hooks/useWalletTransactions';

type Props = {
  walletId: number;
  cols: any[];
  isStakeFarm: boolean;
  metadata?: any;
  expandedField?: (row: any) => ReactNode;
  expandedCellShift?: number;
};

function StakeHistoryPending(props: Props) {
  const { isDarkMode } = useDarkMode();
  const { walletId, cols, isStakeFarm, metadata, expandedField, expandedCellShift } = props;
  const [expanded, setExpanded] = useState<{
    [key: string]: boolean;
  }>({});
  function handleToggleExpand(rowId: string) {
    setExpanded({
      ...expanded,
      [rowId]: !expanded[rowId],
    });
  }

  const { transactions, isLoading } = useWalletTransactions({
    walletId,
    defaultRowsPerPage: 100,
    defaultPage: 0,
    sortKey: 'RELEVANCE',
    reverse: false,
    confirmed: false,
    typeFilter: {
      mode: TransactionTypeFilterMode.INCLUDE,
      values: [
        isStakeFarm ? TransactionType.INCOMING_STAKE_FARM_RECEIVE : TransactionType.INCOMING_STAKE_LOCK_RECEIVE
      ],
    },
  });

  if (isLoading) return null;
  if (!transactions || transactions?.length === 0) return null;

  return (
    <>
      <TableRow>
        <TableCell
          colSpan={cols.length}
          sx={{
            backgroundColor: isDarkMode ? Color.Neutral[500] : Color.Neutral[400],
            color: Color.Neutral[50],
            fontSize: 16,
            '& svg': {
              verticalAlign: 'middle',
              marginRight: 0.5,
            },
          }}
        >
          <AccessTimeIcon />
          <Chip
            label={transactions?.length}
            sx={{
              backgroundColor: isDarkMode ? Color.Neutral[700] : Color.Neutral[500],
              marginLeft: 1,
              minWidth: '30px',
              color: Color.Neutral[50],
            }}
            size="small"
          />
        </TableCell>
      </TableRow>

      {transactions?.map((row, rowIndex) => (
        <TableControlledRow
          row={row}
          rowIndex={rowIndex}
          oddRowBackgroundColor={isDarkMode ? Color.Neutral[700] : Color.Neutral[300]}
          currentCols={cols}
          metadata={metadata}
          expandedField={expandedField}
          expanded={expanded}
          handleToggleExpand={handleToggleExpand}
          expandedCellShift={expandedCellShift}
        />
      ))}
      <TableRow>
        <TableCell
          colSpan={cols.length}
          sx={{
            backgroundColor: isDarkMode ? Color.Neutral[500] : Color.Neutral[400],
            height: '10px',
            padding: 0,
          }}
        />
      </TableRow>
    </>
  );
}

export default StakeHistoryPending;
