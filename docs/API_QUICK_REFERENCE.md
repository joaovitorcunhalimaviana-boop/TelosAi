# API Quick Reference Guide
## Sistema Pós-Operatório - Patient Data Management

Quick reference for developers. For complete documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

---

## Base URL
```
http://localhost:3000/api
```

---

## Endpoints Cheat Sheet

### Patient CRUD

```bash
# Get patient
GET /paciente/{id}

# Update patient
PATCH /paciente/{id}
Content-Type: application/json
{ "name": "João Silva", "phone": "11999999999", ... }

# Delete patient
DELETE /paciente/{id}
```

### Patient List

```bash
# List all patients
GET /pacientes

# Search patients
GET /pacientes?search=João&page=1&limit=20

# Filter patients
GET /pacientes?surgeryType=hemorroidectomia&completeness=high&status=active
```

### Completeness

```bash
# Calculate completeness
GET /paciente/{id}/completeness

# Recalculate all patients
POST /paciente/all/completeness
```

### Timeline

```bash
# Get full timeline
GET /paciente/{id}/timeline

# Get filtered timeline
POST /paciente/{id}/timeline
Content-Type: application/json
{ "type": "followup" }
```

### Dashboard

```bash
# Get dashboard stats
GET /dashboard/stats

# Custom stats query
POST /dashboard/stats
Content-Type: application/json
{ "dateFrom": "2024-01-01T00:00:00.000Z", "surgeryType": "hemorroidectomia" }
```

---

## Common Query Parameters

| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| `page` | number | 1-∞ | Page number (default: 1) |
| `limit` | number | 1-100 | Items per page (default: 10) |
| `search` | string | - | Search name, phone, CPF |
| `surgeryType` | string | hemorroidectomia, fistula, fissura, pilonidal | Filter by surgery type |
| `status` | string | active, completed, cancelled | Filter by status |
| `completeness` | string | low, medium, high | Filter by completeness |
| `dateFrom` | ISO datetime | - | Filter from date |
| `dateTo` | ISO datetime | - | Filter to date |

---

## Request Body Examples

### Update Patient (PATCH /paciente/{id})

```json
{
  "name": "João Silva",
  "phone": "11999999999",
  "cpf": "12345678900",
  "email": "joao@example.com",
  "age": 45,
  "sex": "Masculino",
  "dateOfBirth": "1978-01-15T00:00:00.000Z",

  "surgery": {
    "type": "hemorroidectomia",
    "date": "2024-01-10T00:00:00.000Z",
    "hospital": "Hospital ABC",
    "durationMinutes": 45
  },

  "details": {
    "hemorrhoidTechnique": "Ferguson modificada",
    "hemorrhoidEnergyType": "ligasure",
    "hemorrhoidNumMamillae": 3,
    "fullDescription": "Descrição completa..."
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

### Create Patient (POST /pacientes)

```json
{
  "name": "João Silva",
  "phone": "11999999999",
  "cpf": "12345678900",
  "email": "joao@example.com",
  "age": 45,
  "sex": "Masculino"
}
```

---

## Response Examples

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### List Response

```json
{
  "success": true,
  "data": [ ... ],
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

### Error Response

```json
{
  "error": "Error message",
  "details": "Additional details",
  "code": "ERROR_CODE"
}
```

---

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate CPF |
| 500 | Server Error | Internal error |

---

## Completeness Calculation

| Section | Points | Condition |
|---------|--------|-----------|
| Base | 20% | Express form completed |
| Comorbidities | +10% | At least one comorbidity |
| Medications | +10% | At least one medication |
| Surgery Details | +20% | Details record exists |
| Anesthesia | +15% | Anesthesia record exists |
| Pre-Op | +10% | Pre-op record exists |
| Post-Op | +10% | Post-op record exists |
| Full Description | +5% | Full description filled |
| **TOTAL** | **100%** | All sections complete |

---

## Frontend Integration Examples

### React - Fetch Patient

```typescript
const response = await fetch(`/api/paciente/${id}`);
const { success, data, error } = await response.json();

if (success) {
  setPatient(data);
} else {
  console.error(error);
}
```

### React - Update Patient

```typescript
const response = await fetch(`/api/paciente/${id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
});

const { success, data, error } = await response.json();
```

### React - Search Patients

```typescript
const params = new URLSearchParams({
  search: 'João',
  page: '1',
  limit: '20'
});

