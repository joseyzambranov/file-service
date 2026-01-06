/**
 * InvalidFileNameError - Domain Error
 * 
 * Se lanza cuando el nombre del archivo es inválido.
 * 
 * Casos:
 * - Nombre vacío
 * - Nombre muy largo (>255 caracteres)
 * - Caracteres peligrosos: ../ (path traversal), \0 (null byte)
 */
export class InvalidFileNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidFileNameError';
    Object.setPrototypeOf(this, InvalidFileNameError.prototype);
  }
}
