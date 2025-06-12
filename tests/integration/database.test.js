const { Pool } = require('pg');
const { setupTestDatabase, teardownTestDatabase } = require('../utils/database');
const { createPackage, getPackage, updatePackageStatus, getPackageHistory } = require('../../services/database');

describe('Database Integration', () => {
    let pool;
    
    beforeAll(async () => {
        pool = new Pool({
            user: process.env.TEST_DB_USER,
            host: process.env.TEST_DB_HOST,
            database: process.env.TEST_DB_NAME,
            password: process.env.TEST_DB_PASSWORD,
            port: process.env.TEST_DB_PORT
        });
        
        await setupTestDatabase();
    });
    
    afterAll(async () => {
        await teardownTestDatabase();
        await pool.end();
    });
    
    beforeEach(async () => {
        // Clear test data before each test
        await pool.query('TRUNCATE packages, package_history CASCADE');
    });
    
    describe('Package Management', () => {
        test('should create new package', async () => {
            const packageData = {
                tracking_number: 'TEST1234567',
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
            
            const result = await createPackage(packageData);
            
            expect(result).toHaveProperty('tracking_number', packageData.tracking_number);
            expect(result).toHaveProperty('status', 'pending');
            expect(result).toHaveProperty('created_at');
            expect(result).toHaveProperty('updated_at');
            
            // Verify data in database
            const dbResult = await pool.query(
                'SELECT * FROM packages WHERE tracking_number = $1',
                [packageData.tracking_number]
            );
            
            expect(dbResult.rows).toHaveLength(1);
            expect(dbResult.rows[0]).toMatchObject({
                tracking_number: packageData.tracking_number,
                status: 'pending',
                sender_name: packageData.sender.name,
                recipient_name: packageData.recipient.name
            });
        });
        
        test('should get package by tracking number', async () => {
            // Create test package
            const packageData = {
                tracking_number: 'TEST1234567',
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
            
            await createPackage(packageData);
            
            // Get package
            const result = await getPackage(packageData.tracking_number);
            
            expect(result).toHaveProperty('tracking_number', packageData.tracking_number);
            expect(result).toHaveProperty('status', 'pending');
            expect(result).toHaveProperty('sender');
            expect(result).toHaveProperty('recipient');
            expect(result).toHaveProperty('package');
        });
        
        test('should update package status', async () => {
            // Create test package
            const packageData = {
                tracking_number: 'TEST1234567',
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
            
            await createPackage(packageData);
            
            // Update status
            const statusUpdate = {
                status: 'in_transit',
                location: 'Sofia Hub',
                description: 'Package is in transit'
            };
            
            const result = await updatePackageStatus(packageData.tracking_number, statusUpdate);
            
            expect(result).toHaveProperty('status', statusUpdate.status);
            expect(result).toHaveProperty('location', statusUpdate.location);
            expect(result).toHaveProperty('updated_at');
            
            // Verify data in database
            const dbResult = await pool.query(
                'SELECT * FROM packages WHERE tracking_number = $1',
                [packageData.tracking_number]
            );
            
            expect(dbResult.rows).toHaveLength(1);
            expect(dbResult.rows[0]).toMatchObject({
                status: statusUpdate.status,
                location: statusUpdate.location
            });
        });
        
        test('should get package history', async () => {
            // Create test package
            const packageData = {
                tracking_number: 'TEST1234567',
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
            
            await createPackage(packageData);
            
            // Update status multiple times
            const statusUpdates = [
                {
                    status: 'in_transit',
                    location: 'Sofia Hub',
                    description: 'Package is in transit'
                },
                {
                    status: 'out_for_delivery',
                    location: 'Plovdiv Hub',
                    description: 'Package is out for delivery'
                },
                {
                    status: 'delivered',
                    location: 'Plovdiv',
                    description: 'Package has been delivered'
                }
            ];
            
            for (const update of statusUpdates) {
                await updatePackageStatus(packageData.tracking_number, update);
            }
            
            // Get history
            const history = await getPackageHistory(packageData.tracking_number);
            
            expect(Array.isArray(history)).toBe(true);
            expect(history).toHaveLength(statusUpdates.length + 1); // +1 for initial 'pending' status
            
            history.forEach((entry, index) => {
                expect(entry).toHaveProperty('timestamp');
                expect(entry).toHaveProperty('status');
                expect(entry).toHaveProperty('location');
                expect(entry).toHaveProperty('description');
            });
            
            // Verify history in database
            const dbResult = await pool.query(
                'SELECT * FROM package_history WHERE tracking_number = $1 ORDER BY timestamp ASC',
                [packageData.tracking_number]
            );
            
            expect(dbResult.rows).toHaveLength(statusUpdates.length + 1);
        });
    });
    
    describe('Error Handling', () => {
        test('should handle duplicate tracking number', async () => {
            const packageData = {
                tracking_number: 'TEST1234567',
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
            
            await createPackage(packageData);
            
            await expect(createPackage(packageData))
                .rejects
                .toThrow('Duplicate tracking number');
        });
        
        test('should handle non-existent package', async () => {
            const trackingNumber = 'NONEXISTENT123';
            
            await expect(getPackage(trackingNumber))
                .rejects
                .toThrow('Package not found');
            
            await expect(updatePackageStatus(trackingNumber, {
                status: 'in_transit',
                location: 'Sofia Hub',
                description: 'Package is in transit'
            }))
                .rejects
                .toThrow('Package not found');
            
            await expect(getPackageHistory(trackingNumber))
                .rejects
                .toThrow('Package not found');
        });
        
        test('should handle invalid status update', async () => {
            // Create test package
            const packageData = {
                tracking_number: 'TEST1234567',
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
            
            await createPackage(packageData);
            
            // Try to update with invalid status
            const invalidUpdate = {
                status: 'invalid_status',
                location: 'Sofia Hub',
                description: 'Invalid status update'
            };
            
            await expect(updatePackageStatus(packageData.tracking_number, invalidUpdate))
                .rejects
                .toThrow('Invalid status');
        });
    });
    
    describe('Data Integrity', () => {
        test('should maintain data consistency', async () => {
            // Create test package
            const packageData = {
                tracking_number: 'TEST1234567',
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
            
            await createPackage(packageData);
            
            // Update status
            const statusUpdate = {
                status: 'in_transit',
                location: 'Sofia Hub',
                description: 'Package is in transit'
            };
            
            await updatePackageStatus(packageData.tracking_number, statusUpdate);
            
            // Verify data consistency
            const packageResult = await pool.query(
                'SELECT * FROM packages WHERE tracking_number = $1',
                [packageData.tracking_number]
            );
            
            const historyResult = await pool.query(
                'SELECT * FROM package_history WHERE tracking_number = $1 ORDER BY timestamp DESC LIMIT 1',
                [packageData.tracking_number]
            );
            
            expect(packageResult.rows[0].status).toBe(statusUpdate.status);
            expect(packageResult.rows[0].location).toBe(statusUpdate.location);
            expect(historyResult.rows[0].status).toBe(statusUpdate.status);
            expect(historyResult.rows[0].location).toBe(statusUpdate.location);
            expect(historyResult.rows[0].description).toBe(statusUpdate.description);
        });
        
        test('should handle concurrent updates', async () => {
            // Create test package
            const packageData = {
                tracking_number: 'TEST1234567',
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
            
            await createPackage(packageData);
            
            // Simulate concurrent updates
            const updates = [
                {
                    status: 'in_transit',
                    location: 'Sofia Hub',
                    description: 'Package is in transit'
                },
                {
                    status: 'out_for_delivery',
                    location: 'Plovdiv Hub',
                    description: 'Package is out for delivery'
                }
            ];
            
            const promises = updates.map(update =>
                updatePackageStatus(packageData.tracking_number, update)
            );
            
            await Promise.all(promises);
            
            // Verify final state
            const packageResult = await pool.query(
                'SELECT * FROM packages WHERE tracking_number = $1',
                [packageData.tracking_number]
            );
            
            const historyResult = await pool.query(
                'SELECT * FROM package_history WHERE tracking_number = $1 ORDER BY timestamp DESC',
                [packageData.tracking_number]
            );
            
            expect(packageResult.rows).toHaveLength(1);
            expect(historyResult.rows).toHaveLength(3); // Initial + 2 updates
            
            // Verify that the last update is the final state
            expect(packageResult.rows[0].status).toBe(updates[1].status);
            expect(packageResult.rows[0].location).toBe(updates[1].location);
        });
    });
}); 