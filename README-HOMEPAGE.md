
# UTUNYANGE public website starter

## Included
- Express 5 server and EJS page routes
- Responsive public pages: Home, About, Academics, Admissions, News, Contact
- Portal login placeholder
- White, blue and yellow visual system
- Shared navigation/footer partials
- 404 and 500 pages

## Install and run
Open PowerShell in the project root:

```powershell
npm install
npm start
```

Then open http://localhost:3000

If you have not created `.env` yet:

```powershell
Copy-Item .env.example .env
```

## Important setup notes
1. This package is intended to be extracted into the existing UTUNYANGE project root, preserving the existing `package.json`, `.env`, database and module folders.
2. The pages use image URLs from Unsplash as temporary visual placeholders. Replace them with approved school photographs before production.
3. Replace sample phone, email and address details with the school's official contacts.
4. The contact form opens the visitor's email application; it does not yet save enquiries to the database.
5. The portal login page is a visual placeholder. Authentication and role-based dashboards will be implemented separately.
6. This public website does not yet connect to MySQL; public pages can run without a database.
