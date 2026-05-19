# BidMart Core FE Catalog Plan (Iterasi Core-1)

Date: 2026-05-18
Scope: Implementasi halaman katalog WBS `2.1.*` + `2.2.*` pada `bidmart-core-fe`.

## 0) Progress Status

- FE-1 (Infrastructure Contract): **selesai awal** (DTO, repository contract, mapper, schema, API repository)
- FE-2 (Buyer Pages): **selesai awal** (`/catalog`, `/c/*`, `/listings/:listingId` sudah data-driven)
- FE-3 (Seller Pages): **selesai awal** (`/seller/listings/**` sudah data-driven)
- FE-4 (Auth Guard & Error Mapping): **selesai awal** (route guard terpusat di `routes/_app.seller.tsx` + error mapping katalog)
- FE-5 (Test Coverage Minimum): **selesai awal** (repository test, buyer page test, seller guard loader test)

## 1) Baseline Saat Ini

- Route sudah ada untuk semua halaman katalog.
- Page buyer dan seller katalog sudah aktif.
- Use-case dan data-layer catalog sudah terhubung ke endpoint BE, tetapi belum dipakai oleh halaman.
- Belum ada test file FE (`vitest` menemukan 0 test).

## 2) Kontrak API Referensi

Lihat source of truth di:

- `bidmart-core-be/docs/CATALOG_ITER1_CONTRACT.md`

Semua call FE harus mengikuti kontrak endpoint/shape pada dokumen tersebut.

## 3) Delivery Sequence FE

### FE-1: Infrastructure Contract

- Lengkapi `ICatalogRepository` method signatures.
- Lengkapi DTO input/output pada `application/dtos`.
- Implement `CatalogApiRepository` dan perbaiki `basePath`.
- Tambahkan parser schema Zod untuk semua response katalog.

### FE-2: Buyer Pages

- `/catalog`: list + search + filter + pagination.
- `/c/:categoryPath`: category filter mode (compat slug mode sementara).
- `/listings/:listingId`: detail listing publik.
- Tambahkan state `loading/empty/error` konsisten guideline.

### FE-3: Seller Pages

- `/seller/listings`: daftar listing seller.
- `/seller/listings/new`: create form + validasi.
- `/seller/listings/:listingId`: detail listing seller.
- `/seller/listings/:listingId/edit`: update detail/images.
- `/seller/listings/:listingId/cancel`: konfirmasi cancel + feedback status.

### FE-4: Auth Guard & Error Mapping

- Seller pages harus gagal aman jika unauthorized.
- Mapping error `409` (not editable/not cancellable/not publishable) ke UX message jelas.
- Redirect/CTA untuk user yang belum login.

### FE-5: Test Coverage Minimum

- Unit test repository mapping untuk response utama.
- Component/integration test untuk:
  - search/filter katalog,
  - create listing happy path,
  - edit/cancel conflict handling.

## 4) Acceptance Gate FE

- Seluruh route katalog WBS render data nyata dari API (bukan placeholder).
- Navigasi antar halaman seller/buyer berjalan.
- Error state dan loading state ada di semua data screen.
- Minimal smoke test FE untuk katalog tersedia dan lulus.

## 5) Known Risks

- Typecheck global FE saat ini gagal di modul non-catalog (bidding/wallet/order DTO).
- Selama iterasi katalog, validasi CI sementara perlu scoped test/typecheck untuk katalog supaya progress tetap unblock.
