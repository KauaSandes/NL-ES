// ===== MAIN APPLICATION =====
class SurveillanceApp {
    constructor() {
        this.dataProcessor = null;
        this.mapManager = null;
        this.chartManager = null;
        this.uiManager = null;
        this.isInitialized = false;
        this.sampleDataGenerated = false;
    }

    // Initialize the application
    async initialize() {
        try {
            console.log('Initializing Surveillance Application...');

            // Show loading
            this.showGlobalLoading(true);

            // Initialize managers
            await this.initializeManagers();

            // Set up global references
            this.setupGlobalReferences();

            // Initialize UI
            this.initializeUI();

            // Initialize map
            this.initializeMap();

            // Initialize charts
            this.initializeCharts();

            // Set up file upload
            this.setupFileUpload();

            // Generate initial sample data
            await this.generateSampleData();

            this.isInitialized = true;
            this.showGlobalLoading(false);
            
            console.log('Application initialized successfully');
            this.showNotification('Sistema de Vigilância de Saúde Pública iniciado com sucesso!', 'success');

        } catch (error) {
            console.error('Error initializing application:', error);
            this.showGlobalLoading(false);
            this.showNotification('Erro ao inicializar aplicação. Recarregue a página.', 'error');
        }
    }

    // Initialize all managers
    async initializeManagers() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Initialize managers in order
        this.dataProcessor = new DataProcessor();
        console.log('✓ DataProcessor initialized');

        this.mapManager = new MapManager();
        console.log('✓ MapManager initialized');

        this.chartManager = new ChartManager();
        console.log('✓ ChartManager initialized');

