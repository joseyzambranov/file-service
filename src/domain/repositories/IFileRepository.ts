/**
 * IFileRepository - Domain Repository Interface
 * 
 * 🎯 ¿QUÉ ES UN REPOSITORY?
 * Una INTERFACE (contrato) que define cómo PERSISTIR entidades del dominio.
 * 
 * 🤔 ¿POR QUÉ una Interface y no una clase directa?
 * - Inversión de dependencias (SOLID - D)
 * - El Domain NO conoce detalles de infraestructura (DynamoDB, S3, etc.)
 * - Permite cambiar la implementación sin tocar el dominio
 * 
 * 📊 PATRÓN REPOSITORY:
 * 
 *   Domain Layer              Infrastructure Layer
 *   ─────────────             ────────────────────
 *   IFileRepository  ←────────  DynamoDBFileRepository
 *   (interface)                 (implementación)
 * 
 * 🔑 PRINCIPIO CLAVE:
 * Este repository SOLO se encarga de PERSISTENCIA (save, find, delete).
 * NO genera URLs, NO conoce S3, NO conoce HTTP.
 * 
 * ❌ NO va aquí:
 * - generatePresignedUrl() → Eso va en IFileStorageAdapter (Infrastructure)
 * - uploadFile() → Eso es lógica de infraestructura
 * 
 * ✅ SÍ va aquí:
 * - save() → Guardar metadata en DB
 * - findById() → Buscar por ID
 * - delete() → Eliminar de DB
 * 
 * 💡 NOTA:
 * En un sistema con CQRS, podrías separar en:
 * - IFileWriteRepository (save, delete)
 * - IFileReadRepository (findById, findByOwnerId)
 */

import { File } from '../entities/file';
import { FileStatus } from '../value-objects/FileStatus';

export interface IFileRepository {
  /**
   * Guardar archivo (crear o actualizar)
   * 
   * 📝 COMPORTAMIENTO:
   * - Si el archivo NO existe (ID nuevo) → CREATE
   * - Si el archivo YA existe (mismo ID) → UPDATE
   * 
   * Uso:
   * const file = File.create(metadata, location);
   * await fileRepository.save(file);
   * 
   * @param file - Entidad File a guardar
   * @returns Promise que se resuelve cuando se guarda
   * @throws Error si falla la persistencia
   */
  save(file: File): Promise<void>;

  /**
   * Buscar archivo por ID
   * 
   * 📝 COMPORTAMIENTO:
   * - Si existe → Retorna File reconstruido
   * - Si NO existe → Retorna null (NO lanza error)
   * 
   * Uso:
   * const file = await fileRepository.findById('uuid-123');
   * if (!file) {
   *   throw new FileNotFoundError('uuid-123');
   * }
   * 
   * @param id - UUID del archivo
   * @returns Promise<File | null>
   */
  findById(id: string): Promise<File | null>;

  /**
   * Buscar todos los archivos de un usuario
   * 
   * 📝 COMPORTAMIENTO:
   * - Retorna array de archivos (puede estar vacío [])
   * - Ordenados por fecha de creación (más reciente primero)
   * - Puede incluir archivos PENDING, UPLOADED, DELETED
   * 
   * 💡 FILTRO OPCIONAL:
   * En una implementación real, podrías agregar parámetros:
   * findByOwnerId(ownerId, options?: { status?: FileStatus, limit?: number })
   * 
   * Uso:
   * const files = await fileRepository.findByOwnerId('user-123');
   * console.log(`Usuario tiene ${files.length} archivos`);
   * 
   * @param ownerId - ID del usuario dueño
   * @returns Promise<File[]> Array de archivos (vacío si no hay)
   */
  findByOwnerId(ownerId: string): Promise<File[]>;

  /**
   * Eliminar archivo (físicamente de la base de datos)
   * 
   * ⚠️ IMPORTANTE:
   * Esto NO es un soft delete (markAsDeleted).
   * Esto BORRA el registro de DynamoDB.
   * 
   * 📝 COMPORTAMIENTO:
   * - Si existe → Se elimina
   * - Si NO existe → NO lanza error (idempotente)
   * 
   * 💡 CONSIDERACIÓN:
   * En producción, normalmente NO se elimina físicamente.
   * Se usa markAsDeleted() y luego un proceso batch limpia después.
   * 
   * Uso:
   * await fileRepository.delete('uuid-123');
   * 
   * @param id - UUID del archivo a eliminar
   * @returns Promise que se resuelve cuando se elimina
   */
  delete(id: string): Promise<void>;

  /**
   * Actualizar solo el status de un archivo
   * 
   * 📝 COMPORTAMIENTO:
   * Optimización para NO tener que cargar toda la entidad
   * cuando solo queremos cambiar el status.
   * 
   * Uso típico:
   * // Cuando S3 confirma que el archivo fue subido
   * await fileRepository.updateStatus(fileId, FileStatus.UPLOADED);
   * 
   * 💡 ALTERNATIVA:
   * En lugar de este método, podrías hacer:
   * const file = await repo.findById(id);
   * file.markAsUploaded();
   * await repo.save(file);
   * 
   * Pero updateStatus() es más eficiente (menos queries).
   * 
   * @param id - UUID del archivo
   * @param status - Nuevo status
   * @returns Promise que se resuelve cuando se actualiza
   * @throws FileNotFoundError si el archivo no existe
   */
  updateStatus(id: string, status: FileStatus): Promise<void>;
}
