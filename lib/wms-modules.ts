import { ArchiveRestore, Boxes, ClipboardCheck, Container, Forklift, Gauge, MapPinned, PackageCheck, PackageOpen, RefreshCcw, RotateCcw, Scale, Send, Settings2, Truck, Warehouse } from "lucide-react"

export type WmsModuleKey = "recepcion-nacional" | "recepcion-importada" | "put-away" | "bodegas" | "zonas-ubicaciones" | "picking" | "packing" | "despachos" | "devoluciones" | "conteos-ciclicos" | "transferencias" | "ajustes" | "reabastecimiento" | "transportadoras-envios"
export type WmsModuleDefinition = { key: WmsModuleKey; name: string; shortName: string; description: string; icon: typeof Boxes; color: string; primaryAction: string; stages: string[] }

export const WMS_MODULES: WmsModuleDefinition[] = [
  { key: "recepcion-nacional", name: "Recepción nacional", shortName: "Recepción nacional", description: "Citas, ASN, descargue, inspección y recepción de compras nacionales.", icon: PackageOpen, color: "sky", primaryAction: "Nueva recepción", stages: ["Programada", "En muelle", "Inspección", "Recibida", "Con novedad"] },
  { key: "recepcion-importada", name: "Recepción importada", shortName: "Recepción importada", description: "Contenedores, documentos aduaneros, lotes, costos y recepción de importaciones.", icon: Container, color: "cyan", primaryAction: "Registrar importación", stages: ["En tránsito", "Arribo", "Nacionalizada", "En muelle", "Recibida"] },
  { key: "put-away", name: "Put away", shortName: "Put away", description: "Tareas dirigidas para ubicar mercancía desde recibo hacia almacenamiento.", icon: Forklift, color: "violet", primaryAction: "Generar tareas", stages: ["Pendiente", "Asignada", "En ejecución", "Completada", "Bloqueada"] },
  { key: "bodegas", name: "Gestión de bodegas", shortName: "Bodegas", description: "Capacidad, ocupación, responsables, horarios y parámetros operativos.", icon: Warehouse, color: "slate", primaryAction: "Nueva bodega", stages: ["Activa", "Mantenimiento", "Bloqueada"] },
  { key: "zonas-ubicaciones", name: "Zonas y ubicaciones", shortName: "Zonas y ubicaciones", description: "Mapa de pasillos, racks, niveles, posiciones y reglas de almacenamiento.", icon: MapPinned, color: "indigo", primaryAction: "Nueva ubicación", stages: ["Disponible", "Ocupada", "Reservada", "Bloqueada"] },
  { key: "picking", name: "Picking", shortName: "Picking", description: "Oleadas, rutas de alistamiento, prioridades y confirmación por código.", icon: ClipboardCheck, color: "amber", primaryAction: "Crear oleada", stages: ["Pendiente", "Liberada", "En picking", "Completa", "Con faltante"] },
  { key: "packing", name: "Packing", shortName: "Packing", description: "Validación, empaque, pesaje, volumen, etiquetas y cierre de cajas.", icon: PackageCheck, color: "orange", primaryAction: "Abrir estación", stages: ["Pendiente", "En empaque", "Empacada", "Con novedad"] },
  { key: "despachos", name: "Despachos", shortName: "Despachos", description: "Consolidación, muelles, manifiestos, cargue y salida de vehículos.", icon: Send, color: "emerald", primaryAction: "Nuevo despacho", stages: ["Planeado", "En consolidación", "En muelle", "Despachado", "Entregado"] },
  { key: "devoluciones", name: "Devoluciones", shortName: "Devoluciones", description: "RMA, inspección, clasificación, reintegro, reparación o disposición.", icon: RotateCcw, color: "rose", primaryAction: "Nueva devolución", stages: ["Solicitada", "Recibida", "Inspección", "Reintegrada", "Rechazada"] },
  { key: "conteos-ciclicos", name: "Conteos cíclicos", shortName: "Conteos cíclicos", description: "Plan ABC, conteos ciegos, diferencias, reconteos y aprobación.", icon: Scale, color: "teal", primaryAction: "Programar conteo", stages: ["Programado", "En conteo", "Con diferencia", "Reconteo", "Cerrado"] },
  { key: "transferencias", name: "Transferencias", shortName: "Transferencias", description: "Movimientos entre bodegas y ubicaciones con trazabilidad de tránsito.", icon: ArchiveRestore, color: "blue", primaryAction: "Nueva transferencia", stages: ["Solicitada", "Aprobada", "En tránsito", "Recibida", "Cancelada"] },
  { key: "ajustes", name: "Ajustes de inventario", shortName: "Ajustes", description: "Ajustes positivos o negativos con causal, evidencia y aprobación.", icon: Settings2, color: "red", primaryAction: "Nuevo ajuste", stages: ["Borrador", "Pendiente aprobación", "Aprobado", "Aplicado", "Rechazado"] },
  { key: "reabastecimiento", name: "Reabastecimiento", shortName: "Reabastecimiento", description: "Reposición de ubicaciones de picking mediante mínimos y demanda.", icon: RefreshCcw, color: "lime", primaryAction: "Generar reposición", stages: ["Sugerida", "Liberada", "En ejecución", "Completada"] },
  { key: "transportadoras-envios", name: "Transportadoras y envíos", shortName: "Transportadoras", description: "Tarifas, cobertura, guías, SLA, tracking y novedades de entrega.", icon: Truck, color: "fuchsia", primaryAction: "Crear envío", stages: ["Cotizado", "Guía generada", "Recogido", "En tránsito", "Entregado", "Novedad"] },
]
export function getWmsModule(key: string) { return WMS_MODULES.find((module) => module.key === key) }
export const WMS_KPIS = [
  { label: "Órdenes activas", value: "128", change: "+8.4%", icon: Boxes },
  { label: "Exactitud inventario", value: "99.2%", change: "+0.3%", icon: Gauge },
  { label: "Ocupación", value: "76.8%", change: "4.210 posiciones", icon: Warehouse },
  { label: "OTIF despachos", value: "96.4%", change: "+1.8%", icon: Truck },
]
