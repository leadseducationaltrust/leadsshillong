---
name: oracle-sql-developer
user-invocable: true
description: "Use when you need to connect to an Oracle database using the SQL Developer extension for VS Code and write, review, or troubleshoot SQL queries."
---

# Oracle SQL Developer Skill

## Purpose

This skill helps you work with Oracle databases inside VS Code using the SQL Developer extension. It is designed for database connection setup, schema inspection, query writing, and SQL troubleshooting.

## When to use

- You want to connect to Oracle from VS Code using the SQL Developer extension.
- You need guidance on Oracle connection profiles, connection strings, or TNS settings.
- You want help authoring or optimizing SQL queries for Oracle.
- You need assistance understanding query results, execution plans, or Oracle-specific SQL syntax.

## What this skill does

- Explains how to configure Oracle connection details in the SQL Developer extension.
- Helps choose the right connection parameters (host, port, service name, SID, username, password).
- Helps build and validate SQL queries using Oracle SQL dialect.
- Provides advice for Oracle-specific functions, joins, subqueries, and query tuning.
- Suggests next steps for query testing and result verification in VS Code.

## Typical workflow

1. Verify the SQL Developer extension is installed in VS Code.
2. Confirm the Oracle database connection details you have:
   - host
   - port
   - service name or SID
   - username and password
   - any required wallet, TNS, or network settings
3. Create or update a SQL Developer connection profile.
4. Test connection and troubleshoot any authentication or network issues.
5. Write SQL queries in VS Code and validate them against the Oracle database.
6. Review query results and refine the SQL as needed.

## Example prompts

- "Help me connect to my Oracle database using the SQL Developer extension in VS Code."
- "I have these connection details; show me how to add them to SQL Developer in VS Code."
- "Write an Oracle SQL query to join these two tables and filter by date."
- "Why does my Oracle query return an ORA-00942 error?"
- "Optimize this Oracle SQL query for performance."

## Notes

- This skill is workspace-scoped and intended for the current project environment.
- If you need only a single query or a quick syntax fix, ask directly and the skill will still apply.
