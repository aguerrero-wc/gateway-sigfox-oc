# TASK-003: Implementación de Entidades de Geolocalización

## Contexto del Negocio
Estamos migrando el módulo de geolocalización de Sigfox. Necesitamos estructurar la base de datos para soportar dos conceptos clave:
1.  **Ubicaciones Estáticas (Location):** Puntos de interés definidos (ej. almacenes, oficinas) con coordenadas y radio de cobertura.
2.  **Historial de Rastreo (DeviceLocationHistory):** Registro temporal de dónde ha estado un dispositivo, incluyendo datos crudos de GPS y metadatos de la red Sigfox.

Actualmente, la entidad `Client` **NO existe**, por lo que debemos preparar las tablas para relacionarse con ella mediante un ID, pero sin establecer la llave foránea estricta a nivel de objeto todavía.

## Requisitos Funcionales (Backend)

1.  **Entidad `Location`:**
    *   Debe almacenar coordenadas geográficas con alta precisión (`decimal`).
    *   Debe permitir nulos en campos de dirección (address, city, country) para flexibilidad.
    *   Debe tener un campo `clientId` explícito para futura vinculación, aunque la relación `@ManyToOne` se deje comentada o parcial por ahora.
    *   Debe incluir un `radiusMeters` para lógica geoespacial futura.

2.  **Entidad `DeviceLocationHistory`:**
    *   Es una tabla transaccional de alto volumen (Time Series).
    *   Debe vincularse a un `SigfoxDevice` (Relación obligatoria).
    *   Puede vincularse opcionalmente a una `Location` conocida (si el punto cae dentro del radio).
    *   Debe registrar `duplicates` (metadatos de la red Sigfox).

## Alcance Técnico y Restricciones
*   **Stack:** NestJS, TypeORM, PostgreSQL.
*   **Precisión Decimal:** Usar `precision: 10, scale: 8` para latitud y `precision: 11, scale: 8` para longitud.
*   **Naming:** Tablas en `snake_case`, propiedades en `camelCase`.
*   **Relaciones:**
    *   Usar `@JoinColumn({ name: '...' })` explícitamente.
    *   No usar `Lazy Loading`.

---

## Plan de Ejecución (Checklist para el Agente)

### Fase 1: Definición de Entidades

- [ ] **Tarea 1.1: Crear Entidad Location**
    *   Archivo: `src/modules/location/entities/location.entity.ts` (ajustar ruta según módulo).
    *   Implementar columnas: `id` (uuid), `name`, `address`, `country`, `city`, `province`, `zip`, `latitude`, `longitude`, `radiusMeters`, `notes`.
    *   Implementar columna `clientId` (string, nullable). **Nota:** Dejar comentada la relación `@ManyToOne` a `Client` hasta que esa entidad exista.

- [ ] **Tarea 1.2: Crear Entidad DeviceLocationHistory**
    *   Archivo: `src/modules/device/entities/device-location-history.entity.ts`.
    *   Implementar columnas: `id`, `latitude`, `longitude`, `timestamp` (CreateDateColumn), `duplicates`, `locationName`.
    *   Implementar relación `@ManyToOne` hacia `SigfoxDevice`.
    *   Implementar relación `@ManyToOne` hacia `Location` (nullable).

### Fase 2: Actualización de Relaciones Inversas

- [ ] **Tarea 2.1: Actualizar SigfoxDevice**
    *   Abrir `sigfox-device.entity.ts`.
    *   Agregar la relación inversa `@OneToMany` hacia `DeviceLocationHistory`.

### Fase 3: Documentación y Verificación

- [ ] **Tarea 3.1: Actualizar Mapa de Base de Datos**
    *   Leer `.context/database.md`.
    *   Actualizar la sección de "Relationship Map" y "Core Entity Definitions" reflejando las nuevas tablas creadas y sus FKs.

- [ ] **Tarea 3.2: Verificación de Compilación (Tier 0)**
    *   Como no hemos modificado `package.json`, esto es un "Hot Reload" (Tier 0 en `deploy.md`).
    *   Verificar que no haya errores circulares de importación.