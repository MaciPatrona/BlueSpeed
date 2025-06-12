const {
    validateTrackingNumber,
    formatDate,
    calculateDistance,
    validateDimensions,
    validateWeight,
    validateAddress
} = require('../../utils/helpers');

describe('Utility Functions', () => {
    describe('validateTrackingNumber', () => {
        test('should validate correct tracking number format', () => {
            const validNumbers = [
                'ABC1234567',
                'XYZ9876543',
                'DEF4567890'
            ];
            
            validNumbers.forEach(number => {
                expect(validateTrackingNumber(number)).toBe(true);
            });
        });

        test('should reject invalid tracking number format', () => {
            const invalidNumbers = [
                'ABC123',           // Too short
                'ABC12345678',      // Too long
                '1234567890',       // No letters
                'ABCDEFGHIJ',       // No numbers
                'ABC 1234567',      // Contains space
                'ABC-1234567',      // Contains hyphen
                '',                 // Empty string
                null,               // Null
                undefined           // Undefined
            ];
            
            invalidNumbers.forEach(number => {
                expect(validateTrackingNumber(number)).toBe(false);
            });
        });
    });

    describe('formatDate', () => {
        test('should format date correctly', () => {
            const date = new Date('2024-03-15T10:30:00');
            const formatted = formatDate(date);
            
            expect(formatted).toBe('15.03.2024 10:30');
        });

        test('should handle different date formats', () => {
            const dates = [
                new Date('2024-03-15T10:30:00'),
                new Date('2024-12-31T23:59:59'),
                new Date('2024-01-01T00:00:00')
            ];
            
            const expected = [
                '15.03.2024 10:30',
                '31.12.2024 23:59',
                '01.01.2024 00:00'
            ];
            
            dates.forEach((date, index) => {
                expect(formatDate(date)).toBe(expected[index]);
            });
        });

        test('should handle invalid dates', () => {
            expect(() => formatDate('invalid')).toThrow('Invalid date');
            expect(() => formatDate(null)).toThrow('Invalid date');
            expect(() => formatDate(undefined)).toThrow('Invalid date');
        });
    });

    describe('calculateDistance', () => {
        test('should calculate distance between two points', () => {
            const point1 = { lat: 42.6977, lng: 23.3219 }; // Sofia
            const point2 = { lat: 42.1354, lng: 24.7453 }; // Plovdiv
            
            const distance = calculateDistance(point1, point2);
            
            expect(distance).toBeGreaterThan(0);
            expect(typeof distance).toBe('number');
        });

        test('should return 0 for same points', () => {
            const point = { lat: 42.6977, lng: 23.3219 };
            
            const distance = calculateDistance(point, point);
            
            expect(distance).toBe(0);
        });

        test('should handle invalid coordinates', () => {
            const validPoint = { lat: 42.6977, lng: 23.3219 };
            const invalidPoints = [
                { lat: 91, lng: 23.3219 },    // Invalid latitude
                { lat: 42.6977, lng: 181 },   // Invalid longitude
                { lat: -91, lng: 23.3219 },   // Invalid latitude
                { lat: 42.6977, lng: -181 }   // Invalid longitude
            ];
            
            invalidPoints.forEach(point => {
                expect(() => calculateDistance(validPoint, point))
                    .toThrow('Invalid coordinates');
            });
        });
    });

    describe('validateDimensions', () => {
        test('should validate correct dimensions', () => {
            const validDimensions = {
                length: 30,
                width: 20,
                height: 15
            };
            
            expect(validateDimensions(validDimensions)).toBe(true);
        });

        test('should reject invalid dimensions', () => {
            const invalidDimensions = [
                { length: -30, width: 20, height: 15 },    // Negative length
                { length: 30, width: -20, height: 15 },    // Negative width
                { length: 30, width: 20, height: -15 },    // Negative height
                { length: 0, width: 20, height: 15 },      // Zero length
                { length: 30, width: 0, height: 15 },      // Zero width
                { length: 30, width: 20, height: 0 },      // Zero height
                { length: 300, width: 200, height: 150 },  // Exceeds maximum
                { length: '30', width: 20, height: 15 },   // Invalid type
                { length: 30, width: '20', height: 15 },   // Invalid type
                { length: 30, width: 20, height: '15' }    // Invalid type
            ];
            
            invalidDimensions.forEach(dimensions => {
                expect(validateDimensions(dimensions)).toBe(false);
            });
        });
    });

    describe('validateWeight', () => {
        test('should validate correct weight', () => {
            const validWeights = [0.1, 1, 10, 100, 999.9];
            
            validWeights.forEach(weight => {
                expect(validateWeight(weight)).toBe(true);
            });
        });

        test('should reject invalid weight', () => {
            const invalidWeights = [
                -1,        // Negative
                0,         // Zero
                1000,      // Exceeds maximum
                '1',       // Invalid type
                null,      // Null
                undefined  // Undefined
            ];
            
            invalidWeights.forEach(weight => {
                expect(validateWeight(weight)).toBe(false);
            });
        });
    });

    describe('validateAddress', () => {
        test('should validate correct address', () => {
            const validAddress = {
                street: 'Main Street',
                number: '123',
                city: 'Sofia',
                postalCode: '1000',
                country: 'Bulgaria'
            };
            
            expect(validateAddress(validAddress)).toBe(true);
        });

        test('should reject invalid address', () => {
            const invalidAddresses = [
                { street: '', number: '123', city: 'Sofia', postalCode: '1000', country: 'Bulgaria' },      // Empty street
                { street: 'Main Street', number: '', city: 'Sofia', postalCode: '1000', country: 'Bulgaria' }, // Empty number
                { street: 'Main Street', number: '123', city: '', postalCode: '1000', country: 'Bulgaria' },    // Empty city
                { street: 'Main Street', number: '123', city: 'Sofia', postalCode: '', country: 'Bulgaria' },   // Empty postal code
                { street: 'Main Street', number: '123', city: 'Sofia', postalCode: '1000', country: '' },       // Empty country
                { street: 'Main Street', number: '123', city: 'Sofia', postalCode: 'invalid', country: 'Bulgaria' }, // Invalid postal code
                { street: 'Main Street', number: '123', city: 'Sofia', postalCode: '1000' },                    // Missing country
                { street: 'Main Street', number: '123', city: 'Sofia', country: 'Bulgaria' },                   // Missing postal code
                { street: 'Main Street', number: '123', postalCode: '1000', country: 'Bulgaria' },              // Missing city
                { street: 'Main Street', city: 'Sofia', postalCode: '1000', country: 'Bulgaria' },              // Missing number
                { number: '123', city: 'Sofia', postalCode: '1000', country: 'Bulgaria' }                       // Missing street
            ];
            
            invalidAddresses.forEach(address => {
                expect(validateAddress(address)).toBe(false);
            });
        });
    });
}); 