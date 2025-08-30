# Filter Switch API Documentation

## Base URL
```
https://us-central1-tlemons-46212.cloudfunctions.net
```

## Authentication
All endpoints require an API key in the header:
```
X-API-Key: your-api-key-here
```

## Endpoints

### 1. Create Site
Creates a new site entry and returns PHP code for integration.

**Endpoint:** `POST /createSite`

**Request Body:**
```json
{
  "name": "Site Name"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "siteId": "sitename",
  "name": "Site Name",
  "phpCode": "<?php\n// Site Name - Firebase Control\n...",
  "instructions": {
    "step1": "Add the PHP code to the beginning of your site's main PHP file",
    "step2": "Ensure filter.php exists in the same directory",
    "step3": "The filter will activate when status is set to \"on\" in Firebase"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing API key
- `400 Bad Request` - Missing name parameter
- `409 Conflict` - Site already exists

### 2. Get Site
Retrieves information about a specific site.

**Endpoint:** `GET /getSite?siteId={siteId}`

**Response (200 OK):**
```json
{
  "success": true,
  "siteId": "sitename",
  "data": {
    "name": "Site Name",
    "status": "on",
    "created": 1234567890
  }
}
```

**Error Responses:**
- `404 Not Found` - Site does not exist

### 3. Update Site Status
Changes the on/off status of a site.

**Endpoint:** `PUT /updateSiteStatus`

**Request Body:**
```json
{
  "siteId": "sitename",
  "status": "on"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "siteId": "sitename",
  "status": "on",
  "updated": 1234567890
}
```

**Error Responses:**
- `400 Bad Request` - Invalid status (must be "on" or "off")
- `404 Not Found` - Site does not exist

### 4. Delete Site
Removes a site from the system.

**Endpoint:** `DELETE /deleteSite?siteId={siteId}`

**Response (200 OK):**
```json
{
  "success": true,
  "siteId": "sitename",
  "message": "Site deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` - Site does not exist

### 5. List All Sites
Retrieves all sites in the system.

**Endpoint:** `GET /listSites`

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "sites": [
    {
      "siteId": "site1",
      "name": "Site 1",
      "status": "on",
      "created": 1234567890
    },
    {
      "siteId": "site2",
      "name": "Site 2",
      "status": "off",
      "created": 1234567891
    }
  ]
}
```

## Example Usage

### cURL
```bash
# Create a site
curl -X POST https://us-central1-tlemons-46212.cloudfunctions.net/createSite \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"name": "My Website"}'

# Get site info
curl -X GET "https://us-central1-tlemons-46212.cloudfunctions.net/getSite?siteId=mywebsite" \
  -H "X-API-Key: your-api-key"

# Update status
curl -X PUT https://us-central1-tlemons-46212.cloudfunctions.net/updateSiteStatus \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"siteId": "mywebsite", "status": "on"}'
```

### JavaScript
```javascript
const API_KEY = 'your-api-key';
const BASE_URL = 'https://us-central1-tlemons-46212.cloudfunctions.net';

// Create site
const response = await fetch(`${BASE_URL}/createSite`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  body: JSON.stringify({ name: 'My Website' })
});

const result = await response.json();
console.log(result.phpCode); // PHP code to add to your site
```

### PHP
```php
<?php
$apiKey = 'your-api-key';
$baseUrl = 'https://us-central1-tlemons-46212.cloudfunctions.net';

// Create site
$ch = curl_init($baseUrl . '/createSite');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['name' => 'My Website']));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: ' . $apiKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$result = json_decode($response, true);

// Save the PHP code
file_put_contents('firebase_control.php', $result['phpCode']);
?>
```

## Deployment

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize functions (if not done):
```bash
firebase init functions
```

4. Set the API key:
```bash
firebase functions:config:set api.key="your-secure-api-key"
```

5. Deploy functions:
```bash
cd functions
npm install
firebase deploy --only functions
```

## Security Notes

1. **API Key**: Generate a strong, unique API key. Never expose it in client-side code.
2. **HTTPS Only**: All requests must use HTTPS.
3. **Rate Limiting**: Consider implementing rate limiting for production use.
4. **Input Validation**: The API validates all inputs to prevent injection attacks.
5. **CORS**: Currently allows all origins (*). Restrict this in production.

## PHP Integration

After creating a site via the API, add the returned PHP code to the beginning of your site's main PHP file:

```php
<?php
// Your Site - Firebase Control
$firebase_url = 'https://tlemons-46212-default-rtdb.firebaseio.com/sites/yoursite/status.json';

// Get filter status
$status = trim(@file_get_contents($firebase_url), '"');

// Apply filter only if status is ON
if ($status === 'on') {
    require __DIR__ . '/filter.php';
}

// Your existing site code continues here...
?>
```

The filter will only activate when the site's status is set to "on" via the API or admin panel.