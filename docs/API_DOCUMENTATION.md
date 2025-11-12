# API Documentation - Sistema Pós-Operatório

Complete API documentation for patient data management endpoints.

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Endpoints](#endpoints)
   - [Patient Management](#patient-management)
   - [Patient List](#patient-list)
   - [Completeness Calculation](#completeness-calculation)
   - [Patient Timeline](#patient-timeline)
   - [Dashboard Statistics](#dashboard-statistics)

---

## Authentication

**Status**: Prepared for NextAuth integration

Currently, all endpoints are accessible without authentication for development purposes. Authentication middleware is prepared in `lib/api-middleware.ts` and ready for NextAuth integration.

### Future Implementation

```typescript
// Headers (when authentication is implemented)
Authorization: Bearer <token>
```

---

## Error Handling

All endpoints return consistent error responses:

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional details about the error",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate resources)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

---

## Endpoints

### Patient Management

#### GET /api/paciente/[id]

Load complete patient data with all relations.

**Parameters:**
- `id` (path) - Patient CUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "João Silva",
    "cpf": "12345678900",
    "phone": "11999999999",
    "email": "joao@example.com",
    "age": 45,
    "sex": "Masculino",
    "dateOfBirth": "1978-01-15T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "dataCompleteness": 85,
    "comorbidities": [
      {
        "id": "clxxx...",
        "patientId": "clxxx...",
        "comorbidityId": "clxxx...",
        "details": "HAS controlada",
        "severity": "Moderada",
        "comorbidity": {
          "id": "clxxx...",
          "name": "Hipertensão Arterial",
          "category": "cardiovascular"
        }
      }
    ],
    "medications": [
      {
        "id": "clxxx...",
        "patientId": "clxxx...",
        "medicationId": "clxxx...",
        "dose": "500mg",
        "frequency": "8/8h",
        "route": "VO",
        "medication": {
          "id": "clxxx...",
          "name": "Paracetamol",
          "category": "Analgesico"
        }
      }
    ],
    "surgeries": [
      {
        "id": "clxxx...",
        "type": "hemorroidectomia",
        "date": "2024-01-10T00:00:00.000Z",
        "hospital": "Hospital ABC",
        "durationMinutes": 45,
        "status": "active",
        "dataCompleteness": 85,
        "details": {
          "hemorrhoidTechnique": "Ferguson modificada",
          "hemorrhoidEnergyType": "ligasure",
          "hemorrhoidNumMamillae": 3,
          "fullDescription": "Descrição completa..."
        },
        "anesthesia": {
          "type": "raqui",
          "pudendoBlock": true
        },
        "preOp": {
          "botoxUsed": true,
          "botoxDate": "2024-01-01T00:00:00.000Z"
        },
        "postOp": {
          "ointments": "[...]",
          "medications": "[...]"
        }
      }
    ],
    "followUps": [...],
    "consentTerms": [...]
  }
}
```

#### PATCH /api/paciente/[id]

Update patient data including all related records.

**Parameters:**
- `id` (path) - Patient CUID

**Request Body:**
```json
{
  "name": "João Silva",
  "cpf": "12345678900",
  "phone": "11999999999",
  "email": "joao@example.com",
  "age": 45,
  "sex": "Masculino",
  "dateOfBirth": "1978-01-15T00:00:00.000Z",

  "surgery": {
    "type": "hemorroidectomia",
    "date": "2024-01-10T00:00:00.000Z",
    "hospital": "Hospital ABC",
    "durationMinutes": 45,
    "status": "active"
  },

  "details": {
    "hemorrhoidTechnique": "Ferguson modificada",
    "hemorrhoidEnergyType": "ligasure",
    "hemorrhoidNumMamillae": 3,
    "fullDescription": "Descrição completa da cirurgia..."
  },

  "anesthesia": {
    "type": "raqui",
    "pudendoBlock": true,
    "pudendoTechnique": "ultrassom"
  },

  "preOp": {
    "botoxUsed": true,
    "botoxDate": "2024-01-01T00:00:00.000Z",
    "botoxDoseUnits": 100
  },

  "postOp": {
    "ointments": "[{\"name\": \"Lidocaína 5%\", \"frequency\": \"3x/dia\"}]",
    "medications": "[{\"name\": \"Paracetamol\", \"dose\": \"500mg\"}]"
  },

  "comorbidities": [
    {
      "comorbidityId": "clxxx...",
      "details": "HAS controlada",
      "severity": "Moderada"
    }
  ],

  "medications": [
    {
      "medicationId": "clxxx...",
      "dose": "500mg",
      "frequency": "8/8h",
      "route": "VO"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "data": { ... } // Complete patient object
}
```

#### DELETE /api/paciente/[id]

Delete patient and all related records (cascade).

**Parameters:**
- `id` (path) - Patient CUID

**Response:**
```json
{
  "success": true,
  "message": "Patient deleted successfully"
}
```

---

### Patient List

#### GET /api/pacientes

List patients with pagination, filters, and search.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `search` (string) - Search by name, phone, or CPF
- `surgeryType` (string) - Filter by surgery type: `hemorroidectomia`, `fistula`, `fissura`, `pilonidal`
- `status` (string) - Filter by status: `active`, `completed`, `cancelled`
- `completeness` (string) - Filter by data completeness: `low` (<50%), `medium` (50-79%), `high` (>=80%)
- `dateFrom` (ISO datetime) - Filter surgeries from this date
- `dateTo` (ISO datetime) - Filter surgeries until this date

**Example Request:**
```
GET /api/pacientes?page=1&limit=20&search=João&surgeryType=hemorroidectomia&completeness=high
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "name": "João Silva",
      "cpf": "12345678900",
      "phone": "11999999999",
      "email": "joao@example.com",
      "age": 45,
      "sex": "Masculino",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z",
      "surgery": {
        "id": "clxxx...",
        "type": "hemorroidectomia",
        "date": "2024-01-10T00:00:00.000Z",
        "hospital": "Hospital ABC",
        "status": "active",
        "dataCompleteness": 85
      },
      "comorbidityCount": 2,
      "medicationCount": 3
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### POST /api/pacientes

Create a new patient.

**Request Body:**
```json
{
  "name": "João Silva",
  "phone": "11999999999",
  "cpf": "12345678900",
  "email": "joao@example.com",
  "dateOfBirth": "1978-01-15T00:00:00.000Z",
  "age": 45,
  "sex": "Masculino"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": { ... } // Complete patient object
}
```

---

### Completeness Calculation

#### GET /api/paciente/[id]/completeness

Calculate data completeness percentage for a patient's latest surgery.

**Parameters:**
- `id` (path) - Patient CUID

**Response:**
```json
{
  "success": true,
  "data": {
    "patientId": "clxxx...",
    "surgeryId": "clxxx...",
    "completeness": 85,
    "breakdown": {
      "base": 20,
      "comorbidities": 10,
      "medications": 10,
      "surgeryDetails": 20,
      "anesthesia": 15,
      "preOp": 10,
      "postOp": 10,
      "fullDescription": 5
    },
    "missingFields": []
  }
}
```

**Completeness Calculation:**
- Base: 20% (express form completed)
- Comorbidities: +10% (if filled)
- Medications: +10% (if filled)
- Surgery Details: +20% (if filled)
- Anesthesia: +15% (if filled)
- Pre-Op: +10% (if filled)
- Post-Op Prescription: +10% (if filled)
- Full Description: +5% (if filled)

#### POST /api/paciente/all/completeness

Recalculate completeness for all patients (admin function).

**Response:**
```json
{
  "success": true,
  "message": "Recalculated completeness for 250 surgeries"
}
```

---

### Patient Timeline

#### GET /api/paciente/[id]/timeline

Get complete timeline of all events for a patient.

**Parameters:**
- `id` (path) - Patient CUID

**Response:**
```json
{
  "success": true,
  "data": {
    "patientId": "clxxx...",
    "patientName": "João Silva",
    "timeline": [
      {
        "id": "clxxx...",
        "type": "surgery",
        "date": "2024-01-10T00:00:00.000Z",
        "title": "Cirurgia: hemorroidectomia",
        "description": "Hospital ABC",
        "metadata": {
          "durationMinutes": 45,
          "dataCompleteness": 85
        }
      },
      {
        "id": "clxxx...",
        "type": "followup",
        "date": "2024-01-11T00:00:00.000Z",
        "title": "Follow-up D+1",
        "description": "Status: responded",
        "metadata": {
          "dayNumber": 1,
          "status": "responded",
          "responseCount": 1
        }
      },
      {
        "id": "clxxx...",
        "type": "consent",
        "date": "2024-01-05T00:00:00.000Z",
        "title": "Termo: surgery_hemorrhoid",
        "description": "Assinado fisicamente",
        "metadata": {
          "termType": "surgery_hemorrhoid",
          "signedPhysically": true
        }
      }
    ],
    "stats": {
      "totalSurgeries": 1,
      "totalFollowUps": 7,
      "completedFollowUps": 5,
      "pendingFollowUps": 2,
      "overdueFollowUps": 0,
      "totalConsentTerms": 2,
      "signedConsentTerms": 2,
      "highRiskResponses": 0
    },
    "followUpSummary": [
      {
        "id": "clxxx...",
        "dayNumber": 1,
        "scheduledDate": "2024-01-11T00:00:00.000Z",
        "status": "responded",
        "sentAt": "2024-01-11T08:00:00.000Z",
        "respondedAt": "2024-01-11T09:30:00.000Z",
        "responseCount": 1,
        "latestRiskLevel": "low",
        "hasRedFlags": false
      }
    ]
  }
}
```

#### POST /api/paciente/[id]/timeline

Get filtered timeline events by type.

**Request Body:**
```json
{
  "type": "followup"  // Options: surgery, followup, consent, update
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patientId": "clxxx...",
    "type": "followup",
    "events": [...],
    "count": 7
  }
}
```

---

### Dashboard Statistics

#### GET /api/dashboard/stats

Get comprehensive dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalActivePatients": 150,
      "totalPendingFollowUps": 45,
      "pendingFollowUpsToday": 8,
      "overdueFollowUps": 3,
      "highRiskAlerts": 2,
      "recentSurgeries": 12,
      "averageCompletionRate": 72
    },
    "completionDistribution": {
      "low": 45,
      "medium": 80,
      "high": 25
    },
    "followUpDistribution": {
      "pending": 45,
      "sent": 20,
      "responded": 180,
      "overdue": 3,
      "skipped": 2
    },
    "surgeryTypeDistribution": {
      "hemorroidectomia": 95,
      "fistula": 30,
      "fissura": 18,
      "pilonidal": 7
    },
    "todayFollowUps": [
      {
        "id": "clxxx...",
        "dayNumber": 1,
        "scheduledDate": "2024-01-11T00:00:00.000Z",
        "patient": {
          "id": "clxxx...",
          "name": "João Silva",
          "phone": "11999999999"
        },
        "surgery": {
          "id": "clxxx...",
          "type": "hemorroidectomia",
          "date": "2024-01-10T00:00:00.000Z"
        }
      }
    ],
    "highRiskAlertsDetails": [
      {
        "id": "clxxx...",
        "riskLevel": "high",
        "redFlags": ["dor_intensa", "sangramento_ativo"],
        "createdAt": "2024-01-11T10:00:00.000Z",
        "followUp": {
          "id": "clxxx...",
          "dayNumber": 1
        },
        "patient": {
          "id": "clxxx...",
          "name": "Maria Santos",
          "phone": "11988888888"
        },
        "surgery": {
          "id": "clxxx...",
          "type": "hemorroidectomia",
          "date": "2024-01-10T00:00:00.000Z"
        }
      }
    ],
    "recentSurgeriesDetails": [...]
  }
}
```

#### POST /api/dashboard/stats

Get custom statistics with filters.

**Request Body:**
```json
{
  "dateFrom": "2024-01-01T00:00:00.000Z",
  "dateTo": "2024-01-31T23:59:59.999Z",
  "surgeryType": "hemorroidectomia"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSurgeries": 35,
    "averageCompleteness": 75,
    "averageDuration": 48,
    "riskLevelDistribution": {
      "low": 140,
      "medium": 25,
      "high": 8,
      "critical": 2
    },
    "filters": {
      "dateFrom": "2024-01-01T00:00:00.000Z",
      "dateTo": "2024-01-31T23:59:59.999Z",
      "surgeryType": "hemorroidectomia"
    }
  }
}
```

---

## Data Models

### Patient
```typescript
{
  id: string;
  name: string;
  cpf?: string;
  dateOfBirth?: Date;
  age?: number;
  sex?: string;
  phone: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Surgery
```typescript
{
  id: string;
  patientId: string;
  type: 'hemorroidectomia' | 'fistula' | 'fissura' | 'pilonidal';
  date: Date;
  hospital?: string;
  durationMinutes?: number;
  dataCompleteness: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

### Surgery Types
- `hemorroidectomia` - Hemorrhoidectomy
- `fistula` - Anal fistula surgery
- `fissura` - Anal fissure surgery
- `pilonidal` - Pilonidal disease surgery

---

## Rate Limiting

**Current**: Not enforced in development
**Prepared**: Middleware available in `lib/api-middleware.ts`

**Future limits (when enabled):**
- General endpoints: 100 requests per 15 minutes per IP
- Dashboard stats: 20 requests per minute
- List endpoints: 60 requests per minute

---

## Best Practices

1. **Always include error handling** when calling these endpoints
2. **Use pagination** for list endpoints to avoid large payloads
3. **Cache dashboard statistics** on the client for 1-5 minutes
4. **Validate data** before sending to PATCH endpoints
5. **Use the completeness endpoint** after major data updates
6. **Monitor rate limits** when authentication is enabled

---

## Examples

### Fetch Patient with Error Handling
```typescript
async function fetchPatient(id: string) {
  try {
    const response = await fetch(`/api/paciente/${id}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (error) {
    console.error('Failed to fetch patient:', error);
    throw error;
  }
}
```

### Update Patient Data
```typescript
async function updatePatient(id: string, updates: any) {
  try {
    const response = await fetch(`/api/paciente/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (error) {
    console.error('Failed to update patient:', error);
    throw error;
  }
}
```

### Search Patients
```typescript
async function searchPatients(search: string, page = 1) {
  const params = new URLSearchParams({
    search,
    page: page.toString(),
    limit: '20',
  });

  const response = await fetch(`/api/pacientes?${params}`);
  const data = await response.json();

  return {
    patients: data.data,
    pagination: data.pagination,
  };
}
```

---

## Support

For issues or questions about the API, contact the development team or check the project documentation.
