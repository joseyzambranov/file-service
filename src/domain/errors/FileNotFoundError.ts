/**
 * FileNotFoundError - Domain Error
 * 
 * Se lanza cuando se busca un archivo por ID y no existe.
 */
export class FileNotFoundError extends Error {
  constructor(public readonly fileId: string) {
    super(`File with id '${fileId}' not found`);
    this.name = 'FileNotFoundError';
    Object.setPrototypeOf(this, FileNotFoundError.prototype);
  }
}
