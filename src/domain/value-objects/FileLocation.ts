/**
 * FileLocation - Domain Value Object
 * 
 * 🎯 ¿QUÉ ES?
 * Representa la UBICACIÓN de un archivo en el storage.
 * 
 * 🤔 ¿POR QUÉ un Value Object y no solo strings?
 * - Encapsulación: Las validaciones están DENTRO del objeto
 * - Inmutabilidad: Una vez creado, NO se puede modificar
 * - Type safety: No podés crear una ubicación inválida
 * - Reutilizable: Se usa en File entity sin duplicar código
 * 
 * 📝 IMPORTANTE:
 * Es GENÉRICO - NO conoce S3, Azure, GCP
 * - container: Puede ser bucket (S3), container (Azure), bucket (GCP)
 * - path: Puede ser key (S3), blob path (Azure), object name (GCP)
 * 
 * 🔒 VALIDACIONES:
 * - Container no puede estar vacío
 * - Path no puede estar vacío
 * - Path NO puede contener ".." (path traversal attack)
 */

import { InvalidFileLocationError } from '../errors/InvalidFileLocationError';

export class FileLocation {
  constructor(
    public readonly container: string,  // readonly = inmutable
    public readonly path: string
  ) {
    this.validate();  // Se autovalidida en construcción
  }

  /**
   * Validaciones de negocio
   * Se ejecutan automáticamente al crear el objeto
   */
  private validate(): void {
    if (!this.container || this.container.trim().length === 0) {
      throw new InvalidFileLocationError('Container cannot be empty');
    }

    if (!this.path || this.path.trim().length === 0) {
      throw new InvalidFileLocationError('Path cannot be empty');
    }

    // Seguridad: Prevenir path traversal attack
    if (this.path.includes('..')) {
      throw new InvalidFileLocationError('Path cannot contain ".." (path traversal attempt)');
    }

    // Opcional: Validar que no empiece con /
    if (this.path.startsWith('/')) {
      throw new InvalidFileLocationError('Path cannot start with "/"');
    }
  }

  /**
   * Obtener ruta completa
   * Ejemplo: "my-bucket/uploads/user-123/photo.jpg"
   */
  getFullPath(): string {
    return `${this.container}/${this.path}`;
  }

  /**
   * Comparar dos ubicaciones por VALOR (no por referencia)
   * 
   * Ejemplo:
   * const loc1 = new FileLocation('bucket', 'file.txt');
   * const loc2 = new FileLocation('bucket', 'file.txt');
   * loc1 === loc2          // false (diferentes objetos en memoria)
   * loc1.equals(loc2)      // true (mismo valor)
   */
  equals(other: FileLocation): boolean {
    return (
      this.container === other.container &&
      this.path === other.path
    );
  }
}
