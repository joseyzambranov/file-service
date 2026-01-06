/**
 * InvalidFileLocationError - Domain Error
 * 
 * Se lanza cuando la ubicación del archivo (container/path) es inválida.
 * 
 * Casos:
 * - Container vacío
 * - Path vacío
 * - Path con .. (path traversal attack)
 */
export class InvalidFileLocationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidFileLocationError';
    Object.setPrototypeOf(this, InvalidFileLocationError.prototype);
  }
}
