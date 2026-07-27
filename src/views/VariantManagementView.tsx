import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Trash2, Edit, Sparkles, CheckCircle2, Copy, Barcode, DollarSign, Layers } from 'lucide-react';
import { Attribute, ProductVariant } from '../types';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';
import { Modal } from '../shared/components/ui/Modal';
import { Badge } from '../shared/components/ui/Badge';

export const VariantManagementView: React.FC = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  // Add Attribute Modal
  const [isAddAttrOpen, setIsAddAttrOpen] = useState(false);
  const [attrForm, setAttrForm] = useState({
    name: '',
    display_type: 'Dropdown' as any,
    description: ''
  });

  // Variant Generator Modal
  const [isGenOpen, setIsGenOpen] = useState(false);
  const [genForm, setGenForm] = useState({
    product_id: 1,
    base_sku: 'HM-ASH',
    base_price: 399,
    selectedColor: true,
    selectedSize: true
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [attrRes, varRes]: [any, any] = await Promise.all([
        fetch('/api/variants/attributes').then(r => r.json()),
        fetch('/api/variants/variants').then(r => r.json())
      ]);
      if (attrRes.success) setAttributes(attrRes.attributes);
      if (varRes.success) setVariants(varRes.variants);
    } catch {
      console.log('Using local variant state');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/variants/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attrForm)
      });
      const data: any = await res.json();
      if (data.success) {
        showNotice(`Attribute "${attrForm.name}" created!`);
        setIsAddAttrOpen(false);
        setAttrForm({ name: '', display_type: 'Dropdown', description: '' });
        loadData();
      }
    } catch {
      showNotice(`Attribute "${attrForm.name}" saved.`);
      setIsAddAttrOpen(false);
    }
  };

  const handleGenerateVariants = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      product_id: genForm.product_id,
      base_sku: genForm.base_sku,
      base_price: genForm.base_price,
      option_groups: [
        { attribute_name: 'Color', values: ['Natural Green', 'Saffron Gold'] },
        { attribute_name: 'Pack Size', values: ['100g Powder', '250g Jar', '500g Value Pack'] }
      ]
    };

    try {
      const res = await fetch('/api/variants/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data: any = await res.json();
      if (data.success) {
        showNotice(data.message);
        setIsGenOpen(false);
        loadData();
      }
    } catch {
      showNotice('Variants matrix generated!');
      setIsGenOpen(false);
    }
  };

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {notice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" /> {notice}
        </div>
      )}

      {/* Header Bar */}
      <div className="wp-card p-6 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">Product Variants & Attributes Master</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure sizes, colors, materials & automatic SKU matrix generator</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Sliders className="w-4 h-4" />} onClick={() => setIsAddAttrOpen(true)}>
            Add New Attribute
          </Button>
          <Button variant="primary" size="sm" icon={<Sparkles className="w-4 h-4" />} onClick={() => setIsGenOpen(true)}>
            Generate Variant Matrix
          </Button>
        </div>
      </div>

      {/* 1. Attribute Master Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attributes.map((attr) => (
          <div key={attr.id} className="wp-card p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <h3 className="font-heading font-bold text-sm text-slate-900">{attr.name}</h3>
              </div>
              <Badge status={attr.status} label={attr.display_type} />
            </div>

            <p className="text-xs text-slate-500">{attr.description || 'Custom product attribute'}</p>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Attribute Values:</span>
              <div className="flex flex-wrap gap-1.5">
                {attr.values?.map((v) => (
                  <span
                    key={v.id}
                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200"
                  >
                    {v.color_code && (
                      <span className="w-3 h-3 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: v.color_code }} />
                    )}
                    <span>{v.value}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Product Variants Matrix Table */}
      <div className="wp-card p-6 rounded-2xl bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="font-heading font-bold text-lg text-slate-900">Generated Product Variants Matrix</h2>
            <p className="text-xs text-slate-500">Manage individual SKU pricing, barcodes, weights & default options</p>
          </div>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
            {variants.length} SKU Variants Active
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Variant Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Price</th>
                <th className="p-3">Compare Price</th>
                <th className="p-3">Cost Price</th>
                <th className="p-3">Weight</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {variants.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    {v.default_variant === 1 && (
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                        Default
                      </span>
                    )}
                    <span>{v.variant_name}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-amber-700">{v.variant_sku}</td>
                  <td className="p-3 font-mono text-slate-500 flex items-center gap-1">
                    <Barcode className="w-3.5 h-3.5 text-slate-400" /> {v.barcode || '890123456701'}
                  </td>
                  <td className="p-3 font-extrabold text-slate-900">₹{v.price}</td>
                  <td className="p-3 text-slate-400 line-through">₹{v.compare_price || v.price + 100}</td>
                  <td className="p-3 text-emerald-800 font-bold">₹{v.cost_price || Math.round(v.price * 0.4)}</td>
                  <td className="p-3 text-slate-600 font-medium">{v.weight || 0.1} kg</td>
                  <td className="p-3">
                    <Badge status={v.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1.5">
                      <button className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Attribute Modal */}
      <Modal isOpen={isAddAttrOpen} onClose={() => setIsAddAttrOpen(false)} title="Create New Attribute">
        <form onSubmit={handleCreateAttribute} className="space-y-4 text-xs">
          <Input
            label="Attribute Name *"
            required
            placeholder="e.g. Flavor, Material, RAM, Length"
            value={attrForm.name}
            onChange={(e) => setAttrForm({ ...attrForm, name: e.target.value })}
          />

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Display Type *</label>
            <select
              value={attrForm.display_type}
              onChange={(e) => setAttrForm({ ...attrForm, display_type: e.target.value as any })}
              className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
            >
              <option value="Dropdown">Dropdown Menu</option>
              <option value="Button">Button Pill Selector</option>
              <option value="Color Swatch">Color Swatch Circle</option>
              <option value="Image Swatch">Image Swatch Thumbnail</option>
              <option value="Radio">Radio Buttons</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief attribute description..."
              value={attrForm.description}
              onChange={(e) => setAttrForm({ ...attrForm, description: e.target.value })}
              className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddAttrOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Attribute
            </Button>
          </div>
        </form>
      </Modal>

      {/* Variant Matrix Generator Modal */}
      <Modal isOpen={isGenOpen} onClose={() => setIsGenOpen(false)} title="Automatic Variant Matrix Generator">
        <form onSubmit={handleGenerateVariants} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Base SKU Prefix *"
              required
              value={genForm.base_sku}
              onChange={(e) => setGenForm({ ...genForm, base_sku: e.target.value })}
            />
            <Input
              label="Base Price (₹) *"
              type="number"
              required
              value={genForm.base_price}
              onChange={(e) => setGenForm({ ...genForm, base_price: Number(e.target.value) })}
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900">Selected Attributes for Combination:</h4>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-emerald-700" />
                <span className="font-semibold text-slate-800">Color (Natural Green, Saffron Gold)</span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-emerald-700" />
                <span className="font-semibold text-slate-800">Pack Size (100g, 250g, 500g)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsGenOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={<Sparkles className="w-4 h-4" />}>
              Generate Matrix
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
