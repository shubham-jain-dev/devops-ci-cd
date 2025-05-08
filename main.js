// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const themeToggle = document.getElementById('themeToggle');
  const getStartedBtn = document.getElementById('getStartedBtn');
  const energyDataForm = document.getElementById('energyDataForm');
  const inputFormSection = document.getElementById('input-form');
  const dashboardSection = document.getElementById('dashboard');
  const viewToggles = document.querySelectorAll('.btn-toggle');
  const downloadReportBtn = document.getElementById('downloadReportBtn');

  // State Management
  let userData = {
    name: '',
    electricBill: 0,
    monthlyUsage: 0,
    houseSize: 0,
    occupants: 0,
    renewablePercentage: 0,
    applianceCount: 0,
    acUsage: 0
  };

  let currentView = 'daily';
  let isDarkTheme = false;

  // Chart Objects
  let usageChart = null;
  let sourcesChart = null;
  let trendsChart = null;

  // Data for Charts
  const generateDummyData = () => {
    // Daily data (last 7 days)
    const dailyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyData = Array.from({length: 7}, () => Math.floor(Math.random() * 10) + 5);
    
    // Weekly data (last 4 weeks)
    const weeklyLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const weeklyData = Array.from({length: 4}, () => Math.floor(Math.random() * 50) + 30);
    
    // Monthly data (last 6 months)
    const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyData = Array.from({length: 6}, () => Math.floor(Math.random() * 150) + 100);
    
    return {
      daily: { labels: dailyLabels, data: dailyData },
      weekly: { labels: weeklyLabels, data: weeklyData },
      monthly: { labels: monthlyLabels, data: monthlyData }
    };
  };

  // Initialize Charts
  const initCharts = () => {
    const chartData = generateDummyData();
    
    // Usage Chart
    const usageCtx = document.getElementById('usageChart').getContext('2d');
    usageChart = new Chart(usageCtx, createUsageChart(chartData[currentView]));
    
    // Sources Chart
    const sourcesCtx = document.getElementById('sourcesChart').getContext('2d');
    sourcesChart = new Chart(sourcesCtx, createSourcesChart());
    
    // Trends Chart
    const trendsCtx = document.getElementById('trendsChart').getContext('2d');
    trendsChart = new Chart(trendsCtx, createTrendsChart(chartData[currentView]));
  };

  // Create Usage Chart Configuration
  const createUsageChart = (data) => {
    return {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Energy Usage (kWh)',
          data: data.data,
          backgroundColor: getGradientFill(usageChart?.ctx, 'usage'),
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y} kWh`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: isDarkTheme ? '#e5e7eb' : '#4b5563',
            }
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: isDarkTheme ? '#e5e7eb' : '#4b5563',
            }
          }
        }
      }
    };
  };

  // Create Sources Chart Configuration
  const createSourcesChart = () => {
    return {
      type: 'doughnut',
      data: {
        labels: ['Renewable', 'Non-Renewable'],
        datasets: [{
          data: [userData.renewablePercentage, 100 - userData.renewablePercentage],
          backgroundColor: [
            '#10b981',  // Green for renewable
            '#ef4444',  // Red for non-renewable
          ],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 20,
              color: isDarkTheme ? '#e5e7eb' : '#4b5563',
            }
          }
        }
      }
    };
  };

  // Create Trends Chart Configuration
  const createTrendsChart = (data) => {
    // Calculate prediction data: simple linear trend
    const actualData = data.data;
    const predictedData = [...actualData];
    const lastPoint = actualData[actualData.length - 1];
    const secondLastPoint = actualData[actualData.length - 2];
    const trend = lastPoint - secondLastPoint;
    
    // Add prediction points
    for (let i = 1; i <= 3; i++) {
      const nextPoint = Math.max(0, lastPoint + trend * i);
      predictedData.push(nextPoint);
    }
    
    // Extend labels for prediction
    const extendedLabels = [...data.labels];
    for (let i = 1; i <= 3; i++) {
      extendedLabels.push(`Pred ${i}`);
    }
    
    return {
      type: 'line',
      data: {
        labels: extendedLabels,
        datasets: [
          {
            label: 'Actual Usage',
            data: [...actualData, null, null, null],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: '#3b82f6',
            pointRadius: 4,
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Predicted Usage',
            data: [null, null, null, null, ...predictedData.slice(-3)],
            borderColor: '#f97316',
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: '#f97316',
            pointRadius: 4,
            tension: 0.3,
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 20,
              color: isDarkTheme ? '#e5e7eb' : '#4b5563',
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y} kWh`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: isDarkTheme ? '#e5e7eb' : '#4b5563',
            }
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: isDarkTheme ? '#e5e7eb' : '#4b5563',
            }
          }
        }
      }
    };
  };

  // Canvas Gradient Fill Helper
  const getGradientFill = (ctx, type) => {
    if (!ctx) return isDarkTheme ? '#3b82f6' : '#3b82f6';
    
    if (type === 'usage') {
      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, isDarkTheme ? '#3b82f6' : '#60a5fa');
      gradient.addColorStop(1, isDarkTheme ? '#1d4ed8' : '#2563eb');
      return gradient;
    }
    
    return isDarkTheme ? '#3b82f6' : '#3b82f6';
  };

  // Update Charts with New Data
  const updateCharts = () => {
    if (!usageChart || !sourcesChart || !trendsChart) return;
    
    const chartData = generateDummyData();
    
    // Update Usage Chart
    usageChart.data.labels = chartData[currentView].labels;
    usageChart.data.datasets[0].data = chartData[currentView].data;
    usageChart.data.datasets[0].backgroundColor = getGradientFill(usageChart.ctx, 'usage');
    usageChart.update();
    
    // Update Sources Chart
    sourcesChart.data.datasets[0].data = [userData.renewablePercentage, 100 - userData.renewablePercentage];
    sourcesChart.update();
    
    // Update Trends Chart
    trendsChart.data.labels = chartData[currentView].labels;
    const actualData = chartData[currentView].data;
    const predictedData = [...actualData];
    const lastPoint = actualData[actualData.length - 1];
    const secondLastPoint = actualData[actualData.length - 2];
    const trend = lastPoint - secondLastPoint;
    
    for (let i = 1; i <= 3; i++) {
      predictedData.push(Math.max(0, lastPoint + trend * i));
    }
    
    trendsChart.data.datasets[0].data = [...actualData, null, null, null];
    trendsChart.data.datasets[1].data = [null, null, null, null, ...predictedData.slice(-3)];
    trendsChart.update();
  };

  // Update Dashboard Stats and UI
  const updateDashboardStats = () => {
    // Total Usage
    document.getElementById('totalUsage').textContent = userData.monthlyUsage;
    
    // Total Cost
    document.getElementById('totalCost').textContent = `₹${userData.electricBill}`;
    
    // CO2 Saved
    const co2PerKwh = 0.85; // kg CO2 per kWh for coal electricity
    const co2Saved = (userData.monthlyUsage * (userData.renewablePercentage / 100) * co2PerKwh).toFixed(2);
    document.getElementById('co2Saved').textContent = `${co2Saved} kg`;
    
    // Eco Score
    const ecoScore = calculateEcoScore();
    const scoreElement = document.querySelector('.gauge-value');
    scoreElement.textContent = ecoScore;
    
    // Update the eco score gauge visualization
    const gauge = document.getElementById('ecoScoreGauge');
    updateScoreGauge(gauge, ecoScore);
    
    // Generate and update badges
    generateBadges();
    
    // Generate and update tips
    generateTips();
    
    // Update trend summary
    updateTrendSummary();
  };

  // Calculate Eco Score based on user data
  const calculateEcoScore = () => {
    // Weighted score calculation
    const renewableWeight = 0.4;
    const usageWeight = 0.3;
    const applianceWeight = 0.15;
    const acWeight = 0.15;
    
    // Renewable score (0-40 points)
    const renewableScore = userData.renewablePercentage * renewableWeight;
    
    // Usage efficiency score (0-30 points)
    // Lower usage per square foot is better
    const usagePerSqFt = userData.monthlyUsage / userData.houseSize;
    const usageEfficiencyScore = Math.max(0, 30 - (usagePerSqFt * 5)) * usageWeight;
    
    // Appliance efficiency score (0-15 points)
    // Fewer appliances per occupant is better
    const appliancesPerOccupant = userData.applianceCount / userData.occupants;
    const applianceScore = Math.max(0, 15 - (appliancesPerOccupant * 3)) * applianceWeight;
    
    // AC usage score (0-15 points)
    // Less AC usage is better
    const acScore = Math.max(0, 15 - userData.acUsage) * acWeight;
    
    // Calculate total score (0-100)
    const totalScore = Math.round(renewableScore + usageEfficiencyScore + applianceScore + acScore);
    return Math.min(100, Math.max(0, totalScore));
  };

  // Update the gauge visualization based on score
  const updateScoreGauge = (gauge, score) => {
    // Update conic gradient based on score
    let colorStop;
    if (score >= 80) {
      colorStop = `var(--success-500) 0%, var(--success-500) ${score}%, var(--neutral-300) ${score}%`;
    } else if (score >= 60) {
      colorStop = `var(--primary-500) 0%, var(--primary-500) ${score}%, var(--neutral-300) ${score}%`;
    } else if (score >= 40) {
      colorStop = `var(--warning-500) 0%, var(--warning-500) ${score}%, var(--neutral-300) ${score}%`;
    } else {
      colorStop = `var(--error-500) 0%, var(--error-500) ${score}%, var(--neutral-300) ${score}%`;
    }
    
    gauge.style.background = `conic-gradient(${colorStop})`;
  };

  // Generate badges based on data
  const generateBadges = () => {
    const badgesContainer = document.getElementById('badgesContainer');
    badgesContainer.innerHTML = '';
    
    const badges = [];
    
    if (userData.renewablePercentage >= 50) {
      badges.push({ icon: '🌞', text: 'Green Energy User' });
    }
    
    if (userData.acUsage <= 4) {
      badges.push({ icon: '❄️', text: 'AC Saver' });
    }
    
    if (userData.monthlyUsage / userData.houseSize < 1) {
      badges.push({ icon: '⚡', text: 'Energy Efficient' });
    }
    
    if (userData.applianceCount / userData.occupants <= 2) {
      badges.push({ icon: '🔌', text: 'Minimal Appliances' });
    }
    
    // Add badges to container
    badges.forEach(badge => {
      const badgeElement = document.createElement('div');
      badgeElement.className = 'badge';
      badgeElement.innerHTML = `<span class="badge-icon">${badge.icon}</span> ${badge.text}`;
      badgesContainer.appendChild(badgeElement);
    });
  };

  // Generate personalized tips
  const generateTips = () => {
    const tipsList = document.getElementById('tipsList');
    tipsList.innerHTML = '';
    
    const allTips = [
      {
        title: 'Switch to LED Bulbs',
        description: 'Replace all incandescent bulbs with LEDs to save up to 80% on lighting costs.',
        condition: true // Always show
      },
      {
        title: 'Increase Renewable Usage',
        description: 'Consider installing solar panels or switching to a green energy provider.',
        condition: userData.renewablePercentage < 50
      },
      {
        title: 'Reduce AC Temperature',
        description: 'Increase your AC temperature by 1°C to save up to 6% on cooling costs.',
        condition: userData.acUsage > 6
      },
      {
        title: 'Smart Power Strips',
        description: 'Use smart power strips to eliminate phantom energy usage from appliances.',
        condition: userData.applianceCount > userData.occupants * 2
      },
      {
        title: 'Optimize Peak Usage',
        description: 'Shift energy-intensive activities to off-peak hours to save on costs.',
        condition: userData.electricBill > 2000
      }
    ];
    
    // Filter relevant tips and add to list
    const relevantTips = allTips.filter(tip => tip.condition).slice(0, 3);
    
    relevantTips.forEach(tip => {
      const tipElement = document.createElement('li');
      tipElement.innerHTML = `
        <span class="tip-icon">💡</span>
        <div class="tip-content">
          <h4>${tip.title}</h4>
          <p>${tip.description}</p>
        </div>
      `;
      tipsList.appendChild(tipElement);
    });
  };

  // Update trend summary
  const updateTrendSummary = () => {
    const trendSummary = document.getElementById('trendSummary');
    
    // Simulate trend analysis based on user data
    const usagePerOccupant = userData.monthlyUsage / userData.occupants;
    
    let message;
    if (usagePerOccupant > 150) {
      message = 'Your consumption is higher than average. Consider implementing our energy-saving tips.';
    } else if (usagePerOccupant > 100) {
      message = 'Your consumption is average. Small changes can lead to significant savings.';
    } else {
      message = 'Great job! Your consumption is below average. Keep up the good work.';
    }
    
    trendSummary.textContent = message;
  };

  // Create a downloadable PDF report
  const generatePDF = () => {
    // In a real implementation, you would use a library like jsPDF
    // Since we're limited to vanilla JS, we'll simulate downloading a report
    alert('In a production environment, this would generate a PDF with your energy data. For this demo, we\'ll simulate a download.');
    
    // Create simulated PDF content
    const pdfContent = `
      ECO-DASH-MONITOR: MONTHLY ENERGY REPORT
      
      User: ${userData.name}
      Month: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
      
      SUMMARY:
      - Monthly Usage: ${userData.monthlyUsage} kWh
      - Monthly Cost: ₹${userData.electricBill}
      - Renewable Energy: ${userData.renewablePercentage}%
      - CO₂ Saved: ${(userData.monthlyUsage * (userData.renewablePercentage / 100) * 0.85).toFixed(2)} kg
      - Eco Score: ${calculateEcoScore()}/100
      
      RECOMMENDATIONS:
      1. ${document.querySelector('.tips-list li:nth-child(1) .tip-content h4')?.textContent || 'Switch to LED Bulbs'}
      2. ${document.querySelector('.tips-list li:nth-child(2) .tip-content h4')?.textContent || 'Increase Renewable Usage'}
      3. ${document.querySelector('.tips-list li:nth-child(3) .tip-content h4')?.textContent || 'Reduce AC Temperature'}
      
      Thank you for using Eco-Dash-Monitor!
    `;
    
    // In a real implementation, download the PDF
    console.log('Report Content:', pdfContent);
    
    // Simulate download
    setTimeout(() => {
      alert('Report downloaded successfully!');
    }, 1000);
  };

  // Toggle between dark and light themes
  const toggleTheme = () => {
    isDarkTheme = !isDarkTheme;
    
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
      themeToggle.querySelector('.toggle-icon').textContent = '☀️';
    } else {
      document.body.classList.remove('dark-theme');
      themeToggle.querySelector('.toggle-icon').textContent = '🌙';
    }
    
    // Update charts with new theme colors
    if (usageChart && sourcesChart && trendsChart) {
      updateCharts();
    }
  };

  // -------------- EVENT LISTENERS --------------

  // Theme Toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // Get Started Button
  getStartedBtn.addEventListener('click', () => {
    inputFormSection.classList.remove('hidden');
    inputFormSection.scrollIntoView({ behavior: 'smooth' });
  });
  
  // Form Submission
  energyDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Collect form data
    userData = {
      name: document.getElementById('userName').value,
      electricBill: parseFloat(document.getElementById('electricBill').value),
      monthlyUsage: parseFloat(document.getElementById('monthlyUsage').value),
      houseSize: parseFloat(document.getElementById('houseSize').value),
      occupants: parseFloat(document.getElementById('occupants').value),
      renewablePercentage: parseFloat(document.getElementById('renewablePercentage').value),
      applianceCount: parseFloat(document.getElementById('applianceCount').value),
      acUsage: parseFloat(document.getElementById('acUsage').value)
    };
    
    // Show dashboard
    dashboardSection.classList.remove('hidden');
    
    // Initialize charts if first time
    if (!usageChart) {
      initCharts();
    } else {
      updateCharts();
    }
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Scroll to dashboard
    dashboardSection.scrollIntoView({ behavior: 'smooth' });
  });
  
  // View Toggle Buttons
  viewToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      // Remove active class from all toggles
      viewToggles.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked toggle
      toggle.classList.add('active');
      
      // Update current view
      currentView = toggle.dataset.view;
      
      // Update charts
      updateCharts();
    });
  });
  
  // Download Report Button
  downloadReportBtn.addEventListener('click', generatePDF);

  // -------------- CHART.JS IMPLEMENTATION --------------

  // Simple Chart.js implementation using Canvas API
  class Chart {
    constructor(ctx, config) {
      this.ctx = ctx;
      this.config = config;
      this.data = config.data;
      this.options = config.options;
      this.type = config.type;
      
      this.render();
    }
    
    render() {
      const ctx = this.ctx;
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      if (this.type === 'bar') {
        this.renderBarChart(ctx, width, height);
      } else if (this.type === 'doughnut') {
        this.renderDoughnutChart(ctx, width, height);
      } else if (this.type === 'line') {
        this.renderLineChart(ctx, width, height);
      }
    }
    
    renderBarChart(ctx, width, height) {
      const data = this.data;
      const options = this.options;
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      
      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();
      
      // Find max value for scaling
      const maxValue = Math.max(...data.datasets[0].data) * 1.2;
      
      // Draw bars
      const barCount = data.labels.length;
      const barWidth = chartWidth / barCount * 0.8;
      const barSpacing = chartWidth / barCount * 0.2;
      
      for (let i = 0; i < barCount; i++) {
        const value = data.datasets[0].data[i];
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + i * (barWidth + barSpacing) + barSpacing / 2;
        const y = height - padding - barHeight;
        
        // Draw bar
        ctx.fillStyle = typeof data.datasets[0].backgroundColor === 'object' ? 
                       data.datasets[0].backgroundColor : 
                       isDarkTheme ? '#3b82f6' : '#60a5fa';
        
        // Rounded corners for bars
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, height - padding);
        ctx.lineTo(x, height - padding);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
        
        // Draw label
        ctx.fillStyle = isDarkTheme ? '#e5e7eb' : '#4b5563';
        ctx.textAlign = 'center';
        ctx.font = '10px Arial';
        ctx.fillText(data.labels[i], x + barWidth / 2, height - padding + 15);
        
        // Draw value
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
      }
    }
    
    renderDoughnutChart(ctx, width, height) {
      const data = this.data;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;
      const innerRadius = radius * 0.7; // For doughnut hole
      
      // Calculate total for percentages
      const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
      
      let startAngle = 0;
      
      // Draw segments
      for (let i = 0; i < data.datasets[0].data.length; i++) {
        const value = data.datasets[0].data[i];
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = data.datasets[0].backgroundColor[i];
        ctx.fill();
        
        // Draw doughnut hole
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = isDarkTheme ? '#1f2937' : '#ffffff';
        ctx.fill();
        
        // Calculate label position
        const labelAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 1.1;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;
        
        // Draw label
        ctx.fillStyle = isDarkTheme ? '#e5e7eb' : '#4b5563';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '12px Arial';
        
        // Only draw label if segment is large enough
        if (sliceAngle > 0.2) {
          ctx.fillText(`${data.labels[i]} (${Math.round(value)}%)`, labelX, labelY);
        }
        
        startAngle += sliceAngle;
      }
      
      // Draw center text
      ctx.fillStyle = isDarkTheme ? '#e5e7eb' : '#4b5563';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Energy', centerX, centerY - 10);
      ctx.fillText('Sources', centerX, centerY + 10);
    }
    
    renderLineChart(ctx, width, height) {
      const data = this.data;
      const options = this.options;
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      
      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();
      
      // Find all values for scaling (excluding null values)
      const allValues = data.datasets.flatMap(dataset => 
        dataset.data.filter(value => value !== null)
      );
      
      // Find max value for scaling
      const maxValue = Math.max(...allValues) * 1.2;
      
      // Draw each dataset line
      data.datasets.forEach((dataset, datasetIndex) => {
        const points = [];
        
        // Collect valid points
        dataset.data.forEach((value, i) => {
          if (value !== null) {
            const x = padding + (i * chartWidth) / (data.labels.length - 1);
            const y = height - padding - (value / maxValue) * chartHeight;
            points.push({ x, y });
          }
        });
        
        // Draw line connecting points
        ctx.beginPath();
        ctx.strokeStyle = dataset.borderColor;
        ctx.lineWidth = dataset.borderWidth;
        
        if (dataset.borderDash && dataset.borderDash.length) {
          ctx.setLineDash(dataset.borderDash);
        } else {
          ctx.setLineDash([]);
        }
        
        // Connect points with line
        if (points.length > 0) {
          ctx.moveTo(points[0].x, points[0].y);
          
          for (let i = 1; i < points.length; i++) {
            if (dataset.tension && dataset.tension !== 0) {
              // Curved line (simplified Bezier)
              const cp1x = points[i-1].x + (points[i].x - points[i-1].x) / 3;
              const cp1y = points[i-1].y;
              const cp2x = points[i].x - (points[i].x - points[i-1].x) / 3;
              const cp2y = points[i].y;
              ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
            } else {
              // Straight line
              ctx.lineTo(points[i].x, points[i].y);
            }
          }
          
          ctx.stroke();
          
          // Fill area under line if specified
          if (dataset.fill) {
            ctx.lineTo(points[points.length - 1].x, height - padding);
            ctx.lineTo(points[0].x, height - padding);
            ctx.closePath();
            ctx.fillStyle = dataset.backgroundColor || 'rgba(59, 130, 246, 0.1)';
            ctx.fill();
          }
        }
        
        // Draw points
        points.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, dataset.pointRadius || 3, 0, Math.PI * 2);
          ctx.fillStyle = dataset.pointBackgroundColor || dataset.borderColor;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      });
      
      // Draw x-axis labels
      ctx.fillStyle = isDarkTheme ? '#e5e7eb' : '#4b5563';
      ctx.textAlign = 'center';
      ctx.font = '10px Arial';
      
      data.labels.forEach((label, i) => {
        const x = padding + (i * chartWidth) / (data.labels.length - 1);
        ctx.fillText(label, x, height - padding + 15);
      });
      
      // Draw legend
      const legendX = padding;
      const legendY = padding - 15;
      const legendSpacing = 100;
      
      data.datasets.forEach((dataset, i) => {
        const x = legendX + i * legendSpacing;
        
        // Draw legend color box
        ctx.fillStyle = dataset.borderColor;
        ctx.fillRect(x, legendY, 10, 10);
        
        // Draw legend text
        ctx.fillStyle = isDarkTheme ? '#e5e7eb' : '#4b5563';
        ctx.textAlign = 'left';
        ctx.font = '10px Arial';
        ctx.fillText(dataset.label, x + 15, legendY + 8);
      });
    }
    
    update() {
      this.render();
    }
  }
});