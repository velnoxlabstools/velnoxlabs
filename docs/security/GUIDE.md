# Security Guide

Module: src/security

- ErrorBoundary + GlobalErrorHandler
- Input/Output sanitizers
- Slug/route/metadata/file validators
- Central logger with redaction

Never log tokens/passwords. Prefer ValidationManager for shared checks.
