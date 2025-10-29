# Database Migration Guide

## Resume Fields Migration

This migration adds new resume-related fields to existing user profiles in Firestore.

### New Fields Added

- `certifications`: List of certification objects (name, issuer, year, url)
- `projects`: List of project objects (name, description, technologies, url)
- `languages`: List of spoken languages
- `data_sources`: Dictionary tracking which fields came from resume vs manual entry

### How to Run Migration

**Prerequisites:**
- Ensure backend environment is properly configured
- Firebase credentials must be set up
- Python environment with all dependencies installed

**Run Migration:**

```powershell
# From backend directory
cd backend

# Run the migration script
python scripts/migrate_add_resume_fields.py
```

### What the Migration Does

1. Fetches all existing user profiles from Firestore
2. For each profile:
   - Adds empty `certifications` array if not present
   - Adds empty `projects` array if not present
   - Adds empty `languages` array if not present
   - Adds empty `data_sources` object if not present
   - Updates `updated_at` timestamp
3. Preserves all existing fields and data
4. Reports summary of migrated profiles

### Migration Output

The script will display:
- Progress for each profile processed
- Summary statistics (total, migrated, skipped, errors)
- Success/failure status

### Safety

- **Non-destructive**: Only adds missing fields, never removes existing data
- **Idempotent**: Can be run multiple times safely
- **Backward compatible**: Existing profiles continue to work without migration

### Rollback

No rollback needed - the migration only adds fields with default empty values. Existing functionality is not affected.

### Notes

- The migration uses Firestore's `set(merge=True)` to safely add fields
- All new fields have sensible defaults (empty arrays/objects)
- Frontend and backend handle both migrated and non-migrated profiles gracefully
