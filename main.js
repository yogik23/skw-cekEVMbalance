const { ethers } = require('ethers');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

const networks = {
  ETHEREUM: {
    symbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com',
  },
  ARBITRUM: {
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
  },
  BASE: {
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
  },
  BSC: {
    symbol: 'BNB',
    rpcUrl: 'https://binance.llamarpc.com',
  },
  POLYGON: {
    symbol: 'POL',
    rpcUrl: 'https://polygon-rpc.com/',
  },
  OPTIMISM: {
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
  },
  ZKSYNC: {
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.era.zksync.io',
  },
  BERA: {
    symbol: 'BERA',
    rpcUrl: 'https://rpc.berachain.com',
  },
  FANTOM: {
    symbol: 'FTM',
    rpcUrl: 'https://fantom-rpc.publicnode.com',
  },
  SONIC: {
    symbol: 'S',
    rpcUrl: 'https://sonic.drpc.org',
  },
  CORE: {
    symbol: 'CORE',
    rpcUrl: 'https://core.drpc.org',
  },
  HYPERLIQUID: {
    symbol: 'HYPE',
    rpcUrl: 'https://rpc.hyperliquid.xyz/evm',
  },
  ZIRCUIT: {
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.zircuit.com',
  },
  CRONOS: {
    symbol: 'CRO',
    rpcUrl: 'https://cronos.drpc.org',
  },
  UNICHAIN: {
    symbol: 'ETH',
    rpcUrl: 'https://unichain-rpc.publicnode.com',
  },
  LINEA: {
    symbol: 'ETH',
    rpcUrl: 'https://linea-rpc.publicnode.com',
  },
  PULSE: {
    symbol: 'PLS',
    rpcUrl: 'https://pulsechain-rpc.publicnode.com',
  },
  BLAST: {
    symbol: 'ETH',
    rpcUrl: 'https://blast-rpc.publicnode.com',
  },
  SCROLL: {
    symbol: 'ETH',
    rpcUrl: 'https://scroll-rpc.publicnode.com',
  },
  SYSCOIN: {
    symbol: 'SYS',
    rpcUrl: 'https://syscoin-evm.publicnode.com',
  },
  LENS: {
    symbol: 'GHO',
    rpcUrl: 'https://rpc.lens.xyz',
  },
  VANA: {
    symbol: 'VANA',
    rpcUrl: 'https://rpc.vana.org',
  },
  MANTLE: {
    symbol: 'MNT',
    rpcUrl: 'https://rpc.mantle.xyz',
  },
  ARTELA: {
    symbol: 'ART',
    rpcUrl: 'https://node-euro.artela.network/rpc',
  },
  AVALANCHE: {
    symbol: 'AVAX',
    rpcUrl: 'https://avalanche-c-chain-rpc.publicnode.com',
  },
  HEMI: {
    symbol: 'ETH',
    rpcUrl: 'https://rpc.hemi.network/rpc',
  },
  zkEVM: {
    symbol: 'ETH',
    rpcUrl: 'https://zkevm-rpc.com',
  },
};

async function askNetworkChoice() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'network',
      message: 'Gunakan ⬆️ ⬇️ untuk memilih ( Semua jaringan Mainnet ):',
      choices: Object.keys(networks),
    },
  ]);
  return networks[answers.network];
}

async function cekBalance() {
  console.clear();
  try {
    const selectedNetwork = await askNetworkChoice();
    const provider = new ethers.JsonRpcProvider(selectedNetwork.rpcUrl);
    const addresses = fs.readFileSync(path.join(__dirname, 'address.txt'), 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const CMC_API_KEY = '41cde24f-9803-4d8d-9cbb-2f932374d372';
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
      },
      params: {
        symbol: selectedNetwork.symbol,
        convert: 'USD',
      },
    });
    const hargaUSD = response.data.data[selectedNetwork.symbol].quote.USD.price;

    let totalBalance = ethers.parseEther('0');
    let totalUSD = 0;

    console.log();
    for (const address of addresses) {
      try {
        const balance = await provider.getBalance(address);
        const saldoCoin = parseFloat(ethers.formatEther(balance));
        const nilaiUSD = saldoCoin * hargaUSD;

        console.log(chalk.hex('#00CED1')(`${address}  ${saldoCoin.toFixed(4)} ${selectedNetwork.symbol}  $${nilaiUSD.toFixed(2)}`));

        totalBalance += balance;
        totalUSD += nilaiUSD;
      } catch (err) {
        console.log(`❌ Gagal cek saldo ${address}: ${err.message}`);
      }
    }

    console.log(chalk.hex('#00CED1')("\n==============================="));
    console.log(chalk.hex('#00CED1')(`💰 Total saldo: ${parseFloat(ethers.formatEther(totalBalance)).toFixed(4)} ${selectedNetwork.symbol}`));
    console.log(chalk.hex('#00CED1')(`💵 Estimasi nilai: $${totalUSD.toFixed(2)}`));
    console.log(chalk.hex('#00CED1')("==============================="));

  } catch (err) {
    console.log(`❌ Gagal membaca file atau koneksi RPC: ${err.message}`);
  }
}

cekBalance();
