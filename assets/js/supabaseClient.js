// Supabase Config
const SUPABASE_URL = 'https://xudfzohnlxaukzziyyrl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rfjRHave4ABrUW8vCcfDUw_5OhzCa6u';

// Lazy initialization
let _supabaseClient = null;
function getClient() {
  if (!_supabaseClient) {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Supabase CDN not loaded. Check your internet connection.');
    }
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabaseClient;
}

// ── Image Upload to Supabase Storage ────────────────────
// Bucket name: "product-images" — create this in Supabase Storage > New Bucket
async function uploadProductImage(file, productId) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event) {
      const img = new Image();
      img.src = event.target.result;
      img.onload = function() {
        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Return compressed webp base64 (very small size)
        const dataUrl = canvas.toDataURL('image/webp', 0.7);
        resolve(dataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// ── Orders ──────────────────────────────────────────────

async function getOrders() {
  const { data, error } = await getClient()
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function saveOrder(order) {
  const { data, error } = await getClient()
    .from('orders')
    .insert([order])
    .select();
  if (error) throw error;
  return data;
}

async function updateOrderStatus(id, newStatus) {
  const { error } = await getClient()
    .from('orders')
    .update({ status: newStatus })
    .eq('id', id);
  if (error) throw error;
}

// ── Products ─────────────────────────────────────────────

async function getProducts() {
  const { data, error } = await getClient()
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function upsertProduct(product) {
  const client = getClient();
  if (product.id) {
    // Explicitly update if ID exists
    const { data, error } = await client
      .from('products')
      .update(product)
      .eq('id', product.id)
      .select();
    if (error) throw error;
    return data;
  } else {
    // Insert if new
    const { data, error } = await client
      .from('products')
      .insert([product])
      .select();
    if (error) throw error;
    return data;
  }
}

async function deleteProductSupabase(id) {
  const { error } = await getClient()
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
