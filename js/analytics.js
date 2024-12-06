document.addEventListener('DOMContentLoaded', () => {
  initUSDTPriceChart();
  initTransactionVolumeChart();
  initGasPriceChart();
  updateNetworkStats();
});

async function initUSDTPriceChart() {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    const prconst pr
iceResponse = await fetch(config.apiEndpoints.priceData);
    const priceData = await priceResponse.json();

    const ctx = document.getElementById('usdt-price-chart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: priceData.market_data.sparkline_7d.price.map((_, index) => `Day ${index + 1}`),
        datasets: [{
          label: 'USDT Price (USD)',
          data: priceData.market_data.sparkline_7d.price,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  } catch (error) {
    console.error('Error initializing USDT price chart:', error);
  }
}

async function initTransactionVolumeChart() {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    const volumeResponse = await fetch(`${config.apiEndpoints.networkStats}?module=stats&action=tokentx&contractaddress=${config.usdtContractAddress[config.network]}&apikey=YOUR_ETHERSCAN_API_KEY`);
    const volumeData = await volumeResponse.json();

    const ctx = document.getElementById('transaction-volume-chart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1 Day', '7 Days', '30 Days'],
        datasets: [{
          label: 'Transaction Volume',
          data: [
            volumeData.result.filter(tx => Date.now() - tx.timeStamp * 1000 < 86400000).length,
            volumeData.result.filter(tx => Date.now() - tx.timeStamp * 1000 < 604800000).length,
            volumeData.result.length
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error initializing transaction volume chart:', error);
  }
}

async function initGasPriceChart() {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    const gasResponse = await fetch(config.apiEndpoints.gasPrice);
    const gasData = await gasResponse.json();

    const ctx = document.getElementById('gas-price-chart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Safe Low', 'Standard', 'Fast', 'Fastest'],
        datasets: [{
          label: 'Gas Price (Gwei)',
          data: [
            gasData.safeLow / 10,
            gasData.average / 10,
            gasData.fast / 10,
            gasData.fastest / 10
          ],
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  } catch (error) {
    console.error('Error initializing gas price chart:', error);
  }
}

async function updateNetworkStats() {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    const statsResponse = await fetch(`${config.apiEndpoints.networkStats}?module=proxy&action=eth_blockNumber&apikey=YOUR_ETHERSCAN_API_KEY`);
    const statsData = await statsResponse.json();

    const networkStats = document.getElementById('network-stats');
    const blockNumber = parseInt(statsData.result, 16);
    
    networkStats.innerHTML = `
      <li><strong>Latest Block:</strong> ${blockNumber}</li>
      <li><strong>Network:</strong> ${config.network}</li>
      <li><strong>USDT Contract:</strong> ${config.usdtContractAddress[config.network]}</li>
    `;
  } catch (error) {
    console.error('Error updating network stats:', error);
  }
}