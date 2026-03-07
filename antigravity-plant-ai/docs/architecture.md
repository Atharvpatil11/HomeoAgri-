# System Architecture

## Architecture Diagram (Placeholder for system_architecture.png)
```mermaid
graph TD
    User[User] -->|Browser| Frontend[React Frontend]
    Frontend -->|HTTP/JSON| Backend[FastAPI Backend]
    Backend -->|SQLAlchemy| DB[(SQLite Database)]
    Backend -->|Inference| AI[AI Model Service]
    AI -->|Load| ModelFile[Model .h5]
```

## Database Schema (Placeholder for database_schema.png)
```mermaid
erDiagram
    PLANTS ||--o{ SENSOR_READINGS : has
    PLANTS {
        int id PK
        string name
        string species
        string status
        float moisture
        float light
        float temp
        string image_url
        datetime created_at
    }
    SENSOR_READINGS {
        int id PK
        int plant_id FK
        float moisture
        float light
        float temp
        datetime recorded_at
    }
```

## Model Flow (Placeholder for model_flow_diagram.png)
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Preprocessor
    participant Model
    
    User->>Frontend: Upload Image
    Frontend->>Backend: POST /analyze {image}
    Backend->>Preprocessor: Resize & Normalize
    Preprocessor-->>Backend: Tensor
    Backend->>Model: Predict(Tensor)
    Model-->>Backend: Probabilities
    Backend-->>Frontend: Result (Healthy/Diseased)
    Frontend-->>User: Show Alert/Status
```
