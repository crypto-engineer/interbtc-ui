
import { Toast } from 'react-hot-toast/dist/core/types';
import clsx from 'clsx';
import useUnmount from 'react-use/lib/useUnmount';

import TXToast from 'components/tx-toasts/TXToast';
import {
  POLKADOT,
  KUSAMA
} from 'utils/constants/relay-chain-names';
import { useCount } from 'contexts/count-context';
import { ReactComponent as WarningOutlineIcon } from 'assets/img/icons/warning-outline.svg';

interface Props {
  t: Toast;
  message?: string;
}

const RejectedTXToast = ({
  t,
  message
}: Props): JSX.Element | null => {
  const {
    state,
    dispatch
  } = useCount();

  useUnmount(() => {
    dispatch({
      type: 'remove-toast-info',
      toastID: t.id
    });
  });

  const toastInfo = state.get(t.id);
  if (toastInfo === undefined) {
    return null;
  }

  return (
    <TXToast
      className={clsx(
        { '!bg-interlayCinnabar': process.env.REACT_APP_RELAY_CHAIN_NAME === POLKADOT },
        { 'dark:!bg-kintsugiThunderbird': process.env.REACT_APP_RELAY_CHAIN_NAME === KUSAMA },
        '!bg-opacity-5',
        'dark:!bg-opacity-5'
      )}
      t={t}
      message={
        <span
          className={clsx(
            { 'text-interlayCinnabar': process.env.REACT_APP_RELAY_CHAIN_NAME === POLKADOT },
            { 'dark:text-kintsugiThunderbird': process.env.REACT_APP_RELAY_CHAIN_NAME === KUSAMA }
          )}>
          {message || 'Transaction failed.'}
        </span>
      }
      icon={
        <WarningOutlineIcon
          className={clsx(
            { 'text-interlayCinnabar': process.env.REACT_APP_RELAY_CHAIN_NAME === POLKADOT },
            { 'dark:text-kintsugiThunderbird': process.env.REACT_APP_RELAY_CHAIN_NAME === KUSAMA }
          )}
          width={22}
          height={19} />
      }
      startTime={toastInfo.startTime}
      count={toastInfo.count} />
  );
};

export default RejectedTXToast;
