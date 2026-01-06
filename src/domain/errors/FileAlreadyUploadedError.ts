/**
 * FileAlreadyUploadedError - Domain Error
 * 
 * Se lanza cuando se intenta marcar como UPLOADED un archivo que ya está UPLOADED.
 * 
 * Ejemplo de uso en File entity:
 * file.markAsUploaded()  // OK
 * file.markAsUploaded()  // ❌ Lanza este error
 */
export class FileAlreadyUploadedError extends Error {
  constructor(public readonly fileId: string) {
    super(`File with id '${fileId}' is already uploaded`);
    this.name = 'FileAlreadyUploadedError';
    Object.setPrototypeOf(this, FileAlreadyUploadedError.prototype);
  }
}