        this.uiManager = new UIManager();
        console.log('✓ UIManager initialized');
    }

    // Set up global references
    setupGlobalReferences() {
        // Make managers globally available
        window.DataProcessor = DataProcessor;
        window.MapManager = MapManager;
        window.ChartManager = ChartManager;
        window.UIManager = UIManager;

        // Link UI Manager to Map Manager
        if (this.uiManager && this.mapManager) {
            this.uiManager.mapManager = this.mapManager;
        }
    }

    // Initialize UI components
    initializeUI() {
        // Add custom styles for better UX
        this.addCustomStyles();

        // Set up responsive handling
        this.handleResponsive();

        // Initialize tooltips and other UI enhancements
        this.initializeTooltips();
    }

    // Initialize map
    initializeMap() {
        if (this.mapManager) {
            this.mapManager.initializeMap();
            this.mapManager.addCustomStyles();
        }
    }

    // Initialize charts
    initializeCharts() {
        if (this.chartManager) {
            this.chartManager.initializeCharts();
        }
    }

    // Set up file upload handling
    setupFileUpload() {
        const fileInput = document.getElementById('jsonUpload');
        if (fileInput) {
            fileInput.addEventListener('change', async (event) => {
                await this.handleFileUpload(event);
            });
        }
    }

    // Handle file upload
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.showGlobalLoading(true);

        try {
            const text = await file.text();
            const jsonData = JSON.parse(text);

            if (!this.validateUploadedData(jsonData)) {
                throw new Error('Formato de dados inválido. Verifique a estrutura JSON.');
            }

            await this.processAndDisplayData(jsonData);
            this.showNotification('Dados carregados com sucesso!', 'success');

        } catch (error) {
            console.error('File upload error:', error);
            this.showNotification(`Erro ao processar arquivo: ${error.message}`, 'error');
        } finally {
            this.showGlobalLoading(false);
            event.target.value = ''; // Reset file input
        }
    }

    // Validate uploaded data
    validateUploadedData(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return false;
        }

        // Validate structure of first few items
        const sampleSize = Math.min(5, data.length);
        for (let i = 0; i < sampleSize; i++) {
            const item = data[i];
            if (!item.id_paciente || !item.data_coleta || !item.dados_demograficos || !item.resultados_hemograma) {
                return false;
            }
        }

        return true;
    }

    // Process and display data
    async processAndDisplayData(jsonData) {
        if (this.dataProcessor) {
            const result = this.dataProcessor.processData(jsonData);
            
            if (result.success) {
                this.currentData = result;
                this.updateAllDisplays(result);
            } else {
                throw new Error(result.error);
            }
        }
    }

    // Update all displays
    updateAllDisplays(data) {
        // Update statistics
        if (this.uiManager) {
            this.uiManager.updateStatistics(data.statistics);
            this.uiManager.currentData = data;
            this.uiManager.updateTable(data.municipalities);
        }

        // Update map
        if (this.mapManager) {
            this.mapManager.updateMapData(data.municipalities);
        }

        // Update charts
        if (this.chartManager) {
            this.updateCharts(data);
        }
    }

    // Update charts with data
    updateCharts(data) {
        // City comparison chart
        if (this.dataProcessor && this.chartManager) {
            const cityComparisonData = this.dataProcessor.getCityComparisonData();
            this.chartManager.updateCityComparisonChart(cityComparisonData);

            // Demographic chart
            const demographicData = this.dataProcessor.getDemographicDistribution('age');
            this.chartManager.updateDemographicChart(demographicData, 'age');

            // Distribution chart
            const distributionData = this.dataProcessor.getRDWDistribution();
            this.chartManager.updateDistributionChart(distributionData);

            // Temporal chart (for default city)
            const defaultCity = 'Goiânia';
            const temporalData = this.dataProcessor.getTemporalDataForCity(defaultCity);
            this.chartManager.updateTemporalChart(temporalData, defaultCity);
        }
    }

    // Generate sample data for demonstration
    async generateSampleData() {
        try {
            const sampleData = this.createSampleData();
            await this.processAndDisplayData(sampleData);
            this.sampleDataGenerated = true;
            console.log('Sample data generated and loaded');
        } catch (error) {
            console.error('Error generating sample data:', error);
        }
    }

    // Create realistic sample data for Goiás
    createSampleData() {
        const cities = [
            'Goiânia', 'Anápolis', 'Aparecida de Goiânia', 'Rio Verde', 
            'Luziânia', 'Aguas Lindas de Goiás', 'Valparaíso de Goiás',
            'Trindade', 'Formosa', 'Caldas Novas'
        ];

        const neighborhoods = {
            'Goiânia': ['Jardim América', 'Setor Central', 'Vila Nova', 'Jardim Guanabara', 'Setor Bueno'],
            'Anápolis': ['Centro', 'Jardim das Américas', 'Vila Gothardo', 'Cidade Universitária'],
            'Aparecida de Goiânia': ['Vila Brasília', 'Setor Central', 'Jardimdas Hortênsias'],
            'Rio Verde': ['Centro', 'Vilanelson', 'Jardim Planaltina'],
            'Luziânia': ['Centro', 'Vila São José', 'Jardim Imperial'],
            'Aguas Lindas de Goiás': ['Centro', 'Setor Sul', 'Jardim dasoliveiras'],
            'Valparaíso de Goiás': ['Centro', 'Vila Operária', 'Jardim Planálico'],
            'Trindade': ['Centro', 'Vila Rica', 'Jardim Tropical'],
            'Formosa': ['Centro', 'Vila Boa Vista', 'Jardim das Flores'],
            'Caldas Novas': ['Centro', 'Vila Romana', 'Jardim das Caldas']
        };

        const patients = [];
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2025-10-30');

        // Generate realistic data for 5000 patients
        for (let i = 0; i < 5000; i++) {
            const city = cities[Math.floor(Math.random() * cities.length)];
            const cityNeighborhoods = neighborhoods[city] || ['Centro'];
            const neighborhood = cityNeighborhoods[Math.floor(Math.random() * cityNeighborhoods.length)];
            
            // Generate random date within range
            const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
            const randomDate = new Date(randomTime);
            
            // Generate realistic demographics
            const age = this.generateRealisticAge();
            const sex = Math.random() > 0.52 ? 'F' : 'M'; // Slightly more females
            
            // Generate realistic RDW values with some variation
            let rdwValue;
            const riskFactor = Math.random();
            
            if (riskFactor < 0.7) {
                // 70% normal range (11.5-14.5%)
                rdwValue = 11.5 + Math.random() * 3.0;
            } else if (riskFactor < 0.9) {
                // 20% elevated range (14.5-16%)
                rdwValue = 14.5 + Math.random() * 1.5;
            } else {
                // 10% high range (16-18%)
                rdwValue = 16.0 + Math.random() * 2.0;
            }

            // Add some age-related variation
            if (age > 65) {
                rdwValue += Math.random() * 0.5; // Slightly higher for elderly
            }

            const patient = {
                id_paciente: `PID-${(100000 + i).toString()}`,
                data_coleta: randomDate.toISOString().split('T')[0],
                dados_demograficos: {
                    idade: age,
                    sexo: sex,
                    localidade: {
                        bairro: neighborhood,
                        cidade: city
                    }
                },
                resultados_hemograma: {
                    hemoglobina_g_dl: 12.0 + Math.random() * 4.0, // 12-16 g/dL
                    hematocrito_percent: 35.0 + Math.random() * 15.0, // 35-50%
                    vcm_fl: 80.0 + Math.random() * 20.0, // 80-100 fL
                    rdw_cv_percent: Math.round(rdwValue * 10) / 10 // Round to 1 decimal
                }
            };

            patients.push(patient);
        }

        return patients;
    }

    // Generate realistic age distribution
    generateRealisticAge() {
        // Realistic age distribution for health data
        const ageRanges = [
            { min: 0, max: 17, weight: 0.15 },    // 15%
            { min: 18, max: 29, weight: 0.20 },   // 20%
            { min: 30, max: 44, weight: 0.25 },   // 25%
            { min: 45, max: 59, weight: 0.22 },   // 22%
            { min: 60, max: 74, weight: 0.13 },   // 13%
            { min: 75, max: 90, weight: 0.05 }    // 5%
        ];

        const random = Math.random();
        let cumulative = 0;

        for (const range of ageRanges) {
            cumulative += range.weight;
            if (random <= cumulative) {
                return Math.floor(range.min + Math.random() * (range.max - range.min + 1));
            }
        }

        return 30; // Fallback
    }

    // Add custom styles
    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Custom styles for enhanced UX */
            .loading-spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .chart-canvas {
                background: rgba(255, 255, 255, 0.5);
                border-radius: 8px;
                padding: 16px;
            }
            
            .data-table tbody tr {
                transition: background-color 0.2s ease;
            }
            
            .data-table tbody tr:hover {
                background: rgba(0, 87, 255, 0.05);
            }
            
            .widget {
                transition: all 0.3s ease;
            }
            
            .widget:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 40px rgba(17, 24, 39, 0.15);
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .dashboard-grid {
                    grid-template-columns: 1fr;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                
                .stat-card {
                    padding: 16px;
                }
                
                .widget {
                    margin-bottom: 16px;
                }
            }
            
            /* Focus styles for accessibility */
            .btn:focus,
            .select:focus,
            .btn-icon:focus {
                outline: 2px solid var(--primary-500);
                outline-offset: 2px;
            }
            
            /* Print styles */
            @media print {
                .header,
                .upload-section,
                .widget-controls {
                    display: none;
                }
                
                .dashboard {
                    padding: 0;
                }
                
                .widget {
                    break-inside: avoid;
                    margin-bottom: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Handle responsive design
    handleResponsive() {
        const handleResize = () => {
            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;

            document.body.classList.toggle('mobile', isMobile);
            document.body.classList.toggle('tablet', isTablet);
            document.body.classList.toggle('desktop', !isMobile && !isTablet);

            // Adjust map zoom for mobile
            if (this.mapManager && this.mapManager.map) {
                if (isMobile) {
                    this.mapManager.map.setZoom(6);
                } else {
                    this.mapManager.map.setZoom(7);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call
    }

    // Initialize tooltips and enhancements
    initializeTooltips() {
        // Add loading states and tooltips
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.dataset.tooltip);
            });
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    // Show tooltip
    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            max-width: 200px;
            word-wrap: break-word;
        `;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

        this.currentTooltip = tooltip;
    }

    // Hide tooltip
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    // Show/hide global loading
    showGlobalLoading(show) {
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
}

// Global utility functions
window.refreshMap = function() {
    if (window.MapManager) {
        window.MapManager.refreshMap();
    }
};

window.exportMap = function() {
    if (window.MapManager) {
        window.MapManager.exportMap();
    }
};

window.exportData = function() {
    if (window.UIManager) {
        window.UIManager.exportData();
    }
};

window.updateDistributionChart = function() {
    if (window.UIManager && window.UIManager.currentData) {
        window.UIManager.updateDistributionChart(window.UIManager.currentData.rawData);
    }
};

window.loadSampleData = async function() {
    if (window.app && !window.app.sampleDataGenerated) {
        await window.app.generateSampleData();
        window.app.showNotification('Dados de exemplo carregados!', 'success');
    } else if (window.app && window.app.sampleDataGenerated) {
        window.app.showNotification('Dados de exemplo já estão carregados.', 'info');
    }
};

// Initialize application when DOM is ready
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new SurveillanceApp();
        app.initialize();
        window.app = app;
    });
} else {
    app = new SurveillanceApp();
    app.initialize();
    window.app = app;
}