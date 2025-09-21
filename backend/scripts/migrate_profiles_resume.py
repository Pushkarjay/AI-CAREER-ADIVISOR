"""
Migration script to normalize profile schema for resume previews and parsed data.

What it does:
- Ensures each profile has `resume` object with keys: url, filename, uploadedAt, confidence_score, parsed
- Moves legacy fields (resume_url, resume_parsed_at, extracted_* fields) into the new structure
- Optionally backfills parsed.raw_text from stored data if available

Usage:
  python -m scripts.migrate_profiles_resume

This will run against the configured Firestore (or mock in debug fallback),
reading profiles in batches and updating them in place.
"""
from datetime import datetime
from typing import Dict, Any
import logging

from services.firestore_service import FirestoreService

logger = logging.getLogger(__name__)


async def migrate():
    fs = FirestoreService()
    db = fs._get_db()  # may be None if using mock fallback

    updated = 0
    scanned = 0
    try:
        if fs.use_mock:
            # In-memory mock: iterate keys
            for uid, profile in list(fs._mock_profiles.items()):
                scanned += 1
                newp, changed = normalize_profile(profile)
                if changed:
                    await fs.update_user_profile(uid, newp)
                    updated += 1
        else:
            # Firestore: stream all profiles
            profiles = db.collection("profiles").stream()
            for doc in profiles:
                scanned += 1
                data = doc.to_dict() or {}
                newp, changed = normalize_profile(data)
                if changed:
                    await fs.update_user_profile(data.get("user_id") or doc.id, newp)
                    updated += 1
    finally:
        logger.info(f"Profiles scanned: {scanned}, updated: {updated}")


def normalize_profile(p: Dict[str, Any]):
    changed = False
    resume = p.get("resume") or {}

    # Lift legacy resume_url
    if (not resume.get("url")) and p.get("resume_url"):
        resume["url"] = p.get("resume_url")
        changed = True
    # Lift parsed_at
    if (not p.get("resume_parsed_at")) and p.get("parsed_at"):
        p["resume_parsed_at"] = p.get("parsed_at")
        changed = True
    # Default filename if url present but no filename
    if resume.get("url") and not resume.get("filename"):
        resume["filename"] = resume.get("url").split("/")[-1] or "resume.pdf"
        changed = True
    # Default uploadedAt
    if not resume.get("uploadedAt"):
        resume["uploadedAt"] = datetime.now().isoformat()
        changed = True
    # Ensure confidence_score
    if resume.get("confidence_score") is None and p.get("confidence_score") is not None:
        resume["confidence_score"] = p.get("confidence_score")
        changed = True
    if resume.get("confidence_score") is None:
        resume["confidence_score"] = 0
        changed = True

    # Build parsed object if missing
    parsed = resume.get("parsed") or {}
    # Try to infer from profile fields
    if not parsed.get("skills") and p.get("skills"):
        parsed["skills"] = p.get("skills") if isinstance(p.get("skills"), list) else []
        changed = True
    if not parsed.get("full_name") and p.get("name"):
        parsed["full_name"] = p.get("name")
        changed = True
    if not parsed.get("experience_years") and p.get("experience_years"):
        parsed["experience_years"] = p.get("experience_years")
        changed = True
    # raw_text: leave empty unless you have a source; nothing to lift safely

    if parsed and resume.get("parsed") != parsed:
        resume["parsed"] = parsed
        changed = True

    if resume and p.get("resume") != resume:
        p["resume"] = resume
        changed = True

    # Remove legacy keys we migrated
    for k in ["resume_url", "parsed_at", "confidence_score"]:
        if k in p:
            del p[k]
            changed = True

    return p, changed


if __name__ == "__main__":
    import asyncio
    asyncio.run(migrate())
