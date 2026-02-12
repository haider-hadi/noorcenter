import { supabase, PRODUCT_BUCKET, getPublicUrl } from './supabase.js';

/* =======================
   ADMIN LOGIN
======================= */
window.adminLogin = function(){
  const u = document.getElementById('adminUser').value.trim();
  const p = document.getElementById('adminPass').value.trim();

  if(u === 'noorcenter' && p === 'noor123'){
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';

    loadAdminProducts();
    loadMessages();
    loadOrders();
  } else {
    alert('Invalid credentials');
  }
};

/* =======================
   IMAGE UPLOAD
======================= */
async function uploadProductImage(file){
  if(!file) return { path:null, url:null };

  const safeName = `${crypto.randomUUID()}-${file.name}`
    .replace(/\s+/g,'-')
    .toLowerCase();

  const uploadPath = `products/${safeName}`;

  const { error } = await supabase
    .storage
    .from(PRODUCT_BUCKET)
    .upload(uploadPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg'
    });

  if(error){
    console.error(error);
    throw error;
  }

  return {
    path: uploadPath,
    url: getPublicUrl(uploadPath)
  };
}

/* =======================
   ADD PRODUCT
======================= */
window.addProduct = async function(){
  const id = document.getElementById('pId').value.trim();
  const sku = document.getElementById('pSku').value.trim();
  const name = document.getElementById('pName').value.trim();
  const price = Number(document.getElementById('pPrice').value);
  const category = document.getElementById('pCat').value;
  const description = document.getElementById('pDesc').value.trim();
  const file = document.getElementById('pImg').files[0];

  let image_url = null;
  if(file){
    const up = await uploadProductImage(file);
    image_url = up.url;
  }

  const { error } = await supabase
    .from('products')
    .insert([{ id, sku, name, price, category, description, image_url }]);

  if(error){
    console.error(error);
    alert('Insert failed');
    return;
  }

  alert('Product added successfully');
  document.getElementById('pId').value = '';
  document.getElementById('pSku').value = '';
  document.getElementById('pName').value = '';
  document.getElementById('pPrice').value = '';
  document.getElementById('pDesc').value = '';
  document.getElementById('pImg').value = '';

  loadAdminProducts();
};

/* =======================
   LOAD PRODUCTS
======================= */
window.loadAdminProducts = async function(){
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending:false });

  if(error){
    console.error(error);
    return;
  }

  const wrap = document.getElementById('adminProducts');
  wrap.innerHTML = (data || []).map(p => `
    <div class="card">
      <img src="${p.image_url || 'assets/placeholder.png'}">
      <h4>${p.name}</h4>
      <p class="price">PKR ${Number(p.price).toLocaleString()}</p>

      <details>
        <summary>Edit / Delete</summary>

        <input id="eName-${p.id}" value="${p.name}">
        <input id="ePrice-${p.id}" type="number" value="${p.price}">
        <select id="eCat-${p.id}">
          <option ${p.category==='men'?'selected':''}>men</option>
          <option ${p.category==='women'?'selected':''}>women</option>
          <option ${p.category==='kids'?'selected':''}>kids</option>
          <option ${p.category==='jewelary'?'selected':''}>jewelary</option>
        </select>
        <textarea id="eDesc-${p.id}">${p.description || ''}</textarea>
        <input id="eImg-${p.id}" type="file">

        <button onclick="updateProduct('${p.id}')">Save</button>
        <button class="danger" onclick="deleteProduct('${p.id}')">Delete</button>
      </details>
    </div>
  `).join('');
};

/* =======================
   UPDATE PRODUCT
======================= */
window.updateProduct = async function(id){
  const name = document.getElementById(`eName-${id}`).value.trim();
  const price = Number(document.getElementById(`ePrice-${id}`).value);
  const category = document.getElementById(`eCat-${id}`).value;
  const description = document.getElementById(`eDesc-${id}`).value.trim();
  const file = document.getElementById(`eImg-${id}`).files[0];

  const fields = { name, price, category, description };

  if(file){
    const up = await uploadProductImage(file);
    fields.image_url = up.url;
  }

  const { error } = await supabase
    .from('products')
    .update(fields)
    .eq('id', id);

  if(error){
    console.error(error);
    alert('Update failed');
    return;
  }

  alert('Product updated');
  loadAdminProducts();
};

/* =======================
   DELETE PRODUCT
======================= */
window.deleteProduct = async function(id){
  if(!confirm('Delete this product?')) return;

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if(error){
    console.error(error);
    alert('Delete failed');
    return;
  }

  loadAdminProducts();
};

/* =======================
   LOAD CONTACT MESSAGES
======================= */
window.loadMessages = async function(){
  const box = document.getElementById('adminMessages');
  box.innerHTML = 'Loading...';

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending:false });

  if(error){
    console.error(error);
    box.innerHTML = 'Failed to load messages';
    return;
  }

  if(!data.length){
    box.innerHTML = 'No messages found';
    return;
  }

  box.innerHTML = data.map(m => `
    <div class="msg-card">
      <strong>${m.name}</strong>
      <p>Email: ${m.email || '-'}</p>
      <p>Phone: ${m.phone || '-'}</p>
      <p>${m.message}</p>
      <small>${new Date(m.created_at).toLocaleString()}</small>
    </div>
  `).join('');
};

/* =======================
   LOAD ORDERS + ITEMS
======================= */
window.loadOrders = async function(){
  const box = document.getElementById('adminOrders');
  box.innerHTML = 'Loading orders...';

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending:false });

  if(error){
    console.error(error);
    box.innerHTML = 'Failed to load orders';
    return;
  }

  if(!orders.length){
    box.innerHTML = 'No orders yet';
    return;
  }

  const orderIds = orders.map(o => o.id);

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  box.innerHTML = orders.map(o => {
    const myItems = (items || []).filter(i => i.order_id === o.id);

    return `
      <div class="order-card">
        <h4>Order #${o.id}</h4>
        <p><b>Name:</b> ${o.customer_name}</p>
        <p><b>Phone:</b> ${o.phone}</p>
        <p><b>Address:</b> ${o.address}</p>
        <p><b>Total:</b> PKR ${Number(o.total).toLocaleString()}</p>
        <p><b>Status:</b> ${o.status}</p>

        <details>
          <summary>Items (${myItems.length})</summary>
          ${myItems.map(i => `
            <div class="order-item">
              ${i.name} × ${i.qty}
              <span>PKR ${Number(i.price).toLocaleString()}</span>
            </div>
          `).join('')}
        </details>

        ${o.status === 'received'
          ? `<button onclick="completeOrder('${o.id}')">Mark Completed</button>`
          : `<span class="done">Completed</span>`
        }

        <small>${new Date(o.created_at).toLocaleString()}</small>
      </div>
    `;
  }).join('');
};

/* =======================
   UPDATE ORDER STATUS
======================= */
window.completeOrder = async function(id){
  if(!confirm('Mark this order as completed?')) return;

  const { error } = await supabase
    .from('orders')
    .update({ status:'completed' })
    .eq('id', id);

  if(error){
    console.error(error);
    alert('Failed to update status');
    return;
  }

  loadOrders();
};
