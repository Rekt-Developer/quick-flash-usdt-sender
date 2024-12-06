let web3;
let userAddress;
let usdtContract;

const usdtABI = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}];

async function initWeb3() {
  if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    userAddress = accounts[0];
    
    // Load USDT contract
    const response = await fetch('/config.json');
    const config = await response.json();
    const usdtAddress = config.usdtContractAddress[config.network];
    usdtContract = new web3.eth.Contract(usdtABI, usdtAddress);
  } else {
    console.log('Please install MetaMask!');
  }
}

async function sendUSDT(recipient, amount, gasPrice) {
  try {
    const amountWei = web3.utils.toWei(amount, 'mwei'); // USDT uses 6 decimal places
    const gasPriceWei = web3.utils.toWei(gasPrice, 'gwei');
    
    const tx = await usdtContract.methods.transfer(recipient, amountWei).send({
      from: userAddress,
      gasPrice: gasPriceWei
    });
    
    console.log('Transaction sent:', tx.transactionHash);
    addTransactionToHistory(recipient, amount, tx.transactionHash);
  } catch (error) {
    console.error('Error sending USDT:', error);
  }
}

function addTransactionToHistory(recipient, amount, txHash) {
  const transactionsList = document.getElementById('transactions-list');
  const listItem = document.createElement('li');
  listItem.className = 'bg-white p-4 rounded shadow dark:bg-gray-700';
  listItem.innerHTML = `
    <p><strong>To:</strong> ${recipient}</p>
    <p><strong>Amount:</strong> ${amount} USDT</p>
    <p><strong>Transaction Hash:</strong> ${txHash}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
  `;
  transactionsList.prepend(listItem);
}

document.addEventListener('DOMContentLoaded', async () => {
  await initWeb3();
  
  const sendForm = document.getElementById('send-usdt-form');
  if (sendForm) {
    sendForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const recipient = document.getElementById('recipient').value;
      const amount = document.getElementById('amount').value;
      const gasPrice = document.getElementById('gas-price').value;
      await sendUSDT(recipient, amount, gasPrice);
    });
  }
});