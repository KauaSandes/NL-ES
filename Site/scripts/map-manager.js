// ===== MAP MANAGER =====
class MapManager {
    constructor() {
        this.map = null;
        this.municipalityLayer = null;
        this.markers = [];
        this.municipalityData = new Map();
        this.mapBounds = {
            southwest: [-20.0, -53.0], // Approximate bounds for Goiás
            northeast: [-14.0, -46.0]
        };

        // Major Goiás municipalities with approximate coordinates
        this.municipalities = {
            'Goiânia': { lat: -16.6799, lng: -49.2550, population: 1500000 },
            'Anápolis': { lat: -16.3267, lng: -48.9419, population: 400000 },
            'Aparecida de Goiânia': { lat: -16.8173, lng: -49.2437, population: 550000 },
            'Rio Verde': { lat: -17.7924, lng: -50.9197, population: 350000 },
            'Luziânia': { lat: -16.2530, lng: -47.9504, population: 200000 },
            'Aguas Lindas de Goiás': { lat: -15.7619, lng: -48.2890, population: 200000 },
            'Valparaíso de Goiás': { lat: -16.0651, lng: -47.9757, population: 180000 },
            'Trindade': { lat: -16.6489, lng: -49.4865, population: 130000 },
            'Formosa': { lat: -15.5403, lng: -47.3372, population: 120000 },
            'Caldas Novas': { lat: -17.7443, lng: -48.6247, population: 95000 },
            'Catalão': { lat: -18.1658, lng: -47.9459, population: 110000 },
            'Ceres': { lat: -15.3053, lng: -49.5978, population: 25000 },
            'Goiás': { lat: -15.9400, lng: -50.1400, population: 30000 },
            'Itumbiara': { lat: -18.4128, lng: -49.2187, population: 110000 },
            'Jataí': { lat: -17.8784, lng: -51.5214, population: 100000 },
            'Mineiros': { lat: -17.5706, lng: -52.5533, population: 65000 },
            'Morrinhos': { lat: -17.7319, lng: -49.1028, population: 45000 },
            'Nerópolis': { lat: -16.4069, lng: -49.2208, population: 35000 },
            'Petrolina de Goiás': { lat: -16.0958, lng: -49.3308, population: 15000 },
            'Porangatu': { lat: -13.7547, lng: -49.1486, population: 45000 },
            'Quirinópolis': { lat: -18.4483, lng: -50.4544, population: 50000 },
            'São Luís dos Montes Belos': { lat: -16.5269, lng: -50.3692, population: 35000 },
            'São Simão': { lat: -18.9914, lng: -50.5300, population: 25000 },
            'Senador Canedo': { lat: -16.7083, lng: -49.0917, population: 140000 },
            'Uruaçu': { lat: -14.5208, lng: -49.1344, population: 40000 },
            'Urutaí': { lat: -17.4586, lng: -48.1983, population: 8000 }
        };
    }

    // Initialize the map
    initializeMap() {
        try {
            // Calculate center of Goiás
            const centerLat = (this.mapBounds.southwest[0] + this.mapBounds.northeast[0]) / 2;
            const centerLng = (this.mapBounds.southwest[1] + this.mapBounds.northeast[1]) / 2;

            this.map = L.map('mapContainer', {
                center: [centerLat, centerLng],
                zoom: 7,
                zoomControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                touchZoom: true
            });

            // Add tile layer with better contrast
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 20,
                minZoom: 6
            }).addTo(this.map);

            // Add Goiás state border outline
            this.addStateBorder();
            
