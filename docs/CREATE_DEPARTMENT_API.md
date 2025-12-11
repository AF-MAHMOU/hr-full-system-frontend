# Create Department - Backend API Implementation Guide

## 🎯 API Endpoint

### **POST** `/organization-structure/departments`

**Purpose:** Create a new department in the organization structure

---

## 🔐 Authorization

**Required Roles:**
- `HR_ADMIN`
- `SYSTEM_ADMIN`

**Guards:**
- `JwtAuthGuard` - Validates JWT token (automatic for all endpoints)
- `RolesGuard` - Validates user has required role

---

## 📥 Request

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body (CreateDepartmentDto)

```typescript
{
  code: string;              // Required, 2-10 characters, unique
  name: string;              // Required, 2-100 characters
  description?: string;       // Optional, max 500 characters
  headPositionId?: string;   // Optional, MongoDB ObjectId (must exist)
  costCenter?: string;       // Optional, max 50 characters
}
```

### Validation Rules

| Field | Type | Required | Min Length | Max Length | Unique | Notes |
|-------|------|----------|------------|------------|--------|-------|
| `code` | string | ✅ Yes | 2 | 10 | ✅ Yes | Trimmed, uppercase recommended |
| `name` | string | ✅ Yes | 2 | 100 | ❌ No | Trimmed |
| `description` | string | ❌ No | - | 500 | ❌ No | Trimmed |
| `headPositionId` | string | ❌ No | - | - | ❌ No | Must be valid MongoDB ObjectId, position must exist |
| `costCenter` | string | ❌ No | - | 50 | ❌ No | Trimmed |

### Example Request

**Minimal (Required fields only):**
```json
{
  "code": "IT",
  "name": "Information Technology"
}
```

**Complete (All fields):**
```json
{
  "code": "IT",
  "name": "Information Technology",
  "description": "Handles all IT infrastructure, development, and support",
  "headPositionId": "507f1f77bcf86cd799439011",
  "costCenter": "CC-IT-001"
}
```

---

## 📤 Response

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "code": "IT",
    "name": "Information Technology",
    "description": "Handles all IT infrastructure, development, and support",
    "headPositionId": "507f1f77bcf86cd799439011",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "code must be longer than or equal to 2 characters",
    "name should not be empty"
  ],
  "error": "Bad Request"
}
```

#### 401 Unauthorized - Missing/Invalid Token
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 403 Forbidden - Insufficient Permissions
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

#### 409 Conflict - Duplicate Code
```json
{
  "statusCode": 409,
  "message": "Department with code 'IT' already exists"
}
```

#### 404 Not Found - Invalid headPositionId
```json
{
  "statusCode": 404,
  "message": "Position with ID '507f1f77bcf86cd799439011' not found"
}
```

---

## 🔧 Backend Implementation

### 1. Controller Method

**File:** `src/organization-structure/organization-structure.controller.ts`

```typescript
@Post('departments')
@HttpCode(HttpStatus.CREATED)
@UseGuards(RolesGuard)
@Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
async createDepartment(
  @Body() createDepartmentDto: CreateDepartmentDto,
  @CurrentUser() user: JwtPayload,
) {
  const department = await this.orgStructureService.createDepartment(
    createDepartmentDto,
    user.employeeId?.toString() || user.userid.toString(),
  );

  return {
    success: true,
    message: 'Department created successfully',
    data: department,
  };
}
```

### 2. Service Method

**File:** `src/organization-structure/organization-structure.service.ts`

```typescript
async createDepartment(
  createDepartmentDto: CreateDepartmentDto,
  userId: string,
): Promise<Department> {
  // 1. Check if department code already exists
  const existingDepartment = await this.departmentModel.findOne({
    code: createDepartmentDto.code,
  });

  if (existingDepartment) {
    throw new ConflictException(
      `Department with code '${createDepartmentDto.code}' already exists`,
    );
  }

  // 2. Validate head position exists (if provided)
  if (createDepartmentDto.headPositionId) {
    await this.validatePositionExists(createDepartmentDto.headPositionId);
  }

  // 3. Create new department document
  const department = new this.departmentModel({
    ...createDepartmentDto,
    isActive: true, // Always set to true on creation
  });

  // 4. Save to MongoDB collection
  return department.save();
}
```

### 3. DTO (Data Transfer Object)

**File:** `src/organization-structure/dto/create-department.dto.ts`

```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(10)
  @Transform(({ value }) => value?.trim())
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsMongoId()
  @IsOptional()
  headPositionId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  costCenter?: string;
}
```

### 4. Schema/Model

**File:** `src/organization-structure/models/department.schema.ts`

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Position } from './position.schema';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({ collection: 'departments', timestamps: true })
export class Department {
  @Prop({ type: String, required: true, unique: true })
  code: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  headPositionId?: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const DepartmentSchema = SchemaFactory.createForDepartment(Department);
```

