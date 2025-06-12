const { getAvailableServices, calculatePrice } = require('../../services/services');

describe('Services', () => {
    describe('getAvailableServices', () => {
        test('should return list of available services', async () => {
            const services = await getAvailableServices();
            
            expect(Array.isArray(services)).toBe(true);
            expect(services.length).toBeGreaterThan(0);
            
            services.forEach(service => {
                expect(service).toHaveProperty('id');
                expect(service).toHaveProperty('name');
                expect(service).toHaveProperty('description');
                expect(service).toHaveProperty('base_price');
                expect(service).toHaveProperty('delivery_time');
            });
        });

        test('should include all required service types', async () => {
            const services = await getAvailableServices();
            const serviceTypes = services.map(service => service.id);
            
            expect(serviceTypes).toContain('standard');
            expect(serviceTypes).toContain('express');
            expect(serviceTypes).toContain('overnight');
        });
    });

    describe('calculatePrice', () => {
        test('should calculate price for standard delivery', async () => {
            const params = {
                service: 'standard',
                weight: 2.5,
                distance: 100,
                dimensions: {
                    length: 30,
                    width: 20,
                    height: 15
                }
            };
            
            const price = await calculatePrice(params);
            
            expect(price).toBeDefined();
            expect(price).toBeGreaterThan(0);
            expect(typeof price).toBe('number');
        });

        test('should calculate price for express delivery', async () => {
            const params = {
                service: 'express',
                weight: 1.5,
                distance: 50,
                dimensions: {
                    length: 25,
                    width: 15,
                    height: 10
                }
            };
            
            const price = await calculatePrice(params);
            
            expect(price).toBeDefined();
            expect(price).toBeGreaterThan(0);
            expect(typeof price).toBe('number');
        });

        test('should throw error for invalid service', async () => {
            const params = {
                service: 'invalid',
                weight: 2.5,
                distance: 100,
                dimensions: {
                    length: 30,
                    width: 20,
                    height: 15
                }
            };
            
            await expect(calculatePrice(params))
                .rejects
                .toThrow('Invalid service type');
        });

        test('should throw error for invalid weight', async () => {
            const params = {
                service: 'standard',
                weight: -1,
                distance: 100,
                dimensions: {
                    length: 30,
                    width: 20,
                    height: 15
                }
            };
            
            await expect(calculatePrice(params))
                .rejects
                .toThrow('Invalid weight');
        });

        test('should throw error for invalid distance', async () => {
            const params = {
                service: 'standard',
                weight: 2.5,
                distance: -50,
                dimensions: {
                    length: 30,
                    width: 20,
                    height: 15
                }
            };
            
            await expect(calculatePrice(params))
                .rejects
                .toThrow('Invalid distance');
        });

        test('should throw error for invalid dimensions', async () => {
            const params = {
                service: 'standard',
                weight: 2.5,
                distance: 100,
                dimensions: {
                    length: -30,
                    width: 20,
                    height: 15
                }
            };
            
            await expect(calculatePrice(params))
                .rejects
                .toThrow('Invalid dimensions');
        });
    });

    describe('Price Calculation Logic', () => {
        test('should apply weight-based pricing', async () => {
            const baseParams = {
                service: 'standard',
                distance: 100,
                dimensions: {
                    length: 30,
                    width: 20,
                    height: 15
                }
            };
            
            const lightPackage = { ...baseParams, weight: 1 };
            const heavyPackage = { ...baseParams, weight: 5 };
            
            const lightPrice = await calculatePrice(lightPackage);
            const heavyPrice = await calculatePrice(heavyPackage);
            
            expect(heavyPrice).toBeGreaterThan(lightPrice);
        });

        test('should apply distance-based pricing', async () => {
            const baseParams = {
                service: 'standard',
                weight: 2.5,
                dimensions: {
                    length: 30,
                    width: 20,
                    height: 15
                }
            };
            
            const shortDistance = { ...baseParams, distance: 50 };
            const longDistance = { ...baseParams, distance: 200 };
            
            const shortPrice = await calculatePrice(shortDistance);
            const longPrice = await calculatePrice(longDistance);
            
            expect(longPrice).toBeGreaterThan(shortPrice);
        });

        test('should apply service type multiplier', async () => {
            const baseParams = {
                weight: 2.5,
                distance: 100,
                dimensions: {
                    length: 30,
                    width: 20,
                    height: 15
                }
            };
            
            const standardPrice = await calculatePrice({ ...baseParams, service: 'standard' });
            const expressPrice = await calculatePrice({ ...baseParams, service: 'express' });
            const overnightPrice = await calculatePrice({ ...baseParams, service: 'overnight' });
            
            expect(expressPrice).toBeGreaterThan(standardPrice);
            expect(overnightPrice).toBeGreaterThan(expressPrice);
        });
    });

    describe('Edge Cases', () => {
        test('should handle maximum weight limit', async () => {
            const params = {
                service: 'standard',
                weight: 1000,
                distance: 100,
                dimensions: {
                    length: 30,
                    width: 20,
                    height: 15
                }
            };
            
            await expect(calculatePrice(params))
                .rejects
                .toThrow('Weight exceeds maximum limit');
        });

        test('should handle maximum distance limit', async () => {
            const params = {
                service: 'standard',
                weight: 2.5,
                distance: 10000,
                dimensions: {
                    length: 30,
                    width: 20,
                    height: 15
                }
            };
            
            await expect(calculatePrice(params))
                .rejects
                .toThrow('Distance exceeds maximum limit');
        });

        test('should handle maximum dimensions limit', async () => {
            const params = {
                service: 'standard',
                weight: 2.5,
                distance: 100,
                dimensions: {
                    length: 300,
                    width: 200,
                    height: 150
                }
            };
            
            await expect(calculatePrice(params))
                .rejects
                .toThrow('Dimensions exceed maximum limit');
        });
    });
}); 