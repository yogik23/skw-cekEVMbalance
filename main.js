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
  BSC: {
    symbol: 'BNB',
    rpcUrl: 'https://binance.llamarpc.com',
  },
  POLYGON: {
    symbol: 'POL',
    rpcUrl: 'https://polygon-rpc.com/',
  },
  BASE: {
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
  },
  AVALANCHE: {
    symbol: 'AVAX',
    rpcUrl: 'https://avalanche-c-chain-rpc.publicnode.com',
  },
};

async function askNetworkChoice() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'network',
      message: 'Pilih jaringan yang ingin digunakan:',
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