**MongoDB Collection:** `departments`

**Indexes:**
- `code` - Unique index (enforced by Mongoose)

**Auto-generated Fields:**
- `_id` - MongoDB ObjectId
- `createdAt` - Timestamp (from timestamps: true)
- `updatedAt` - Timestamp (from timestamps: true)

---

## 🔄 Complete Flow

```
1. Client sends POST /organization-structure/departments
   ↓
2. JwtAuthGuard validates JWT token from cookie
   ↓
3. RolesGuard checks user has HR_ADMIN or SYSTEM_ADMIN role
   ↓
4. Controller receives CreateDepartmentDto
   ↓
5. Service.createDepartment() called:
   a. Check if code already exists → throw ConflictException if exists
   b. Validate headPositionId exists (if provided) → throw NotFoundException if invalid
   c. Create new Department document with:
      - All DTO fields
      - isActive: true (default)
   d. Save to MongoDB 'departments' collection
   ↓
6. Return success response with created department
```

---

## 📊 Database Document Structure

### Created Document in `departments` Collection

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "code": "IT",
  "name": "Information Technology",
  "description": "Handles all IT infrastructure, development, and support",
  "headPositionId": ObjectId("507f1f77bcf86cd799439011"),
  "isActive": true,
  "createdAt": ISODate("2024-01-15T10:00:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:00:00.000Z")
}
```

### MongoDB Indexes

```javascript
// Automatically created by Mongoose
db.departments.createIndex({ "code": 1 }, { unique: true })
```

---

## ✅ Validation Checklist

Before calling the API, ensure:

- [ ] User is authenticated (has valid JWT token)
- [ ] User has `HR_ADMIN` or `SYSTEM_ADMIN` role
- [ ] `code` is provided and is 2-10 characters
- [ ] `code` is unique (not already exists)
- [ ] `name` is provided and is 2-100 characters
- [ ] `headPositionId` (if provided) is a valid MongoDB ObjectId
- [ ] `headPositionId` (if provided) references an existing Position
- [ ] `description` (if provided) is max 500 characters
- [ ] `costCenter` (if provided) is max 50 characters

---

## 🧪 Testing Examples

### cURL Command

```bash
curl -X POST http://localhost:3000/organization-structure/departments \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{
    "code": "IT",
    "name": "Information Technology",
    "description": "IT Department"
  }'
```

### JavaScript/Fetch Example

```javascript
const response = await fetch('http://localhost:3000/organization-structure/departments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies
  body: JSON.stringify({
    code: 'IT',
    name: 'Information Technology',
    description: 'IT Department'
  })
});

const data = await response.json();
console.log(data);
```

### Postman Collection

```
POST http://localhost:3000/organization-structure/departments

Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "code": "IT",
  "name": "Information Technology",
  "description": "IT Department"
}

Authentication:
  Type: Cookie
  Cookie Name: token
  Value: <JWT_TOKEN>
```

---

## 🔗 Related Endpoints

After creating a department, you can:

1. **View Department:**
   - `GET /organization-structure/departments/:id`
   - `GET /organization-structure/departments/code/:code`

2. **Update Department:**
   - `PUT /organization-structure/departments/:id`

3. **Assign Department Head:**
   - `PUT /organization-structure/departments/:id/head`

4. **Create Position in Department:**
   - `POST /organization-structure/positions` (with `departmentId`)

---

## 📝 Notes

1. **Department Code:** Should be short, uppercase, and unique (e.g., "IT", "HR", "FIN")

2. **Head Position:** Can be assigned later using the assign head endpoint. Not required at creation.

3. **Soft Delete:** Departments are never deleted, only deactivated (`isActive: false`)

4. **Timestamps:** `createdAt` and `updatedAt` are automatically managed by Mongoose

5. **Validation:** All string fields are automatically trimmed before validation

6. **Case Sensitivity:** Department codes are case-sensitive. "IT" and "it" are different.

---

## 🚨 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `409 Conflict` | Department code already exists | Use a different code or update existing department |
| `404 Not Found` | Invalid `headPositionId` | Create position first, or remove `headPositionId` |
| `401 Unauthorized` | Missing/invalid JWT token | Login first to get valid token |
| `403 Forbidden` | User doesn't have required role | Use account with HR_ADMIN or SYSTEM_ADMIN role |
| `400 Bad Request` | Validation failed | Check field lengths and required fields |

---

## 🎯 Next Steps

After creating a department:

1. **Create Positions** in the department
2. **Assign Department Head** (optional)
3. **Assign Employees** to positions in the department
4. **View Organization Chart** to see the structure

