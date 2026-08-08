import { notFound } from "next/navigation"
import { WmsModuleView } from "@/components/admin/wms-view"
import { DispatchWorkspace, PackingWorkspace, PutawayWorkspace, ReceiptWorkspace, WmsOperationsHydration } from "@/components/admin/wms-operation-workspaces"
import { getWmsModule, WMS_MODULES } from "@/lib/wms-modules"

export function generateStaticParams() { return WMS_MODULES.map((module) => ({ slug:module.key })) }
export default async function WmsModulePage({ params }:{ params:Promise<{slug:string}> }) {
  const {slug}=await params
  const module=getWmsModule(slug)
  if(!module)notFound()
  if(slug==="recepcion-nacional") return <WmsOperationsHydration><ReceiptWorkspace /></WmsOperationsHydration>
  if(slug==="recepcion-importada") return <WmsOperationsHydration><ReceiptWorkspace imported /></WmsOperationsHydration>
  if(slug==="put-away") return <WmsOperationsHydration><PutawayWorkspace /></WmsOperationsHydration>
  if(slug==="packing") return <WmsOperationsHydration><PackingWorkspace /></WmsOperationsHydration>
  if(slug==="despachos") return <WmsOperationsHydration><DispatchWorkspace /></WmsOperationsHydration>
  return <WmsModuleView moduleKey={module.key}/>
}
