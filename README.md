# AmpuLife Next

Workspace Next.js untuk migrasi bertahap dari versi HTML + jQuery lama.

## Menjalankan Project

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Route Utama

- `/` -> dashboard migration
- `/game` -> layered architecture game (modular)
- `/legacy/index.html` -> file game legacy asli

## Struktur Folder

```text
ampulife-next/
	public/
		legacy/
			index.html
			css/
			js/
			images/
	src/
		layers/
			domain/
				entities/
				services/
			application/
				use-cases/
			infrastructure/
				catalogs/
				persistence/
			presentation/
				game/
		app/
			game/
				page.js
				page.module.css
			globals.css
			layout.js
			page.js
			page.module.css
```

## Rencana Refactor Bertahap

1. Pisahkan state game dari `public/legacy/js/script.js` ke module Next.js.
2. Pecah fitur berdasarkan domain: `jobs`, `assets`, `relationship`, `events`.
3. Tambahkan autosave `localStorage` dengan versioning save.
4. Migrasi UI panel satu per satu dari legacy HTML ke React component.

## Catatan

- Versi saat ini menjaga kompatibilitas penuh dengan game lama.
- Layered route baru sudah mengimplementasikan domain `jobs`, `assets`, `relations`, dan `events`.
- Autosave localStorage sudah aktif melalui repository di layer infrastructure.