            console.log('Map initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing map:', error);
            return false;
        }
    }

    // Add state border
    addStateBorder() {
        // Approximate boundary for Goiás state (simplified polygon)
        const goiasBorder = [
            [-20.0, -53.0], // Southwest
            [-20.0, -46.0], // Southeast  
            [-14.0, -46.0], // Northeast
            [-14.0, -53.0], // Northwest
            [-20.0, -53.0]  // Close polygon
        ];

        L.polygon(goiasBorder, {
            color: '#0057FF',
            weight: 4,
            opacity: 0.8,
            fillColor: '#0057FF',
            fillOpacity: 0.1,
            dashArray: '10, 5'
        }).addTo(this.map);
    }

    // Update map data and redraw state border
    updateMapData(municipalityData) {
        try {
            this.municipalityData = municipalityData;
            this.clearMarkers();
            
            // Redraw state border
            this.addStateBorder();

            // Add markers for each municipality with data
            Object.entries(municipalityData).forEach(([cityName, data]) => {
                if (this.municipalities[cityName] && data.summary) {
                    this.addMunicipalityMarker(cityName, data, this.municipalities[cityName]);
                }
            });

            this.updateMapStyle();
            console.log('Map data updated successfully');
        } catch (error) {
            console.error('Error updating map data:', error);
        }
    }

    // Add marker for a municipality
    addMunicipalityMarker(cityName, data, coordinates) {
        const { avgRDW, patientCount, elevatedRDWPercentage } = data.summary;
        const status = this.getRDWStatus(avgRDW);
        
        // Create circle marker with size based on patient count
        const radius = Math.max(10, Math.min(50, Math.sqrt(patientCount) * 2));
        
        // Color based on RDW status
        const color = this.getStatusColor(status);
        
        const marker = L.circleMarker([coordinates.lat, coordinates.lng], {
            radius: radius,
            fillColor: color,
            color: '#000000',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.85
        });

        // Create detailed popup
        const popupContent = this.createPopupContent(cityName, data.summary);
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });

        // Add click event
        marker.on('click', () => {
            this.onMunicipalityClick(cityName, data);
        });

        marker.addTo(this.map);
        this.markers.push(marker);
    }

    // Create popup content
    createPopupContent(cityName, summary) {
        const statusLabels = {
            normal: 'Normal',
            elevated: 'Elevado',
            high: 'Muito Elevado'
        };

        const statusLabel = statusLabels[summary.status] || 'Desconhecido';
        const statusColor = this.getStatusColor(summary.status);

        return `
            <div class="popup-content">
                <h3>${cityName}</h3>
                <div class="popup-stat">
                    <strong>Pacientes:</strong> ${summary.patientCount.toLocaleString()}
                </div>
                <div class="popup-stat">
                    <strong>RDW Médio:</strong> ${summary.avgRDW.toFixed(2)}%
                </div>
                <div class="popup-stat">
                    <strong>RDW Elevado:</strong> ${summary.elevatedRDWPercentage.toFixed(1)}%
                </div>
                <div class="popup-stat">
                    <strong>Status:</strong> 
                    <span class="status-badge-popup" style="background-color: ${statusColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                        ${statusLabel}
                    </span>
                </div>
                <div class="popup-action">
                    <button onclick="showMunicipalityDetails('${cityName}')" 
                            style="background: #0057FF; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 8px; font-size: 12px;">
                        Ver Detalhes
                    </button>
                </div>
            </div>
        `;
    }

    // Handle municipality click
    onMunicipalityClick(cityName, data) {
        // This will be handled by the UI Manager
        if (window.UIManager && window.UIManager.showMunicipalityDetails) {
            window.UIManager.showMunicipalityDetails(cityName, data);
        }
    }

    // Update map style based on data
    updateMapStyle() {
        this.markers.forEach(marker => {
            const latlng = marker.getLatLng();
            const cityName = this.findCityByCoordinates(latlng.lat, latlng.lng);
            
            if (cityName && this.municipalityData[cityName]) {
                const data = this.municipalityData[cityName];
                const status = data.summary.status;
                const color = this.getStatusColor(status);
                
                marker.setStyle({
                    fillColor: color
                });
            }
        });
    }

    // Clear all markers
    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    // Find city by coordinates (simplified)
    findCityByCoordinates(lat, lng) {
        for (const [cityName, coords] of Object.entries(this.municipalities)) {
            const distance = Math.sqrt(
                Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
            );
            if (distance < 0.5) { // Within 0.5 degrees
                return cityName;
            }
        }
        return null;
    }

    // Get RDW status
    getRDWStatus(avgRDW) {
        if (avgRDW <= 14.5) return 'normal';
        if (avgRDW <= 16.0) return 'elevated';
        return 'high';
    }

    // Get status color
    getStatusColor(status) {
        const colors = {
            normal: '#16a34a',    // Green (more vibrant)
            elevated: '#d97706',  // Orange (higher contrast)
            high: '#dc2626'       // Red (more vibrant)
        };
        return colors[status] || '#6b7280'; // Gray default
    }

    // Refresh map
    refreshMap() {
        this.clearMarkers();
        this.updateMapData(this.municipalityData);
        this.addStateBorder();
        console.log('Map refreshed');
    }

    // Export map as image
    exportMap() {
        if (this.map) {
            // Create a simple export function
            try {
                // Get map bounds and center
                const bounds = this.map.getBounds();
                const center = this.map.getCenter();
                
                // Create export data
                const exportData = {
                    center: { lat: center.lat, lng: center.lng },
                    zoom: this.map.getZoom(),
                    bounds: {
                        northeast: bounds.getNorthEast(),
                        southwest: bounds.getSouthWest()
                    },
                    municipalities: Object.entries(this.municipalityData).map(([name, data]) => ({
                        name,
                        summary: data.summary,
                        coordinates: this.municipalities[name] || null
                    }))
                };

                // Download as JSON
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = 'mapa-rdw-goias.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                console.log('Map exported successfully');
            } catch (error) {
                console.error('Error exporting map:', error);
                alert('Erro ao exportar mapa. Tente novamente.');
            }
        }
    }

    // Fit map to show all markers
    fitMapToMarkers() {
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    // Add custom styles to map
    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .custom-popup .leaflet-popup-content-wrapper {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            
            .custom-popup .leaflet-popup-content {
                margin: 16px;
                font-family: 'Inter', sans-serif;
            }
            
            .popup-content h3 {
                margin: 0 0 12px 0;
                font-size: 18px;
                font-weight: 600;
                color: #111827;
            }
            
            .popup-stat {
                margin-bottom: 8px;
                font-size: 14px;
                color: #4B5563;
            }
            
            .popup-action {
                margin-top: 12px;
            }
            
            .status-badge-popup {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }
}

// Export for use in other modules
window.MapManager = MapManager;