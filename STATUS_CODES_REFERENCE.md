# Status Codes Reference - RESTful API

## Status Codes Used

| Code | Name | Use | Example Message |
|--------|--------|-----|-----------------|
| **200** | OK | Successful request (GET, PUT, PATCH) | "Operation successful" |
| **201** | Created | Resource created successfully (POST) | "Resource created" |
| **204** | No Content | Resource deleted (DELETE) | Used without body |
| **400** | Bad Request | ⚠️ **DEPRECATED** - Use 422 instead | - |
| **401** | Unauthorized | User not authenticated / Invalid token | "Access denied. Please log in to continue." |
| **403** | Forbidden | Authenticated user but without permissions | "You don't have permission to perform this action." |
| **404** | Not Found | Resource does not exist | "The requested resource was not found." |
| **409** | Conflict | Integrity violation (duplicate data) | "This action conflicts with existing data." |
| **422** | Unprocessable Entity | Validation errors (ZodError) | "Invalid request. Please check your input and try again." |
| **500** | Internal Server Error | Unhandled server error | "An unexpected error occurred. Please try again later." |

## Response Structure

All endpoints return this format:

```json
{
  "status": "Success|Error|Unauthorized|Forbidden|Conflict|Unprocessable Entity",
  "message": "Technical message for developers",
  "data": {} // Optional, additional data
}
```