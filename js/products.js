import { supabase } from './supabase.js';

const PRODUCT_BUCKET = 'product-images';
const SUPABASE_URL = 'https://lqcdfysynegysckwzkwc.supabase.co';

// --- GENERATE PRODUCT CARDS ---
function productCard(p) {
    const imgUrl = `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_BUCKET}/${p.image_path}`;
    
    return `
    <div class="card">
        <a href="product.html?id=${p.id}" style="text-decoration: none; color: inherit; display: block;">
            <div class="img-container" style="height: 250px; overflow: hidden; border-radius: 8px;">
                <img src="${imgUrl}" alt="${p.name}" 
                     style="width: 100%; height: 100%; object-fit: cover; transition: 0.3s;"
                     onerror="this.src='https://via.placeholder.com/300'">
            </div>
            <h4 style="margin: 12px 0 5px 0;">${p.name}</h4>
        </a>
        <p class="price" style="color: var(--gold); font-weight: bold; margin-bottom: 12px;">
            PKR ${Number(p.price).toLocaleString()}
        </p>
        <button class="btn" onclick='addToCart(${JSON.stringify({id: p.id, name: p.name, price: p.price, img: p.image_path})})'>
            Add to Cart
        </button>
    </div>`;
}

// --- LOAD PRODUCTS FOR SHOP PAGE ---
export async function loadProducts({category='all', q=''}={}) {
    let query = supabase.from('products').select('*').order('created_at', {ascending:false});
    if(category !== 'all') query = query.eq('category', category);
    if(q) query = query.ilike('name', `%${q}%`);

    const { data, error } = await query;
    const el = document.getElementById('productList');
    if(el) el.innerHTML = data ? data.map(productCard).join('') : "No products found.";
}

// --- LOAD SINGLE PRODUCT FOR DETAILS PAGE ---
export async function loadProductDetail() {
    const productId = new URLSearchParams(window.location.search).get('id');
    const container = document.getElementById('productDetail');

    if (!productId) return container.innerHTML = "<h2>Product not found.</h2>";

    const { data: p, error } = await supabase.from('products').select('*').eq('id', productId).single();
    if (error || !p) return container.innerHTML = "<h2>Error loading product.</h2>";

    const imgUrl = `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_BUCKET}/${p.image_path}`;

    container.innerHTML = `
        <div class="grid halves" style="gap:50px; align-items:center; margin-top: 30px;">
            <div class="box" style="padding:0; overflow:hidden; border-radius:15px;">
                <img src="${imgUrl}" style="width:100%; display:block;" onerror="this.src='https://via.placeholder.com/600'">
            </div>
            <div class="product-info">
                <small style="color:var(--gold); font-weight:bold; text-transform:uppercase;">${p.category}</small>
                <h1 style="font-size: 2.5rem; margin: 10px 0;">${p.name}</h1>
                <p style="font-size: 1.8rem; font-weight: bold; color: var(--dark);">PKR ${Number(p.price).toLocaleString()}</p>
                <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
                <p style="color:#666; line-height:1.8; margin-bottom:30px;">${p.description || 'No description available for this luxury item.'}</p>
                <button class="btn" style="width:auto; padding: 15px 40px;" 
                        onclick='addToCart(${JSON.stringify({id: p.id, name: p.name, price: p.price, img: p.image_path})})'>
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

// --- INITIALIZE SHOP PAGE ---
if(document.getElementById('productList')) {
    const catSel = document.getElementById('categorySelect');
    const qBox = document.getElementById('searchBox');
    const reload = () => loadProducts({category: catSel.value, q: qBox.value});
    catSel.addEventListener('change', reload);
    qBox.addEventListener('input', reload);
    reload();
}