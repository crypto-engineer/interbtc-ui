import { useState } from 'react';

import { VaultsTableRow } from '../VaultsTable';
import DespositCollateralStep from './DespositCollateralStep';
import DisclaimerStep from './DisclaimerStep';
import { Steps } from './Step';
import VaultCreatedStep from './VaultCreatedStep';

type Props = {
  vault?: VaultsTableRow;
};

type CreateVaultWizardProps = Props;

const CreateVaultWizard = ({ vault }: CreateVaultWizardProps): JSX.Element | null => {
  const [step, setStep] = useState<Steps>(1);

  const handleNextStep = () => setStep((s) => (s + 1) as Steps);

  if (!vault) {
    return null;
  }

  return (
    <>
      <DisclaimerStep step={step} onClickAgree={handleNextStep} />
      <DespositCollateralStep
        step={step}
        onSuccessfulDeposit={handleNextStep}
        collateralCurrency={vault.collateralCurrency}
        minCollateralAmount={vault.minCollateralAmount}
      />
      <VaultCreatedStep step={step} collateralCurrency={vault.collateralCurrency} />
    </>
  );
};

export { CreateVaultWizard };
