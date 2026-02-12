
function renderCart(){
  const list = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  let total = 0;
  list.innerHTML = cart.map((c,idx)=>{
    const line = c.price * c.qty; total += line;
    return `<div class="row">
      <div style="flex:1">${c.name}<br><small>PKR ${c.price.toLocaleString()}</small></div>
      <div>
        <button onclick="decQty(${idx})">-</button>
        <span style="padding:0 8px">${c.qty}</span>
        <button onclick="incQty(${idx})">+</button>
      </div>
      <div style="width:120px;text-align:right">PKR ${line.toLocaleString()}</div>
      <button onclick="removeItem(${idx})">✕</button>
    </div>`
  }).join('');
  totalEl.textContent = 'PKR ' + total.toLocaleString();
}
window.incQty = i=>{ const c=JSON.parse(localStorage.getItem('cart')||'[]'); c[i].qty++; localStorage.setItem('cart',JSON.stringify(c)); renderCart(); }
window.decQty = i=>{ const c=JSON.parse(localStorage.getItem('cart')||'[]'); c[i].qty=Math.max(1,c[i].qty-1); localStorage.setItem('cart',JSON.stringify(c)); renderCart(); }
window.removeItem = i=>{ const c=JSON.parse(localStorage.getItem('cart')||'[]'); c.splice(i,1); localStorage.setItem('cart',JSON.stringify(c)); renderCart(); }

document.addEventListener('DOMContentLoaded', renderCart);
