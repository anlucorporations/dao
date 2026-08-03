-- ============================================================
-- COOPERATIVA "LOS CAPPONES" - Script de Inicialización (Seed)
-- Fase 4: Despliegue
-- Ejecutar DESPUÉS de crear las tablas con: npx prisma migrate dev
-- ============================================================

-- Inserta el SuperUsuario: Angel Lucci
-- Nota: La wallet debe coincidir con la que despliega los contratos
INSERT INTO "Socio" (
    "id",
    "walletAddress",
    "nombre",
    "cedula",
    "sexo",
    "fechaNacimiento",
    "estadoCivil",
    "telefono",
    "correo",
    "direccion",
    "activo",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    '0x2d3db17af7a2e9c256c9204ae8881d63ad1df833',
    'Angel Lucci',
    'V-12533620',
    'M',
    '1980-01-01',
    'Soltero',
    '+58 412-0000000',
    'admin@loscappones.com',
    'Dirección administrativa',
    true,
    NOW(),
    NOW()
);

-- Inserta el cargo de Presidente para el SuperUsuario
INSERT INTO "Directivo" (
    "id",
    "socioId",
    "cargo",
    "fechaInicio",
    "fechaFin",
    "activo",
    "secret2FA",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    (SELECT "id" FROM "Socio" WHERE "cedula" = 'V-12533620'),
    'PRESIDENTE',
    '2026-07-31',
    '2028-07-31',
    true,
    'PENDIENTE_CONFIGURAR',
    NOW(),
    NOW()
);

-- Configuración inicial del sistema
INSERT INTO "Configuracion" ("clave", "valor", "descripcion") VALUES
    ('CAPITAL_TOTAL_INICIAL', '0', 'Capital total acumulado en wei'),
    ('PORCENTAJE_INSCRIPCION', '2', 'Porcentaje del capital para inscripción de nuevos socios'),
    ('PORCENTAJE_MINIMO_DIRECTIVO', '10', 'Porcentaje mínimo del capital para postularse a directivo'),
    ('DURACION_VOTACION_INVERSION', '86400', 'Segundos: 24 horas para propuestas de inversión'),
    ('DURACION_VOTACION_ADMIN', '43200', 'Segundos: 12 horas para propuestas administrativas'),
    ('MAX_REINTENTOS_PROPUESTA', '3', 'Máximo de reintentos automáticos si no hay votos'),
    ('PERIODO_CARGO_ANIOS', '2', 'Duración del período de cargos directivos'),
    ('VERSION_SISTEMA', '1.0.0', 'Versión actual del sistema'),
    ('RED_BLOCKCHAIN', 'polygon-amoy', 'Red de despliegue actual'),
    ('RELAYER_ACTIVO', 'true', 'Indica si el relayer externo está operativo');

-- Inserta los 4 cargos directivos restantes como vacantes (para referencia)
-- Nota: Estos se llenarán cuando haya elecciones
-- Vicepresidente, Secretario, Contralor, Contador

-- Log de auditoría: sistema inicializado
INSERT INTO "AuditoriaLog" (
    "id",
    "accion",
    "entidad",
    "entidadId",
    "detalle",
    "walletEjecutor",
    "ipAddress",
    "createdAt"
) VALUES (
    gen_random_uuid(),
    'SISTEMA_INICIALIZADO',
    'Configuracion',
    NULL,
    'Sistema desplegado en Polygon Amoy. SuperUsuario: Angel Lucci (V-12533620)',
    '0x2d3db17af7a2e9c256c9204ae8881d63ad1df833',
    '127.0.0.1',
    NOW()
);

-- ============================================================
-- FIN DEL SCRIPT
-- Para ejecutar: psql -U tu_usuario -d cooperativa_cappones -f seed.sql
-- ============================================================
