const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
    user: process.env.TEST_DB_USER,
    host: process.env.TEST_DB_HOST,
    database: process.env.TEST_DB_NAME,
    password: process.env.TEST_DB_PASSWORD,
    port: process.env.TEST_DB_PORT
});

async function setupTestDatabase() {
    try {
        // Read and execute schema file
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Split schema into individual statements
        const statements = schema
            .split(';')
            .filter(statement => statement.trim())
            .map(statement => statement + ';');
        
        // Execute each statement
        for (const statement of statements) {
            await pool.query(statement);
        }
        
        // Insert test data
        await insertTestData();
        
        console.log('Test database setup completed successfully');
    } catch (error) {
        console.error('Error setting up test database:', error);
        throw error;
    }
}

async function teardownTestDatabase() {
    try {
        // Drop all tables
        await pool.query(`
            DROP TABLE IF EXISTS package_history CASCADE;
            DROP TABLE IF EXISTS packages CASCADE;
            DROP TABLE IF EXISTS services CASCADE;
        `);
        
        console.log('Test database teardown completed successfully');
    } catch (error) {
        console.error('Error tearing down test database:', error);
        throw error;
    }
}

async function insertTestData() {
    try {
        // Insert test services
        await pool.query(`
            INSERT INTO services (id, name, description, base_price, delivery_time)
            VALUES
                ('standard', 'Standard Delivery', 'Regular delivery service', 10.00, '3-5 days'),
                ('express', 'Express Delivery', 'Fast delivery service', 20.00, '1-2 days'),
                ('overnight', 'Overnight Delivery', 'Next day delivery service', 30.00, '1 day')
            ON CONFLICT (id) DO NOTHING;
        `);
        
        // Insert test package
        await pool.query(`
            INSERT INTO packages (
                tracking_number,
                sender_name,
                sender_address,
                sender_phone,
                sender_email,
                recipient_name,
                recipient_address,
                recipient_phone,
                recipient_email,
                weight,
                dimensions,
                service,
                description,
                status,
                location,
                created_at,
                updated_at
            )
            VALUES (
                'ABC1234567',
                'John Doe',
                '{"street": "Main Street", "number": "123", "city": "Sofia", "postalCode": "1000", "country": "Bulgaria"}',
                '+359888123456',
                'john@example.com',
                'Jane Smith',
                '{"street": "High Street", "number": "456", "city": "Plovdiv", "postalCode": "4000", "country": "Bulgaria"}',
                '+359888789012',
                'jane@example.com',
                2.5,
                '{"length": 30, "width": 20, "height": 15}',
                'standard',
                'Test package',
                'pending',
                'Sofia Hub',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
            ON CONFLICT (tracking_number) DO NOTHING;
        `);
        
        // Insert test package history
        await pool.query(`
            INSERT INTO package_history (
                tracking_number,
                status,
                location,
                description,
                timestamp
            )
            VALUES (
                'ABC1234567',
                'pending',
                'Sofia Hub',
                'Package registered',
                CURRENT_TIMESTAMP
            )
            ON CONFLICT DO NOTHING;
        `);
        
        console.log('Test data inserted successfully');
    } catch (error) {
        console.error('Error inserting test data:', error);
        throw error;
    }
}

async function clearTestData() {
    try {
        await pool.query('TRUNCATE packages, package_history CASCADE');
        console.log('Test data cleared successfully');
    } catch (error) {
        console.error('Error clearing test data:', error);
        throw error;
    }
}

module.exports = {
    setupTestDatabase,
    teardownTestDatabase,
    insertTestData,
    clearTestData,
    pool
}; 