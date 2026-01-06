/**
 * FileSizeExceededError - Domain Error
 * 
 * 🎯 ¿QUÉ ES?
 * Un error ESPECÍFICO de negocio que se lanza cuando un archivo
 * excede el tamaño máximo permitido.
 * 
 * 🤔 ¿POR QUÉ una clase de error custom?
 * - Semantic: El nombre describe EXACTAMENTE qué pasó
 * - Type checking: Podés hacer `catch (e) { if (e instanceof FileSizeExceededError) {...} }`
 * - Información adicional: Guardamos fileSize y maxSize para logging/debugging
 * 
 * ⚠️ DIFERENCIA con Error genérico:
 * ❌ throw new Error('File too big')  → No sabés qué tipo de error es
 * ✅ throw new FileSizeExceededError() → Sabés exactamente qué pasó
 */
export class FileSizeExceededError extends Error {
  constructor(
    public readonly fileSize: number,    // Tamaño del archivo (bytes)
    public readonly maxSize: number      // Tamaño máximo permitido (bytes)
  ) {
    super(
      `File size ${fileSize} bytes exceeds maximum allowed size of ${maxSize} bytes (${(maxSize / 1024 / 1024).toFixed(2)}MB)`
    );
    this.name = 'FileSizeExceededError';
    
    // CRÍTICO en TypeScript: Necesario para instanceof funcione correctamente
    Object.setPrototypeOf(this, FileSizeExceededError.prototype);
  }
}
