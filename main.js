const { ethers } = require('ethers');
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const COIN_SYMBOL = "BNB"; // bisa diganti jadi ETH, MATIC, dll
const RPC_URL = "https://opbnb-mainnet-rpc.bnbchain.org"; // bisa diganti jadi RPC lain

async function cekBalance() {
  console.clear();
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const addresses = fs.readFileSync(path.join(__dirname, "address.txt"), "utf-8") // isi address di file address.txt
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const CMC_API_KEY = "41cde24f-9803-4d8d-9cbb-2f932374d372";
    const response = await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest", {
      headers: {
        "X-CMC_PRO_API_KEY": CMC_API_KEY
      },
      params: {
        symbol: COIN_SYMBOL,
        convert: "USD"
      }
    });
    const hargaUSD = response.data.data[COIN_SYMBOL].quote.USD.price;

    let totalBalance = ethers.parseEther("0");
    let totalUSD = 0;

    for (const address of addresses) {
      try {
        const balance = await provider.getBalance(address);
        const saldoCoin = parseFloat(ethers.formatEther(balance));
        const nilaiUSD = saldoCoin * hargaUSD;

        console.log(chalk.hex('#00CED1')(`${address}  ${saldoCoin.toFixed(4)} ${COIN_SYMBOL}  $${nilaiUSD.toFixed(2)}`));

        totalBalance += balance;
        totalUSD += nilaiUSD;
      } catch (err) {
        console.log(`❌ Gagal cek saldo ${address}: ${err.message}`);
      }
    }

    console.log(chalk.hex('#00CED1')("\n==============================="));
    console.log(chalk.hex('#00CED1')(`💰 Total saldo: ${parseFloat(ethers.formatEther(totalBalance)).toFixed(4)} ${COIN_SYMBOL}`));
    console.log(chalk.hex('#00CED1')(`💵 Estimasi nilai: $${totalUSD.toFixed(2)}`));
    console.log(chalk.hex('#00CED1')("==============================="));

  } catch (err) {
    console.log(`❌ Gagal membaca file atau koneksi RPC: ${err.message}`);
  }
}

cekBalance();
