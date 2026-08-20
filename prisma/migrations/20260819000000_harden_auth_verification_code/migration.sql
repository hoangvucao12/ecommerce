ALTER TABLE "VerificationCode"
ALTER COLUMN "code" TYPE VARCHAR(100);

-- Keep only the newest code for each email/purpose before tightening uniqueness.
DELETE FROM "VerificationCode" AS older
USING "VerificationCode" AS newer
WHERE older."email" = newer."email"
  AND older."type" = newer."type"
  AND (
    older."createdAt" < newer."createdAt"
    OR (older."createdAt" = newer."createdAt" AND older."id" < newer."id")
  );

DROP INDEX IF EXISTS "VerificationCode_email_code_type_key";

CREATE UNIQUE INDEX "VerificationCode_email_type_key"
ON "VerificationCode"("email", "type");
