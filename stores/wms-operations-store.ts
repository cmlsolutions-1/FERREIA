"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type WmsProduct = {
  id: string
  reference: string
  barcode: string
  name: string
  unit: string
  inner: number
  box: number
  master: number
  weight: number
  storageClass: "general" | "pesado" | "quimico" | "alto-valor"
}

export type ReceiptLine = {
  id: string
  productId: string
  quantity: number
  lot: string
  serials: string[]
  expiration: string
  country: string
  condition: "Conforme" | "Cuarentena" | "Rechazado"
}

export type Receipt = {
  id: string
  kind: "Nacional" | "Importada"
  supplier: string
  purchaseOrder: string
  dock: string
  arrival: string
  status: "Borrador" | "En inspección" | "Recibida" | "Con novedad"
  documents: string[]
  lines: ReceiptLine[]
}

export type PutawayTask = {
  id: string
  receiptId: string
  productId: string
  quantity: number
  lot: string
  suggestedLocation: string
  reason: string
  status: "Pendiente" | "En ejecución" | "Ubicada"
}

export type OrderLine = { productId: string; requested: number; packed: number }
export type CustomerOrder = {
  id: string
  source: "Cliente" | "Vendedor"
  customer: string
  seller: string
  city: string
  priority: "Urgente" | "Alta" | "Normal"
  status: "Pendiente" | "En picking" | "Lista para packing" | "Empacando" | "Empacada" | "Despachada" | "En tránsito" | "Entregada" | "Novedad"
  promisedDate: string
  carrier: string
  tracking: string
  lines: OrderLine[]
}

type WmsOperationsState = {
  products: WmsProduct[]
  receipts: Receipt[]
  putawayTasks: PutawayTask[]
  orders: CustomerOrder[]
  addReceipt: (receipt: Omit<Receipt, "id">) => string
  receiveReceipt: (id: string) => void
  startPutaway: (id: string) => void
  confirmPutaway: (id: string) => void
  scanPacking: (orderId: string, code: string, pack: "unit" | "inner" | "box" | "master") => { ok: boolean; message: string }
  closePacking: (orderId: string) => void
  advanceShipment: (orderId: string) => void
}

export const WMS_PRODUCTS: WmsProduct[] = [
  { id:"P-001", reference:"00021", barcode:"7701010000214", name:"Disco de corte metal 4 1/2 pulg.", unit:"unidad", inner:5, box:25, master:100, weight:.09, storageClass:"general" },
  { id:"P-002", reference:"00142", barcode:"7701010001426", name:"Bisagra mariposa 26 mm par", unit:"par", inner:10, box:50, master:200, weight:.16, storageClass:"general" },
  { id:"P-003", reference:"007914", barcode:"7701010079142", name:"Broca HSS para metal 1/2 pulg.", unit:"unidad", inner:6, box:24, master:96, weight:.21, storageClass:"alto-valor" },
  { id:"P-004", reference:"003108", barcode:"7701010031089", name:"Cemento gris uso general 50 kg", unit:"saco", inner:1, box:1, master:40, weight:50, storageClass:"pesado" },
  { id:"P-005", reference:"004522", barcode:"7701010045222", name:"Diluyente industrial galón", unit:"galón", inner:4, box:4, master:48, weight:3.8, storageClass:"quimico" },
]

const locationRules: Record<WmsProduct["storageClass"], { location:string; reason:string }> = {
  general:{ location:"A-03-R02-N02-P04", reason:"Alta rotación, cerca de zona de picking" },
  pesado:{ location:"PES-01-R01-N01-P02", reason:"Carga pesada, primer nivel y piso reforzado" },
  quimico:{ location:"QUI-02-R03-N01-P01", reason:"Zona ventilada y segregada para químicos" },
  "alto-valor":{ location:"SEG-01-R01-N02-P03", reason:"Ubicación controlada con acceso restringido" },
}

const seedOrders: CustomerOrder[] = [
  { id:"PED-045083", source:"Cliente", customer:"Ferretería El Constructor SAS", seller:"Tatiana Restrepo", city:"Bogotá", priority:"Urgente", status:"Lista para packing", promisedDate:"2026-08-08", carrier:"Coordinadora", tracking:"", lines:[{productId:"P-001",requested:27,packed:0},{productId:"P-002",requested:50,packed:0}] },
  { id:"PED-045084", source:"Vendedor", customer:"Tornillería La 80 SAS", seller:"Edwin Barrera", city:"Medellín", priority:"Alta", status:"Lista para packing", promisedDate:"2026-08-09", carrier:"Servientrega", tracking:"", lines:[{productId:"P-003",requested:12,packed:0},{productId:"P-005",requested:8,packed:0}] },
  { id:"PED-045085", source:"Cliente", customer:"Logística Ferretera SAS", seller:"Laura Méndez", city:"Cali", priority:"Normal", status:"Empacada", promisedDate:"2026-08-10", carrier:"TCC", tracking:"TCC-92401882", lines:[{productId:"P-004",requested:40,packed:40}] },
  { id:"PED-045080", source:"Vendedor", customer:"Suministros del Norte", seller:"Carlos Ruiz", city:"Barranquilla", priority:"Normal", status:"En tránsito", promisedDate:"2026-08-08", carrier:"Interrapidísimo", tracking:"INT-60318204", lines:[{productId:"P-001",requested:100,packed:100}] },
]

