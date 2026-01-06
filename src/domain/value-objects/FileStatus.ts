/**
 * FileStatus - Domain Value Object (Enum)
 * 
 * 🎯 ¿QUÉ ES?
 * Un enum que representa los ESTADOS POSIBLES de un archivo.
 * 
 * 🤔 ¿POR QUÉ un enum y no un string?
 * - Type safety: TypeScript te obliga a usar solo valores válidos
 * - Autocomplete: El IDE te sugiere los valores
 * - Refactoring seguro: Si cambias el valor, se actualiza en todos lados
 * 
 * 🔄 CICLO DE VIDA de un archivo:
 * 
 *   PENDING → UPLOADED → DELETED
 *      ↑                     ↑
 *      |                     |
 *   (creado)            (soft delete)
 * 
 * PENDING:  Archivo registrado en DB pero AÚN NO subido a storage
 * UPLOADED: Archivo subido exitosamente a storage (S3, Azure, etc.)
 * DELETED:  Archivo marcado como eliminado (soft delete, NO se borra físicamente)
 */
export enum FileStatus {
  PENDING = 'PENDING',
  UPLOADED = 'UPLOADED',
  DELETED = 'DELETED',
}
