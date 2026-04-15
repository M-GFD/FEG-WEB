# Bucket Storage: fotos de clubes (`club-photos`)

Para que la subida **desde archivo** funcione, creá el bucket en Supabase:

1. **Dashboard** → **Storage** → **New bucket**
2. **Name:** `club-photos` (o el valor de `SUPABASE_STORAGE_BUCKET` en `.env.local`)
3. Marcá **Public bucket** (así la galería `/prensa` puede mostrar las URLs sin firmar).

Opcional (si no usás bucket público): políticas RLS de Storage para `SELECT` público y `INSERT` solo service role (el servidor ya usa la service role key).

En la app se permiten hasta **15 imágenes** por envío (mismo pie de foto y torneo opcional para todas).

Variable opcional en `.env.local`:

```env
SUPABASE_STORAGE_BUCKET=club-photos
```
