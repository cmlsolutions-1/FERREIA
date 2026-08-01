"use client"

import { useEffect, useMemo, useState } from "react"
import { MoreHorizontal, Pencil, Plus, Power, Search, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CATEGORIES, INVENTORY, formatCOP } from "@/lib/data"

type BarcodeEntry = {
  presentation: "Unidad" | "Caja inner" | "Caja master" | "Alterno"
  code: string
}

type InventoryRecord = {
  id: string
  codigoInterno: string
  sku: string
  nombre: string
  marca: string
  categoria: string
  subcategoria: string
  bodega: string
  unidad: string
  costo: number
  precio: number
  stockMin: number
  stockActual: number
  barcodes: BarcodeEntry[]
  priceTiers: {
    unit: { quantity: 1; unitPrice: number }
    inner: { quantity: number; unitPrice: number }
    master: { quantity: number; unitPrice: number }
  }
  activo: boolean
}

type CategoryRecord = {
  slug: string
  name: string
  icon: string
  count: number
  activo: boolean
}

const BODEGAS = ["Bodega Norte", "Bodega Sur", "Bodega Principal", "Mostrador"]
const PRESENTATIONS: BarcodeEntry["presentation"][] = ["Unidad", "Caja inner", "Caja master", "Alterno"]
const PRODUCT_STORAGE_KEY = "ferreia-admin-inventory-products"
const CATEGORY_STORAGE_KEY = "ferreia-admin-inventory-categories"

const initialProducts: InventoryRecord[] = INVENTORY.map((item, index) => ({
  id: item.sku,
  codigoInterno: item.codigoInterno,
  sku: item.sku,
  nombre: item.nombre,
  marca: item.marca,
  categoria: item.categoria,
  subcategoria: item.subcategoria,
  bodega: item.bodega,
  unidad: item.unidad,
  costo: item.costo,
  precio: item.precio,
  stockMin: item.stockMin,
  stockActual: item.stockActual,
  barcodes: [
    { presentation: "Unidad", code: item.barcode },
    { presentation: "Caja inner", code: `${item.barcode}-IN` },
    { presentation: "Caja master", code: `${item.barcode}-MA` },
  ],
  priceTiers: {
    unit: { quantity: 1, unitPrice: item.precio },
    inner: { quantity: 10, unitPrice: Math.round(item.precio * 0.9) },
    master: { quantity: 30, unitPrice: Math.round(item.precio * 0.85) },
  },
  activo: index !== 3,
}))

const initialCategories: CategoryRecord[] = CATEGORIES.map((category) => ({
  ...category,
  activo: true,
}))

const emptyProduct: InventoryRecord = {
  id: "nuevo",
  codigoInterno: "",
  sku: "",
  nombre: "",
  marca: "",
  categoria: initialCategories[0]?.name || "",
  subcategoria: "",
  bodega: BODEGAS[0],
  unidad: "Unidad",
  costo: 0,
  precio: 0,
  stockMin: 20,
  stockActual: 0,
  barcodes: [
    { presentation: "Unidad", code: "" },
    { presentation: "Caja inner", code: "" },
    { presentation: "Caja master", code: "" },
  ],
  priceTiers: {
    unit: { quantity: 1, unitPrice: 0 },
    inner: { quantity: 10, unitPrice: 0 },
    master: { quantity: 30, unitPrice: 0 },
  },
  activo: true,
}

