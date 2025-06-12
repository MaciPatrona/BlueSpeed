const { getPackageStatus, getTrackingHistory } = require('../../services/tracking');

describe('Tracking Service', () => {
    describe('getPackageStatus', () => {
        test('should return package status for valid tracking number', async () => {
            const trackingNumber = 'ABC1234567';
            const status = await getPackageStatus(trackingNumber);
            
            expect(status).toBeDefined();
            expect(status.tracking_number).toBe(trackingNumber);
            expect(status.status).toBeDefined();
            expect(status.last_updated).toBeDefined();
            expect(status.location).toBeDefined();
        });

        test('should throw error for invalid tracking number', async () => {
            const trackingNumber = 'INVALID';
            
            await expect(getPackageStatus(trackingNumber))
                .rejects
                .toThrow('Invalid tracking number');
        });

        test('should throw error for non-existent package', async () => {
            const trackingNumber = 'NONEXISTENT123';
            
            await expect(getPackageStatus(trackingNumber))
                .rejects
                .toThrow('Package not found');
        });
    });

    describe('getTrackingHistory', () => {
        test('should return tracking history for valid tracking number', async () => {
            const trackingNumber = 'ABC1234567';
            const history = await getTrackingHistory(trackingNumber);
            
            expect(Array.isArray(history)).toBe(true);
            expect(history.length).toBeGreaterThan(0);
            
            history.forEach(entry => {
                expect(entry.timestamp).toBeDefined();
                expect(entry.status).toBeDefined();
                expect(entry.location).toBeDefined();
                expect(entry.description).toBeDefined();
            });
        });

        test('should throw error for invalid tracking number', async () => {
            const trackingNumber = 'INVALID';
            
            await expect(getTrackingHistory(trackingNumber))
                .rejects
                .toThrow('Invalid tracking number');
        });

        test('should return empty array for new package', async () => {
            const trackingNumber = 'NEW1234567';
            const history = await getTrackingHistory(trackingNumber);
            
            expect(Array.isArray(history)).toBe(true);
            expect(history.length).toBe(0);
        });
    });

    describe('Status Validation', () => {
        test('should validate package status format', async () => {
            const trackingNumber = 'ABC1234567';
            const status = await getPackageStatus(trackingNumber);
            
            const validStatuses = [
                'pending',
                'in_transit',
                'out_for_delivery',
                'delivered',
                'exception'
            ];
            
            expect(validStatuses).toContain(status.status);
        });

        test('should include required status fields', async () => {
            const trackingNumber = 'ABC1234567';
            const status = await getPackageStatus(trackingNumber);
            
            expect(status).toHaveProperty('tracking_number');
            expect(status).toHaveProperty('status');
            expect(status).toHaveProperty('last_updated');
            expect(status).toHaveProperty('location');
            expect(status).toHaveProperty('estimated_delivery');
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors gracefully', async () => {
            const trackingNumber = 'ABC1234567';
            
            // Mock network error
            jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
            
            await expect(getPackageStatus(trackingNumber))
                .rejects
                .toThrow('Failed to fetch package status');
        });

        test('should handle malformed response', async () => {
            const trackingNumber = 'ABC1234567';
            
            // Mock malformed response
            jest.spyOn(global, 'fetch').mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ invalid: 'response' })
            });
            
            await expect(getPackageStatus(trackingNumber))
                .rejects
                .toThrow('Invalid response format');
        });
    });

    describe('Performance', () => {
        test('should respond within acceptable time limit', async () => {
            const trackingNumber = 'ABC1234567';
            const startTime = Date.now();
            
            await getPackageStatus(trackingNumber);
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
        });

        test('should handle concurrent requests', async () => {
            const trackingNumbers = [
                'ABC1234567',
                'ABC1234568',
                'ABC1234569'
            ];
            
            const promises = trackingNumbers.map(number => getPackageStatus(number));
            const results = await Promise.all(promises);
            
            expect(results).toHaveLength(trackingNumbers.length);
            results.forEach((result, index) => {
                expect(result.tracking_number).toBe(trackingNumbers[index]);
            });
        });
    });
}); 