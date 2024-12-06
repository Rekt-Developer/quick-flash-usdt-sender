let web3;
let userAddress;

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      userAddress = accounts[0];
      updateWalletInfo();
    } catch (error) {
      console.error("User denied account access");
    }
  } else {
    console.log('Please install MetaMask!');
  }
}

async function updateWalletInfo() {
  const walletInfo = document.getElementById('wallet-info');
  if (userAddress) {
    const balance = await web3.eth.getBalance(userAddress);
    const usdtBalance = await getUSDTBalance(userAddress);
    walletInfo.innerHTML = `
      <p><strong>Address:</strong> ${userAddress}</p>
      <p><strong>ETH Balance:</strong> ${web3.utils.fromWei(balance, 'ether')} ETH</p>
      <p><strong>USDT Balance:</strong> ${usdtBalance} USDT</p>
    `;
    updateRecentTransactions();
  } else {
    walletInfo.innerHTML = '<p>Wallet not connected</p>';
  }
}

async function getUSDTBalance(address) {
  const response = await fetch('/config.json');
  const config = await response.json();
  const usdtContract = new web3.eth.Contract(usdtABI, config.usdtContractAddress[config.network]);
  const balance = await usdtContract.methods.balanceOf(address).call();
  return web3.utils.fromWei(balance, 'mwei'); // USDT uses 6 decimal places
}

async function updateRecentTransactions() {
  const transactionList = document.getElementById('transaction-list');
  const etherscanApiKey = 'YOUR_ETHERSCAN_API_KEY'; // Replace with your Etherscan API key
  const response = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`);
  const data = await response.json();

  if (data.status === '1') {
    const recentTransactions = data.result.slice(0, 5); // Get the 5 most recent transactions
    transactionList.innerHTML = recentTransactions.map(tx => `
      <li class="bg-gray-100 p-2 rounded dark:bg-gray-700">
        <p><strong>Hash:</strong> ${tx.hash}</p>
        <p><strong>Value:</strong> ${web3.utils.fromWei(tx.value, 'ether')} ETH</p>
        <p><strong>To:</strong> ${tx.to}</p>
        <p><strong>Timestamp:</strong> ${new Date(tx.timeStamp * 1000).toLocaleString()}</p>
      </li>
    `).join('');
  } else {
    transactionList.innerHTML = '<li>Failed to fetch recent transactions</li>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const connectButton = document.getElementById('connect-wallet');
  if (connectButton) {
    connectButton.addEventListener('click', connectWallet);
  }
});

const usdtABI = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"}];