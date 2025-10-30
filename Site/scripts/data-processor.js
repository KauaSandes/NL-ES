// ===== DATA PROCESSOR =====
class DataProcessor {
    constructor() {
        this.rawData = [];
        this.processedData = {
            municipalities: new Map(),
            temporalData: new Map(),
            demographicData: {
                ageGroups: new Map(),
                sex: new Map()
            }
        };
        this.statistics = {
            totalPatients: 0,
            avgRDW: 0,
            elevatedRDWCount: 0,
            activeCities: 0
        };
    }

    // Process uploaded JSON data
    processData(jsonData) {
        try {
            this.rawData = jsonData;
            this.processedData.municipalities.clear();
            this.processedData.temporalData.clear();
            this.processedData.demographicData.ageGroups.clear();
            this.processedData.demographicData.sex.clear();

            // Calculate statistics and organize data
            this.calculateStatistics();
            this.organizeByMunicipality();
            this.organizeTemporalData();
            this.organizeDemographicData();

            return {
                success: true,
                statistics: this.statistics,
                municipalities: Object.fromEntries(this.processedData.municipalities),
                temporalData: Object.fromEntries(this.processedData.temporalData),
                demographicData: {
                    ageGroups: Object.fromEntries(this.processedData.demographicData.ageGroups),
                    sex: Object.fromEntries(this.processedData.demographicData.sex)
                }
            };
        } catch (error) {
            console.error('Error processing data:', error);
            return { success: false, error: error.message };
        }
    }

    // Calculate overall statistics
    calculateStatistics() {
        this.statistics.totalPatients = this.rawData.length;
        
        if (this.rawData.length === 0) {
            this.statistics.avgRDW = 0;
            this.statistics.elevatedRDWCount = 0;
            this.statistics.activeCities = 0;
            return;
        }

        const rdwValues = this.rawData.map(patient => 
            patient.resultados_hemograma?.rdw_cv_percent || 0
        ).filter(val => val > 0);

        // Calculate average RDW
        this.statistics.avgRDW = rdwValues.reduce((sum, val) => sum + val, 0) / rdwValues.length;

        // Calculate elevated RDW count (RDW > 14.5%)
        this.statistics.elevatedRDWCount = rdwValues.filter(val => val > 14.5).length;

        // Calculate active cities
        const uniqueCities = new Set(
            this.rawData.map(patient => 
                patient.dados_demograficos?.localidade?.cidade
            ).filter(city => city)
        );
        this.statistics.activeCities = uniqueCities.size;
    }

    // Organize data by municipality
    organizeByMunicipality() {
        this.rawData.forEach(patient => {
            const city = patient.dados_demograficos?.localidade?.cidade;
            if (!city) return;

            if (!this.processedData.municipalities.has(city)) {
                this.processedData.municipalities.set(city, {
                    name: city,
                    patients: [],
                    rdwValues: [],
                    demographics: {
                        ageGroups: new Map(),
                        sex: new Map()
                    }
                });
            }

            const municipalityData = this.processedData.municipalities.get(city);
            municipalityData.patients.push(patient);

            const rdwValue = patient.resultados_hemograma?.rdw_cv_percent;
            if (rdwValue > 0) {
                municipalityData.rdwValues.push(rdwValue);
            }

            // Organize demographics
            const age = patient.dados_demograficos?.idade;
            const sex = patient.dados_demograficos?.sexo;
            const neighborhood = patient.dados_demograficos?.localidade?.bairro;

            if (age) {
                const ageGroup = this.getAgeGroup(age);
                municipalityData.demographics.ageGroups.set(ageGroup, 
                    (municipalityData.demographics.ageGroups.get(ageGroup) || 0) + 1);
            }

            if (sex) {
                municipalityData.demographics.sex.set(sex, 
                    (municipalityData.demographics.sex.get(sex) || 0) + 1);
            }
        });

        // Calculate summary statistics for each municipality
        this.processedData.municipalities.forEach((data, city) => {
            const rdwValues = data.rdwValues;
            data.summary = {
                patientCount: data.patients.length,
                avgRDW: rdwValues.length > 0 ? rdwValues.reduce((sum, val) => sum + val, 0) / rdwValues.length : 0,
                elevatedRDWPercentage: rdwValues.length > 0 ? 
                    (rdwValues.filter(val => val > 14.5).length / rdwValues.length) * 100 : 0,
                minRDW: Math.min(...rdwValues),
                maxRDW: Math.max(...rdwValues),
                status: this.getRDWStatus(rdwValues.length > 0 ? 
                    rdwValues.reduce((sum, val) => sum + val, 0) / rdwValues.length : 0)
            };
        });
    }

    // Organize temporal data
    organizeTemporalData() {
        this.rawData.forEach(patient => {
            const date = patient.data_coleta;
            const city = patient.dados_demograficos?.localidade?.cidade;
            const rdwValue = patient.resultados_hemograma?.rdw_cv_percent;

            if (!date || !rdwValue || rdwValue <= 0) return;

            if (!this.processedData.temporalData.has(date)) {
                this.processedData.temporalData.set(date, new Map());
            }

            const dateData = this.processedData.temporalData.get(date);
            if (!dateData.has(city)) {
                dateData.set(city, []);
            }

            dateData.get(city).push(rdwValue);
        });

        // Calculate daily averages
        this.processedData.temporalData.forEach((cities, date) => {
            cities.forEach((rdwValues, city) => {
                cities.set(city, rdwValues.reduce((sum, val) => sum + val, 0) / rdwValues.length);
            });
        });
    }

