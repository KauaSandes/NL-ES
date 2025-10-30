// ===== UI MANAGER =====
class UIManager {
    constructor() {
        this.isProcessing = false;
        this.currentData = null;
        this.modalElement = null;
        this.statsElements = {
            totalPatients: document.getElementById('totalPatients'),
            avgRDW: document.getElementById('avgRDW'),
            elevatedRDW: document.getElementById('elevatedRDW'),
            activeCities: document.getElementById('activeCities'),
            patientsChange: document.getElementById('patientsChange'),
            rdwChange: document.getElementById('rdwChange'),
            elevatedChange: document.getElementById('elevatedChange'),
            citiesChange: document.getElementById('citiesChange')
        };

        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // File upload
        const fileInput = document.getElementById('jsonUpload');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Chart type selectors
        const cityChartType = document.getElementById('cityChartType');
        if (cityChartType) {
            cityChartType.addEventListener('change', (e) => this.handleChartTypeChange(e));
        }

        const temporalCity = document.getElementById('temporalCity');
        if (temporalCity) {
            temporalCity.addEventListener('change', (e) => this.handleTemporalCityChange(e));
        }

        const demographicType = document.getElementById('demographicType');
        if (demographicType) {
            demographicType.addEventListener('change', (e) => this.handleDemographicTypeChange(e));
        }

        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Table row click events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.data-table tbody tr')) {
                const row = e.target.closest('.data-table tbody tr');
                const cityName = row.dataset.city;
                if (cityName && this.currentData) {
                    const cityData = this.currentData.municipalities[cityName];
                    if (cityData) {
                        this.showMunicipalityDetails(cityName, cityData);
                    }
                }
            }
        });
    }

    // Handle file upload
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            this.showNotification('Por favor, selecione um arquivo JSON válido.', 'error');
            return;
        }

        this.showLoading(true);
        this.isProcessing = true;

        try {
            const text = await file.text();
            const jsonData = JSON.parse(text);
            
            // Validate JSON structure
            if (!this.validateJSONStructure(jsonData)) {
                throw new Error('Estrutura JSON inválida. Verifique se os dados seguem o formato esperado.');
            }

            // Process the data
            await this.processData(jsonData);
            this.showNotification('Dados carregados com sucesso!', 'success');

        } catch (error) {
            console.error('Error processing file:', error);
            this.showNotification(`Erro ao processar arquivo: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
            this.isProcessing = false;
            // Reset file input
            event.target.value = '';
        }
    }

    // Validate JSON structure
    validateJSONStructure(data) {
        if (!Array.isArray(data)) return false;
        
        // Check first few items for structure
        const sampleSize = Math.min(3, data.length);
        for (let i = 0; i < sampleSize; i++) {
            const item = data[i];
            if (!item.id_paciente || !item.data_coleta || !item.dados_demograficos || !item.resultados_hemograma) {
                return false;
            }
            if (!item.dados_demograficos.idade || !item.dados_demograficos.sexo || !item.dados_demograficos.localidade) {
                return false;
            }
            if (!item.resultados_hemograma.rdw_cv_percent) {
                return false;
            }
        }
        return true;
    }

    // Process and display data
    async processData(jsonData) {
        if (!window.DataProcessor) {
            throw new Error('DataProcessor não está disponível');
        }

        const dataProcessor = new DataProcessor();
        const result = dataProcessor.processData(jsonData);
        
        if (!result.success) {
            throw new Error(result.error);
        }

        this.currentData = result;
        this.updateStatistics(result.statistics);
        this.updateMapData(result.municipalities);
        this.updateCharts(result);
        this.updateTable(result.municipalities);

        // Initialize map if not already done
        if (window.MapManager && !window.MapManager.map) {
            window.MapManager.initializeMap();
        }

        console.log('Data processed successfully');
    }

    // Update statistics display
    updateStatistics(stats) {
        if (!stats) return;

        this.animateValue(this.statsElements.totalPatients, 0, stats.totalPatients, 1000);
        this.animateValue(this.statsElements.avgRDW, 0, stats.avgRDW, 1000, '%');
        this.animateValue(this.statsElements.elevatedRDW, 0, (stats.elevatedRDWCount / stats.totalPatients * 100), 1000, '%');
        this.animateValue(this.statsElements.activeCities, 0, stats.activeCities, 1000);

        // Update change indicators
        this.updateChangeIndicators(stats);
    }

    // Update change indicators
    updateChangeIndicators(stats) {
        // These would typically compare with previous period data
        // For now, showing placeholder values
        this.updateChangeElement(this.statsElements.patientsChange, '+12%', 'positive');
        this.updateChangeElement(this.statsElements.rdwChange, '-0.2%', 'positive');
        this.updateChangeElement(this.statsElements.elevatedChange, '+2.1%', 'negative');
        this.updateChangeElement(this.statsElements.citiesChange, '+3', 'positive');
    }

    updateChangeElement(element, value, type) {
        if (element) {
            element.textContent = value;
            element.className = `stat-change ${type}`;
        }
    }

    // Animate value change
    animateValue(element, start, end, duration, suffix = '') {
        if (!element) return;
        
        const startTime = performance.now();
        const range = end - start;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (range * progress);
            element.textContent = suffix === '%' ? 
                `${current.toFixed(1)}${suffix}` : 
                Math.round(current).toLocaleString() + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Update map data
    updateMapData(municipalities) {
        if (window.MapManager) {
            window.MapManager.updateMapData(municipalities);
        }
    }

    // Update all charts
    updateCharts(data) {
        if (window.ChartManager) {
            // City comparison chart
            const cityData = window.DataProcessor ? 
                (new DataProcessor()).getCityComparisonData() : [];
            window.ChartManager.updateCityComparisonChart(cityData);

            // Temporal chart
            if (data.temporalData) {
                this.updateTemporalChart(data);
            }

            // Demographic chart
            if (data.demographicData) {
                this.updateDemographicChart(data);
            }

            // Distribution chart
            if (data.rawData) {
                this.updateDistributionChart(data.rawData);
            }
        }
    }

    updateTemporalChart(data) {
        const temporalCity = document.getElementById('temporalCity').value;
        const temporalData = this.getTemporalDataForCity(temporalCity);
        if (window.ChartManager) {
            window.ChartManager.updateTemporalChart(temporalData, temporalCity);
        }
    }

    updateDemographicChart(data) {
        const demographicType = document.getElementById('demographicType').value;
        const demographicData = this.getDemographicData(demographicType);
        if (window.ChartManager) {
            window.ChartManager.updateDemographicChart(demographicData, demographicType);
        }
    }

    updateDistributionChart(rawData) {
        const dataProcessor = new DataProcessor();
        const distributionData = dataProcessor.getRDWDistribution();
        if (window.ChartManager) {
            window.ChartManager.updateDistributionChart(distributionData);
        }
    }

    // Get temporal data for specific city
    getTemporalDataForCity(cityName) {
        if (!this.currentData || !this.currentData.temporalData) return [];
        
        const temporalData = [];
        for (const [date, cities] of Object.entries(this.currentData.temporalData)) {
            if (cities[cityName]) {
                temporalData.push({
                    date: new Date(date),
                    rdw: cities[cityName]
                });
            }
        }
        return temporalData.sort((a, b) => a.date - b.date);
    }

    // Get demographic data
    getDemographicData(type) {
        if (!this.currentData || !this.currentData.demographicData) return [];
        
        if (type === 'age') {
            return Object.entries(this.currentData.demographicData.ageGroups).map(([group, data]) => ({
                group,
                count: data.count,
                avgRDW: data.avgRDW
            }));
        } else {
            return Object.entries(this.currentData.demographicData.sex).map(([sex, data]) => ({
                group: sex,
                count: data.count,
                avgRDW: data.avgRDW
            }));
        }
    }

    // Update municipality table
    updateTable(municipalities) {
        const table = document.getElementById('municipalityTable').querySelector('tbody');
        if (!table) return;

        table.innerHTML = '';
        
        const sortedCities = Object.entries(municipalities)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.summary.patientCount - a.summary.patientCount);

        sortedCities.forEach(city => {
            const row = document.createElement('tr');
            row.dataset.city = city.name;
            
            const statusClass = this.getStatusClass(city.summary.status);
            const statusText = this.getStatusText(city.summary.status);
            
            row.innerHTML = `
                <td><strong>${city.name}</strong></td>
                <td>${city.summary.patientCount.toLocaleString()}</td>
                <td>${city.summary.avgRDW.toFixed(2)}%</td>
                <td>${city.summary.elevatedRDWPercentage.toFixed(1)}%</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            `;
            
            table.appendChild(row);
        });
    }

    // Get status class for styling
    getStatusClass(status) {
        const classes = {
            normal: 'status-normal',
            elevated: 'status-elevated',
            high: 'status-high'
        };
        return classes[status] || 'status-normal';
    }

    // Get status text
    getStatusText(status) {
        const texts = {
            normal: 'Normal',
            elevated: 'Elevado',
            high: 'Muito Elevado'
        };
        return texts[status] || 'Desconhecido';
    }

    // Show municipality details modal
    showMunicipalityDetails(cityName, cityData) {
        this.modalElement = document.getElementById('municipalityModal');
        const modalTitle = document.getElementById('modalTitle');
        const detailStats = document.getElementById('detailStats');

        if (modalTitle) {
            modalTitle.textContent = `Detalhes - ${cityName}`;
        }

        if (detailStats && cityData.summary) {
            detailStats.innerHTML = `
                <h4>Estatísticas Resumidas</h4>
                <p><strong>Total de Pacientes:</strong> ${cityData.summary.patientCount.toLocaleString()}</p>
                <p><strong>RDW Médio:</strong> ${cityData.summary.avgRDW.toFixed(2)}%</p>
                <p><strong>RDW Mínimo:</strong> ${cityData.summary.minRDW.toFixed(2)}%</p>
                <p><strong>RDW Máximo:</strong> ${cityData.summary.maxRDW.toFixed(2)}%</p>
                <p><strong>Percentual RDW Elevado:</strong> ${cityData.summary.elevatedRDWPercentage.toFixed(1)}%</p>
                <p><strong>Status Geral:</strong> ${this.getStatusText(cityData.summary.status)}</p>
            `;
        }

        // Update modal charts
        if (window.ChartManager) {
            window.ChartManager.createModalCharts(cityData);
        }

        if (this.modalElement) {
            this.modalElement.classList.add('show');
        }
    }

    // Close modal
    closeModal() {
        if (this.modalElement) {
            this.modalElement.classList.remove('show');
        }
    }

    // Handle chart type change
    handleChartTypeChange(event) {
        const type = event.target.value;
        if (window.ChartManager) {
            window.ChartManager.updateCityChartType(type);
        }
    }

    // Handle temporal city change
    handleTemporalCityChange(event) {
        const cityName = event.target.value;
        if (this.currentData && window.ChartManager) {
            const temporalData = this.getTemporalDataForCity(cityName);
            window.ChartManager.updateTemporalChart(temporalData, cityName);
        }
    }

    // Handle demographic type change
    handleDemographicTypeChange(event) {
        const type = event.target.value;
        if (this.currentData && window.ChartManager) {
            const demographicData = this.getDemographicData(type);
            window.ChartManager.updateDemographicChart(demographicData, type);
        }
    }

    // Show loading overlay
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            if (show) {
                overlay.classList.add('show');
            } else {
                overlay.classList.remove('show');
            }
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 16px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 3000;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    max-width: 400px;
                    animation: slideInRight 0.3s ease-out;
                }
                
                .notification-success { background: #10B981; }
                .notification-error { background: #EF4444; }
                .notification-info { background: #0057FF; }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    margin-left: auto;
                }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Export data
    exportData() {
        if (!this.currentData) {
            this.showNotification('Nenhum dado para exportar. Faça upload de dados primeiro.', 'error');
            return;
        }

        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                system: 'Sistema de Vigilância de Saúde Pública - RDW Goiás',
                statistics: this.currentData.statistics,
                municipalities: this.currentData.municipalities,
                demographicData: this.currentData.demographicData
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `rdw-goias-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.showNotification('Dados exportados com sucesso!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Erro ao exportar dados.', 'error');
        }
    }
}

// Global function for modal buttons
window.showMunicipalityDetails = function(cityName) {
    if (window.UIManager && window.UIManager.currentData) {
        const cityData = window.UIManager.currentData.municipalities[cityName];
        if (cityData) {
            window.UIManager.showMunicipalityDetails(cityName, cityData);
        }
    }
};

// Global function to close modal
window.closeModal = function() {
    if (window.UIManager) {
        window.UIManager.closeModal();
    }
};

// Export for use in other modules
window.UIManager = UIManager;