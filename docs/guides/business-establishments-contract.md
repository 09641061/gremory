# Contrato de API - Business Establishments

Este contrato define los payloads que el frontend debe usar para crear, editar y leer locales.

## Endpoint base

`/api/business/establishments`

## Resumen para frontend

- `timeZone` ya forma parte del contrato del local
- El backend lo devuelve en todas las respuestas de `establishment`
- El frontend debe enviarlo al crear y editar
- El valor debe ser una zona IANA valida, por ejemplo `America/Lima`
- Si no se envia en create, el backend usa `UTC` por compatibilidad
- Si no se envia en update JSON, el backend conserva la zona actual

## Formatos soportados

### 1. JSON

Usar cuando solo se envia texto y no se sube archivo.

#### Crear local

```http
POST /api/business/establishments
Content-Type: application/json
```

```json
{
  "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Miraflores Branch",
  "photoUrl": "establishments/miraflores.jpg",
  "timeZone": "America/Lima"
}
```

#### Editar local

```http
PUT /api/business/establishments/{id}
Content-Type: application/json
```

```json
{
  "name": "San Isidro Branch",
  "photoUrl": "establishments/sanisidro.jpg",
  "timeZone": "America/Lima"
}
```

### 2. multipart/form-data

Usar cuando se sube una imagen desde el frontend.

#### Crear local

```http
POST /api/business/establishments
Content-Type: multipart/form-data
```

Campos:

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `organizationId` | `UUID` | Si | Organizacion padre |
| `name` | `string` | Si | Nombre del local |
| `photoFile` | `file` | No | Imagen a subir |
| `photoUrl` | `string` | No | Ruta o URL de imagen si no se sube archivo |
| `timeZone` | `string` | No | Zona horaria IANA del local |

Ejemplo de campos:

```text
organizationId=3fa85f64-5717-4562-b3fc-2c963f66afa6
name=Miraflores Branch
photoFile=<archivo>
timeZone=America/Lima
```

#### Editar local

```http
PUT /api/business/establishments/{id}
Content-Type: multipart/form-data
```

Campos:

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `name` | `string` | Si | Nuevo nombre del local |
| `photoFile` | `file` | No | Nueva imagen a subir |
| `photoUrl` | `string` | No | Ruta o URL de imagen si no se sube archivo |
| `timeZone` | `string` | No | Nueva zona horaria IANA del local |

Ejemplo de campos:

```text
name=San Isidro Branch
photoFile=<archivo>
timeZone=America/Bogota
```

## Respuesta del local

El backend siempre devuelve esta forma:

```json
{
  "id": "f8a1f6d4-5f1c-4d1d-8d1e-5a8c6b4e2a11",
  "organizationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Miraflores Branch",
  "photoUrl": "https://images.takodu.com/establishments/miraflores.jpg",
  "timeZone": "America/Lima"
}
```

## Reglas para frontend

- Usa `America/Lima` como valor sugerido si el usuario no elige otra zona
- Si el negocio opera en varias ciudades, toma la zona horaria del local, no la del navegador
- No conviertas fechas de negocio usando la zona del usuario final para el guardado
- Usa la zona del local para visualizacion, para construir el payload y para interpretar analytics de ese local
- Si el usuario sube archivo, manda `photoFile` y no dependas de `photoUrl`
- Si no sube archivo, puedes mandar `photoUrl` como ruta almacenada o URL publica
- No envias `timeZone` vacio; si no aplica, omite el campo

## Cambios que debe hacer el backend

- Persistir `timeZone` en la entidad del local
- Validar que `timeZone` sea una zona IANA valida antes de guardar
- Devolver `timeZone` en `GET`, `POST` y `PUT` del local
- Usar `timeZone` como fuente de verdad para scheduling y analytics del local
- Mantener `UTC` como fallback solo si el dato no llega o no se puede resolver

## Notas tecnicas

- `photoUrl` puede ser una ruta almacenada o una URL publica
- `timeZone` debe mantenerse estable porque analytics y scheduling la usan para agrupar citas por dia y hora local
- Si el backend expone un detalle del local o un listado, ese payload tambien debe incluir `timeZone`
