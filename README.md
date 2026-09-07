# Guesso

Guesso is an ultra-fast Canvas LMS client for students.

## Development

Install dependencies with Bun:

```sh
bun install
```

Set `SESSION_SECRET` to a random 32-byte hexadecimal key in your local `.env` and deployment environment. Generate one with:

```sh
openssl rand -hex 32
```

Users enter their own public HTTPS Canvas URL and personal API token at `/login`. No Canvas credentials belong in `.env`. The server verifies each connection with Canvas before issuing a 30-day encrypted, HttpOnly, SameSite cookie. HTTPS deployments also mark the cookie Secure. Use HTTPS in production and keep the same secret across server instances and deployments. Changing it signs everyone out.

Tokens are encrypted in the session cookie and only decrypted on the server. No database is required. Sign-out deletes the browser's cookie; to revoke a token or a copied session, revoke the token in Canvas. Schools must permit personal access tokens. Private-network Canvas installations and nonstandard HTTPS ports are not supported.

Start the development server:

```sh
bun run dev
```

Run checks with:

```sh
bun run check
bun run lint
bun run build
```

After building, run the authentication tests with `bun run test:auth` on Node 24 or newer. They use synthetic Canvas responses and block real network connections.
