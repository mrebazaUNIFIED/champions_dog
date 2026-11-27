/** Mascota de carga: perrito de public/loading.svg que "respira" con un zoom in/out (ver .dog-loader en
 * globals.css). Con `size` en px se usa ese tamaño fijo (spinners chicos); sin `size`, el tamaño lo da
 * `className` (pantalla completa, responsive). */
export function DogLoader({ size, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/loading.svg"
      alt="Cargando"
      className={`dog-loader ${className}`}
      style={size ? { width: size, height: size } : undefined}
    />
  );
}
