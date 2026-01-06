/**
 * InvalidFileTypeError - Domain Error
 * 
 * Se lanza cuando el tipo de archivo (MIME type) no está permitido.
 * 
 * Ejemplo: Usuario intenta subir un .exe pero solo permitimos imágenes y PDFs
 */
export class InvalidFileTypeError extends Error {
  constructor(
    public readonly mimeType: string,
    public readonly allowedTypes: string[]
  ) {
    super(
      `File type '${mimeType}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    );
    this.name = 'InvalidFileTypeError';
    Object.setPrototypeOf(this, InvalidFileTypeError.prototype);
  }
}
