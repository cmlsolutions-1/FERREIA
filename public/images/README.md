# Imágenes locales

Estructura usada durante desarrollo local:

- `products/`: imágenes oficiales de productos creados desde administración.
- `categories/`: imágenes o banners de categorías.

La app debe guardar en cada producto la ruta pública, por ejemplo:

```ts
image: "/images/products/p-002-taladro-percutor-inalambrico-20v.webp"
```

Cuando se lance a producción, se puede conservar el mismo contrato de respuesta
del endpoint de subida y reemplazar internamente el almacenamiento local por una
API de archivos externa.
