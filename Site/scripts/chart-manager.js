// ===== CHART MANAGER =====
class ChartManager {
    constructor() {
        this.charts = new Map();
        this.chartDefaults = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        color: '#4B5563'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 11
                        },
                        color: '#6B7280'
                    },
                    grid: {
                        color: '#E5E7EB'
                    }
                },
                y: {
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 11
                        },
                        color: '#6B7280'
                    },
                    grid: {
                        color: '#E5E7EB'
                    }
                }
            }
        };
    }

    // Initialize all charts
    initializeCharts() {
        this.createCityComparisonChart();
        this.createTemporalChart();
        this.createDemographicChart();
        this.createDistributionChart();
        console.log('All charts initialized');
    }

    // City Comparison Chart
    createCityComparisonChart() {
        const ctx = document.getElementById('cityChart');
        if (!ctx) return;

        const config = {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'RDW Médio (%)',
                    data: [],
                    backgroundColor: 'rgba(0, 87, 255, 0.6)',
                    borderColor: '#0057FF',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                ...this.chartDefaults,
                plugins: {
                    ...this.chartDefaults.plugins,
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return `RDW: ${context.parsed.y.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    ...this.chartDefaults.scales,
                    y: {
                        ...this.chartDefaults.scales.y,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'RDW (%)',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: '600'
                            },
                            color: '#4B5563'
                        }
                    },
                    x: {
                        ...this.chartDefaults.scales.x,
                        title: {
                            display: true,
                            text: 'Municípios',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: '600'
                            },
                            color: '#4B5563'
                        }
                    }
                }
            }
        };

        this.charts.set('cityComparison', new Chart(ctx, config));
    }

    // Update city comparison chart
    updateCityComparisonChart(cityData) {
        const chart = this.charts.get('cityComparison');
        if (!chart) return;

        const labels = cityData.map(city => city.name);
        const data = cityData.map(city => city.avgRDW);
        const backgroundColors = cityData.map(city => this.getRDWColor(city.avgRDW));

        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].backgroundColor = backgroundColors;
        chart.update();
    }

    // Temporal Evolution Chart
    createTemporalChart() {
        const ctx = document.getElementById('temporalChart');
        if (!ctx) return;

        const config = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'RDW Médio (%)',
                    data: [],
                    borderColor: '#0057FF',
                    backgroundColor: 'rgba(0, 87, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#0057FF',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                ...this.chartDefaults,
                plugins: {
                    ...this.chartDefaults.plugins,
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return new Date(context[0].parsed.x).toLocaleDateString('pt-BR');
                            },
                            label: function(context) {
                                return `RDW: ${context.parsed.y.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    ...this.chartDefaults.scales,
                    x: {
                        ...this.chartDefaults.scales.x,
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'dd/MM'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Data',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: '600'
                            },
                            color: '#4B5563'
                        }
                    },
                    y: {
                        ...this.chartDefaults.scales.y,
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'RDW (%)',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: '600'
                            },
                            color: '#4B5563'
                        }
                    }
                }
            }
        };

        this.charts.set('temporal', new Chart(ctx, config));
    }

    // Update temporal chart
    updateTemporalChart(temporalData, cityName) {
        const chart = this.charts.get('temporal');
        if (!chart) return;

        const labels = temporalData.map(point => point.date);
        const data = temporalData.map(point => point.rdw);

        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].label = `RDW - ${cityName}`;
        chart.update();
    }

    // Demographic Chart
    createDemographicChart() {
        const ctx = document.getElementById('demographicChart');
        if (!ctx) return;

        const config = {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Número de Pacientes',
                        data: [],
                        backgroundColor: 'rgba(0, 87, 255, 0.6)',
                        borderColor: '#0057FF',
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'RDW Médio (%)',
                        data: [],
                        backgroundColor: 'rgba(16, 185, 129, 0.6)',
                        borderColor: '#10B981',
                        borderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                ...this.chartDefaults,
                plugins: {
                    ...this.chartDefaults.plugins,
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Pacientes: ${context.parsed.y}`;
                                } else {
                                    return `RDW: ${context.parsed.y.toFixed(2)}%`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    ...this.chartDefaults.scales,
                    x: {
                        ...this.chartDefaults.scales.x,
                        title: {
                            display: true,
                            text: 'Grupos',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: '600'
                            },
                            color: '#4B5563'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Pacientes',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: '600'
                            },
                            color: '#0057FF'
                        },
                        ticks: {
                            color: '#0057FF'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'RDW (%)',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: '600'
                            },
                            color: '#10B981'
                        },
                        ticks: {
                            color: '#10B981'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        };

        this.charts.set('demographic', new Chart(ctx, config));
    }

    // Update demographic chart
    updateDemographicChart(demographicData, type) {
        const chart = this.charts.get('demographic');
        if (!chart) return;

        const labels = demographicData.map(item => item.group);
        const patientCounts = demographicData.map(item => item.count);
        const avgRDW = demographicData.map(item => item.avgRDW);

        chart.data.labels = labels;
        chart.data.datasets[0].data = patientCounts;
        chart.data.datasets[1].data = avgRDW;
        
        // Update chart title
        chart.options.plugins.title = {
            display: true,
            text: `Distribuição RDW - ${type === 'age' ? 'Por Idade' : 'Por Sexo'}`,
            font: {
                family: 'Inter',
                size: 16,
                weight: '600'
            },
            color: '#111827'
        };

        chart.update();
    }

    // RDW Distribution Chart (Histogram)
    createDistributionChart() {
        const ctx = document.getElementById('distributionChart');
        if (!ctx) return;

        const config = {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Frequência',
                    data: [],
                    backgroundColor: 'rgba(0, 87, 255, 0.6)',
                    borderColor: '#0057FF',
                    borderWidth: 2,
                    borderRadius: 2,
                }]
            },
            options: {
                ...this.chartDefaults,
                plugins: {
                    ...this.chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'Distribuição de Frequência RDW',
                        font: {
                            family: 'Inter',
                            size: 16,
                            weight: '600'
                        },
                        color: '#111827'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = context.raw && context.raw.percentage 
                                    ? ` (${context.raw.percentage.toFixed(1)}%)`
                                    : '';
                                return `Pacientes: ${context.parsed.y}${percentage}`;
                            }
                        }
                    }
                },
                scales: {
                    ...this.chartDefaults.scales,
                    y: {
                        ...this.chartDefaults.scales.y,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Pacientes',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: '600'
                            },
                            color: '#4B5563'
                        }
                    },
                    x: {
                        ...this.chartDefaults.scales.x,
                        title: {
                            display: true,
                            text: 'RDW (%)',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: '600'
                            },
                            color: '#4B5563'
                        }
                    }
                }
            }
        };

        this.charts.set('distribution', new Chart(ctx, config));
    }

    // Update distribution chart
    updateDistributionChart(distributionData) {
        const chart = this.charts.get('distribution');
        if (!chart) return;

        const labels = distributionData.map(bin => bin.range);
        const data = distributionData.map(bin => ({ 
            x: bin.range, 
            y: bin.count, 
            percentage: bin.percentage 
        }));

        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    }

    // Create modal charts for municipality details
    createModalCharts(municipalityData) {
        // Age distribution chart
        this.createModalAgeChart(municipalityData);
        // Sex distribution chart
        this.createModalSexChart(municipalityData);
    }

    createModalAgeChart(municipalityData) {
        const ctx = document.getElementById('modalAgeChart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts.has('modalAge')) {
            this.charts.get('modalAge').destroy();
        }

        const ageData = this.convertAgeGroupsToChartData(municipalityData.demographics.ageGroups);

        const config = {
            type: 'doughnut',
            data: {
                labels: ageData.labels,
                datasets: [{
                    data: ageData.data,
                    backgroundColor: [
                        '#0057FF',
                        '#10B981',
                        '#F59E0B',
                        '#EF4444',
                        '#8B5CF6',
                        '#06B6D4'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Inter',
                                size: 11
                            },
                            color: '#4B5563',
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed} pacientes`;
                            }
                        }
                    }
                }
            }
        };

        this.charts.set('modalAge', new Chart(ctx, config));
    }

    createModalSexChart(municipalityData) {
        const ctx = document.getElementById('modalSexChart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts.has('modalSex')) {
            this.charts.get('modalSex').destroy();
        }

        const sexData = this.convertSexDataToChartData(municipalityData.demographics.sex);

        const config = {
            type: 'pie',
            data: {
                labels: sexData.labels,
                datasets: [{
                    data: sexData.data,
                    backgroundColor: ['#0057FF', '#EC4899'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Inter',
                                size: 11
                            },
                            color: '#4B5563',
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed} pacientes`;
                            }
                        }
                    }
                }
            }
        };

        this.charts.set('modalSex', new Chart(ctx, config));
    }

    // Helper methods for data conversion
    convertAgeGroupsToChartData(ageGroups) {
        const ageOrder = ['0-17', '18-29', '30-44', '45-59', '60-74', '75+'];
        const labels = [];
        const data = [];

        ageOrder.forEach(ageGroup => {
            if (ageGroups.has(ageGroup)) {
                labels.push(ageGroup);
                data.push(ageGroups.get(ageGroup));
            }
        });

        return { labels, data };
    }

    convertSexDataToChartData(sexData) {
        const labels = [];
        const data = [];

        sexData.forEach((count, sex) => {
            labels.push(sex);
            data.push(count);
        });

        return { labels, data };
    }

    // Utility methods
    getRDWColor(rdw) {
        if (rdw <= 14.5) return 'rgba(16, 185, 129, 0.6)';    // Green
        if (rdw <= 16.0) return 'rgba(245, 158, 11, 0.6)';   // Yellow
        return 'rgba(239, 68, 68, 0.6)';                      // Red
    }

    // Update chart type for city comparison
    updateCityChartType(type) {
        const chart = this.charts.get('cityComparison');
        if (!chart) return;

        chart.config.type = type;
        chart.update();
    }

    // Get chart data for export
    exportChartData() {
        const data = {};
        this.charts.forEach((chart, name) => {
            data[name] = {
                type: chart.config.type,
                data: chart.data,
                options: chart.options
            };
        });
        return data;
    }

    // Destroy all charts
    destroyAllCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
        console.log('All charts destroyed');
    }
}

// Export for use in other modules
window.ChartManager = ChartManager;