export function InventoryView() {
  const [products, setProducts] = useState(initialProducts)
  const [categories, setCategories] = useState(initialCategories)
  const [query, setQuery] = useState("")
  const [cat, setCat] = useState("todas")
  const [bodega, setBodega] = useState("todas")
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<InventoryRecord>(emptyProduct)
  const [categoryName, setCategoryName] = useState("")
  const [categorySlug, setCategorySlug] = useState("")
  const [categoryIcon, setCategoryIcon] = useState("Package")

  useEffect(() => {
    const storedProducts = localStorage.getItem(PRODUCT_STORAGE_KEY)
    const storedCategories = localStorage.getItem(CATEGORY_STORAGE_KEY)

    if (storedProducts) setProducts(JSON.parse(storedProducts) as InventoryRecord[])
    if (storedCategories) setCategories(JSON.parse(storedCategories) as CategoryRecord[])
  }, [])

  const filtered = useMemo(() => {
    return products.filter((item) => {
      const q = query.toLowerCase()
      const matchQ =
        !q ||
        item.nombre.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.codigoInterno.toLowerCase().includes(q) ||
        item.barcodes.some((barcode) => barcode.code.toLowerCase().includes(q))
      const matchCat = cat === "todas" || item.categoria === cat
      const matchBod = bodega === "todas" || item.bodega === bodega
      return matchQ && matchCat && matchBod
    })
  }, [products, query, cat, bodega])

  const activeCategories = categories.filter((category) => category.activo)
  const totalValor = filtered.reduce((acc, item) => acc + item.costo * item.stockActual, 0)
  const agotados = filtered.filter((item) => item.stockActual <= item.stockMin).length

  function persistProducts(next: InventoryRecord[]) {
    setProducts(next)
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(next))
  }

  function persistCategories(next: CategoryRecord[]) {
    setCategories(next)
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(next))
  }

  function updateForm<K extends keyof InventoryRecord>(key: K, value: InventoryRecord[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateBarcode(index: number, patch: Partial<BarcodeEntry>) {
    setForm((current) => ({
      ...current,
      barcodes: current.barcodes.map((barcode, idx) =>
        idx === index ? { ...barcode, ...patch } : barcode,
      ),
    }))
  }

  function addBarcode() {
    setForm((current) => {
      if (current.barcodes.length >= 10) return current
      return {
        ...current,
        barcodes: [...current.barcodes, { presentation: "Alterno", code: "" }],
      }
    })
  }

  function removeBarcode(index: number) {
    setForm((current) => ({
      ...current,
      barcodes: current.barcodes.filter((_, idx) => idx !== index),
    }))
  }

  function startCreate() {
    setEditingId(null)
    setForm({
      ...emptyProduct,
      id: `draft-${Date.now()}`,
      categoria: activeCategories[0]?.name || "",
    })
    setShowProductForm(true)
  }

  function startEdit(product: InventoryRecord) {
    setEditingId(product.id)
    setForm(product)
    setShowProductForm(true)
  }

  function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextProduct: InventoryRecord = {
      ...form,
      id: editingId || form.sku || `draft-${Date.now()}`,
      sku: form.sku.trim(),
      codigoInterno: form.codigoInterno.trim(),
      nombre: form.nombre.trim(),
      barcodes: form.barcodes.filter((barcode) => barcode.code.trim()),
      priceTiers: {
        ...form.priceTiers,
        unit: { quantity: 1, unitPrice: form.precio },
      },
    }
    const next = editingId
      ? products.map((product) => (product.id === editingId ? nextProduct : product))
      : [nextProduct, ...products]

    persistProducts(next)
    setShowProductForm(false)
    setEditingId(null)
  }

  function toggleProduct(id: string) {
    persistProducts(
      products.map((product) =>
        product.id === id ? { ...product, activo: !product.activo } : product,
      ),
    )
  }

  function createCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const slug = categorySlug || slugify(categoryName)
    if (!categoryName.trim() || !slug.trim()) return

    persistCategories([
      {
        slug,
        name: categoryName.trim(),
        icon: categoryIcon.trim() || "Package",
        count: 0,
        activo: true,
      },
      ...categories,
    ])
    setCategoryName("")
    setCategorySlug("")
    setCategoryIcon("Package")
  }

  function toggleCategory(slug: string) {
    persistCategories(
      categories.map((category) =>
        category.slug === slug ? { ...category, activo: !category.activo } : category,
      ),
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="productos">
        <TabsList>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="space-y-4">
          <InventoryStats filtered={filtered} totalValor={totalValor} agotados={agotados} />

          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, SKU, código interno o código de barras..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={cat} onValueChange={(value) => value && setCat(value)}>
                  <SelectTrigger className="lg:w-52">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las categorías</SelectItem>
                    {activeCategories.map((category) => (
                      <SelectItem key={category.slug} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={bodega} onValueChange={(value) => value && setBodega(value)}>
                  <SelectTrigger className="lg:w-44">
                    <SelectValue placeholder="Bodega" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las bodegas</SelectItem>
                    {BODEGAS.map((warehouse) => (
                      <SelectItem key={warehouse} value={warehouse}>
                        {warehouse}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={startCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo producto
                </Button>
              </div>

              {showProductForm && (
                <ProductForm
                  form={form}
                  categories={activeCategories}
                  editing={!!editingId}
                  onSubmit={saveProduct}
                  onCancel={() => setShowProductForm(false)}
                  onUpdate={updateForm}
                  onUpdateBarcode={updateBarcode}
                  onAddBarcode={addBarcode}
                  onRemoveBarcode={removeBarcode}
                />
              )}

              <ProductsTable
                products={filtered}
                onEdit={startEdit}
                onToggle={toggleProduct}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <CategoriesPanel
            categories={categories}
            name={categoryName}
            slug={categorySlug}
            icon={categoryIcon}
            onNameChange={(value) => {
              setCategoryName(value)
              setCategorySlug((current) => current || slugify(value))
            }}
            onSlugChange={setCategorySlug}
            onIconChange={setCategoryIcon}
            onSubmit={createCategory}
            onToggle={toggleCategory}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InventoryStats({
  filtered,
  totalValor,
  agotados,
}: {
  filtered: InventoryRecord[]
  totalValor: number
  agotados: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Referencias</p>
          <p className="mt-1 text-xl font-bold">{filtered.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Valor inventario (costo)</p>
          <p className="mt-1 text-xl font-bold">{formatCOP(totalValor)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Unidades totales</p>
          <p className="mt-1 text-xl font-bold">
            {filtered.reduce((acc, item) => acc + item.stockActual, 0).toLocaleString("es-CO")}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Bajo mínimo</p>
          <p className="mt-1 text-xl font-bold text-rose-600">{agotados}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function ProductForm({
  form,
  categories,
  editing,
  onSubmit,
  onCancel,
  onUpdate,
  onUpdateBarcode,
  onAddBarcode,
  onRemoveBarcode,
}: {
  form: InventoryRecord
  categories: CategoryRecord[]
  editing: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  onUpdate: <K extends keyof InventoryRecord>(key: K, value: InventoryRecord[K]) => void
  onUpdateBarcode: (index: number, patch: Partial<BarcodeEntry>) => void
  onAddBarcode: () => void
  onRemoveBarcode: (index: number) => void
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <Field label="Nombre del producto" className="lg:col-span-2">
          <Input
            value={form.nombre}
            onChange={(event) => onUpdate("nombre", event.target.value)}
            placeholder="Chapa de seguridad pomo doble"
            required
          />
        </Field>
        <Field label="SKU">
          <Input
            value={form.sku}
            onChange={(event) => onUpdate("sku", event.target.value)}
            placeholder="CER-POMO-DOBLE"
            required
          />
        </Field>
        <Field label="Código interno">
          <Input
            value={form.codigoInterno}
            onChange={(event) => onUpdate("codigoInterno", event.target.value)}
            placeholder="INT-0013"
            required
          />
        </Field>
        <Field label="Marca">
          <Input
            value={form.marca}
            onChange={(event) => onUpdate("marca", event.target.value)}
            placeholder="Truper"
          />
        </Field>
        <Field label="Categoría">
          <Select value={form.categoria} onValueChange={(value) => value && onUpdate("categoria", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.slug} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Subcategoría">
          <Input
            value={form.subcategoria}
            onChange={(event) => onUpdate("subcategoria", event.target.value)}
            placeholder="Cerraduras"
          />
        </Field>
        <Field label="Bodega">
          <Select value={form.bodega} onValueChange={(value) => value && onUpdate("bodega", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona bodega" />
            </SelectTrigger>
            <SelectContent>
              {BODEGAS.map((warehouse) => (
                <SelectItem key={warehouse} value={warehouse}>
                  {warehouse}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Costo">
          <Input
            value={form.costo}
            onChange={(event) => onUpdate("costo", Number(event.target.value))}
            type="number"
            min={0}
            required
          />
        </Field>
        <Field label="Precio unidad">
          <Input
            value={form.precio}
            onChange={(event) => onUpdate("precio", Number(event.target.value))}
            type="number"
            min={0}
            required
          />
        </Field>
        <Field label="Stock actual">
          <Input
            value={form.stockActual}
            onChange={(event) => onUpdate("stockActual", Number(event.target.value))}
            type="number"
            min={0}
            required
          />
        </Field>
        <Field label="Stock mínimo">
          <Input
            value={form.stockMin}
            onChange={(event) => onUpdate("stockMin", Number(event.target.value))}
            type="number"
            min={0}
          />
        </Field>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-foreground">Precios por presentación</p>
            <p className="text-xs text-muted-foreground">El cliente obtiene cada precio solo al completar empaques exactos.</p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <Field label="Unidad">
            <Input value={form.precio} disabled />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Inner und">
              <Input
                value={form.priceTiers.inner.quantity}
                onChange={(event) =>
                  onUpdate("priceTiers", {
                    ...form.priceTiers,
                    inner: { ...form.priceTiers.inner, quantity: Number(event.target.value) },
                  })
                }
                type="number"
                min={2}
              />
            </Field>
            <Field label="Precio und inner">
              <Input
                value={form.priceTiers.inner.unitPrice}
                onChange={(event) =>
                  onUpdate("priceTiers", {
                    ...form.priceTiers,
                    inner: { ...form.priceTiers.inner, unitPrice: Number(event.target.value) },
                  })
                }
                type="number"
                min={0}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Master und">
              <Input
                value={form.priceTiers.master.quantity}
                onChange={(event) =>
                  onUpdate("priceTiers", {
                    ...form.priceTiers,
                    master: { ...form.priceTiers.master, quantity: Number(event.target.value) },
                  })
                }
                type="number"
                min={2}
              />
            </Field>
            <Field label="Precio und master">
              <Input
                value={form.priceTiers.master.unitPrice}
                onChange={(event) =>
                  onUpdate("priceTiers", {
                    ...form.priceTiers,
                    master: { ...form.priceTiers.master, unitPrice: Number(event.target.value) },
                  })
                }
                type="number"
                min={0}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-foreground">Códigos de barras</p>
            <p className="text-xs text-muted-foreground">Agrega hasta 10 códigos para unidad, inner, master u otras presentaciones.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onAddBarcode} disabled={form.barcodes.length >= 10}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar código
          </Button>
        </div>
        <div className="mt-3 grid gap-2">
          {form.barcodes.map((barcode, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[180px_1fr_36px]">
              <Select
                value={barcode.presentation}
                onValueChange={(value) => value && updateBarcodePresentation(value, index, onUpdateBarcode)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESENTATIONS.map((presentation) => (
                    <SelectItem key={presentation} value={presentation}>
                      {presentation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={barcode.code}
                onChange={(event) => onUpdateBarcode(index, { code: event.target.value })}
                placeholder="7701234567890"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveBarcode(index)}
                aria-label="Eliminar código"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{editing ? "Guardar cambios" : "Crear producto"}</Button>
      </div>
    </form>
  )
}

function ProductsTable({
  products,
  onEdit,
  onToggle,
}: {
  products: InventoryRecord[]
  onEdit: (product: InventoryRecord) => void
  onToggle: (id: string) => void
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>SKU / Código</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Bodega</TableHead>
            <TableHead className="text-right">Costo</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Códigos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((item) => {
            const low = item.stockActual <= item.stockMin
            return (
              <TableRow key={item.id} className={!item.activo ? "opacity-60" : undefined}>
                <TableCell>
                  <div className="min-w-0">
                    <p className="max-w-[220px] truncate font-medium text-foreground">{item.nombre}</p>
                    <p className="text-xs text-muted-foreground">{item.marca || "Sin marca"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-mono text-xs">{item.sku}</p>
                  <p className="font-mono text-xs text-muted-foreground">{item.codigoInterno}</p>
                </TableCell>
                <TableCell className="text-sm">{item.categoria}</TableCell>
                <TableCell className="text-sm">{item.bodega}</TableCell>
                <TableCell className="text-right text-sm">{formatCOP(item.costo)}</TableCell>
                <TableCell className="text-right text-sm font-medium">{formatCOP(item.precio)}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={`border-0 ${low ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}
                  >
                    {item.stockActual}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{item.barcodes.length} códigos</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`border-0 ${item.activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}
                  >
                    {item.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onToggle(item.id)} variant={!item.activo ? "default" : "destructive"}>
                        <Power className="h-4 w-4" />
                        {item.activo ? "Inactivar" : "Activar"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                No se encontraron productos con los filtros aplicados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function CategoriesPanel({
  categories,
  name,
  slug,
  icon,
  onNameChange,
  onSlugChange,
  onIconChange,
  onSubmit,
  onToggle,
}: {
  categories: CategoryRecord[]
  name: string
  slug: string
  icon: string
  onNameChange: (value: string) => void
  onSlugChange: (value: string) => void
  onIconChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onToggle: (slug: string) => void
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <h2 className="font-semibold text-foreground">Nueva categoría</h2>
              <p className="mt-1 text-sm text-muted-foreground">Crea categorías para clasificar productos en tienda e inventario.</p>
            </div>
            <Field label="Nombre">
              <Input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Tubería y plomería" required />
            </Field>
            <Field label="Slug">
              <Input value={slug} onChange={(event) => onSlugChange(event.target.value)} placeholder="tuberia-plomeria" required />
            </Field>
            <Field label="Icono">
              <Input value={icon} onChange={(event) => onIconChange(event.target.value)} placeholder="Wrench" />
            </Field>
            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Crear categoría
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Icono</TableHead>
                  <TableHead className="text-right">Productos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.slug}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="font-mono text-xs">{category.slug}</TableCell>
                    <TableCell className="text-sm">{category.icon}</TableCell>
                    <TableCell className="text-right">{category.count}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`border-0 ${category.activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}
                      >
                        {category.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggle(category.slug)} aria-label="Cambiar estado">
                        <Power className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className ? `space-y-1.5 ${className}` : "space-y-1.5"}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function updateBarcodePresentation(
  value: string,
  index: number,
  onUpdateBarcode: (index: number, patch: Partial<BarcodeEntry>) => void,
) {
  if (PRESENTATIONS.includes(value as BarcodeEntry["presentation"])) {
    onUpdateBarcode(index, { presentation: value as BarcodeEntry["presentation"] })
  }
}
