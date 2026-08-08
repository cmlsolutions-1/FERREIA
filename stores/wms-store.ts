"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { WmsModuleKey } from "@/lib/wms-modules"

export type WmsPriority = "Crítica" | "Alta" | "Media" | "Baja"
export type WmsTask = { id: string; module: WmsModuleKey; number: string; title: string; reference: string; warehouse: string; zone: string; owner: string; priority: WmsPriority; status: string; progress: number; units: number; date: string; due: string }
export type WarehouseNode = { id: string; code: string; name: string; city: string; capacity: number; occupied: number; zones: number; locations: number; status: string }
export type WmsEvent = { id: string; title: string; detail: string; time: string; tone: "success" | "warning" | "info" }
type WmsState = { tasks: WmsTask[]; warehouses: WarehouseNode[]; events: WmsEvent[]; darkMode: boolean; setDarkMode: (value: boolean) => void; addTask: (module: WmsModuleKey, status: string) => void; updateTaskStatus: (id: string, status: string, progress?: number) => void }

const modules: WmsModuleKey[] = ["recepcion-nacional","recepcion-importada","put-away","bodegas","zonas-ubicaciones","picking","packing","despachos","devoluciones","conteos-ciclicos","transferencias","ajustes","reabastecimiento","transportadoras-envios"]
const statuses: Record<WmsModuleKey,string> = { "recepcion-nacional":"En muelle", "recepcion-importada":"Arribo", "put-away":"Asignada", bodegas:"Activa", "zonas-ubicaciones":"Disponible", picking:"En picking", packing:"En empaque", despachos:"En consolidación", devoluciones:"Inspección", "conteos-ciclicos":"En conteo", transferencias:"En tránsito", ajustes:"Pendiente aprobación", reabastecimiento:"Liberada", "transportadoras-envios":"En tránsito" }
const seedTasks: WmsTask[] = modules.flatMap((module, moduleIndex) => Array.from({ length: 3 }, (_, index) => ({ id: `${module}-${index+1}`, module, number: `${String(moduleIndex+1).padStart(2,"0")}-${String(1040+moduleIndex*7+index)}`, title: ["Operación prioritaria", "Tarea programada", "Control operativo"][index], reference: [`OC-${8201+moduleIndex}`,`PED-${45080+moduleIndex}`,`SKU-${String(1200+moduleIndex).padStart(5,"0")}`][index], warehouse: moduleIndex%2 ? "Bodega Norte" : "CEDI Principal", zone: ["REC-01","PICK-A","RACK-B03"][index], owner: ["Laura Méndez","Carlos Ruiz","Sin asignar"][index], priority: (["Alta","Media","Baja"] as WmsPriority[])[index], status: statuses[module], progress: [65,35,10][index], units: 12+moduleIndex*3+index*8, date: "2026-08-08", due: ["10:30","14:00","17:00"][index] })))
export const useWmsStore = create<WmsState>()(persist((set) => ({
  tasks: seedTasks,
  warehouses: [
    { id:"WH-01", code:"CEDI-01", name:"CEDI Principal", city:"Bogotá", capacity:5200, occupied:3988, zones:8, locations:4680, status:"Activa" },
    { id:"WH-02", code:"BOD-N", name:"Bodega Norte", city:"Bogotá", capacity:1800, occupied:1164, zones:5, locations:1420, status:"Activa" },
    { id:"WH-03", code:"BOD-S", name:"Bodega Sur", city:"Soacha", capacity:1400, occupied:1190, zones:4, locations:1080, status:"Alta ocupación" },
  ],
  events: [
    { id:"E1", title:"Recepción RN-008142 completada", detail:"324 unidades disponibles para put away", time:"Hace 8 min", tone:"success" },
    { id:"E2", title:"Diferencia en conteo CC-00198", detail:"Ubicación R03-N02-P04 requiere reconteo", time:"Hace 21 min", tone:"warning" },
    { id:"E3", title:"Oleada PK-00482 liberada", detail:"18 pedidos · 146 unidades", time:"Hace 36 min", tone:"info" },
  ],
  darkMode: false,
  setDarkMode: (darkMode) => set({ darkMode }),
  addTask: (module, status) => set((state) => ({ tasks: [{ id:crypto.randomUUID(), module, number:`${String(state.tasks.length+1).padStart(8,"0")}`, title:"Nueva operación", reference:"Pendiente", warehouse:"CEDI Principal", zone:"Por asignar", owner:"Sin asignar", priority:"Media", status, progress:0, units:0, date:new Date().toISOString().slice(0,10), due:"17:00" }, ...state.tasks] })),
  updateTaskStatus: (id, status, progress) => set((state) => ({ tasks: state.tasks.map((task) => task.id===id ? { ...task, status, progress:progress ?? task.progress } : task) })),
}), { name:"ferreia-wms-store-v1", skipHydration:true, partialize:(state)=>({ tasks:state.tasks, warehouses:state.warehouses, events:state.events, darkMode:state.darkMode }) }))
