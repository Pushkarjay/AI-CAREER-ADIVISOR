### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /chatHistory/{userId}/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### BigQuery Schema (example for careers table)

```json
[
  {
    "name": "career_id",
    "type": "STRING",
    "mode": "REQUIRED"
  },
  {
    "name": "title",
    "type": "STRING",
    "mode": "NULLABLE"
  },
  {
    "name": "description",
    "type": "STRING",
    "mode": "NULLABLE"
  },
  {
    "name": "required_skills",
    "type": "STRING",
    "mode": "REPEATED"
  },
  {
    "name": "embedding",
    "type": "FLOAT",
    "mode": "REPEATED"
  }
]
```
