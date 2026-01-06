/**
 * FileMetadata - Domain Value Object
 * 
 * 🎯 ¿QUÉ ES?
 * Metadata (información) de un archivo con VALIDACIONES DE NEGOCIO.
 * 
 * 🤔 ¿QUÉ VALIDA?
 * - Tamaño del archivo (max 10MB)
 * - Tipo de archivo (solo jpeg, png, pdf)
 * - Nombre del archivo (sin caracteres peligrosos)
 * 
 * ⚠️ DIFERENCIA con Zod:
 * - Zod valida FORMATO (en Application Layer - DTOs)
 * - FileMetadata valida REGLAS DE NEGOCIO (en Domain Layer)
 * 
 * Ejemplo:
 * - Zod: "¿Es un string?" "¿Es un número positivo?"
 * - FileMetadata: "¿Excede 10MB?" "¿Es un tipo permitido?"
 * 
 * 🔒 REGLAS DE NEGOCIO (hardcodeadas):
 * - MAX_FILE_SIZE: 10MB
 * - ALLOWED_TYPES: image/jpeg, image/png, application/pdf
 * 
 * 💡 Si estas reglas varían por usuario (plan free vs premium),
 *    se pasan como parámetros en el constructor o se crea un
 *    FileUploadPolicy separado.
 */

import { FileSizeExceededError } from '../errors/FileSizeExceededError';
import { InvalidFileTypeError } from '../errors/InvalidFileTypeError';
import { InvalidFileNameError } from '../errors/InvalidFileNameError';

export class FileMetadata {
  // ============================================
  // REGLAS DE NEGOCIO (Constantes)
  // ============================================
  
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB en bytes
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ];

  // ============================================
  // Constructor
  // ============================================
  
  constructor(
    public readonly fileName: string,
    public readonly fileSize: number,    // en bytes
    public readonly mimeType: string,    // ej: "image/jpeg"
    public readonly ownerId: string,     // ID del usuario dueño
    public readonly uploadedAt: Date = new Date()  // Default: ahora
  ) {
    this.validate();  // Autovalidación
  }

  // ============================================
  // Validaciones (privadas)
  // ============================================
  
  /**
   * Ejecuta todas las validaciones
   * Se llama automáticamente en el constructor
   */
  private validate(): void {
    this.validateFileSize();
    this.validateMimeType();
    this.validateFileName();
  }

  /**
   * Validar tamaño del archivo
   * 
   * Reglas:
   * - Debe ser mayor a 0
   * - NO debe exceder MAX_FILE_SIZE (10MB)
   */
  private validateFileSize(): void {
    if (this.fileSize <= 0) {
      throw new FileSizeExceededError(this.fileSize, FileMetadata.MAX_FILE_SIZE);
    }

    if (this.fileSize > FileMetadata.MAX_FILE_SIZE) {
      throw new FileSizeExceededError(this.fileSize, FileMetadata.MAX_FILE_SIZE);
    }
  }

  /**
   * Validar tipo de archivo (MIME type)
   * 
   * Reglas:
   * - Solo se permiten: image/jpeg, image/png, application/pdf
   */
  private validateMimeType(): void {
    if (!FileMetadata.ALLOWED_TYPES.includes(this.mimeType)) {
      throw new InvalidFileTypeError(this.mimeType, FileMetadata.ALLOWED_TYPES);
    }
  }

  /**
   * Validar nombre del archivo
   * 
   * Reglas:
   * - No puede estar vacío
   * - Máximo 255 caracteres
   * - NO puede contener: ../ (path traversal), / (separadores), \0 (null byte)
   */
  private validateFileName(): void {
    if (!this.fileName || this.fileName.trim().length === 0) {
      throw new InvalidFileNameError('File name cannot be empty');
    }

    if (this.fileName.length > 255) {
      throw new InvalidFileNameError('File name is too long (max 255 characters)');
    }

    // Seguridad: Prevenir ataques
    if (this.fileName.includes('..') || this.fileName.includes('/') || this.fileName.includes('\0')) {
      throw new InvalidFileNameError('File name contains invalid characters (../, /, or null byte)');
    }
  }

  // ============================================
  // Métodos de consulta (públicos)
  // ============================================
  
  /**
   * ¿Es una imagen?
   * true si es image/jpeg o image/png
   */
  isImage(): boolean {
    return this.mimeType.startsWith('image/');
  }

  /**
   * ¿Es un PDF?
   * true si es application/pdf
   */
  isPDF(): boolean {
    return this.mimeType === 'application/pdf';
  }

  /**
   * Obtener tamaño en MB (más legible que bytes)
   * Ejemplo: 5242880 bytes → 5.00 MB
   */
  getSizeInMB(): number {
    return this.fileSize / (1024 * 1024);
  }

  /**
   * Obtener extensión del archivo
   * Ejemplo: "photo.jpg" → "jpg"
   */
  getFileExtension(): string {
    const parts = this.fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }
}
