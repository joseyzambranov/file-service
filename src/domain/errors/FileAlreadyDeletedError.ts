/**
 * FileAlreadyDeletedError - Domain Error
 * 
 * Se lanza cuando se intenta operar sobre un archivo ya eliminado.
 */
export class FileAlreadyDeletedError extends Error {
  constructor(public readonly fileId: string) {
    super(`File with id '${fileId}' is already deleted`);
    this.name = 'FileAlreadyDeletedError';
    Object.setPrototypeOf(this, FileAlreadyDeletedError.prototype);
  }
}
