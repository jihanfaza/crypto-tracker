// DOM Elements
const coinSelect = document.getElementById('coinSelect');
const timeSelect = document.getElementById('timeSelect');
const priceChart = document.getElementById('priceChart');
const chartLoader = document.getElementById('chartLoader');
const currentPriceEl = document.getElementById('currentPrice');
const priceChangeEl = document.getElementById('priceChange');
const marketCapEl = document.getElementById('marketCap');
const volumeEl = document.getElementById('volume');
const coinIcon = document.getElementById('coinIcon');
const coinName = document.getElementById('coinName');
const coinSymbol = document.getElementById('coinSymbol');

// Chart.js instance
let chart;

// Coin data
const coinData = {
    bitcoin: { name: 'Bitcoin', symbol: 'BTC', icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579' },
    ethereum: { name: 'Ethereum', symbol: 'ETH', icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880' },
    cardano: { name: 'Cardano', symbol: 'ADA', icon: 'https://assets.coingecko.com/coins/images/975/large/cardano.png?1547034860' },
    solana: { name: 'Solana', symbol: 'SOL', icon: 'https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422' },
    dogecoin: { name: 'Dogecoin', symbol: 'DOGE', icon: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png?1547792256' }
};

// Initialize the app
function init() {
    fetchData();
    coinSelect.addEventListener('change', fetchData);
    timeSelect.addEventListener('change', fetchData);
}

// Fetch data from CoinGecko API
async function fetchData() {
    const coinId = coinSelect.value;
    const days = timeSelect.value;
    chartLoader.style.display = 'block';

    try {
        const chartResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
        );
        const chartData = await chartResponse.json();

        const currentResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
        );
        const currentData = await currentResponse.json();

        processChartData(chartData);
        updateCurrentData(currentData);
        updateCoinInfo(coinId);
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data. Please try again later.');
    } finally {
        chartLoader.style.display = 'none';
    }
}

// Process chart data and render chart
function processChartData(data) {
    const prices = data.prices;
    const labels = [];
    const values = [];

    prices.forEach(([timestamp, value]) => {
        const date = new Date(timestamp);
        const days = parseInt(timeSelect.value);
        let label = days <= 7
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

        labels.push(label);
        values.push(value);
    });

    if (chart) chart.destroy();

    const ctx = priceChart.getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Price (USD)',
                data: values,
                borderColor: '#00c9ff',
                backgroundColor: 'rgba(0, 201, 255, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: context => `$${context.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { maxTicksLimit: 8, color: 'rgba(255, 255, 255, 0.7)' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false },
                    ticks: {
                        callback: value => `$${value.toFixed(2)}`,
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

// Update current data stats
function updateCurrentData(data) {
    const marketData = data.market_data;

    currentPriceEl.textContent = `$${marketData.current_price.usd.toLocaleString()}`;

    const change = marketData.price_change_percentage_24h;
    priceChangeEl.textContent = `${change.toFixed(2)}%`;
    priceChangeEl.className = change >= 0 ? 'stat-value positive' : 'stat-value negative';

    marketCapEl.textContent = `$${marketData.market_cap.usd.toLocaleString()}`;
    volumeEl.textContent = `$${marketData.total_volume.usd.toLocaleString()}`;
}

// Update coin info section
function updateCoinInfo(coinId) {
    const data = coinData[coinId];
    coinIcon.src = data.icon;
    coinName.textContent = data.name;
    coinSymbol.textContent = data.symbol;
}

// Load app
window.addEventListener('load', init);
