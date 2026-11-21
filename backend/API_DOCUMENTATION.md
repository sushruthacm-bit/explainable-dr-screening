# Diabetic Retinopathy Screening System – Backend API Documentation

**Backend:** Node.js + Express.js  
**Database:** MongoDB  
**Base URL:** `http://localhost:5000`

## 1. Health Check API

**Method:** GET  
**Endpoint:** `/api/health`

**Purpose:** Checks whether the backend server is running.

## 2. Patient APIs

### Register Patient
- **Method:** POST
- **Endpoint:** `/api/patients`
- **Purpose:** Registers a new patient.
- **Input:** Patient name, age and gender.
- **Output:** Patient details and generated patient ID.

### Get Patient Details
- **Method:** GET
- **Endpoint:** `/api/patients/:patientId`
- **Purpose:** Retrieves patient information using the patient ID.

### Get Patient Screening History
- **Method:** GET
- **Endpoint:** `/api/patients/:patientId/history`
- **Purpose:** Retrieves patient details and previous screening records.

## 3. Screening APIs

### Upload Retinal Image
- **Method:** POST
- **Endpoint:** `/api/screenings/upload`
- **Content-Type:** `multipart/form-data`

**Input fields:**
| Field | Type | Description |
|---|---|---|
| patientId | Text | Registered patient ID |
| image | File | Retinal image in JPEG or PNG format |

**Purpose:** Uploads the retinal image, sends it to the AI model API and stores the screening results.

**Output includes:**
- Original prediction
- Adaptive prediction
- Confidence values
- Class probabilities
- Image quality metrics
- PIED analysis
- Reliability flag
- Grad-CAM image paths
- Processing and review status

### Get Screening Result
- **Method:** GET
- **Endpoint:** `/api/screenings/:id`
- **Purpose:** Retrieves a screening record using its screening ID, including populated patient details.

## 4. Report APIs

### Upload PDF Report
- **Method:** POST
- **Endpoint:** `/api/reports/upload`
- **Content-Type:** `multipart/form-data`

**Input fields:**
| Field | Type | Description |
|---|---|---|
| patientId | Text | Registered patient ID |
| screeningId | Text | Screening record ID |
| report | File | PDF report (maximum 10 MB) |

### Get Patient Reports
- **Method:** GET
- **Endpoint:** `/api/reports/patient/:patientId`
- **Purpose:** Retrieves all reports belonging to a patient.

### Get Report Details
- **Method:** GET
- **Endpoint:** `/api/reports/:reportId`
- **Purpose:** Retrieves report information with patient and screening details.

### Download Report
- **Method:** GET
- **Endpoint:** `/api/reports/:reportId/download`
- **Purpose:** Downloads the stored PDF report.

## 5. Important Notes for Frontend Integration

1. The frontend must use the backend base URL.
2. Patient registration should happen before image screening.
3. Use `multipart/form-data` for image and PDF uploads.
4. The image field must be named `image`.
5. The PDF field must be named `report`.
6. Use the generated patient ID for subsequent patient operations.
7. Use the screening ID to retrieve screening results.
8. Display the reliability flag and review status clearly.
9. A failed AI request must be handled without displaying a successful screening result.
10. Grad-CAM paths refer to files stored by the backend; the frontend needs an appropriate way to access those images.

**Important:** The screening output is experimental and requires appropriate human review. It must not be presented as a confirmed medical diagnosis.