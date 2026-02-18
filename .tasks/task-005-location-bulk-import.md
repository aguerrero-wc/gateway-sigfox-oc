# TASK-005: Bulk Import Locations from CDN (Excel)

## Business Context
We need to populate the database with a provider list hosted on a generic CDN.
The source file is an `.xlsx` (Excel) file.
Instead of uploading the file to our server, the API will receive a **public URL**, fetch the file, parse it in memory, and insert the records.

## Technical Requirements

### 1. Dependencies
*   **Networking:** Use `@nestjs/axios` (Axios) to fetch the file as an `ArrayBuffer`.
*   **Parsing:** Use `xlsx` (SheetJS) to read the buffer.
*   **Action:** Install these packages if missing.

### 2. Endpoint Definition
*   **Method:** `POST /locations/import-cdn`
*   **DTO:** `ImportLocationsDto`
    *   Property: `fileUrl` (string, IsUrl, IsNotEmpty).
    *   Example: `https://video-item.sfo3.cdn.digitaloceanspaces.com/Technogym%20-%20Providers%20list.xlsx`

### 3. Data Transformation & Mapping (CRITICAL)
The Excel file uses **Italian/European number formatting** (comma for decimals). You MUST sanitize this before parsing to float.

| Excel Header | Entity Property | Transformation Logic |
| :--- | :--- | :--- |
| `Name` | `name` | Trim string |
| `Street` | `address` | Trim string |
| `City` | `city` | Trim string |
| `ZIP` | `zip` | Parse Int |
| `Province` | `province` | Trim string |
| `Country` | `country` | Trim string |
| `Micro BS` | `microbs` | Trim string |
| `Lat.` | `latitude` | **Replace `,` with `.`** then Parse Float |
| `Long.` | `longitude` | **Replace `,` with `.`** then Parse Float |

### 4. Logic Flow
1.  Receive URL.
2.  Download file (Stream/Buffer).
3.  Parse Sheet 1 to JSON.
4.  Iterate rows:
    *   Sanitize data (Handle empty rows).
    *   Map fields.
    *   **Ignore ID column from Excel** (Let DB generate UUIDs or use it if strictly required, but usually DB auto-generates).
    *   Set `radiusMeters` to default `100` (since it's not in Excel).
5.  **Bulk Insert:** Use `repository.save()` or `insert()` in chunks (e.g., 50 records) for performance.
6.  Return: `{ success: true, count: number_of_records }`.

## Constraints
*   **Error Handling:** If the URL is invalid or 404, throw `BadRequestException`.
*   **Async:** Ensure the operation uses `await` correctly.