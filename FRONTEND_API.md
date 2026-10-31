# Frontend API

Base URL: `http://127.0.0.1:8000/api/v1`

## Submit customer details

`POST /customer-details`

This endpoint is public and does not require a login or API key. It is limited to 10 submissions per minute per IP. Send and receive JSON.

### Request

```json
{
  "customer_type": "Individual",
  "name": "Asha Kumar",
  "mobile": "+91 98765 43210",
  "city": "Mumbai",
  "pincode": "400001",
  "email": "asha@example.com",
  "interests": ["Kitchen Hardware", "Furniture Fittings"]
}
```

`customer_type` must be `Individual` or `Commercial`. `name`, `mobile`, `city`, `pincode`, and `interests` are required. `email` is optional and must be unique if supplied. `interests` must contain one or more of:

- `Kitchen Hardware`
- `Wardrobe Accessories`
- `Furniture Fittings`
- `Outdoor Furniture`

### Example JavaScript

```js
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const response = await fetch(`${API_BASE_URL}/customer-details`, {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(formData)
});

const result = await response.json();
if (!response.ok) throw result;
```

### Success response (`201`)

```json
{
  "message": "Customer details submitted successfully.",
  "data": {
    "id": 42,
    "customer_type": "Individual",
    "name": "Asha Kumar",
    "mobile": "+91 98765 43210",
    "city": "Mumbai",
    "pincode": "400001",
    "email": "asha@example.com",
    "interests": ["Kitchen Hardware", "Furniture Fittings"],
    "created_at": "2026-10-24T10:00:00.000000Z"
  }
}
```

Validation errors return `422` with `message` and `errors`. Requests over the limit return `429`.

## CORS

Set `FRONTEND_ORIGINS` in `.env` to the frontend origin, or comma-separated origins, without a path or trailing slash:

```env
FRONTEND_ORIGINS=https://www.example.com,http://localhost:5173
```

The default `*` allows any origin to submit this public form. Restrict it to the real frontend origins in production. Customer read/list endpoints remain admin-only and are not part of this public API.
