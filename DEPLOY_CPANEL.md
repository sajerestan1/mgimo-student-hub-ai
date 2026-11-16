# Standalone Academic Intelligence Demo — cPanel deployment

This demo is a static Vite site. It does not require the Base44 runtime for its demo-mode data.

## Build

From the repository root (Node 20+):

```bash
npm ci
npm run build:demo
```

The deployable site is generated in `dist/`. GitHub Actions also builds this on every push to `main`; download the **academic-intelligence-demo** artifact from the successful workflow run (artifacts are retained for 7 days).

## Upload to cPanel

1. In cPanel → **Domains**, locate `academic.buildforge.com.ng` and confirm its **Document Root**. Do not assume the directory name.
2. Open File Manager and navigate to that exact document root.
3. Upload the *contents* of `dist/` (including `index.html` and the `assets/` directory), not the `dist` folder itself.
4. Ensure the document root contains `index.html` at its top level.
5. If direct navigation to app routes returns 404, add this `.htaccess` in the document root so React Router paths fall back to the SPA entry point:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

6. Test the root URL, refresh a nested route, and test demo login/workspace navigation.

## DNS / cutover

The subdomain currently points at the Base44 host. Uploading files alone does **not** change DNS or make the new cPanel site public. Confirm the cPanel document root and test the static build first; change the `academic` DNS record only when you explicitly approve the cutover. Keep the existing Base44 destination available for rollback until the new site is verified.
