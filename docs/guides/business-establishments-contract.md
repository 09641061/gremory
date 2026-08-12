# Contrato de API - Business Establishments

Snapshot del estado actual del proyecto al `2026-08-12`.
Este documento registra el flujo de locales tal como lo consume hoy el frontend.

## Estado actual del frontend

- La pantalla de crear local ya incluye selector de `timeZone`.
- La pantalla de editar local ya permite modificar `timeZone`.
- El detalle del local muestra `timeZone`.
- El frontend usa la zona IANA del local como referencia para agenda y analytics.
- `America/Lima` sigue siendo el valor sugerido por defecto cuando no hay otra zona elegida.

## Endpoint base

`/api/business/establishments`

## Regla de zona horaria

- El frontend debe enviar `timeZone` cuando cree o edite un local
- El valor debe ser una zona IANA valida, por ejemplo `America/Lima`
- Si el frontend no envia `timeZone`, el backend usa `UTC` por compatibilidad
- El campo se devuelve siempre en la respuesta del local

## Flujo actual de datos

- El backend devuelve `timeZone` en listados y detalles de locales
- El frontend guarda esa zona en el formulario de crear y editar
- El detalle del local tambien la presenta al usuario
- Esa misma zona sirve como base para scheduling y analytics del local

## Cambios que debe hacer el frontend

- Agregar un selector de zona horaria en los formularios de crear y editar local
- Usar zonas IANA, no offsets sueltos
- Sugerir `America/Lima` como valor por defecto cuando no haya una zona elegida
- Mostrar `timeZone` en el detalle del local
- Mantener la zona horaria del local como referencia para agenda y analytics, no la del navegador del usuario

## Cambios que debe hacer el backend

- Persistir `timeZone` en la entidad del local
- Validar que `timeZone` sea una zona IANA valida antes de guardar
- Devolver `timeZone` en `GET`, `POST` y `PUT` del local
- Usar `timeZone` como fuente de verdad para scheduling y analytics del local
- Mantener `UTC` como fallback solo si el dato no llega o no se puede resolver

## Crear local

### Request JSON

```json
{
  "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Miraflores Branch",
  "photoUrl": "establishments/miraflores.jpg",
  "timeZone": "America/Lima"
}
```

### Campos

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `organizationId` | `UUID` | Si | Organizacion padre |
| `name` | `string` | Si | Nombre del local |
| `photoUrl` | `string` | No | Ruta o URL de la imagen |
| `timeZone` | `string` | No | Zona horaria IANA del local |

### Response

```json
{
  "id": "f8a1f6d4-5f1c-4d1d-8d1e-5a8c6b4e2a11",
  "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Miraflores Branch",
  "photoUrl": "https://images.takodu.com/establishments/miraflores.jpg",
  "timeZone": "America/Lima"
}
```

## Editar local

### Request JSON

```json
{
  "name": "San Isidro Branch",
  "photoUrl": "establishments/sanisidro.jpg",
  "timeZone": "America/Lima"
}
```

### Campos

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `name` | `string` | Si | Nuevo nombre del local |
| `photoUrl` | `string` | No | Nueva ruta o URL de la imagen |
| `timeZone` | `string` | No | Nueva zona horaria IANA del local |

## Reglas para frontend

- Usa `America/Lima` como valor sugerido si el usuario no elige otra zona
- Si el negocio opera en varias ciudades, toma la zona horaria del local, no la del navegador
- No conviertas fechas de negocio usando la zona del usuario final para el guardado
- Usa la zona del local para visualizacion, para construir el payload y para interpretar analytics de ese local

## Notas tecnicas

- `photoUrl` puede ser una ruta almacenada o una URL publica
- `timeZone` debe mantenerse estable porque analytics y scheduling la usan para agrupar citas por dia y hora local
- Si el backend expone un detalle del local o un listado, ese payload tambien debe incluir `timeZone`
