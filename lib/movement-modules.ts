export type MovementModule = {
  slug: string
  name: string
  description: string
  category: "Contabilidad" | "Ventas" | "Punto de venta" | "Compras" | "Inventarios"
  shortcut?: string
  dian?: "Factura electrónica" | "Documento equivalente POS" | "Nota electrónica"
  effects: Array<"Contabilidad" | "Cartera" | "Inventario" | "Caja" | "DIAN">
  status: "Base creada" | "Integración existente"
}

export const MOVEMENT_MODULES: MovementModule[] = [
  { slug: "nota-contabilidad", name: "Nota de contabilidad", description: "Asientos manuales, ajustes, reclasificaciones y cierres contables.", category: "Contabilidad", shortcut: "Ctrl+S", effects: ["Contabilidad"], status: "Base creada" },
  { slug: "comprobante-egreso", name: "Comprobante de egreso", description: "Registro y aplicación de pagos realizados por la empresa.", category: "Contabilidad", shortcut: "Ctrl+E", effects: ["Contabilidad", "Cartera", "Caja"], status: "Base creada" },
  { slug: "recibo-caja", name: "Recibo de caja", description: "Ingresos de caja, recaudos de clientes y aplicación de anticipos.", category: "Contabilidad", shortcut: "Ctrl+R", effects: ["Contabilidad", "Cartera", "Caja"], status: "Base creada" },
  { slug: "traslado-cuentas", name: "Traslado entre cuentas", description: "Transferencias entre cajas, bancos y otras cuentas financieras.", category: "Contabilidad", effects: ["Contabilidad", "Caja"], status: "Base creada" },
  { slug: "factura-venta", name: "Factura electrónica de venta", description: "Venta con validación previa, impuestos, cartera y afectación de inventario.", category: "Ventas", shortcut: "Ctrl+F", dian: "Factura electrónica", effects: ["Contabilidad", "Cartera", "Inventario", "DIAN"], status: "Base creada" },
  { slug: "factura-electronica", name: "Factura electrónica", description: "Elaboración comercial completa de la factura electrónica, validación DIAN y representación gráfica.", category: "Ventas", dian: "Factura electrónica", effects: ["Contabilidad", "Cartera", "Inventario", "DIAN"], status: "Base creada" },
  { slug: "nota-credito-facturacion", name: "Nota crédito de facturación", description: "Disminución o anulación de valores facturados, referenciada a factura origen.", category: "Ventas", dian: "Nota electrónica", effects: ["Contabilidad", "Cartera", "Inventario", "DIAN"], status: "Base creada" },
  { slug: "nota-debito-facturacion", name: "Nota débito de facturación", description: "Incremento de valores facturados con referencia al documento origen.", category: "Ventas", dian: "Nota electrónica", effects: ["Contabilidad", "Cartera", "DIAN"], status: "Base creada" },
  { slug: "nota-debito-cuentas-cobrar", name: "Nota débito – cuentas por cobrar", description: "Causación de cargos adicionales a clientes sin documento electrónico.", category: "Ventas", effects: ["Contabilidad", "Cartera"], status: "Base creada" },
  { slug: "pedido-cliente", name: "Pedido de cliente", description: "Compromiso comercial, reserva de existencias y seguimiento de entrega.", category: "Ventas", shortcut: "Ctrl+D", effects: ["Cartera", "Inventario"], status: "Base creada" },
  { slug: "remision", name: "Remisión", description: "Despacho de mercancía pendiente de facturación o soporte de entrega.", category: "Ventas", shortcut: "Alt+R", effects: ["Inventario"], status: "Base creada" },
  { slug: "cotizacion", name: "Cotización", description: "Propuesta comercial con vigencia, precios y condiciones de negociación.", category: "Ventas", shortcut: "Alt+H", effects: [], status: "Base creada" },
  { slug: "orden-trabajo-servicio", name: "Orden de trabajo o servicio", description: "Planeación, ejecución y liquidación de servicios al cliente.", category: "Ventas", effects: ["Contabilidad", "Inventario"], status: "Base creada" },
  { slug: "facturacion-pos", name: "Facturación POS electrónica", description: "Documento equivalente electrónico para ventas en punto de venta.", category: "Punto de venta", shortcut: "F9", dian: "Documento equivalente POS", effects: ["Contabilidad", "Inventario", "Caja", "DIAN"], status: "Base creada" },
  { slug: "devolucion-pos", name: "Devolución POS", description: "Reversión de ventas POS y reintegro de mercancía o dinero.", category: "Punto de venta", shortcut: "F11", effects: ["Contabilidad", "Inventario", "Caja", "DIAN"], status: "Base creada" },
  { slug: "devolucion-factura-electronica", name: "Devolución de factura electrónica", description: "Nota crédito electrónica referenciada a la factura de venta origen.", category: "Ventas", dian: "Nota electrónica", effects: ["Contabilidad", "Cartera", "Inventario", "DIAN"], status: "Base creada" },
  { slug: "pedido-pos", name: "Pedido POS", description: "Pedido rápido desde terminal de venta con reserva de artículos.", category: "Punto de venta", shortcut: "F7", effects: ["Inventario"], status: "Base creada" },
  { slug: "expedir-bono", name: "Expedir bono o tarjeta prepago", description: "Emisión, saldo, vigencia y trazabilidad de instrumentos prepago.", category: "Punto de venta", effects: ["Contabilidad", "Caja"], status: "Base creada" },
  { slug: "consultar-bonos", name: "Consultar bonos y tarjetas", description: "Consulta de saldos, movimientos, vencimientos y estado de bonos.", category: "Punto de venta", effects: ["Caja"], status: "Base creada" },
  { slug: "compra", name: "Compra", description: "Recepción de factura de proveedor, causación y entrada de mercancía.", category: "Compras", shortcut: "Ctrl+Q", effects: ["Contabilidad", "Cartera", "Inventario"], status: "Base creada" },
  { slug: "nota-credito-cuentas-pagar", name: "Nota crédito – cuentas por pagar", description: "Disminución de obligaciones causadas con proveedores.", category: "Compras", effects: ["Contabilidad", "Cartera"], status: "Base creada" },
  { slug: "nota-debito-devolucion-compra", name: "Nota débito – devolución de compra", description: "Devolución al proveedor con salida de inventario y ajuste de cartera.", category: "Compras", effects: ["Contabilidad", "Cartera", "Inventario"], status: "Base creada" },
  { slug: "orden-compra-servicio", name: "Orden de compra o servicio", description: "Solicitud formal al proveedor con aprobación y seguimiento.", category: "Compras", effects: ["Inventario"], status: "Base creada" },
  { slug: "nota-inventarios", name: "Nota de inventarios", description: "Ajustes positivos o negativos con motivo, autorización y costo.", category: "Inventarios", shortcut: "Ctrl+I", effects: ["Contabilidad", "Inventario"], status: "Integración existente" },
  { slug: "traslado-bodegas", name: "Traslado entre bodegas", description: "Salida de bodega origen y entrada confirmada en bodega destino.", category: "Inventarios", shortcut: "Ctrl+K", effects: ["Inventario"], status: "Integración existente" },
  { slug: "orden-traslado-bodegas", name: "Orden de traslado entre bodegas", description: "Solicitud, aprobación y preparación previa del traslado.", category: "Inventarios", effects: ["Inventario"], status: "Base creada" },
  { slug: "traslado-tallas", name: "Traslado entre tallas o variantes", description: "Conversión controlada entre variantes de una misma referencia.", category: "Inventarios", effects: ["Inventario"], status: "Base creada" },
  { slug: "orden-produccion", name: "Nota u orden de producción", description: "Consumo de materias primas y entrada de producto terminado.", category: "Inventarios", effects: ["Contabilidad", "Inventario"], status: "Base creada" },
  { slug: "salida-inventarios", name: "Salida de inventarios", description: "Consumos internos, obsequios, bajas y otras salidas autorizadas.", category: "Inventarios", effects: ["Contabilidad", "Inventario"], status: "Base creada" },
]

export const MOVEMENT_CATEGORIES = ["Contabilidad", "Ventas", "Punto de venta", "Compras", "Inventarios"] as const
export function getMovementModule(slug: string) { return MOVEMENT_MODULES.find((item) => item.slug === slug) }