const initialReceipt: Receipt = { id:"RN-008142", kind:"Nacional", supplier:"Abrasivos Andinos SAS", purchaseOrder:"OC-008201", dock:"Muelle 02", arrival:"2026-08-08T08:10", status:"Recibida", documents:["Factura FV-88310.pdf","Remisión RM-22019.pdf"], lines:[{id:"RL-1",productId:"P-001",quantity:324,lot:"L-240801",serials:[],expiration:"2029-08-01",country:"Colombia",condition:"Conforme"}] }

export const useWmsOperationsStore = create<WmsOperationsState>()(persist((set, get) => ({
  products: WMS_PRODUCTS,
  receipts:[initialReceipt],
  putawayTasks:[{id:"PA-00184",receiptId:"RN-008142",productId:"P-001",quantity:324,lot:"L-240801",suggestedLocation:"A-03-R02-N02-P04",reason:"Alta rotación, cerca de zona de picking",status:"Pendiente"}],
  orders:seedOrders,
  addReceipt:(receipt) => {
    const prefix=receipt.kind==="Nacional"?"RN":"RI"
    const id=`${prefix}-${String(get().receipts.length+8143).padStart(6,"0")}`
    set((state)=>({receipts:[{...receipt,id},...state.receipts]}))
    return id
  },
  receiveReceipt:(id)=>set((state)=>{
    const receipt=state.receipts.find((item)=>item.id===id)
    if(!receipt)return state
    const generated=receipt.lines.filter((line)=>line.condition==="Conforme").map((line,index)=>{
      const product=state.products.find((item)=>item.id===line.productId)!
      const rule=locationRules[product.storageClass]
      return {id:`PA-${Date.now()}-${index}`,receiptId:id,productId:line.productId,quantity:line.quantity,lot:line.lot,suggestedLocation:rule.location,reason:rule.reason,status:"Pendiente" as const}
    })
    return {receipts:state.receipts.map((item)=>item.id===id?{...item,status:"Recibida"}:item),putawayTasks:[...generated,...state.putawayTasks]}
  }),
  startPutaway:(id)=>set((state)=>({putawayTasks:state.putawayTasks.map((task)=>task.id===id?{...task,status:"En ejecución"}:task)})),
  confirmPutaway:(id)=>set((state)=>({putawayTasks:state.putawayTasks.map((task)=>task.id===id?{...task,status:"Ubicada"}:task)})),
  scanPacking:(orderId,code,pack)=>{
    const state=get(); const product=state.products.find((item)=>item.barcode===code||item.reference===code)
    if(!product)return {ok:false,message:"Código no encontrado en el catálogo"}
    const order=state.orders.find((item)=>item.id===orderId); const line=order?.lines.find((item)=>item.productId===product.id)
    if(!order||!line)return {ok:false,message:"El producto no pertenece al pedido seleccionado"}
    const increment=pack==="unit"?1:product[pack]
    if(line.packed+increment>line.requested)return {ok:false,message:`El escaneo excede lo solicitado. Faltan ${line.requested-line.packed} ${product.unit}(es)`}
    set((current)=>({orders:current.orders.map((item)=>item.id===orderId?{...item,status:"Empacando",lines:item.lines.map((orderLine)=>orderLine.productId===product.id?{...orderLine,packed:orderLine.packed+increment}:orderLine)}:item)}))
    return {ok:true,message:`+${increment} ${product.unit}(es) · ${packLabel(pack)}`}
  },
  closePacking:(orderId)=>set((state)=>({orders:state.orders.map((order)=>order.id===orderId&&order.lines.every((line)=>line.packed===line.requested)?{...order,status:"Empacada"}:order)})),
  advanceShipment:(orderId)=>set((state)=>({orders:state.orders.map((order)=>{
    if(order.id!==orderId)return order
    const flow:CustomerOrder["status"][]=["Empacada","Despachada","En tránsito","Entregada"]
    const next=flow[Math.min(flow.indexOf(order.status)+1,flow.length-1)]||"Despachada"
    return {...order,status:next,tracking:order.tracking||`FER-${Date.now().toString().slice(-8)}`}
  })})),
}),{name:"ferreia-wms-operations-v1",skipHydration:true}))

function packLabel(pack:"unit"|"inner"|"box"|"master") { return ({unit:"Unidad",inner:"Inner",box:"Caja",master:"Master"})[pack] }
