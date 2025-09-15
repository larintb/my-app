# 🚀 FASE 2 - Setup Guide

## ✅ ¿Qué se implementó?

### 🗄️ **Database Functions**
- `src/lib/db/users.ts` - Operaciones CRUD para usuarios
- `src/lib/db/businesses.ts` - Operaciones CRUD para negocios
- `src/lib/db/tokens.ts` - Operaciones de tokens de invitación

### 🌐 **API Routes**
- `POST /api/auth/superuser-login` - Login de superuser
- `POST /api/auth/register-business` - Registro de business admin
- `POST /api/auth/register-client` - Registro de final client
- `POST /api/tokens/generate` - Generación de tokens
- `POST /api/tokens/validate` - Validación de tokens
- `GET /api/businesses/by-name/[name]` - Búsqueda de business por nombre

### 🔄 **Frontend Updates**
- Todos los componentes ahora usan APIs reales
- Eliminado dummy data
- Manejo real de errores
- Validación de tokens desde base de datos

---

## 🛠️ Setup Instructions

### 1. **Crear Superuser en Supabase**

Ejecuta este SQL en **Supabase SQL Editor**:

```sql
INSERT INTO users (role, email, password_hash, first_name, last_name)
VALUES (
  'superuser',
  'admin@mycard.com',
  'superadmin123',
  'Super',
  'Admin'
)
ON CONFLICT (email) DO NOTHING;
```

### 2. **Verificar Variables de Entorno**

Asegúrate que `.env.local` tenga:
```
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

---

## 🧪 Testing End-to-End Flow

### **Paso 1: Login Superuser**
1. Ve a: `http://localhost:3002/a/admin`
2. Usa: `admin@mycard.com` / `superadmin123`
3. ✅ Debe entrar al dashboard real

### **Paso 2: Generar Token de Business**
1. En el dashboard, click "Generate Business Token"
2. ✅ Debe generar token real desde la DB
3. Copia la URL generada

### **Paso 3: Registrar Business Admin**
1. Ve a la URL del token (ej: `http://localhost:3002/a/ba_xxx`)
2. Llena el formulario completo
3. ✅ Debe crear usuario y negocio en la DB
4. ✅ Debe redirigir a `/{businessname}/dashboard`

### **Paso 4: Login Business Admin**
1. Ve a: `http://localhost:3002/{businessname}/login`
2. Usa las credenciales del business registrado
3. ✅ Debe encontrar el negocio por nombre
4. ✅ Debe aplicar el tema personalizado

### **Paso 5: Generar Token de Cliente**
1. En el admin dashboard, genera un "Client Token"
2. Usa el business ID del negocio creado
3. ✅ Debe vincular el token al negocio

### **Paso 6: Registrar Final Client**
1. Ve a la URL del client token (`http://localhost:3002/c/fc_xxx`)
2. ✅ Debe mostrar info del negocio
3. Llena formulario de registro
4. ✅ Debe crear cliente y vincularlo al negocio

---

## 🐛 Troubleshooting

### **Error: "Token generation failed"**
- Verifica que el superuser existe en la DB
- Verifica que el user ID del localStorage sea correcto

### **Error: "Business not found"**
- El business slug no coincide con el nombre
- Verifica que el negocio existe en la DB

### **Error: "Invalid token"**
- Token expirado o ya usado
- Genera un nuevo token

### **Error: Database connection**
- Verifica variables de entorno de Supabase
- Verifica que RLS esté configurado

---

## 📊 Database Verification

Para verificar que todo funciona, ejecuta en Supabase:

```sql
-- Ver todos los usuarios
SELECT * FROM users;

-- Ver todos los negocios
SELECT * FROM businesses;

-- Ver todos los tokens
SELECT * FROM invitation_tokens;

-- Ver estadísticas
SELECT
  (SELECT COUNT(*) FROM users WHERE role = 'superuser') as superusers,
  (SELECT COUNT(*) FROM users WHERE role = 'business_admin') as business_admins,
  (SELECT COUNT(*) FROM users WHERE role = 'final_client') as final_clients,
  (SELECT COUNT(*) FROM businesses) as businesses,
  (SELECT COUNT(*) FROM invitation_tokens WHERE status = 'active') as active_tokens;
```

---

## ✨ ¡Todo listo para producción!

Con la Fase 2 completada, tienes:
- ✅ Autenticación real con base de datos
- ✅ Tokens funcionales con expiración
- ✅ Registro de usuarios y negocios
- ✅ Theming dinámico por negocio
- ✅ APIs completas y seguras

**¡Ahora puedes proceder con la Fase 3 para implementar servicios, citas y funcionalidades avanzadas!** 🎉