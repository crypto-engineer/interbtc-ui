// ray test touch <
import {
  CurrencyIdLiteral,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  currencyIdToMonetaryCurrency,
  newAccountId,
  newMonetaryAmount
} from '@interlay/interbtc-api';
// ray test touch >
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { displayMonetaryAmount } from '@/common/utils/utils';
import InterlayDenimOrKintsugiMidnightOutlinedButton from '@/components/buttons/InterlayDenimOrKintsugiMidnightOutlinedButton';
import ErrorModal from '@/components/ErrorModal';
import {
  GOVERNANCE_TOKEN,
  GOVERNANCE_TOKEN_SYMBOL,
  RELAY_CHAIN_NATIVE_TOKEN,
  RELAY_CHAIN_NATIVE_TOKEN_SYMBOL,
  WRAPPED_TOKEN,
  WRAPPED_TOKEN_SYMBOL
} from '@/config/relay-chains';
import { ISSUES_FETCHER } from '@/services/fetchers/issues-fetcher';
import { TABLE_PAGE_LIMIT } from '@/utils/constants/general';
import { QUERY_PARAMETERS } from '@/utils/constants/links';
import { getColorShade } from '@/utils/helpers/colors';
import useQueryParams from '@/utils/hooks/use-query-params';

interface Props {
  request: {
    backingPayment: {
      amount: number;
      btcTxId: string;
    };
    vault: {
      accountId: string;
      collateralToken: {
        token: CurrencyIdLiteral;
      };
      wrappedToken: {
        token: CurrencyIdLiteral;
      };
    };
  };
}

const ManualIssueExecutionUI = ({ request }: Props): JSX.Element => {
  const { t } = useTranslation();

  const queryParams = useQueryParams();
  const selectedPage = Number(queryParams.get(QUERY_PARAMETERS.PAGE)) || 1;
  const selectedPageIndex = selectedPage - 1;

  const queryClient = useQueryClient();

  // TODO: should type properly (`Relay`)
  const executeMutation = useMutation<void, Error, any>(
    (variables: any) => {
      if (!variables.backingPayment.btcTxId) {
        throw new Error('Bitcoin transaction ID not identified yet.');
      }
      return window.bridge.issue.execute(variables.id, variables.backingPayment.btcTxId);
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries([ISSUES_FETCHER, selectedPageIndex * TABLE_PAGE_LIMIT, TABLE_PAGE_LIMIT]);
        toast.success(t('issue_page.successfully_executed', { id: variables.id }));
      }
    }
  );

  const { data: vaultCapacity, error: vaultCapacityError } = useQuery({
    queryKey: 'vault-capacity',
    queryFn: async () => {
      const vaultAccountId = newAccountId(window.bridge.api, request.vault.accountId);

      // ray test touch <
      // const collateralToken = await currencyIdToMonetaryCurrency(
      //   window.bridge.assetRegistry,
      //   request.vault.currencies.collateral
      // );

      let collateralCurrency;
      if (request.vault.collateralToken.token === RELAY_CHAIN_NATIVE_TOKEN_SYMBOL) {
        collateralCurrency = RELAY_CHAIN_NATIVE_TOKEN;
      } else if (request.vault.collateralToken.token === GOVERNANCE_TOKEN_SYMBOL) {
        collateralCurrency = GOVERNANCE_TOKEN;
      } else {
        // TODO: `SDOT` will break here
        throw new Error(`Unsupported collateral token (${request.vault.collateralToken.token})!`);
      }
      // ray test touch >

      return await window.bridge.vaults.getIssuableTokensFromVault(vaultAccountId, collateralCurrency);
    }
  });

  // TODO: should type properly (`Relay`)
  const handleExecute = (request: any) => () => {
    executeMutation.mutate(request);
  };

  const backingPaymentAmount = newMonetaryAmount(request.backingPayment.amount, WRAPPED_TOKEN);

  const executable = vaultCapacity?.gte(backingPaymentAmount);

  return (
    <div className={clsx('text-center', 'space-y-2')}>
      {vaultCapacity && (
        <p className={clsx(getColorShade('red'), 'text-sm')}>
          {executable
            ? t('issue_page.vault_has_capacity_you_can_claim', {
                vaultCapacity: displayMonetaryAmount(vaultCapacity),
                wrappedTokenSymbol: WRAPPED_TOKEN_SYMBOL
              })
            : t('issue_page.vault_has_capacity_you_can_not_claim', {
                vaultCapacity: displayMonetaryAmount(vaultCapacity),
                wrappedTokenSymbol: WRAPPED_TOKEN_SYMBOL
              })}
        </p>
      )}
      {vaultCapacityError && (
        <p className={clsx(getColorShade('red'), 'text-sm')}>
          {vaultCapacityError instanceof Error ? vaultCapacityError.message : String(vaultCapacityError)}
        </p>
      )}
      <InterlayDenimOrKintsugiMidnightOutlinedButton
        pending={executeMutation.isLoading}
        disabled={!executable}
        onClick={handleExecute(request)}
      >
        {t('issue_page.claim_interbtc', {
          wrappedTokenSymbol: WRAPPED_TOKEN_SYMBOL
        })}
      </InterlayDenimOrKintsugiMidnightOutlinedButton>
      {executeMutation.isError && executeMutation.error && (
        <ErrorModal
          open={!!executeMutation.error}
          onClose={() => {
            executeMutation.reset();
          }}
          title='Error'
          description={
            typeof executeMutation.error === 'string' ? executeMutation.error : executeMutation.error.message
          }
        />
      )}
    </div>
  );
};

export default ManualIssueExecutionUI;
