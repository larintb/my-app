# Database Setup Guide - MyCard App

## ⚠️ IMPORTANTE: Ejecutar en Orden

Debes ejecutar estos archivos SQL **uno por uno** en el Supabase SQL Editor, en este orden exacto:

## Paso 1: Extensions y Enums
📁 Ejecuta: `database-setup/01-extensions-and-enums.sql`

**Qué hace:**
- Habilita la extensión UUID
- Crea los tipos ENUM necesarios (roles de usuario, estados de tokens, etc.)

## Paso 2: Tablas Principales
📁 Ejecuta: `database-setup/02-core-tables.sql`

**Qué hace:**
- Crea tabla `users` (todos los tipos de usuario)
- Crea tabla `invitation_tokens` (tokens de invitación NFC)
- Crea tabla `businesses` (información de negocios)

## Paso 3: Tablas de Negocio
📁 Ejecuta: `database-setup/03-business-tables.sql`

**Qué hace:**
- Crea tabla `services` (servicios que ofrece cada negocio)
- Crea tabla `business_hours` (horarios de atención)
- Crea tabla `appointments` (citas agendadas)
- Crea tabla `client_businesses` (relación clientes-negocios)

## Paso 4: Optimización
📁 Ejecuta: `database-setup/04-indexes-and-functions.sql`

**Qué hace:**
- Crea índices para mejorar performance
- Crea funciones para auto-actualizar timestamps
- Crea triggers para las funciones

## Paso 5: Seguridad y Datos de Prueba
📁 Ejecuta: `database-setup/05-security-and-sample-data.sql`

**Qué hace:**
- Habilita Row Level Security (RLS)
- Inserta usuario superuser de prueba

---

## 🚨 Si algo falla:

1. **Error en Step 1**: Probablemente tienes restricciones de permisos. Contacta a Supabase support.

2. **Error en Step 2-5**: Verifica que ejecutaste los pasos anteriores. Puedes ejecutar:
   ```sql
   DROP TABLE IF EXISTS table_name CASCADE;
   ```
   Para limpiar y volver a ejecutar.

3. **Error de constraints**: Normal en desarrollo, significa que intentaste insertar datos que no cumplen las reglas.

---

## ✅ Verificación

Después de ejecutar todos los pasos, verifica que todo esté correcto ejecutando:

```sql
-- Verifica que todas las tablas se crearon
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- Debe mostrar:
-- users, invitation_tokens, businesses, services,
-- business_hours, appointments, client_businesses
```

## 📋 Siguiente Paso

Una vez completado el setup de la base de datos, podemos proceder con el desarrollo de las interfaces de usuario y la lógica de autenticación.