    // Organize demographic data
    organizeDemographicData() {
        this.rawData.forEach(patient => {
            const age = patient.dados_demograficos?.idade;
            const sex = patient.dados_demograficos?.sexo;
            const rdwValue = patient.resultados_hemograma?.rdw_cv_percent;

            if (age && rdwValue > 0) {
                const ageGroup = this.getAgeGroup(age);
                if (!this.processedData.demographicData.ageGroups.has(ageGroup)) {
                    this.processedData.demographicData.ageGroups.set(ageGroup, {
                        count: 0,
                        rdwSum: 0,
                        rdwValues: []
                    });
                }

                const ageGroupData = this.processedData.demographicData.ageGroups.get(ageGroup);
                ageGroupData.count++;
                ageGroupData.rdwSum += rdwValue;
                ageGroupData.rdwValues.push(rdwValue);
            }

            if (sex && rdwValue > 0) {
                const sexKey = sex === 'M' ? 'Masculino' : 'Feminino';
                if (!this.processedData.demographicData.sex.has(sexKey)) {
                    this.processedData.demographicData.sex.set(sexKey, {
                        count: 0,
                        rdwSum: 0,
                        rdwValues: []
                    });
                }

                const sexData = this.processedData.demographicData.sex.get(sexKey);
                sexData.count++;
                sexData.rdwSum += rdwValue;
                sexData.rdwValues.push(rdwValue);
            }
        });

        // Calculate averages
        this.processedData.demographicData.ageGroups.forEach((data, ageGroup) => {
            data.avgRDW = data.rdwSum / data.count;
            delete data.rdwSum;
        });

        this.processedData.demographicData.sex.forEach((data, sex) => {
            data.avgRDW = data.rdwSum / data.count;
            delete data.rdwSum;
        });
    }

    // Helper functions
    getAgeGroup(age) {
        if (age < 18) return '0-17';
        if (age < 30) return '18-29';
        if (age < 45) return '30-44';
        if (age < 60) return '45-59';
        if (age < 75) return '60-74';
        return '75+';
    }

    getRDWStatus(avgRDW) {
        if (avgRDW <= 14.5) return 'normal';
        if (avgRDW <= 16.0) return 'elevated';
        return 'high';
    }

    // Get data for specific municipality
    getMunicipalityData(cityName) {
        return this.processedData.municipalities.get(cityName);
    }

    // Get chart data for city comparison
    getCityComparisonData() {
        const cities = Array.from(this.processedData.municipalities.entries())
            .map(([name, data]) => ({
                name,
                avgRDW: data.summary.avgRDW,
                patientCount: data.summary.patientCount,
                elevatedPercentage: data.summary.elevatedRDWPercentage,
                status: data.summary.status
            }))
            .sort((a, b) => b.patientCount - a.patientCount)
            .slice(0, 10); // Top 10 cities by patient count

        return cities;
    }

    // Get temporal evolution data for a city
    getTemporalDataForCity(cityName) {
        const temporalData = [];
        const dates = Array.from(this.processedData.temporalData.keys()).sort();

        dates.forEach(date => {
            const cityData = this.processedData.temporalData.get(date);
            if (cityData.has(cityName)) {
                temporalData.push({
                    date: new Date(date),
                    rdw: cityData.get(cityName)
                });
            }
        });

        return temporalData;
    }

    // Get demographic distribution
    getDemographicDistribution(type = 'age') {
        if (type === 'age') {
            return Array.from(this.processedData.demographicData.ageGroups.entries())
                .map(([group, data]) => ({
                    group,
                    count: data.count,
                    avgRDW: data.avgRDW
                }))
                .sort((a, b) => {
                    const ageOrder = ['0-17', '18-29', '30-44', '45-59', '60-74', '75+'];
                    return ageOrder.indexOf(a.group) - ageOrder.indexOf(b.group);
                });
        } else {
            return Array.from(this.processedData.demographicData.sex.entries())
                .map(([sex, data]) => ({
                    group: sex,
                    count: data.count,
                    avgRDW: data.avgRDW
                }));
        }
    }

    // Get RDW distribution data for histogram
    getRDWDistribution() {
        const allRDWValues = this.rawData
            .map(patient => patient.resultados_hemograma?.rdw_cv_percent)
            .filter(val => val > 0);

        const bins = [];
        const binSize = 0.5;
        const minValue = 10;
        const maxValue = 20;

        for (let i = minValue; i <= maxValue; i += binSize) {
            const binStart = i;
            const binEnd = i + binSize;
            const count = allRDWValues.filter(val => val >= binStart && val < binEnd).length;
            
            bins.push({
                range: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}%`,
                count: count,
                percentage: allRDWValues.length > 0 ? (count / allRDWValues.length) * 100 : 0
            });
        }

        return bins;
    }

    // Export processed data
    exportData() {
        return {
            statistics: this.statistics,
            municipalities: Object.fromEntries(this.processedData.municipalities),
            temporalData: Object.fromEntries(this.processedData.temporalData),
            demographicData: {
                ageGroups: Object.fromEntries(this.processedData.demographicData.ageGroups),
                sex: Object.fromEntries(this.processedData.demographicData.sex)
            },
            rawData: this.rawData
        };
    }
}

// Export for use in other modules
window.DataProcessor = DataProcessor;