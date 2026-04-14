// /api/lookup.js

export default async function handler(req, res) {
  // Allow only GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { barcode } = req.query;

  if (!barcode) {
    return res.status(400).json({ error: 'Missing barcode parameter' });
  }

  try {
    // UPCItemDB endpoint (free trial)
    const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`;

    const response = await fetch(url);

    // Handle rate limit / failure
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'UPC API failed',
        status: response.status,
      });
    }

    const data = await response.json();

    // If no product found
    if (!data.items || data.items.length === 0) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    // Extract useful fields
    const item = data.items[0];

    const result = {
      barcode: barcode,
      title: item.title || null,
      brand: item.brand || null,
      category: item.category || null,
      image: item.images?.[0] || null,
      ean: item.ean || null,
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('Lookup error:', error);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}
