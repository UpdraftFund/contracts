import hre from 'hardhat';
import { parseUnits } from 'viem';

import { networks } from './addresses.json';

async function deploy(network) {
  const feeToken = networks[network].UPDToken;
  const minFee = parseUnits('1', 18); // 1 UPDT
  //  100% is 1000000 (percentScale is 1000000 in Updraft.sol)
  const percentFee = 10000; // 1%
  const accrualRate = 1000; // 0.1%
  const cycleLength = 3600; // 1 hour in seconds
  const args = [feeToken, minFee, percentFee, cycleLength, accrualRate];

  const updraft = await hre.viem.deployContract('Updraft', args);

  console.log(
    `Updraft contract deployed to ${updraft.address}`
  );

  setTimeout(async () => {
    await hre.run('verify:verify', {
      address: updraft.address,
      constructorArguments: args,
      network
    });
  }, networks[network].blockTime * 5); // wait for 5 confirmations

  return updraft.address;
}

if (require.main === module) {
  deploy(process.env.network).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}