const response = await fetch(`/api/pacientes?${params}`);
const { data, pagination } = await response.json();
```

### React - Dashboard Stats

```typescript
const response = await fetch('/api/dashboard/stats');
const { data } = await response.json();

console.log(data.summary.totalActivePatients);
console.log(data.todayFollowUps);
console.log(data.highRiskAlertsDetails);
```

---

## TypeScript Types

### Patient Type

```typescript
interface Patient {
  id: string;
  name: string;
  cpf?: string;
  phone: string;
  email?: string;
  age?: number;
  sex?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Surgery Type

```typescript
interface Surgery {
  id: string;
  patientId: string;
  type: 'hemorroidectomia' | 'fistula' | 'fissura' | 'pilonidal';
  date: Date;
  hospital?: string;
  durationMinutes?: number;
  status: 'active' | 'completed' | 'cancelled';
  dataCompleteness: number;
}
```

### API Response Type

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

interface ListResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

---

## Validation Schemas

Import from `lib/api-validation.ts`:

```typescript
import {
  createPatientSchema,
  updatePatientBasicSchema,
  surgerySchema,
  anesthesiaSchema,
  preOpSchema,
  postOpSchema,
  patientListParamsSchema
} from '@/lib/api-validation';

// Validate data
const validatedData = createPatientSchema.parse(requestBody);
```

---

## Utility Functions

Import from `lib/api-utils.ts`:

```typescript
import {
  paginate,
  buildPaginationMeta,
  buildSearchQuery,
  calculateCompleteness,
  buildTimelineEvents,
  isValidCuid,
  buildErrorResponse
} from '@/lib/api-utils';

// Use utilities
const { skip, take } = paginate(page, limit);
const completeness = calculateCompleteness(patient);
const events = buildTimelineEvents(patient);
```

---

## Common Patterns

### Error Handling

```typescript
try {
  const response = await fetch(url);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
} catch (error) {
  console.error('API Error:', error);
  throw error;
}
```

### With Loading State

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

try {
  setLoading(true);
  const data = await fetchPatient(id);
  setPatient(data);
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
```

### Pagination Handler

```typescript
function handlePageChange(newPage: number) {
  const params = new URLSearchParams({
    page: newPage.toString(),
    limit: limit.toString(),
    ...filters
  });

  router.push(`/pacientes?${params}`);
}
```

---

## Environment Variables

Currently not required for development. For production:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-here"
```

---

## Testing Endpoints

### Using cURL

```bash
# Get patient
curl http://localhost:3000/api/paciente/clxxx...

# Update patient
curl -X PATCH http://localhost:3000/api/paciente/clxxx... \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva"}'

# Search patients
curl "http://localhost:3000/api/pacientes?search=João&page=1"
```

### Using Postman/Insomnia

Import these as requests:

1. **GET Patient**: `GET {{baseUrl}}/paciente/{{patientId}}`
2. **UPDATE Patient**: `PATCH {{baseUrl}}/paciente/{{patientId}}`
3. **LIST Patients**: `GET {{baseUrl}}/pacientes?page=1&limit=20`
4. **Dashboard Stats**: `GET {{baseUrl}}/dashboard/stats`

---

## Troubleshooting

### 400 Bad Request
- Check request body matches schema
- Verify all required fields present
- Check data types (string vs number)

### 404 Not Found
- Verify patient ID exists
- Check ID is valid CUID format
- Ensure resource hasn't been deleted

### 500 Internal Error
- Check database connection
- Review server logs
- Verify Prisma schema is synced

---

## Performance Tips

1. **Use pagination** - Don't fetch all patients at once
2. **Cache dashboard stats** - Update every 1-5 minutes
3. **Debounce search** - Wait 300ms after user stops typing
4. **Parallel requests** - Fetch independent data simultaneously
5. **Optimize includes** - Only include relations you need

---

## Security Notes

- **Authentication**: Prepared for NextAuth (not yet enforced)
- **Input Validation**: All inputs validated with Zod
- **SQL Injection**: Protected by Prisma
- **XSS**: Inputs sanitized
- **Rate Limiting**: Prepared (not enforced in dev)

---

## Next Steps

1. ✅ API endpoints created
2. ⏳ Integrate into frontend pages
3. ⏳ Add authentication
4. ⏳ Add caching layer
5. ⏳ Write integration tests

---

## Support

- **Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Implementation Report**: See [API_IMPLEMENTATION_REPORT.md](./API_IMPLEMENTATION_REPORT.md)
- **Schema**: Check `prisma/schema.prisma`

---

**Last Updated**: November 9, 2025
