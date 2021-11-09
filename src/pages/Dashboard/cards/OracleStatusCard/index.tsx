
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useQuery } from 'react-query';
import {
  useErrorHandler,
  withErrorBoundary
} from 'react-error-boundary';
import { CollateralBtcOracleStatus } from '@interlay/interbtc/build/oracleTypes';

import DashboardCard from '../DashboardCard';
import ErrorFallback from 'components/ErrorFallback';
import InterlayConiferOutlinedButton from 'components/buttons/InterlayConiferOutlinedButton';
import InterlayRouterLink from 'components/UI/InterlayRouterLink';
import { COLLATERAL_TOKEN_SYMBOL } from 'config/relay-chains';
import { PAGES } from 'utils/constants/links';
import genericFetcher, {
  GENERIC_FETCHER
} from 'services/fetchers/generic-fetcher';
import { StoreType } from 'common/types/util.types';

interface Props {
  linkButton?: boolean;
}

const OracleStatusCard = ({ linkButton }: Props): JSX.Element => {
  const { t } = useTranslation();
  const { bridgeLoaded } = useSelector((state: StoreType) => state.general);

  const {
    isIdle: collateralBtcOracleStatusIdle,
    isLoading: collateralBtcOracleStatusLoading,
    data: collateralBtcOracleStatus,
    error: collateralBtcOracleStatusError
  } = useQuery<CollateralBtcOracleStatus, Error>(
    [
      GENERIC_FETCHER,
      'interBtcIndex',
      'getLatestSubmission',
      COLLATERAL_TOKEN_SYMBOL
    ],
    genericFetcher<CollateralBtcOracleStatus>(),
    {
      enabled: !!bridgeLoaded
    }
  );
  useErrorHandler(collateralBtcOracleStatusError);

  const renderContent = () => {
    // TODO: should use skeleton loaders
    if (collateralBtcOracleStatusIdle || collateralBtcOracleStatusLoading) {
      return <>Loading...</>;
    }
    if (collateralBtcOracleStatus === undefined) {
      throw new Error('Something went wrong!');
    }

    const exchangeRate = collateralBtcOracleStatus.exchangeRate;
    const oracleStatus = collateralBtcOracleStatus.online;

    let statusText;
    let statusCircle;
    if (oracleStatus === true) {
      statusText = (
        <span
          className={clsx(
            'font-bold',
            'text-interlayConifer'
          )}>
          {t('dashboard.oracles.online')}
        </span>
      );

      statusCircle = (
        <div
          className={clsx(
            'w-64',
            'h-64',
            'ring-4',
            'ring-interlayConifer',
            'rounded-full',
            'inline-flex',
            'flex-col',
            'items-center',
            'justify-center'
          )}>
          <h1
            className={clsx(
              'font-bold',
              'text-3xl',
              'text-center',
              'text-interlayConifer'
            )}>
            {t('online')}
          </h1>
          <h2
            className={clsx(
              'text-base',
              'font-bold',
              'mb-1'
            )}>
            {exchangeRate?.toHuman(5)} {COLLATERAL_TOKEN_SYMBOL}/BTC
          </h2>
        </div>
      );
    } else if (oracleStatus === false) {
      statusText = (
        <span
          className={clsx(
            'font-bold',
            'text-interlayCinnabar'
          )}>
          {t('dashboard.oracles.offline')}
        </span>
      );

      statusCircle = (
        <div
          className={clsx(
            'w-64',
            'h-64',
            'ring-4',
            'ring-interlayCinnabar',
            'rounded-full',
            'inline-flex',
            'flex-col',
            'items-center',
            'justify-center'
          )}>
          <h1
            className={clsx(
              'font-bold',
              'text-3xl',
              'text-center',
              'text-interlayCinnabar'
            )}>
            {t('offline')}
          </h1>
          <h2
            className={clsx(
              'text-base',
              'font-bold',
              'mb-1'
            )}>
            {exchangeRate?.toHuman(5)} {COLLATERAL_TOKEN_SYMBOL}/BTC
          </h2>
        </div>
      );
    } else {
      throw new Error('Something went wrong!');
    }

    return (
      <>
        <div
          className={clsx(
            'flex',
            'justify-between',
            'items-center'
          )}>
          <div>
            <h1
              className={clsx(
                'font-bold',
                'text-sm',
                'xl:text-base',
                'mb-1',
                'xl:mb-2'
              )}>
              {t('dashboard.oracles.oracles_are')}&nbsp;
              {statusText}
            </h1>
          </div>
          {linkButton && (
            <InterlayRouterLink to={PAGES.DASHBOARD_ORACLES}>
              <InterlayConiferOutlinedButton
                endIcon={<FaExternalLinkAlt />}
                className='w-full'>
                VIEW ORACLES
              </InterlayConiferOutlinedButton>
            </InterlayRouterLink>
          )}
        </div>
        <div
          className={clsx(
            'mt-6',
            'flex',
            'justify-center',
            'items-center'
          )}>
          {statusCircle}
        </div>
      </>
    );
  };

  return (
    <DashboardCard>
      {renderContent()}
    </DashboardCard>
  );
};

export default withErrorBoundary(OracleStatusCard, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload();
  }
});