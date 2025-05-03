const { ethers } = require('ethers');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

const networks = {
  SEPOLIA: {
    symbol: 'ETH',
    rpcUrl: 'https://sepolia.infura.io/v3/2258e1561a6b49299326df405cce7ef2',
  },
  ARB_SEPOLIA: {
    symbol: 'ETH',
    rpcUrl: 'https://arbitrum-sepolia-rpc.publicnode.com',
  },
  BASE_SEPOLIA: {
    symbol: 'ETH',
    rpcUrl: 'https://sepolia.base.org',
  },
  OPTIMIS_SEPOLIA: {
    symbol: 'ETH',
    rpcUrl: 'https://sepolia.optimism.io',
  },
  MONAD: {
    symbol: 'MON',
    rpcUrl: 'https://monad-testnet.drpc.org',
  },
  AVAX_FUJI: {
    symbol: 'AVAX',
    rpcUrl: 'https://avalanche-fuji-c-chain-rpc.publicnode.com',
  },
  OPTIMIS_SEPOLIA: {
    symbol: 'ETH',
    rpcUrl: 'https://sepolia.optimism.io',
  },
  PLUME_TESTNET: {
    symbol: 'ETH',
    rpcUrl: 'https://testnet-rpc.plumenetwork.xyz',
  },
};

async function askNetworkChoice() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'network',
      message: 'Gunakan ⬆️ ⬇️ untuk memilih ( Semua jaringan Testnet ):',
      choices: Object.keys(networks),
    },
  ]);
  return networks[answers.network];
}

async function askAddressFile() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'addressFile',
      message: 'Gunakan ⬆️ ⬇️ untuk memilih (Pilih file address) :',
      choices: [
        { name: 'address.txt', value: 'address.txt' },
        { name: 'secondaddress.txt', value: 'secondaddress.txt' },
        { name: 'antisybil.txt', value: 'antisybil.txt' },
      ],
    },
  ]);
  return answers.addressFile;
}

async function cekBalance() {
  console.clear();
  try {
    const selectedNetwork = await askNetworkChoice();
    const addressFile = await askAddressFile();
    const provider = new ethers.JsonRpcProvider(selectedNetwork.rpcUrl);
    const addresses = fs.readFileSync(path.join(__dirname, addressFile), 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const [name, address] = line.split(',');
        return { name: name.trim(), address: address.trim() };
      });

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
    for (const entry of addresses) {
      try {
        const balance = await provider.getBalance(entry.address);
        const saldoCoin = parseFloat(ethers.formatEther(balance));
        const nilaiUSD = saldoCoin * hargaUSD;
        const shortaddress = `${entry.address.slice(0, 4)}...${entry.address.slice(-4)}`;

        console.log(chalk.hex('#00CED1')(`${entry.name.padEnd(10)} ${shortaddress}  ${saldoCoin.toFixed(4)} ${selectedNetwork.symbol}  $${nilaiUSD.toFixed(2)}`));

        totalBalance += balance;
        totalUSD += nilaiUSD;
      } catch (err) {
        console.log(`❌ Gagal cek saldo ${entry.name}: ${err.message}`);
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
