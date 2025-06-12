# BlueSpeed Courier Service API Documentation

## Overview

The BlueSpeed Courier Service API provides endpoints for tracking packages, managing deliveries, and accessing service information. This documentation outlines the available endpoints, request/response formats, and authentication requirements.

## Base URL

```
https://api.bluespeed.com/v1
```

## Authentication

All API requests require authentication using an API key. Include your API key in the request header:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Package Tracking

#### Get Package Status
```
GET /tracking/{tracking_number}
```

**Parameters:**
- `tracking_number` (required): The unique tracking number of the package

**Response:**
```json
{
    "success": true,
    "data": {
        "tracking_number": "ABC1234567",
        "status": "in_transit",
        "service": "Express Delivery",
        "sender": {
            "name": "John Doe",
            "phone": "+359888123456"
        },
        "recipient": {
            "name": "Jane Smith",
            "phone": "+359888765432",
            "address": "123 Main St, Sofia, Bulgaria"
        },
        "created_at": "2024-03-20T10:00:00Z",
        "estimated_delivery": "2024-03-22T10:00:00Z"
    }
}
```

#### Get Tracking History
```
GET /tracking/{tracking_number}/history
```

**Parameters:**
- `tracking_number` (required): The unique tracking number of the package

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "status": "pending",
            "location": "Sofia Hub",
            "description": "Package received",
            "timestamp": "2024-03-20T10:00:00Z"
        },
        {
            "status": "in_transit",
            "location": "In Transit",
            "description": "Package in transit",
            "timestamp": "2024-03-21T10:00:00Z"
        }
    ]
}
```

### Package Management

#### Create Package
```
POST /packages
```

**Request Body:**
```json
{
    "service_id": 1,
    "sender": {
        "name": "John Doe",
        "phone": "+359888123456",
        "address": "456 Oak St, Sofia, Bulgaria"
    },
    "recipient": {
        "name": "Jane Smith",
        "phone": "+359888765432",
        "address": "123 Main St, Sofia, Bulgaria"
    },
    "package": {
        "weight": 2.5,
        "dimensions": "30x20x10",
        "description": "Fragile items"
    }
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "tracking_number": "ABC1234567",
        "status": "pending",
        "created_at": "2024-03-20T10:00:00Z"
    }
}
```

#### Update Package Status
```
PUT /packages/{tracking_number}/status
```

**Parameters:**
- `tracking_number` (required): The unique tracking number of the package

**Request Body:**
```json
{
    "status": "in_transit",
    "location": "Sofia Hub",
    "description": "Package in transit"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "tracking_number": "ABC1234567",
        "status": "in_transit",
        "updated_at": "2024-03-21T10:00:00Z"
    }
}
```

### Services

#### Get Available Services
```
GET /services
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Standard Delivery",
            "description": "Regular delivery service within 3-5 business days",
            "price": 10.00,
            "delivery_time": "3-5 business days"
        },
        {
            "id": 2,
            "name": "Express Delivery",
            "description": "Fast delivery service within 1-2 business days",
            "price": 20.00,
            "delivery_time": "1-2 business days"
        },
        {
            "id": 3,
            "name": "Same Day Delivery",
            "description": "Delivery on the same day for local addresses",
            "price": 30.00,
            "delivery_time": "Same day"
        }
    ]
}
```

#### Calculate Delivery Price
```
POST /services/calculate-price
```

**Request Body:**
```json
{
    "service_id": 1,
    "weight": 2.5,
    "dimensions": "30x20x10",
    "from_address": "456 Oak St, Sofia, Bulgaria",
    "to_address": "123 Main St, Sofia, Bulgaria"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "service": "Standard Delivery",
        "base_price": 10.00,
        "weight_price": 5.00,
        "distance_price": 3.00,
        "total_price": 18.00
    }
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages in the following format:

```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Error description"
    }
}
```

Common error codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for standard users
- 1000 requests per minute for premium users

Rate limit headers are included in the response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1616236800
```

## Versioning

The API version is included in the URL path. The current version is v1.

## Support

For API support, please contact:
- Email: api-support@bluespeed.com
- Phone: +359 888 123 456
- Documentation: https://api.bluespeed.com/docs 