/**
 * AURA BOTANICA - Public JavaScript (Vanilla JS, No Heavy Dependencies)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Quick Add to Cart with feedback
    const addToCartForms = document.querySelectorAll('.form-add-to-cart');
    addToCartForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Menambahkan...</span>';
            }

            const formData = new FormData(form);
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                });
                const data = await response.json();
                if (data.success) {
                    // Update cart badge
                    const badges = document.querySelectorAll('.cart-badge');
                    badges.forEach(b => {
                        b.textContent = data.items_count;
                        b.style.display = data.items_count > 0 ? 'flex' : 'none';
                    });
                    showToast('Produk berhasil ditambahkan ke keranjang!', 'success');
                } else {
                    showToast(data.message || 'Gagal menambahkan produk.', 'error');
                }
            } catch (err) {
                // Fallback standard submit
                form.submit();
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            }
        });
    });

    // Toast notification helper
    window.showToast = function(message, type = 'info') {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        const bg = type === 'success' ? '#2C2724' : (type === 'error' ? '#A33B32' : '#334155');
        toast.style.cssText = `background: ${bg}; color: #fff; padding: 12px 20px; border-radius: 6px; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 8px; animation: fadeIn 0.3s ease;`;
        toast.innerHTML = `<span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };
});
