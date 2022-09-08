import { ReplaceRequestExt } from '@interlay/interbtc-api';
import { H256 } from '@polkadot/types/interfaces';
import { useErrorHandler } from 'react-error-boundary';
import { useQuery } from 'react-query';

import { formatDateTimePrecise } from '@/common/utils/utils';
import { ACCOUNT_ID_TYPE_NAME } from '@/config/general';
import { TransactionTableData } from '@/pages/Vaults/Vault/components/TransactionHistory/TransactionTable';
import genericFetcher, { GENERIC_FETCHER } from '@/services/fetchers/generic-fetcher';
import issuesFetcher, { ISSUES_FETCHER } from '@/services/fetchers/issues-fetcher';
import redeemsFetcher, { REDEEMS_FETCHER } from '@/services/fetchers/redeems-fetcher';

// TODO: Issues/Redeems/ReplaceRequests types are missing
const parseTransactionsData = (issues: any, redeems: any, replaceRequests: any) => {
  const mappedIssues = issues
    ? issues.map((issue: any) => {
        return {
          id: issue.id,
          request: 'Issue',
          amount: issue.execution
            ? issue.execution.amountWrapped.toBig().toString()
            : issue.request.amountWrapped.toBig().toString(),
          status: issue.status.toLowerCase(),
          date: formatDateTimePrecise(new Date(issue.request.timestamp))
        };
      })
    : undefined;

  const mappedRedeems = redeems
    ? redeems.map((redeem: any) => {
        return {
          id: redeem.id,
          request: 'Redeem',
          amount: redeem.request.requestedAmountBacking.toBig().toString(),
          status: redeem.status.toLowerCase(),
          date: formatDateTimePrecise(new Date(redeem.request.timestamp))
        };
      })
    : undefined;

  const mappedReplaceRequests = replaceRequests
    ? replaceRequests.map((replaceRequest: any) => {
        return {
          id: replaceRequest.id,
          request: 'Replace',
          amount: '-',
          status: replaceRequest.status.isPending
            ? 'pending'
            : replaceRequest.status.isCompleted
            ? 'completed'
            : replaceRequest.status.isCancelled
            ? 'cancelled'
            : '',
          date: '-'
        };
      })
    : undefined;

  return mappedIssues && mappedRedeems && mappedReplaceRequests
    ? [...mappedIssues, ...mappedRedeems, ...mappedReplaceRequests]
    : [];
};

const useGetVaultTransactions = (address: string, collateralTokenIdLiteral: string): TransactionTableData[] => {
  const vaultId = window.bridge?.api.createType(ACCOUNT_ID_TYPE_NAME, address);

  // TODO: remove the dependency on legacy issuesFetcher and redeemFetcher
  const { data: issues, error: issuesError } = useQuery<any, Error>(
    [
      ISSUES_FETCHER,
      0, // offset
      10, // limit
      `vault: {accountId_eq: "${address}", collateralToken: {token_eq: ${collateralTokenIdLiteral}}}`
    ],
    issuesFetcher
  );
  useErrorHandler(issuesError);

  const { data: redeems, error: redeemsError } = useQuery<any, Error>(
    [
      REDEEMS_FETCHER,
      0, // offset
      10, // limit
      `vault: {accountId_eq: "${address}", collateralToken: {token_eq: ${collateralTokenIdLiteral}}}`
    ],
    redeemsFetcher
  );
  useErrorHandler(redeemsError);

  // TODO: removing the generic fetcher in this instance caused a type error. This needs to be fixed.
  const { data: replaceRequests, error: replaceRequestsError } = useQuery<Map<H256, ReplaceRequestExt>, Error>(
    [GENERIC_FETCHER, 'replace', 'mapReplaceRequests', vaultId],
    genericFetcher<Map<H256, ReplaceRequestExt>>()
  );
  useErrorHandler(replaceRequestsError);

  return parseTransactionsData(issues, redeems, replaceRequests);
};

export { useGetVaultTransactions };