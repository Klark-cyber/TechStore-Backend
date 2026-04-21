// ── Search ──
function searchProducts() {
  var search = document.getElementById('searchInput').value.trim();
  var category = document.getElementById('categorySelect').value;
  var url = '/admin/product/all?';
  if (search) url += 'search=' + encodeURIComponent(search) + '&';
  if (category) url += 'productCollection=' + encodeURIComponent(category);
  window.location.href = url;
}

document.getElementById('searchInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') searchProducts();
});

// ── Show / Hide form ──
function showProductForm() {
  var section = document.getElementById('product-form-section');
  section.classList.remove('hidden');
  document.getElementById('sidebar').classList.add('closed');
  document.getElementById('sidebar-overlay').classList.add('hidden');
  toggleSpecs();
  setTimeout(function() {
    section.scrollIntoView({ behavior: 'smooth' });
  }, 300);
}

function hideProductForm() {
  var section = document.getElementById('product-form-section');
  section.classList.add('hidden');
  // Sidebar ni qaytaramiz
  document.getElementById('sidebar').classList.remove('closed');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Specs toggle ──
function toggleSpecs() {
  const category = document.getElementById('productCollection').value;
  const specsBlock = document.getElementById('telephone-specs');
  const ramInput = document.querySelector('input[name="productRam"]');
  const memoryInput = document.querySelector('input[name="productMemory"]');
  if (category === 'TELEPHONE' || category === 'MACBOOKS') {
    specsBlock.classList.remove('hidden');
    ramInput.disabled = false;
    memoryInput.disabled = false;
  } else {
    specsBlock.classList.add('hidden');
    ramInput.value = '';
    memoryInput.value = '';
    ramInput.disabled = true;
    memoryInput.disabled = true;
  }
}

// ── Status update ──
function updateProductStatus(select, event) {
  if (event) event.preventDefault();
  const productId = select.id;
  const newStatus = select.value;
  fetch(`/admin/product/${productId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productStatus: newStatus })
  })
  .then(res => {
    if (!res.ok) alert('Status update failed');
    else console.log('Status updated');
  })
  .catch(err => console.error(err));
}

// ── Image preview ──
// Uploads stored here to persist across validation attempts
var uploadedFiles = {};

function initImageSlots() {
  var slots = document.querySelectorAll('.img-slot');
  slots.forEach(function(slot, i) {
    var idx = i + 1;
    slot.addEventListener('click', function() {
      // Create a hidden input dynamically
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpg,image/jpeg,image/png';
      input.onchange = function() {
        if (this.files && this.files[0]) {
          var file = this.files[0];
          var allowed = ['image/jpg', 'image/jpeg', 'image/png'];
          if (!allowed.includes(file.type)) {
            alert('Only JPG, JPEG, PNG formats allowed!');
            return;
          }
          // Store file reference
          uploadedFiles[idx] = file;

          // Preview
          var reader = new FileReader();
          reader.onload = function(e) {
            slot.style.backgroundImage = 'url(' + e.target.result + ')';
            slot.style.backgroundSize = 'cover';
            slot.style.backgroundPosition = 'center';
            var icon = slot.querySelector('.material-symbols-outlined');
            if (icon) icon.style.display = 'none';
            var label = slot.querySelector('.slot-label');
            if (label) label.style.display = 'none';
            // Show remove button
            var rm = slot.querySelector('.slot-remove');
            if (rm) rm.style.display = 'flex';
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });
  });

  // Remove button
  document.querySelectorAll('.slot-remove').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var slot = this.closest('.img-slot');
      var idx = parseInt(slot.dataset.idx);
      delete uploadedFiles[idx];
      slot.style.backgroundImage = '';
      var icon = slot.querySelector('.material-symbols-outlined');
      if (icon) icon.style.display = '';
      var label = slot.querySelector('.slot-label');
      if (label) label.style.display = '';
      this.style.display = 'none';
    });
  });
}

// ── Validate & attach files before submit ──
function validateForm() {
  var name = document.querySelector('[name="productName"]').value.trim();
  var brand = document.querySelector('[name="productBrand"]').value.trim();
  var price = document.querySelector('[name="productPrice"]').value;
  var stock = document.querySelector('[name="productLeftCount"]').value;

  if (!name || !brand || !price || !stock) {
    alert('Please fill in all required fields!');
    return false;
  }

  // Check at least 1 image
  if (Object.keys(uploadedFiles).length === 0) {
    alert('Please upload at least one product image!');
    // Form is NOT reset — user stays on form with existing data
    return false;
  }

  // Inject files into a real FormData and submit via fetch
  // so files persist and page doesn't reload on error
  var form = document.querySelector('form[action="/admin/product/create"]');
  var formData = new FormData(form);

  // Attach stored files
  Object.keys(uploadedFiles).forEach(function(idx) {
    formData.append('productImages', uploadedFiles[idx]);
  });

  // Submit via fetch to avoid full page reload on error
  fetch('/admin/product/create', {
    method: 'POST',
    body: formData
  })
  .then(function(res) {
    if (res.ok || res.redirected) {
      // Success — go to product list
      window.location.href = '/admin/product/all';
    } else {
      return res.text().then(function(msg) {
        alert('Error creating product: ' + msg);
      });
    }
  })
  .catch(function(err) {
    alert('Network error. Please try again.');
    console.error(err);
  });

  // Always return false — submission handled by fetch above
  return false;
}

// ── Scroll shadow on table ──
var tableContainer = document.querySelector('.overflow-x-auto');
if (tableContainer) {
  tableContainer.addEventListener('scroll', function() {
    this.classList.toggle('shadow-inner', this.scrollLeft > 0);
  });
}

// ── Init on load ──
document.addEventListener('DOMContentLoaded', function() {
  initImageSlots();
});

// ── Mobile sidebar toggle ──
function toggleSidebar() {
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sidebar-overlay');
  sb.classList.toggle('open');
  ov.classList.toggle('hidden');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.add('hidden');
}