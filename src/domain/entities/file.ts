/**
 * File - Domain Entity
 * 
 * 🎯 ¿QUÉ ES UNA ENTIDAD?
 * Un objeto con IDENTIDAD ÚNICA (ID) y CICLO DE VIDA.
 * 
 * 🔄 CICLO DE VIDA:
 * 
 *   create() → PENDING → markAsUploaded() → UPLOADED → markAsDeleted() → DELETED
 * 
 * 📊 DIFERENCIA con Value Object:
 * 
 * | Concepto        | Entidad (File)      | Value Object (FileMetadata) |
 * |-----------------|---------------------|----------------------------|
 * | Identidad       | Por ID              | Por valor                  |
 * | Mutabilidad     | Mutable (status)    | Inmutable                  |
 * | Comparación     | file1.id === file2.id | metadata1.equals(metadata2) |
 * | Ejemplo         | User, Order, File   | Email, Money, Address      |
 * 
 * 🏗️ PATRONES USADOS:
 * - Factory Methods: create() y reconstitute()
 * - Encapsulación: Constructor privado
 * - Rich Domain Model: Métodos de negocio (markAsUploaded, canBeDownloaded)
 */

import { v4 as uuidv4 } from 'uuid';
import { FileMetadata } from '../value-objects/FileMetadata';
import { FileLocation } from '../value-objects/FileLocation';
import { FileStatus } from '../value-objects/FileStatus';
import { FileAlreadyUploadedError } from '../errors/FileAlreadyUploadedError';
import { FileAlreadyDeletedError } from '../errors/FileAlreadyDeletedError';

export class File {
  // ============================================
  // Constructor PRIVADO
  // ============================================
  
  /**
   * Constructor privado - Solo se puede crear via factory methods
   * 
   * ¿Por qué privado?
   * - Previene: new File(...)
   * - Obliga a usar: File.create() o File.reconstitute()
   * - Separación clara entre crear nuevo vs reconstruir desde DB
   */
  private constructor(
    public readonly id: string,                // Identidad única (UUID)
    public readonly metadata: FileMetadata,    // Value Object (inmutable)
    public readonly location: FileLocation,    // Value Object (inmutable)
    private _status: FileStatus                // Mutable (cambia en ciclo de vida)
  ) {}

  // ============================================
  // FACTORY METHODS (Creación)
  // ============================================
  
  /**
   * Crear NUEVO archivo (estado inicial: PENDING)
   * 
   * Uso: Cuando el usuario solicita subir un archivo
   * 
   * Ejemplo:
   * const metadata = new FileMetadata('photo.jpg', 1024000, 'image/jpeg', 'user-123');
   * const location = new FileLocation('my-bucket', 'uploads/user-123/photo.jpg');
   * const file = File.create(metadata, location);
   * // file.id → UUID generado automáticamente
   * // file.status → FileStatus.PENDING
   */
  static create(
    metadata: FileMetadata,
    location: FileLocation
  ): File {
    const id = uuidv4();  // Generar UUID automáticamente
    return new File(id, metadata, location, FileStatus.PENDING);
  }

  /**
   * Reconstruir archivo EXISTENTE desde base de datos
   * 
   * Uso: Cuando traemos un archivo de DynamoDB
   * 
   * Diferencia con create():
   * - create(): ID generado automáticamente, status PENDING
   * - reconstitute(): ID y status vienen de DB
   * 
   * Ejemplo:
   * const file = File.reconstitute(
   *   'existing-uuid',
   *   metadata,
   *   location,
   *   FileStatus.UPLOADED
   * );
   */
  static reconstitute(
    id: string,
    metadata: FileMetadata,
    location: FileLocation,
    status: FileStatus
  ): File {
    return new File(id, metadata, location, status);
  }

  // ============================================
  // GETTERS (Encapsulación)
  // ============================================
  
  /**
   * Obtener status actual
   * 
   * ¿Por qué getter y no public?
   * - Encapsulación: No queremos que se modifique directamente
   * - file.status = FileStatus.UPLOADED  ❌ NO permitido
   * - file.markAsUploaded()              ✅ Correcto
   */
  get status(): FileStatus {
    return this._status;
  }

