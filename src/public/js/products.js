 function searchProducts() {
    var search = document.getElementById('searchInput').value.trim();
    var category = document.getElementById('categorySelect').value;
    var url = '/admin/product/all?';
    if (search) url += 'search=' + encodeURIComponent(search) + '&';
    if (category) url += 'productCollection=' + encodeURIComponent(category);
    window.location.href = url;
  }

  document.querySelectorAll('.img-upload').forEach(function(input, i) {
  input.addEventListener('change', function() {
    previewFileHandler(this, i + 1);
  });
});

  document.getElementById('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') searchProducts();
  });

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
      if (!res.ok) {
        alert('Status update failed');
      } else {
        console.log("updated");
      }
    })
    .catch(err => console.error(err));
  }

  function validateForm() {
    var name = document.querySelector('[name="productName"]').value.trim();
    var brand = document.querySelector('[name="productBrand"]').value.trim();
    var price = document.querySelector('[name="productPrice"]').value;
    var stock = document.querySelector('[name="productLeftCount"]').value;
    if (!name || !brand || !price || !stock) {
      alert('Please fill in all required fields');
      return false;
    }
    return true;
  }

  function previewFileHandler(input, num) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var box = input.parentElement;
        box.style.backgroundImage = 'url(' + e.target.result + ')';
        box.style.backgroundSize = 'cover';
        box.style.backgroundPosition = 'center';
        var icon = box.querySelector('.material-symbols-outlined');
        if (icon) icon.style.display = 'none';
        var label = box.querySelector('span.text-\\[10px\\]');
        if (label) label.style.display = 'none';
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  var tableContainer = document.querySelector('.overflow-x-auto');
  if (tableContainer) {
    tableContainer.addEventListener('scroll', function() {
      this.classList.toggle('shadow-inner', this.scrollLeft > 0);
    });
  }