import { useEffect, useState } from "react";
import { MoneyDisplay } from "../MoneyDisplay";
import { Bool, Cell, MARKET_CATEGORIES, TableShell, field } from "./MarketComponents";

const emptyItem = { itemId: "", displayName: "", category: "", referencePrice: 1, referenceXp: 0, minPrice: 1, maxPrice: "", enabled: true };

export function ReferenceItemForm({ item, existingItems, onSave, onCancel, saving }) {
  const [form, setForm] = useState(emptyItem);
  const [errors, setErrors] = useState({});
  useEffect(() => setForm(item ? {
    itemId: field(item, "itemId", "item_id") || "",
    displayName: field(item, "displayName", "display_name") || "",
    category: item.category || "",
    referencePrice: field(item, "referencePrice", "reference_price") ?? 1,
    referenceXp: field(item, "referenceXp", "reference_xp") ?? 0,
    minPrice: field(item, "minPrice", "min_price") ?? 1,
    maxPrice: field(item, "maxPrice", "max_price") ?? "",
    enabled: field(item, "enabled", "active") ?? true,
  } : emptyItem), [item]);

  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (!form.itemId.trim()) next.itemId = "L'itemId est obligatoire.";
    if (existingItems.some((candidate) => field(candidate, "itemId", "item_id") === form.itemId && candidate.id !== item?.id)) next.itemId = "Cet itemId existe déjà.";
    if (!form.displayName.trim()) next.displayName = "Le nom affiché est obligatoire.";
    if (!form.category) next.category = "La catégorie est obligatoire.";
    if (Number(form.referencePrice) < 1) next.referencePrice = "Minimum: 1 fer.";
    if (Number(form.minPrice) < 1) next.minPrice = "Minimum: 1 fer.";
    if (form.maxPrice !== "" && Number(form.maxPrice) < Number(form.minPrice)) next.maxPrice = "Le maximum doit être supérieur ou égal au minimum.";
    setErrors(next);
    if (!Object.keys(next).length) onSave({
      itemId: form.itemId.trim(),
      displayName: form.displayName.trim(),
      category: form.category,
      referencePrice: Number(form.referencePrice),
      referenceXp: Number(form.referenceXp) || 0,
      minPrice: Number(form.minPrice),
      maxPrice: form.maxPrice === "" ? null : Number(form.maxPrice),
      enabled: form.enabled,
    });
  };
  const input = (name, label, type = "text") => <label className="text-sm text-stone-300">{label}<input type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-600 bg-[#11110f] px-3 py-2 text-white" />{errors[name] && <span className="text-xs text-red-400">{errors[name]}</span>}</label>;
  return <form onSubmit={submit} className="mb-6 grid gap-4 rounded-sm border border-stone-700 bg-[#1b1b17] p-5 md:grid-cols-3">
    {input("itemId", "Item ID")}{input("displayName", "Nom affiché")}
    <label className="text-sm text-stone-300">Catégorie<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-600 bg-[#11110f] px-3 py-2 text-white"><option value="">Choisir une catégorie</option>{MARKET_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>{errors.category && <span className="text-xs text-red-400">{errors.category}</span>}</label>
    {input("referencePrice", "Prix de référence (fer)", "number")}{input("referenceXp", "XP de référence", "number")}{input("minPrice", "Prix minimum (fer)", "number")}{input("maxPrice", "Prix maximum (fer, optionnel)", "number")}
    <label className="flex items-center gap-2"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> Actif</label>
    <div className="flex gap-2 md:col-span-2 md:justify-end"><button type="button" onClick={onCancel} className="rounded-lg bg-stone-800 px-4 py-2">Annuler</button><button disabled={saving} className="rounded-lg bg-amber-800 px-4 py-2 font-semibold disabled:opacity-50">{saving ? "Enregistrement..." : "Enregistrer"}</button></div>
  </form>;
}

export function ReferenceItemsTable({ items, onEdit, onDisable }) {
  return <TableShell headers={["Item ID", "Nom", "Catégorie", "Référence", "XP", "Minimum", "Maximum", "Actif", "Actions"]}>{items.map((item) => { const enabled = field(item, "enabled", "active"); return <tr key={item.id || field(item, "itemId", "item_id")}><Cell>{field(item, "itemId", "item_id")}</Cell><Cell>{field(item, "displayName", "display_name")}</Cell><Cell>{item.category}</Cell><Cell><MoneyDisplay amount={field(item, "referencePrice", "reference_price")} /></Cell><Cell>{field(item, "referenceXp", "reference_xp") ?? 0}</Cell><Cell><MoneyDisplay amount={field(item, "minPrice", "min_price")} /></Cell><Cell>{field(item, "maxPrice", "max_price") == null ? "—" : <MoneyDisplay amount={field(item, "maxPrice", "max_price")} />}</Cell><Cell><Bool value={enabled} /></Cell><Cell><div className="flex gap-3"><button onClick={() => onEdit(item)} className="text-amber-300">Modifier</button>{enabled && <button onClick={() => onDisable(item)} className="text-red-400">Désactiver</button>}</div></Cell></tr>; })}</TableShell>;
}
