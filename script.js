class ShopMeEcommerce {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('shopMeUsers') || '[]');
        this.cart = JSON.parse(localStorage.getItem('shopMeCart') || '[]');
        this.orders = JSON.parse(localStorage.getItem('shopMeOrders') || '[]');
        this.currentPage = 'home';
        this.currentCategory = 'all';
        this.products = [];
        this.filteredProducts = [];
        this.currentProduct = null;
        this.productsPerPage = 12;
        this.currentPageNumber = 1;
        
        this.init();
    }

    init() {
        this.generateProducts();
        this.setupEventListeners();
        this.checkAuthStatus();
        this.loadCategories();
        this.loadProducts();
        this.updateCartCount();
    }

    generateProducts() {
        const categories = [
            { name: 'Electronics', subcategories: ['Smartphones', 'Laptops', 'Tablets', 'Headphones', 'Cameras'] },
            { name: 'Fashion', subcategories: ['Mens Clothing', 'Womens Clothing', 'Shoes', 'Accessories', 'Watches'] },
            { name: 'Home & Kitchen', subcategories: ['Furniture', 'Kitchen Appliances', 'Home Decor', 'Bedding', 'Storage'] },
            { name: 'Sports & Outdoors', subcategories: ['Exercise Equipment', 'Outdoor Gear', 'Sports Accessories', 'Fitness Trackers'] },
            { name: 'Books & Media', subcategories: ['Books', 'Movies', 'Music', 'Games', 'Educational'] },
            { name: 'Beauty & Health', subcategories: ['Skincare', 'Makeup', 'Health Supplements', 'Personal Care', 'Perfumes'] },
            { name: 'Automotive', subcategories: ['Car Accessories', 'Tools', 'Car Care', 'Electronics', 'Interior'] },
            { name: 'Toys & Games', subcategories: ['Action Figures', 'Board Games', 'Educational Toys', 'Outdoor Toys', 'Video Games'] }
        ];

        const productNames = [
            'Premium Wireless Headphones', 'Smart LED TV 55"', 'Fitness Tracker Watch', 'Organic Cotton T-Shirt',
            'Coffee Maker Pro', 'Wireless Gaming Mouse', 'Smartphone Case', 'Laptop Backpack',
            'Running Shoes', 'Bluetooth Speaker', 'Digital Camera', 'Office Chair',
            'Kitchen Blender', 'Moisturizing Cream', 'Car Phone Mount', 'Board Game Set',
            'Yoga Mat', 'Desk Lamp', 'Protein Powder', 'Sunglasses'
        ];

        const descriptions = [
            'High-quality product with premium materials and excellent craftsmanship.',
            'Perfect for daily use with modern design and reliable performance.',
            'Innovative features combined with user-friendly interface.',
            'Durable construction ensures long-lasting value and satisfaction.',
            'Ergonomic design provides comfort and convenience in everyday use.'
        ];

        // Generate 1000+ products
        for (let i = 0; i < 1200; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const subcategory = category.subcategories[Math.floor(Math.random() * category.subcategories.length)];
            const name = productNames[Math.floor(Math.random() * productNames.length)];
            const basePrice = Math.floor(Math.random() * 500) + 20;
            const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0;
            const finalPrice = Math.floor(basePrice * (1 - discount / 100));
            
            this.products.push({
                id: i + 1,
                name: `${name} ${i + 1}`,
                category: category.name,
                subcategory: subcategory,
                price: finalPrice,
                originalPrice: discount > 0 ? basePrice : null,
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                image: `https://picsum.photos/300/300?random=${i + 1}`,
                rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0 rating
                reviews: Math.floor(Math.random() * 500) + 10,
                inStock: Math.random() > 0.1, // 90% in stock
                colors: this.generateColors(),
                sizes: this.generateSizes(category.name),
                specifications: this.generateSpecifications(category.name)
            });
        }

        this.filteredProducts = [...this.products];
    }

    generateColors() {
        const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Brown', 'Pink'];
        const numColors = Math.floor(Math.random() * 4) + 1;
        return colors.slice(0, numColors);
    }

    generateSizes(category) {
        if (category === 'Fashion') {
            return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        } else if (category === 'Electronics') {
            return ['32GB', '64GB', '128GB', '256GB'];
        }
        return [];
    }

    generateSpecifications(category) {
        const specs = {};
        
        if (category === 'Electronics') {
            specs['Brand'] = ['Samsung', 'Apple', 'Sony', 'LG', 'HP'][Math.floor(Math.random() * 5)];
            specs['Warranty'] = '1 Year';
            specs['Model Number'] = `MODEL-${Math.floor(Math.random() * 10000)}`;
            specs['Color'] = 'Multiple Options Available';
        } else if (category === 'Fashion') {
            specs['Material'] = ['Cotton', 'Polyester', 'Silk', 'Denim', 'Leather'][Math.floor(Math.random() * 5)];
            specs['Care Instructions'] = 'Machine Wash Cold';
            specs['Fit'] = ['Regular', 'Slim', 'Relaxed'][Math.floor(Math.random() * 3)];
        }
        
        return specs;
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        document.getElementById('searchInput').addEventListener('input', (e) => this.showSearchSuggestions(e.target.value));

        // Header actions
        document.getElementById('cartBtn').addEventListener('click', () => this.showPage('cart'));
        document.getElementById('ordersBtn').addEventListener('click', () => this.showPage('orders'));
        document.getElementById('authBtn').addEventListener('click', () => this.showAuthModal());
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());

        // Mobile menu
        document.getElementById('mobileMenuToggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarToggle').addEventListener('click', () => this.toggleSidebar());

        // Modals
        document.getElementById('closeAuthModal').addEventListener('click', () => this.hideModal('authModal'));
        document.getElementById('closePaymentModal').addEventListener('click', () => this.hideModal('paymentModal'));
        document.getElementById('closeInvoiceModal').addEventListener('click', () => this.hideModal('invoiceModal'));

        // Auth forms
        document.getElementById('signinForm').addEventListener('submit', (e) => this.handleSignIn(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignUp(e));

        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchAuthTab(tab.dataset.tab));
        });

        // Payment options
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', () => this.selectPaymentMethod(option.dataset.method));
        });

        // Load more products
        document.getElementById('loadMoreBtn').addEventListener('click', () => this.loadMoreProducts());

        // Window events
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                document.getElementById('sidebar').classList.remove('hidden');
            }
        });
    }

    checkAuthStatus() {
        const savedUser = localStorage.getItem('shopMeCurrentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateAuthUI();
        }
    }

    loadCategories() {
        const categories = [...new Set(this.products.map(p => p.category))];
        const categoryList = document.getElementById('categoryList');
        
        // Add "All Products" option
        categoryList.innerHTML = `
            <li class="category-item">
                <a href="#" class="category-link active" data-category="all">
                    All Products
                    <span class="product-count">${this.products.length}</span>
                </a>
            </li>
        `;

        categories.forEach(category => {
            const productCount = this.products.filter(p => p.category === category).length;
            categoryList.innerHTML += `
                <li class="category-item">
                    <a href="#" class="category-link" data-category="${category}">
                        ${category}
                        <span class="product-count">${productCount}</span>
                    </a>
                </li>
            `;
        });

        // Add event listeners to category links
        document.querySelectorAll('.category-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByCategory(link.dataset.category);
                
                // Update active category
                document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    loadProducts() {
        this.currentPageNumber = 1;
        this.displayProducts();
    }

    displayProducts() {
        const grid = document.getElementById('productsGrid');
        const startIndex = 0;
        const endIndex = this.currentPageNumber * this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        if (this.currentPageNumber === 1) {
            grid.innerHTML = '';
        }

        productsToShow.slice(startIndex + (this.currentPageNumber - 1) * this.productsPerPage).forEach(product => {
            const productCard = this.createProductCard(product);
            grid.appendChild(productCard);
        });

        // Update load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (endIndex >= this.filteredProducts.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => this.showProductDetail(product.id);

        const originalPriceHTML = product.originalPrice 
            ? `<span class="original-price">₹${product.originalPrice}</span>` 
            : '';

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    ₹${product.price}
                    ${originalPriceHTML}
                </div>
                <div class="product-rating">
                    <div class="stars">
                        ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <span class="rating-text">${product.rating} (${product.reviews})</span>
                </div>
                <button class="add-to-cart" onclick="event.stopPropagation(); shopMe.addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        `;

        return card;
    }

    showProductDetail(productId) {
        this.currentProduct = this.products.find(p => p.id === productId);
        if (!this.currentProduct) return;

        const container = document.getElementById('productDetailContainer');
        
        const specificationsHTML = Object.entries(this.currentProduct.specifications)
            .map(([key, value]) => `
                <tr>
                    <td>${key}</td>
                    <td>${value}</td>
                </tr>
            `).join('');

        const colorsHTML = this.currentProduct.colors.map(color => 
            `<div class="color-option" data-color="${color}" style="background-color: ${color.toLowerCase()}"></div>`
        ).join('');

        const sizesHTML = this.currentProduct.sizes.map(size => 
            `<div class="size-option" data-size="${size}">${size}</div>`
        ).join('');

        container.innerHTML = `
            <div class="product-detail">
                <div class="product-images">
                    <img src="${this.currentProduct.image}" alt="${this.currentProduct.name}" class="main-image" id="mainImage">
                    <div class="image-thumbnails">
                        <img src="${this.currentProduct.image}" alt="Thumbnail" class="thumbnail active">
                        <img src="https://picsum.photos/300/300?random=${this.currentProduct.id + 1000}" alt="Thumbnail" class="thumbnail">
                        <img src="https://picsum.photos/300/300?random=${this.currentProduct.id + 2000}" alt="Thumbnail" class="thumbnail">
                    </div>
                </div>
                <div class="product-details">
                    <div class="product-category">${this.currentProduct.category} > ${this.currentProduct.subcategory}</div>
                    <h1>${this.currentProduct.name}</h1>
                    <div class="product-price">
                        ₹${this.currentProduct.price}
                        ${this.currentProduct.originalPrice ? `<span class="original-price">₹${this.currentProduct.originalPrice}</span>` : ''}
                    </div>
                    <div class="product-rating">
                        <div class="stars">
                            ${'★'.repeat(Math.floor(this.currentProduct.rating))}${'☆'.repeat(5 - Math.floor(this.currentProduct.rating))}
                        </div>
                        <span class="rating-text">${this.currentProduct.rating} (${this.currentProduct.reviews} reviews)</span>
                    </div>
                    <p class="product-description">${this.currentProduct.description}</p>
                    
                    <div class="product-options">
                        ${this.currentProduct.colors.length > 0 ? `
                            <div class="option-group">
                                <label class="option-label">Color:</label>
                                <div class="color-options">
                                    ${colorsHTML}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${this.currentProduct.sizes.length > 0 ? `
                            <div class="option-group">
                                <label class="option-label">Size:</label>
                                <div class="size-options">
                                    ${sizesHTML}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="quantity-selector">
                            <label class="option-label">Quantity:</label>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="shopMe.changeQuantity(-1)">-</button>
                                <input type="number" class="quantity-input" id="productQuantity" value="1" min="1" max="10">
                                <button class="quantity-btn" onclick="shopMe.changeQuantity(1)">+</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="product-actions">
                        <button class="buy-now-btn" onclick="shopMe.buyNow()">Buy Now</button>
                        <button class="add-to-cart-detail" onclick="shopMe.addToCart(${this.currentProduct.id})">Add to Cart</button>
                    </div>
                </div>
            </div>
            
            <div class="specifications">
                <h3>Specifications</h3>
                <table class="spec-table">
                    ${specificationsHTML}
                </table>
            </div>
        `;

        this.showPage('productDetail');
        this.setupProductDetailEvents();
    }

    setupProductDetailEvents() {
        // Thumbnail clicks
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                document.getElementById('mainImage').src = thumb.src;
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });

        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });

        // Size selection
        document.querySelectorAll('.size-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }

    changeQuantity(change) {
        const input = document.getElementById('productQuantity');
        let value = parseInt(input.value) + change;
        if (value < 1) value = 1;
        if (value > 10) value = 10;
        input.value = value;
    }

    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // If on product detail page, get quantity from input
        if (this.currentPage === 'productDetail' && this.currentProduct?.id === productId) {
            quantity = parseInt(document.getElementById('productQuantity')?.value || 1);
        }

        const existingItem = this.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                productId: productId,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        localStorage.setItem('shopMeCart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.showNotification(`${product.name} added to cart!`, 'success');
    }

    buyNow() {
        if (!this.currentProduct) return;
        
        this.addToCart(this.currentProduct.id);
        this.showPage('cart');
    }

    filterByCategory(category) {
        this.currentCategory = category;
        
        if (category === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(p => p.category === category);
        }
        
        this.currentPageNumber = 1;
        this.displayProducts();
    }

    performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;

        this.filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()) ||
            product.subcategory.toLowerCase().includes(query.toLowerCase())
        );

        document.getElementById('searchResultsTitle').textContent = `Search Results for "${query}"`;
        this.displaySearchResults();
        this.showPage('searchResults');
        this.hideSearchSuggestions();
    }

    showSearchSuggestions(query) {
        const container = document.getElementById('searchSuggestions');
        
        if (!query.trim()) {
            this.hideSearchSuggestions();
            return;
        }

        const suggestions = this.products
            .filter(product => product.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);

        if (suggestions.length > 0) {
            container.innerHTML = suggestions.map(product => 
                `<div class="search-suggestion" onclick="shopMe.selectSuggestion('${product.name}')">
                    ${product.name}
                </div>`
            ).join('');
            container.style.display = 'block';
        } else {
            this.hideSearchSuggestions();
        }
    }

    selectSuggestion(productName) {
        document.getElementById('searchInput').value = productName;
        this.hideSearchSuggestions();
        this.performSearch();
    }

    hideSearchSuggestions() {
        document.getElementById('searchSuggestions').style.display = 'none';
    }

    displaySearchResults() {
        const grid = document.getElementById('searchResultsGrid');
        grid.innerHTML = '';

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search terms</p>
                </div>
            `;
            return;
        }

        this.filteredProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            grid.appendChild(productCard);
        });
    }

    loadMoreProducts() {
        this.currentPageNumber++;
        this.displayProducts();
    }

    showPage(pageId) {
        this.currentPage = pageId;
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        
        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Load page-specific content
            if (pageId === 'cart') {
                this.loadCartPage();
            } else if (pageId === 'orders') {
                this.loadOrdersPage();
            }
        }
    }

    loadCartPage() {
        const cartContent = document.getElementById('cartContent');
        const cartSummary = document.getElementById('cartSummary');

        if (this.cart.length === 0) {
            cartContent.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started</p>
                </div>
            `;
            cartSummary.innerHTML = '';
            return;
        }

        // Display cart items
        let cartItemsHTML = '<div class="cart-items">';
        let total = 0;

        this.cart.forEach(cartItem => {
            const product = this.products.find(p => p.id === cartItem.productId);
            if (!product) return;

            const itemTotal = product.price * cartItem.quantity;
            total += itemTotal;

            cartItemsHTML += `
                <div class="cart-item">
                    <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h4>${product.name}</h4>
                        <p>${product.category}</p>
                        <p class="cart-item-price">₹${product.price} each</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="shopMe.updateCartQuantity(${cartItem.productId}, -1)">-</button>
                        <span>${cartItem.quantity}</span>
                        <button class="quantity-btn" onclick="shopMe.updateCartQuantity(${cartItem.productId}, 1)">+</button>
                    </div>
                    <div class="cart-item-price">₹${itemTotal}</div>
                    <button class="remove-item" onclick="shopMe.removeFromCart(${cartItem.productId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        cartItemsHTML += '</div>';
        cartContent.innerHTML = cartItemsHTML;

        // Display cart summary
        const shipping = total > 500 ? 0 : 50;
        const tax = Math.floor(total * 0.18); // 18% GST
        const finalTotal = total + shipping + tax;

        cartSummary.innerHTML = `
            <h3>Order Summary</h3>
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>₹${total}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'Free' : '₹' + shipping}</span>
            </div>
            <div class="summary-row">
                <span>Tax (GST 18%):</span>
                <span>₹${tax}</span>
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span>₹${finalTotal}</span>
            </div>
            <button class="checkout-btn" onclick="shopMe.proceedToCheckout()">
                Proceed to Checkout
            </button>
        `;
    }

    updateCartQuantity(productId, change) {
        const cartItem = this.cart.find(item => item.productId === productId);
        if (!cartItem) return;

        cartItem.quantity += change;
        
        if (cartItem.quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        localStorage.setItem('shopMeCart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.loadCartPage();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.productId !== productId);
        localStorage.setItem('shopMeCart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.loadCartPage();
        
        const product = this.products.find(p => p.id === productId);
        this.showNotification(`${product.name} removed from cart`, 'warning');
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
        
        if (count === 0) {
            document.getElementById('cartCount').style.display = 'none';
        } else {
            document.getElementById('cartCount').style.display = 'flex';
        }
    }

    proceedToCheckout() {
        if (!this.currentUser) {
            this.showNotification('Please sign in to proceed with checkout', 'warning');
            this.showAuthModal();
            return;
        }

        this.showModal('paymentModal');
    }

    selectPaymentMethod(method) {
        // Hide all payment forms
        document.querySelectorAll('.payment-form').forEach(form => {
            form.style.display = 'none';
        });

        // Remove selection from all options
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Select current option and show form
        document.querySelector(`[data-method="${method}"]`).classList.add('selected');
        document.getElementById(`${method}Form`).style.display = 'block';
    }

    loadOrdersPage() {
        const ordersContent = document.getElementById('ordersContent');

        if (!this.currentUser) {
            ordersContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-lock"></i>
                    <h3>Please sign in</h3>
                    <p>Sign in to view your orders</p>
                    <button class="cta-btn" onclick="shopMe.showAuthModal()">Sign In</button>
                </div>
            `;
            return;
        }

        const userOrders = this.orders.filter(order => order.userId === this.currentUser.id);

        if (userOrders.length === 0) {
            ordersContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here</p>
                </div>
            `;
            return;
        }

        ordersContent.innerHTML = userOrders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-id">Order #${order.id}</div>
                    <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
                </div>
                <div class="order-products">
                    ${order.products.map(item => {
                        const product = this.products.find(p => p.id === item.productId);
                        return `
                            <div class="order-product">
                                <img src="${product.image}" alt="${product.name}" class="order-product-image">
                                <div class="order-product-info">
                                    <h4>${product.name}</h4>
                                    <p>Quantity: ${item.quantity} | ₹${product.price} each</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="order-total">Total: ₹${order.total}</div>
                <p><small>Ordered on ${new Date(order.createdAt).toLocaleDateString()}</small></p>
            </div>
        `).join('');
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        sidebar.classList.toggle('hidden');
        mainContent.classList.toggle('sidebar-hidden');
    }

    showAuthModal() {
        this.showModal('authModal');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = '';
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}Form`).classList.add('active');
    }

    handleSignIn(e) {
        e.preventDefault();
        
        const email = document.getElementById('signinEmail').value;
        const password = document.getElementById('signinPassword').value;
        
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('shopMeCurrentUser', JSON.stringify(user));
            this.updateAuthUI();
            this.hideModal('authModal');
            this.showNotification(`Welcome back, ${user.name}!`, 'success');
        } else {
            this.showNotification('Invalid email or password', 'error');
        }
    }

    handleSignUp(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const phone = document.getElementById('signupPhone').value;
        const address = document.getElementById('signupAddress').value;
        
        if (this.users.find(u => u.email === email)) {
            this.showNotification('Email already exists', 'error');
            return;
        }
        
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            phone,
            address,
            createdAt: new Date().toISOString()
        };
        
        this.users.push(newUser);
        localStorage.setItem('shopMeUsers', JSON.stringify(this.users));
        
        this.currentUser = newUser;
        localStorage.setItem('shopMeCurrentUser', JSON.stringify(newUser));
        this.updateAuthUI();
        this.hideModal('authModal');
        this.showNotification(`Welcome to Shop Me, ${name}!`, 'success');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('shopMeCurrentUser');
        this.updateAuthUI();
        this.showNotification('Logged out successfully', 'success');
        
        if (this.currentPage === 'orders') {
            this.showPage('home');
        }
    }

    updateAuthUI() {
        const authBtn = document.getElementById('authBtn');
        const userProfile = document.getElementById('userProfile');
        const username = document.getElementById('username');
        
        if (this.currentUser) {
            authBtn.style.display = 'none';
            userProfile.style.display = 'flex';
            username.textContent = this.currentUser.name;
        } else {
            authBtn.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                container.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Payment processing
function processPayment(method) {
    const shopMe = window.shopMe;
    
    if (shopMe.cart.length === 0) {
        shopMe.showNotification('Your cart is empty', 'error');
        return;
    }

    // Calculate total
    let total = 0;
    shopMe.cart.forEach(cartItem => {
        const product = shopMe.products.find(p => p.id === cartItem.productId);
        total += product.price * cartItem.quantity;
    });

    const shipping = total > 500 ? 0 : 50;
    const tax = Math.floor(total * 0.18);
    const finalTotal = total + shipping + tax;

    // Create order
    const order = {
        id: Date.now(),
        userId: shopMe.currentUser.id,
        products: [...shopMe.cart],
        total: finalTotal,
        paymentMethod: method,
        status: method === 'cod' ? 'Confirmed' : 'Confirmed',
        createdAt: new Date().toISOString()
    };

    shopMe.orders.push(order);
    localStorage.setItem('shopMeOrders', JSON.stringify(shopMe.orders));

    // Clear cart
    shopMe.cart = [];
    localStorage.setItem('shopMeCart', JSON.stringify(shopMe.cart));
    shopMe.updateCartCount();

    shopMe.hideModal('paymentModal');
    shopMe.showNotification('Order placed successfully!', 'success');
    
    // Generate and show invoice
    generateInvoice(order);
    shopMe.showModal('invoiceModal');
    
    // Redirect to orders page after a delay
    setTimeout(() => {
        shopMe.showPage('orders');
    }, 2000);
}

function generateInvoice(order) {
    const shopMe = window.shopMe;
    const container = document.getElementById('invoiceContainer');
    
    const orderDate = new Date(order.createdAt).toLocaleDateString();
    let productsHTML = '';
    let subtotal = 0;

    order.products.forEach(item => {
        const product = shopMe.products.find(p => p.id === item.productId);
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        
        productsHTML += `
            <tr>
                <td>${product.name}</td>
                <td>${item.quantity}</td>
                <td>₹${product.price}</td>
                <td>₹${itemTotal}</td>
            </tr>
        `;
    });

    const shipping = subtotal > 500 ? 0 : 50;
    const tax = Math.floor(subtotal * 0.18);

    container.innerHTML = `
        <div class="invoice-header">
            <h2>Shop Me</h2>
            <h3>Invoice</h3>
        </div>
        
        <div class="invoice-details">
            <div>
                <h4>Bill To:</h4>
                <p>${shopMe.currentUser.name}</p>
                <p>${shopMe.currentUser.email}</p>
                <p>${shopMe.currentUser.phone}</p>
                <p>${shopMe.currentUser.address}</p>
            </div>
            <div>
                <h4>Order Details:</h4>
                <p><strong>Order ID:</strong> #${order.id}</p>
                <p><strong>Date:</strong> ${orderDate}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            </div>
        </div>
        
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${productsHTML}
                <tr>
                    <td colspan="3"><strong>Subtotal</strong></td>
                    <td><strong>₹${subtotal}</strong></td>
                </tr>
                <tr>
                    <td colspan="3">Shipping</td>
                    <td>₹${shipping}</td>
                </tr>
                <tr>
                    <td colspan="3">Tax (18% GST)</td>
                    <td>₹${tax}</td>
                </tr>
                <tr>
                    <td colspan="3" class="invoice-total"><strong>Grand Total</strong></td>
                    <td class="invoice-total"><strong>₹${order.total}</strong></td>
                </tr>
            </tbody>
        </table>
        
        <div style="text-align: center; margin-top: 2rem; color: #666;">
            <p>Thank you for shopping with Shop Me!</p>
            <p>For any queries, contact us at support@shopme.com</p>
        </div>
    `;
}

function downloadInvoice() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Add content to PDF
    pdf.setFontSize(20);
    pdf.text('Shop Me - Invoice', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Order ID: #${Date.now()}`, 20, 50);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    pdf.text(`Customer: ${window.shopMe.currentUser.name}`, 20, 70);
    
    // Add more invoice details...
    pdf.text('Thank you for shopping with Shop Me!', 20, 200);
    
    pdf.save(`ShopMe_Invoice_${Date.now()}.pdf`);
}

// Add required CSS animations
const additionalStyles = `
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.shopMe = new ShopMeEcommerce();
    console.log('🛒 Shop Me E-commerce Platform Loaded Successfully!');
});
