# API Documentation

## Base URL
`http://localhost:8000/api/v1`

## Endpoints

### Plants

#### Create a Plant
- **URL**: `/plants/`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "Monstera",
    "species": "Araceae",
    "moisture": 60.5,
    "light": 500,
    "temp": 24.0,
    "status": "Healthy",
    "image_url": "http://example.com/image.jpg"
  }
  ```
- **Response**: `200 OK` (Returns created plant object)

#### Get All Plants
- **URL**: `/plants/`
- **Method**: `GET`
- **Query Params**:
  - `skip`: int (default 0)
  - `limit`: int (default 100)
- **Response**: `200 OK` (List of plants)

#### Get Single Plant
- **URL**: `/plants/{plant_id}`
- **Method**: `GET`
- **Response**: `200 OK` or `404 Not Found`

## Health Check
- **URL**: `/`
- **Method**: `GET`
- **Response**: `{"message": "Welcome to Antigravity Plant AI API V2"}`
