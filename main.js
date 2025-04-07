const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function cekETHBalance(address) {
  console.clear();
  try {
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org'); // Ganti URL RPC Jika ingin cek Jaringan lain
    const addresses = fs.readFileSync(path.join(__dirname, "address.txt"), "utf-8")
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    for (const address of addresses) {
      const balance = await provider.getBalance(address);
      console.log(`🔎 Saldo ${address}: ${ethers.formatEther(balance)} ETH`);
    }
  } catch (err) {
    console.log(`❌ Gagal cek saldo ${address}: ${err.message}`);
  }
}

cekETHBalance();