  // ============================================
  // COMPORTAMIENTO DE NEGOCIO
  // ============================================
  
  /**
   * Marcar archivo como subido exitosamente
   * 
   * 📝 REGLAS DE NEGOCIO:
   * - Solo se puede marcar como UPLOADED si está PENDING
   * - Un archivo UPLOADED no puede ser re-uploaded
   * - Un archivo DELETED no puede ser uploaded
   * 
   * 🔄 TRANSICIÓN DE ESTADO:
   * PENDING → UPLOADED ✅
   * UPLOADED → UPLOADED ❌ FileAlreadyUploadedError
   * DELETED → UPLOADED ❌ FileAlreadyDeletedError
   */
  markAsUploaded(): void {
    if (this._status === FileStatus.UPLOADED) {
      throw new FileAlreadyUploadedError(this.id);
    }

    if (this._status === FileStatus.DELETED) {
      throw new FileAlreadyDeletedError(this.id);
    }

    this._status = FileStatus.UPLOADED;
  }

  /**
   * Marcar archivo como eliminado (soft delete)
   * 
   * 📝 REGLAS DE NEGOCIO:
   * - Un archivo ya DELETED no puede ser re-deleted
   * - Se puede eliminar tanto PENDING como UPLOADED
   * 
   * 🔄 TRANSICIÓN DE ESTADO:
   * PENDING → DELETED ✅
   * UPLOADED → DELETED ✅
   * DELETED → DELETED ❌ FileAlreadyDeletedError
   * 
   * 💡 SOFT DELETE:
   * No se elimina físicamente de S3 ni DynamoDB,
   * solo se marca como DELETED.
   */
  markAsDeleted(): void {
    if (this._status === FileStatus.DELETED) {
      throw new FileAlreadyDeletedError(this.id);
    }

    this._status = FileStatus.DELETED;
  }

  /**
   * ¿El archivo puede ser descargado?
   * 
   * 📝 REGLA DE NEGOCIO:
   * Solo archivos UPLOADED pueden ser descargados
   * 
   * Returns:
   * - true: Si status === UPLOADED
   * - false: Si status === PENDING o DELETED
   */
  canBeDownloaded(): boolean {
    return this._status === FileStatus.UPLOADED;
  }

  /**
   * ¿El archivo pertenece a un usuario específico?
   * 
   * Útil para validar permisos antes de download/delete
   * 
   * Ejemplo:
   * if (!file.belongsTo(requesterId)) {
   *   throw new UnauthorizedError();
   * }
   */
  belongsTo(ownerId: string): boolean {
    return this.metadata.ownerId === ownerId;
  }

  // ============================================
  // EQUALITY (Comparación por ID)
  // ============================================
  
  /**
   * Comparar dos archivos por ID (NO por valor)
   * 
   * Dos archivos son el MISMO archivo si tienen el mismo ID,
   * aunque otros datos hayan cambiado.
   * 
   * Ejemplo:
   * const file1 = File.create(metadata, location);
   * file1.markAsUploaded();
   * const file2 = File.reconstitute(file1.id, metadata, location, FileStatus.UPLOADED);
   * 
   * file1.equals(file2)  // true (mismo ID)
   * file1 === file2      // false (objetos diferentes en memoria)
   */
  equals(other: File): boolean {
    if (!other) return false;
    return this.id === other.id;
  }

  // ============================================
  // SERIALIZACIÓN (Para persistencia)
  // ============================================
  
  /**
   * Convertir a objeto plano para guardar en DynamoDB
   * 
   * ¿Por qué?
   * DynamoDB NO puede guardar instancias de clases directamente.
   * Necesitamos convertir a objeto plano (plain object).
   * 
   * Uso:
   * await dynamoDB.put({ Item: file.toObject() });
   */
  toObject(): {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    ownerId: string;
    container: string;
    path: string;
    status: string;
    uploadedAt: string;
  } {
    return {
      id: this.id,
      fileName: this.metadata.fileName,
      fileSize: this.metadata.fileSize,
      mimeType: this.metadata.mimeType,
      ownerId: this.metadata.ownerId,
      container: this.location.container,
      path: this.location.path,
      status: this._status,
      uploadedAt: this.metadata.uploadedAt.toISOString(),
    };
  }
}
