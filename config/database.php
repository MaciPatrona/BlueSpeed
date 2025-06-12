<?php
/**
 * Database Configuration
 * 
 * This file contains the database configuration settings for the BlueSpeed Courier Service.
 * Make sure to update these settings according to your environment.
 */

// Database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'bluespeed');
define('DB_USER', 'bluespeed_user');
define('DB_PASS', 'your_password');

// Database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    // Log error and display user-friendly message
    error_log("Database Connection Error: " . $e->getMessage());
    die("Sorry, there was a problem connecting to the database. Please try again later.");
}

// Database tables
define('TABLE_USERS', 'users');
define('TABLE_PACKAGES', 'packages');
define('TABLE_TRACKING', 'tracking');
define('TABLE_SERVICES', 'services');

// Database queries
define('QUERY_GET_USER', "SELECT * FROM " . TABLE_USERS . " WHERE id = ?");
define('QUERY_GET_PACKAGE', "SELECT * FROM " . TABLE_PACKAGES . " WHERE tracking_number = ?");
define('QUERY_GET_TRACKING', "SELECT * FROM " . TABLE_TRACKING . " WHERE package_id = ? ORDER BY timestamp DESC");
define('QUERY_GET_SERVICES', "SELECT * FROM " . TABLE_SERVICES . " WHERE active = 1");

// Database functions
function getPackageStatus($trackingNumber) {
    global $pdo;
    try {
        $stmt = $pdo->prepare(QUERY_GET_PACKAGE);
        $stmt->execute([$trackingNumber]);
        return $stmt->fetch();
    } catch (PDOException $e) {
        error_log("Error getting package status: " . $e->getMessage());
        return false;
    }
}

function getTrackingHistory($packageId) {
    global $pdo;
    try {
        $stmt = $pdo->prepare(QUERY_GET_TRACKING);
        $stmt->execute([$packageId]);
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log("Error getting tracking history: " . $e->getMessage());
        return false;
    }
}

function getAvailableServices() {
    global $pdo;
    try {
        $stmt = $pdo->query(QUERY_GET_SERVICES);
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log("Error getting services: " . $e->getMessage());
        return false;
    }
}

// Security functions
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}

function validateTrackingNumber($trackingNumber) {
    return preg_match('/^[A-Z0-9]{10}$/', $trackingNumber);
}

// Error handling
function handleDatabaseError($error) {
    error_log("Database Error: " . $error->getMessage());
    return [
        'success' => false,
        'message' => 'An error occurred. Please try again later.'
    ];
}

// Response functions
function sendJsonResponse($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sendErrorResponse($message, $code = 400) {
    http_response_code($code);
    sendJsonResponse([
        'success' => false,
        'message' => $message
    ]);
}

function sendSuccessResponse($data = null, $message = 'Success') {
    sendJsonResponse([
        'success' => true,
        'message' => $message,
        'data' => $data
    ]);
} 