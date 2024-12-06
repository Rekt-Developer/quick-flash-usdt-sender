document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const page = path.split("/").pop();

  // Add active class to current nav item
  document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === '/' + page) {
      link.classList.add('font-bold');
    }
  });

  // Load and display network information
  fetch('/config.json')
    .then(response => response.json())
    .then(config => {
      const networkInfo = document.getElementById('network-info');
      if (networkInfo) {
        networkInfo.textContent = `Current Network: ${config.network.charAt(0).toUpperCase() + config.network.slice(1)}`;
      }
    });

  // Load blockchain stats
  if (document.getElementById('blockchain-stats')) {
    updateBlockchainStats();
    setInterval(updateBlockchainStats, 30000); // Update every 30 seconds
  }

  // Initialize USDT price chart
  if (document.getElementById('usdt-price-chart')) {
    initUSDTPriceChart();
  }
});

async function updateBlockchainStats() {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    const gasApiResponse = await fetch(config.apiEndpoints.gasPrice);
    const gasData = await gasApiResponse.json();

    const etherscanApiKey = 'YOUR_ETHERSCAN_API_KEY'; // Replace with your Etherscan API key
    const blockNumberResponse = await fetch(`${config.apiEndpoints.networkStats}?module=proxy&action=eth_blockNumber&apikey=${etherscanApiKey}`);
    const blockNumberData = await blockNumberResponse.json();

    document.getElementById('block-height').textContent = `Block Height: ${parseInt(blockNumberData.result, 16)}`;
    document.getElementById('gas-price').textContent = `Gas Price: ${gasData.average / 10} Gwei`;
    document.getElementById('network-congestion').textContent = `Network Congestion: ${getNetworkCongestion(gasData.average)}`;
  } catch (error) {
    console.error('Error fetching blockchain stats:', error);
  }
}

function getNetworkCongestion(gasPrice) {
  if (gasPrice < 20) return 'Low';
  if (gasPrice < 50) return 'Medium';
  return 'High';
}

async function initUSDTPriceChart() {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    const priceResponse = await fetch(config.apiEndpoints.priceData);
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