const request = require('supertest');
const app = require('../../app');
const { setupTestDatabase, teardownTestDatabase } = require('../utils/database');

describe('API Endpoints', () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    describe('Tracking Endpoints', () => {
        describe('GET /api/v1/tracking/:id', () => {
            test('should return package status for valid tracking number', async () => {
                const trackingNumber = 'ABC1234567';
                
                const response = await request(app)
                    .get(`/api/v1/tracking/${trackingNumber}`)
                    .expect(200);
                
                expect(response.body).toHaveProperty('success', true);
                expect(response.body.data).toHaveProperty('tracking_number', trackingNumber);
                expect(response.body.data).toHaveProperty('status');
                expect(response.body.data).toHaveProperty('last_updated');
                expect(response.body.data).toHaveProperty('location');
            });

            test('should return 404 for non-existent package', async () => {
                const trackingNumber = 'NONEXISTENT123';
                
                const response = await request(app)
                    .get(`/api/v1/tracking/${trackingNumber}`)
                    .expect(404);
                
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('error', 'Package not found');
            });

            test('should return 400 for invalid tracking number', async () => {
                const trackingNumber = 'INVALID';
                
                const response = await request(app)
                    .get(`/api/v1/tracking/${trackingNumber}`)
                    .expect(400);
                
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('error', 'Invalid tracking number');
            });
        });

        describe('GET /api/v1/tracking/:id/history', () => {
            test('should return tracking history for valid tracking number', async () => {
                const trackingNumber = 'ABC1234567';
                
                const response = await request(app)
                    .get(`/api/v1/tracking/${trackingNumber}/history`)
                    .expect(200);
                
                expect(response.body).toHaveProperty('success', true);
                expect(Array.isArray(response.body.data)).toBe(true);
                
                response.body.data.forEach(entry => {
                    expect(entry).toHaveProperty('timestamp');
                    expect(entry).toHaveProperty('status');
                    expect(entry).toHaveProperty('location');
                    expect(entry).toHaveProperty('description');
                });
            });

            test('should return 404 for non-existent package', async () => {
                const trackingNumber = 'NONEXISTENT123';
                
                const response = await request(app)
                    .get(`/api/v1/tracking/${trackingNumber}/history`)
                    .expect(404);
                
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('error', 'Package not found');
            });
        });
    });

    describe('Package Management Endpoints', () => {
        describe('POST /api/v1/packages', () => {
            test('should create new package', async () => {
                const packageData = {
                    sender: {
                        name: 'John Doe',
                        address: {
                            street: 'Main Street',
                            number: '123',
                            city: 'Sofia',
                            postalCode: '1000',
                            country: 'Bulgaria'
                        },
                        phone: '+359888123456',
                        email: 'john@example.com'
                    },
                    recipient: {
                        name: 'Jane Smith',
                        address: {
                            street: 'High Street',
                            number: '456',
                            city: 'Plovdiv',
                            postalCode: '4000',
                            country: 'Bulgaria'
                        },
                        phone: '+359888789012',
                        email: 'jane@example.com'
                    },
                    package: {
                        weight: 2.5,
                        dimensions: {
                            length: 30,
                            width: 20,
                            height: 15
                        },
                        service: 'standard',
                        description: 'Test package'
                    }
                };
                
                const response = await request(app)
                    .post('/api/v1/packages')
                    .send(packageData)
                    .expect(201);
                
                expect(response.body).toHaveProperty('success', true);
                expect(response.body.data).toHaveProperty('tracking_number');
                expect(response.body.data).toHaveProperty('status', 'pending');
            });

            test('should return 400 for invalid package data', async () => {
                const invalidPackageData = {
                    sender: {
                        name: 'John Doe'
                        // Missing required fields
                    },
                    recipient: {
                        name: 'Jane Smith'
                        // Missing required fields
                    },
                    package: {
                        weight: -1, // Invalid weight
                        service: 'invalid' // Invalid service
                    }
                };
                
                const response = await request(app)
                    .post('/api/v1/packages')
                    .send(invalidPackageData)
                    .expect(400);
                
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('error');
            });
        });

        describe('PUT /api/v1/packages/:id/status', () => {
            test('should update package status', async () => {
                const trackingNumber = 'ABC1234567';
                const statusUpdate = {
                    status: 'in_transit',
                    location: 'Sofia Hub',
                    description: 'Package is in transit'
                };
                
                const response = await request(app)
                    .put(`/api/v1/packages/${trackingNumber}/status`)
                    .send(statusUpdate)
                    .expect(200);
                
                expect(response.body).toHaveProperty('success', true);
                expect(response.body.data).toHaveProperty('status', statusUpdate.status);
                expect(response.body.data).toHaveProperty('location', statusUpdate.location);
            });

            test('should return 404 for non-existent package', async () => {
                const trackingNumber = 'NONEXISTENT123';
                const statusUpdate = {
                    status: 'in_transit',
                    location: 'Sofia Hub',
                    description: 'Package is in transit'
                };
                
                const response = await request(app)
                    .put(`/api/v1/packages/${trackingNumber}/status`)
                    .send(statusUpdate)
                    .expect(404);
                
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('error', 'Package not found');
            });

            test('should return 400 for invalid status update', async () => {
                const trackingNumber = 'ABC1234567';
                const invalidStatusUpdate = {
                    status: 'invalid_status',
                    location: '',
                    description: ''
                };
                
                const response = await request(app)
                    .put(`/api/v1/packages/${trackingNumber}/status`)
                    .send(invalidStatusUpdate)
                    .expect(400);
                
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('error');
            });
        });
    });

    describe('Services Endpoints', () => {
        describe('GET /api/v1/services', () => {
            test('should return list of available services', async () => {
                const response = await request(app)
                    .get('/api/v1/services')
                    .expect(200);
                
                expect(response.body).toHaveProperty('success', true);
                expect(Array.isArray(response.body.data)).toBe(true);
                
                response.body.data.forEach(service => {
                    expect(service).toHaveProperty('id');
                    expect(service).toHaveProperty('name');
                    expect(service).toHaveProperty('description');
                    expect(service).toHaveProperty('base_price');
                    expect(service).toHaveProperty('delivery_time');
                });
            });
        });

        describe('POST /api/v1/services/calculate-price', () => {
            test('should calculate delivery price', async () => {
                const priceRequest = {
                    service: 'standard',
                    weight: 2.5,
                    distance: 100,
                    dimensions: {
                        length: 30,
                        width: 20,
                        height: 15
                    }
                };
                
                const response = await request(app)
                    .post('/api/v1/services/calculate-price')
                    .send(priceRequest)
                    .expect(200);
                
                expect(response.body).toHaveProperty('success', true);
                expect(response.body.data).toHaveProperty('price');
                expect(response.body.data).toHaveProperty('currency', 'BGN');
                expect(response.body.data).toHaveProperty('estimated_delivery_time');
            });

            test('should return 400 for invalid price calculation request', async () => {
                const invalidPriceRequest = {
                    service: 'invalid',
                    weight: -1,
                    distance: -100,
                    dimensions: {
                        length: -30,
                        width: -20,
                        height: -15
                    }
                };
                
                const response = await request(app)
                    .post('/api/v1/services/calculate-price')
                    .send(invalidPriceRequest)
                    .expect(400);
                
                expect(response.body).toHaveProperty('success', false);
                expect(response.body).toHaveProperty('error');
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle 404 for non-existent endpoint', async () => {
            const response = await request(app)
                .get('/api/v1/non-existent')
                .expect(404);
            
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Endpoint not found');
        });

        test('should handle 500 for server error', async () => {
            // Simulate server error by sending invalid data
            const response = await request(app)
                .post('/api/v1/packages')
                .send(null)
                .expect(500);
            
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', 'Internal server error');
        });
    });

    describe('Rate Limiting', () => {
        test('should limit requests per minute', async () => {
            const trackingNumber = 'ABC1234567';
            const requests = Array(60).fill().map(() => 
                request(app).get(`/api/v1/tracking/${trackingNumber}`)
            );
            
            const responses = await Promise.all(requests);
            
            // First 50 requests should succeed
            responses.slice(0, 50).forEach(response => {
                expect(response.status).toBe(200);
            });
            
            // Remaining requests should be rate limited
            responses.slice(50).forEach(response => {
                expect(response.status).toBe(429);
                expect(response.body).toHaveProperty('error', 'Too many requests');
            });
        });
    });
}); 