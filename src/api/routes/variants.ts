import { Hono } from 'hono';
import { queryAll, queryFirst } from '../db';

export const variantApp = new Hono<{ Bindings: { DB: D1Database } }>();

// Initial in-memory mock attributes
let mockAttributes = [
  {
    id: 1,
    name: 'Color',
    slug: 'color',
    display_type: 'Color Swatch',
    description: 'Product color variations',
    status: 'active',
    sort_order: 1,
    values: [
      { id: 101, attribute_id: 1, value: 'Natural Green', slug: 'natural-green', color_code: '#166534', sort_order: 1, status: 'active' },
      { id: 102, attribute_id: 1, value: 'Saffron Gold', slug: 'saffron-gold', color_code: '#EAB308', sort_order: 2, status: 'active' }
    ]
  },
  {
    id: 2,
    name: 'Pack Size',
    slug: 'pack-size',
    display_type: 'Button',
    description: 'Quantity & Grams packaging size',
    status: 'active',
    sort_order: 2,
    values: [
      { id: 201, attribute_id: 2, value: '100g Powder', slug: '100g-powder', sort_order: 1, status: 'active' },
      { id: 202, attribute_id: 2, value: '250g Jar', slug: '250g-jar', sort_order: 2, status: 'active' },
      { id: 203, attribute_id: 2, value: '500g Value Pack', slug: '500g-value-pack', sort_order: 3, status: 'active' }
    ]
  }
];

let mockVariants = [
  {
    id: 1,
    product_id: 1,
    variant_name: 'Natural Green / 100g Powder',
    variant_sku: 'HM-ASH-100G-GRN',
    barcode: '890123456701',
    price: 399,
    compare_price: 499,
    cost_price: 150,
    weight: 0.1,
    status: 'active',
    default_variant: 1
  },
  {
    id: 2,
    product_id: 1,
    variant_name: 'Natural Green / 250g Jar',
    variant_sku: 'HM-ASH-250G-GRN',
    barcode: '890123456702',
    price: 799,
    compare_price: 999,
    cost_price: 300,
    weight: 0.25,
    status: 'active',
    default_variant: 0
  }
];

// 1. GET /attributes
variantApp.get('/attributes', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM attributes ORDER BY sort_order ASC');
    return c.json({ success: true, attributes: rows });
  }
  return c.json({ success: true, attributes: mockAttributes });
});

// 2. POST /attributes
variantApp.post('/attributes', async (c) => {
  const { name, display_type, description } = await c.req.json();
  if (!name) return c.json({ success: false, message: 'Attribute name required' }, 400);

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newAttr = {
    id: Date.now(),
    name,
    slug,
    display_type: display_type || 'Dropdown',
    description: description || '',
    status: 'active',
    sort_order: mockAttributes.length + 1,
    values: []
  };

  mockAttributes.push(newAttr as any);
  return c.json({ success: true, message: `Attribute "${name}" created`, attribute: newAttr });
});

// 3. DELETE /attributes/:id
variantApp.delete('/attributes/:id', async (c) => {
  const id = Number(c.req.param('id'));
  mockAttributes = mockAttributes.filter((a) => a.id !== id);
  return c.json({ success: true, message: `Attribute #${id} deleted` });
});

// 4. GET /variants
variantApp.get('/variants', async (c) => {
  if (c.env?.DB) {
    const rows = await queryAll(c.env.DB, 'SELECT * FROM product_variants ORDER BY id DESC');
    return c.json({ success: true, variants: rows });
  }
  return c.json({ success: true, variants: mockVariants });
});

// 5. POST /variants/generate (Cartesian Variant Matrix Generator)
variantApp.post('/variants/generate', async (c) => {
  const { product_id, base_sku, base_price, option_groups } = await c.req.json();
  // option_groups: [{ attribute_name: 'Color', values: ['Red', 'Blue'] }, { attribute_name: 'Size', values: ['S', 'M'] }]

  if (!option_groups || option_groups.length === 0) {
    return c.json({ success: false, message: 'Please select at least 1 attribute with values.' }, 400);
  }

  const cartesian = (arrays: any[]): any[] => {
    return arrays.reduce(
      (a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())),
      [[]]
    );
  };

  const attributeValueMatrix = option_groups.map((og: any) =>
    og.values.map((v: string) => ({ group: og.attribute_name, value: v }))
  );

  const combinations = cartesian(attributeValueMatrix);
  const generatedVariants: any[] = [];

  combinations.forEach((combo: any, idx: number) => {
    const name = Array.isArray(combo) ? combo.map((c: any) => c.value).join(' / ') : (combo as any).value;
    const skuCode = (base_sku || 'SKU') + '-' + (idx + 101);
    const varObj = {
      id: Date.now() + idx,
      product_id: product_id || 1,
      variant_name: name,
      variant_sku: skuCode,
      barcode: '890123456' + (100 + idx),
      price: base_price || 499,
      compare_price: (base_price || 499) + 100,
      cost_price: Math.round((base_price || 499) * 0.4),
      weight: 0.2,
      status: 'active',
      default_variant: idx === 0 ? 1 : 0
    };
    generatedVariants.push(varObj);
    mockVariants.push(varObj);
  });

  return c.json({
    success: true,
    message: `Generated ${generatedVariants.length} product variants automatically!`,
    variants: generatedVariants
  });
});
