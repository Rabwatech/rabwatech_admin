-- ============================================
-- RABWATECH - COMPREHENSIVE OFFERS MANAGEMENT SYSTEM
-- Version: 2.0 - Professional & Reusable - PostgreSQL Edition
-- Created: November 18, 2025
-- Author: Claude (Anthropic)
-- ============================================
-- 
-- FEATURES:
-- ✅ Flexible campaign system (Black Friday, Ramadan, Summer, etc.)
-- ✅ Multiple offer types (percentage, fixed amount, BOGO, bundles, etc.)
-- ✅ Coupon/Promo code system
-- ✅ Customer tracking and restrictions
-- ✅ Order/Purchase tracking
-- ✅ Price history (versioning)
-- ✅ Analytics and reporting
-- ✅ Multi-language support (Arabic/English)
-- ✅ 100% Reusable for any future campaigns
--
-- ============================================

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS coupon_usage CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS offer_price_history CASCADE;
DROP TABLE IF EXISTS offer_restrictions CASCADE;
DROP TABLE IF EXISTS offer_items CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS offer_types CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;

-- Drop custom types if they exist
DROP TYPE IF EXISTS customer_type_enum CASCADE;
DROP TYPE IF EXISTS offer_calculation_method_enum CASCADE;
DROP TYPE IF EXISTS campaign_type_enum CASCADE;
DROP TYPE IF EXISTS customer_segment_enum CASCADE;
DROP TYPE IF EXISTS discount_type_enum CASCADE;
DROP TYPE IF EXISTS order_status_enum CASCADE;
DROP TYPE IF EXISTS payment_status_enum CASCADE;
DROP TYPE IF EXISTS item_status_enum CASCADE;
DROP TYPE IF EXISTS coupon_discount_type_enum CASCADE;
DROP TYPE IF EXISTS coupon_applies_to_enum CASCADE;

-- ============================================
-- CREATE CUSTOM TYPES (PostgreSQL ENUMS)
-- ============================================

CREATE TYPE customer_type_enum AS ENUM ('individual', 'business', 'enterprise');
CREATE TYPE offer_calculation_method_enum AS ENUM (
    'percentage_discount',
    'fixed_amount_discount',
    'fixed_price',
    'buy_x_get_y',
    'bundle',
    'free_item',
    'free_shipping',
    'tiered_discount'
);
CREATE TYPE campaign_type_enum AS ENUM (
    'seasonal',
    'launch',
    'anniversary',
    'clearance',
    'flash_sale',
    'loyalty',
    'referral',
    'custom'
);
CREATE TYPE customer_segment_enum AS ENUM ('all', 'new', 'returning', 'vip', 'business', 'influencer');
CREATE TYPE discount_type_enum AS ENUM ('percentage', 'fixed');
CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE item_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE coupon_discount_type_enum AS ENUM ('percentage', 'fixed', 'free_shipping', 'free_item');
CREATE TYPE coupon_applies_to_enum AS ENUM ('all', 'specific_services', 'specific_categories', 'specific_offers');

-- ============================================
-- 1. SERVICE CATEGORIES
-- Base categories for all your services
-- ============================================
CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    category_name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    description_ar TEXT,
    parent_id INTEGER REFERENCES service_categories(id) ON DELETE SET NULL,
    icon VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_categories_active ON service_categories(is_active);
CREATE INDEX idx_service_categories_code ON service_categories(category_code);

-- ============================================
-- 2. SERVICES (Your Core Products/Services)
-- All services you offer (websites, apps, branding, etc.)
-- ============================================
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES service_categories(id) ON DELETE SET NULL,
    service_code VARCHAR(50) UNIQUE NOT NULL,
    service_name VARCHAR(200) NOT NULL,
    service_name_ar VARCHAR(200) NOT NULL,
    
    -- Description
    short_description TEXT,
    short_description_ar TEXT,
    full_description TEXT,
    full_description_ar TEXT,
    
    -- Pricing
    base_price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    
    -- Details
    delivery_time_days INTEGER,
    delivery_time_text VARCHAR(100),
    delivery_time_text_ar VARCHAR(100),
    
    -- Features (JSON)
    features JSONB,
    
    -- Media
    image_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    
    -- SEO
    meta_title VARCHAR(200),
    meta_title_ar VARCHAR(200),
    meta_description TEXT,
    meta_description_ar TEXT,
    slug VARCHAR(200) UNIQUE,
    
    -- Display
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Stats
    views_count INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_featured ON services(is_featured);
CREATE INDEX idx_services_code ON services(service_code);
CREATE INDEX idx_services_slug ON services(slug);

-- ============================================
-- 3. CUSTOMERS
-- Track customer information and purchase history
-- ============================================
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    
    -- Personal Info
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    
    -- Business Info (optional)
    company_name VARCHAR(200),
    company_name_ar VARCHAR(200),
    tax_number VARCHAR(50),
    
    -- Location
    country VARCHAR(100) DEFAULT 'Saudi Arabia',
    city VARCHAR(100),
    address TEXT,
    
    -- Customer Type
    customer_type customer_type_enum DEFAULT 'individual',
    
    -- Stats
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(10, 2) DEFAULT 0.00,
    first_order_date DATE,
    last_order_date DATE,
    
    -- Preferences
    preferred_language VARCHAR(2) DEFAULT 'ar',
    marketing_consent BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Notes (internal)
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_code ON customers(customer_code);
CREATE INDEX idx_customers_type ON customers(customer_type);

-- ============================================
-- 4. OFFER TYPES
-- Define different types of offers/promotions
-- ============================================
CREATE TABLE offer_types (
    id SERIAL PRIMARY KEY,
    type_code VARCHAR(50) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    type_name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    description_ar TEXT,
    
    -- Type Configuration
    calculation_method offer_calculation_method_enum NOT NULL,
    
    requires_code BOOLEAN DEFAULT FALSE,
    is_stackable BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offer_types_code ON offer_types(type_code);

-- ============================================
-- 5. CAMPAIGNS
-- Marketing campaigns (Black Friday, Ramadan, Summer, etc.)
-- ============================================
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    campaign_code VARCHAR(50) UNIQUE NOT NULL,
    campaign_name VARCHAR(200) NOT NULL,
    campaign_name_ar VARCHAR(200) NOT NULL,
    
    -- Description
    tagline VARCHAR(255),
    tagline_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    
    -- Campaign Type/Season
    campaign_type campaign_type_enum DEFAULT 'seasonal',
    season VARCHAR(50),
    
    -- Timing
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    
    -- Display
    banner_image_url VARCHAR(500),
    banner_image_mobile_url VARCHAR(500),
    theme_color VARCHAR(7),
    
    -- Landing Page
    landing_page_url VARCHAR(500),
    landing_page_slug VARCHAR(200) UNIQUE,
    
    -- Goals & Budget
    target_revenue NUMERIC(12, 2),
    target_customers INTEGER,
    marketing_budget NUMERIC(10, 2),
    
    -- Stats (auto-calculated)
    total_revenue NUMERIC(12, 2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    unique_customers INTEGER DEFAULT 0,
    
    -- Priority & Display
    priority INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Notifications
    notify_start BOOLEAN DEFAULT TRUE,
    notify_end BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_active ON campaigns(is_active, start_date, end_date);
CREATE INDEX idx_campaigns_code ON campaigns(campaign_code);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);

-- ============================================
-- 6. OFFERS
-- The main offers table (packages, combos, discounts, etc.)
-- ============================================
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    offer_type_id INTEGER NOT NULL REFERENCES offer_types(id) ON DELETE RESTRICT,
    
    offer_code VARCHAR(50) UNIQUE NOT NULL,
    offer_name VARCHAR(200) NOT NULL,
    offer_name_ar VARCHAR(200) NOT NULL,
    
    -- Description
    subtitle VARCHAR(255),
    subtitle_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    terms_and_conditions TEXT,
    terms_and_conditions_ar TEXT,
    
    -- Pricing
    original_price NUMERIC(10, 2),
    sale_price NUMERIC(10, 2),
    discount_value NUMERIC(10, 2),
    discount_type discount_type_enum DEFAULT 'percentage',
    
    -- Calculated fields
    savings_amount NUMERIC(10, 2),
    discount_percentage INTEGER,
    
    -- Target Audience
    target_audience TEXT,
    target_audience_ar TEXT,
    customer_segment customer_segment_enum DEFAULT 'all',
    
    -- Display & Marketing
    badge_text VARCHAR(50),
    badge_text_ar VARCHAR(50),
    badge_color VARCHAR(7),
    
    image_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    
    -- Availability
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    
    -- Quantity Limits
    max_quantity INTEGER,
    quantity_per_customer INTEGER DEFAULT 1,
    sold_count INTEGER DEFAULT 0,
    reserved_count INTEGER DEFAULT 0,
    
    -- Requirements
    min_purchase_amount NUMERIC(10, 2),
    requires_coupon BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    auto_apply BOOLEAN DEFAULT FALSE,
    
    -- Stats
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    conversion_rate NUMERIC(5, 2) DEFAULT 0.00,
    
    -- SEO
    meta_title VARCHAR(200),
    meta_title_ar VARCHAR(200),
    meta_description TEXT,
    meta_description_ar TEXT,
    slug VARCHAR(200) UNIQUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offers_active ON offers(is_active, start_date, end_date);
CREATE INDEX idx_offers_campaign ON offers(campaign_id);
CREATE INDEX idx_offers_code ON offers(offer_code);
CREATE INDEX idx_offers_dates ON offers(start_date, end_date);
CREATE INDEX idx_offers_featured ON offers(is_featured);
CREATE INDEX idx_offers_slug ON offers(slug);

-- ============================================
-- 7. OFFER ITEMS
-- What's included in each offer (services/products)
-- ============================================
CREATE TABLE offer_items (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    
    -- Item Details
    item_name VARCHAR(200) NOT NULL,
    item_name_ar VARCHAR(200) NOT NULL,
    item_description TEXT,
    item_description_ar TEXT,
    
    -- Quantity & Pricing
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2),
    
    -- Display
    display_order INTEGER DEFAULT 0,
    is_highlighted BOOLEAN DEFAULT FALSE,
    icon VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offer_items_offer ON offer_items(offer_id);

-- ============================================
-- 8. OFFER RESTRICTIONS
-- Rules and restrictions for offers
-- ============================================
CREATE TABLE offer_restrictions (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    
    -- Customer Restrictions
    new_customers_only BOOLEAN DEFAULT FALSE,
    returning_customers_only BOOLEAN DEFAULT FALSE,
    exclude_customers JSONB,
    include_customers JSONB,
    
    -- Location Restrictions
    allowed_countries JSONB,
    allowed_cities JSONB,
    excluded_cities JSONB,
    
    -- Time Restrictions
    allowed_days JSONB,
    allowed_hours_start TIME,
    allowed_hours_end TIME,
    
    -- Combination Rules
    cannot_combine_with JSONB,
    requires_offers JSONB,
    
    -- Other Rules
    first_purchase_only BOOLEAN DEFAULT FALSE,
    min_cart_items INTEGER,
    max_cart_items INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offer_restrictions_offer ON offer_restrictions(offer_id);

-- ============================================
-- 9. OFFER PRICE HISTORY
-- Track price changes over time (versioning)
-- ============================================
CREATE TABLE offer_price_history (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    
    -- Old Prices
    old_original_price NUMERIC(10, 2),
    old_sale_price NUMERIC(10, 2),
    old_discount_value NUMERIC(10, 2),
    
    -- New Prices
    new_original_price NUMERIC(10, 2),
    new_sale_price NUMERIC(10, 2),
    new_discount_value NUMERIC(10, 2),
    
    -- Change Info
    change_reason VARCHAR(255),
    changed_by VARCHAR(100),
    
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offer_price_history_offer ON offer_price_history(offer_id);
CREATE INDEX idx_offer_price_history_date ON offer_price_history(effective_from);

-- ============================================
-- 10. COUPONS (Promo Codes)
-- Discount codes that customers can apply
-- ============================================
CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    offer_id INTEGER REFERENCES offers(id) ON DELETE SET NULL,
    
    -- Code Details
    coupon_code VARCHAR(50) UNIQUE NOT NULL,
    coupon_name VARCHAR(200),
    coupon_name_ar VARCHAR(200),
    description TEXT,
    description_ar TEXT,
    
    -- Discount Type
    discount_type coupon_discount_type_enum NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    
    -- Requirements
    min_purchase_amount NUMERIC(10, 2) DEFAULT 0.00,
    max_discount_amount NUMERIC(10, 2),
    
    -- Applicability
    applies_to coupon_applies_to_enum DEFAULT 'all',
    applicable_services JSONB,
    applicable_categories JSONB,
    applicable_offers JSONB,
    
    -- Usage Limits
    usage_limit INTEGER,
    usage_limit_per_customer INTEGER DEFAULT 1,
    current_usage INTEGER DEFAULT 0,
    
    -- Validity
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    
    -- Target Audience
    customer_segment customer_segment_enum DEFAULT 'all',
    specific_customers JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Stats
    total_revenue NUMERIC(12, 2) DEFAULT 0.00,
    total_discount_given NUMERIC(12, 2) DEFAULT 0.00,
    
    -- Metadata
    created_by VARCHAR(100),
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(coupon_code);
CREATE INDEX idx_coupons_active ON coupons(is_active, start_date, end_date);
CREATE INDEX idx_coupons_campaign ON coupons(campaign_id);

-- ============================================
-- 11. COUPON USAGE
-- Track who used which coupon when
-- ============================================
CREATE TABLE coupon_usage (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id INTEGER,
    
    -- Usage Details
    discount_applied NUMERIC(10, 2) NOT NULL,
    order_total NUMERIC(10, 2),
    
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_customer ON coupon_usage(customer_id);
CREATE INDEX idx_coupon_usage_date ON coupon_usage(used_at);

-- ============================================
-- 12. ORDERS
-- Customer orders/purchases
-- ============================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    
    -- Order Details
    order_status order_status_enum DEFAULT 'pending',
    
    -- Pricing
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    
    -- Payment
    payment_status payment_status_enum DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_date TIMESTAMP,
    transaction_id VARCHAR(100),
    
    -- Applied Offers & Coupons
    applied_offers JSONB,
    applied_coupons JSONB,
    
    -- Delivery/Contact Info
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    delivery_address TEXT,
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Tracking
    ip_address VARCHAR(45),
    user_agent TEXT,
    referral_source VARCHAR(255),
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_date ON orders(ordered_at);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_campaign ON orders(campaign_id);

-- ============================================
-- 13. ORDER ITEMS
-- Items in each order
-- ============================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    offer_id INTEGER REFERENCES offers(id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    
    -- Item Details
    item_name VARCHAR(200) NOT NULL,
    item_name_ar VARCHAR(200) NOT NULL,
    item_description TEXT,
    
    -- Pricing (snapshot at time of purchase)
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL,
    
    -- Status
    item_status item_status_enum DEFAULT 'pending',
    
    -- Delivery
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_offer ON order_items(offer_id);
CREATE INDEX idx_order_items_service ON order_items(service_id);

-- ============================================
-- INSERT BASE DATA - OFFER TYPES
-- ============================================

INSERT INTO offer_types (type_code, type_name, type_name_ar, calculation_method, requires_code, is_stackable) VALUES
('percentage_discount', 'Percentage Discount', 'خصم بالنسبة المئوية', 'percentage_discount', FALSE, TRUE),
('fixed_discount', 'Fixed Amount Discount', 'خصم بقيمة ثابتة', 'fixed_amount_discount', FALSE, TRUE),
('fixed_price', 'Fixed Price Deal', 'سعر ثابت', 'fixed_price', FALSE, FALSE),
('bundle', 'Bundle/Package Deal', 'عرض باقة', 'bundle', FALSE, FALSE),
('bogo', 'Buy One Get One', 'اشتري واحد واحصل على الثاني', 'buy_x_get_y', FALSE, FALSE),
('free_bonus', 'Free Bonus Item', 'هدية مجانية', 'free_item', FALSE, TRUE),
('free_shipping', 'Free Shipping/Delivery', 'توصيل مجاني', 'free_shipping', FALSE, TRUE),
('tiered', 'Tiered Discount', 'خصم متدرج', 'tiered_discount', FALSE, FALSE),
('coupon_only', 'Coupon Code Only', 'كود خصم فقط', 'percentage_discount', TRUE, TRUE);

-- ============================================
-- INSERT SAMPLE DATA - BLACK FRIDAY CAMPAIGN
-- ============================================

INSERT INTO campaigns (
    campaign_code, campaign_name, campaign_name_ar,
    tagline, tagline_ar,
    description, description_ar,
    campaign_type, season,
    start_date, end_date,
    target_revenue, target_customers,
    is_featured, is_active, priority
) VALUES (
    'BF2025', 'Black Friday 2025', 'الجمعة البيضاء 2025',
    'Mega Savings on All Services', 'وفّر بشكل ضخم على جميع الخدمات',
    'Our biggest sale of the year with discounts up to 60% on all digital services',
    'أكبر تخفيضات السنة مع خصومات تصل إلى 60% على جميع الخدمات الرقمية',
    'seasonal', 'black_friday',
    '2025-11-16 00:00:00', '2025-11-30 23:59:59',
    500000.00, 100,
    TRUE, TRUE, 10
);

-- ============================================
-- INSERT SAMPLE DATA - SERVICE CATEGORIES
-- ============================================

INSERT INTO service_categories (category_code, category_name, category_name_ar, display_order) VALUES
('web_design', 'Web Design & Development', 'تصميم وتطوير المواقع', 1),
('mobile_apps', 'Mobile Applications', 'تطبيقات الجوال', 2),
('branding', 'Branding & Identity', 'العلامة التجارية والهوية', 3),
('marketing', 'Digital Marketing', 'التسويق الرقمي', 4),
('photography', 'Photography & Videography', 'التصوير الفوتوغرافي والفيديو', 5),
('consulting', 'Consulting Services', 'الخدمات الاستشارية', 6);

-- ============================================
-- INSERT SAMPLE DATA - SERVICES
-- ============================================

INSERT INTO services (category_id, service_code, service_name, service_name_ar, short_description, short_description_ar, base_price, delivery_time_days) VALUES
((SELECT id FROM service_categories WHERE category_code = 'web_design'), 'WEB-INTRO', 'Introductory Website', 'موقع تعريفي', 'Professional 5-page website', 'موقع احترافي من 5 صفحات', 4000.00, 10),
((SELECT id FROM service_categories WHERE category_code = 'web_design'), 'WEB-PRO', 'Professional Website', 'موقع احترافي', 'Advanced 10+ page website', 'موقع متقدم 10+ صفحات', 8500.00, 21),
((SELECT id FROM service_categories WHERE category_code = 'web_design'), 'WEB-ECOM', 'E-commerce Store', 'متجر إلكتروني', 'Complete online store', 'متجر إلكتروني متكامل', 12000.00, 30),
((SELECT id FROM service_categories WHERE category_code = 'mobile_apps'), 'APP-SINGLE', 'Mobile App (Single Platform)', 'تطبيق جوال (منصة واحدة)', 'iOS or Android app', 'تطبيق iOS أو Android', 15000.00, 45),
((SELECT id FROM service_categories WHERE category_code = 'mobile_apps'), 'APP-DUAL', 'Mobile App (Both Platforms)', 'تطبيق جوال (منصتين)', 'iOS and Android app', 'تطبيق iOS و Android', 25000.00, 60),
((SELECT id FROM service_categories WHERE category_code = 'branding'), 'BRAND-LOGO', 'Logo Design', 'تصميم شعار', 'Professional logo design', 'تصميم شعار احترافي', 800.00, 3),
((SELECT id FROM service_categories WHERE category_code = 'branding'), 'BRAND-FULL', 'Complete Brand Identity', 'هوية بصرية كاملة', 'Full branding package', 'باقة هوية كاملة', 3500.00, 7),
((SELECT id FROM service_categories WHERE category_code = 'marketing'), 'MKT-PLAN', 'Marketing Plan', 'خطة تسويقية', 'Complete marketing strategy', 'استراتيجية تسويقية متكاملة', 3000.00, 7),
((SELECT id FROM service_categories WHERE category_code = 'marketing'), 'MKT-SOCIAL', 'Social Media Management', 'إدارة سوشال ميديا', 'Monthly social media management', 'إدارة شهرية لوسائل التواصل', 2500.00, 30),
((SELECT id FROM service_categories WHERE category_code = 'photography'), 'PHOTO-PRODUCT', 'Product Photography', 'تصوير منتجات', 'Professional product photoshoot', 'جلسة تصوير منتجات احترافية', 2500.00, 1);

-- ============================================
-- INSERT SAMPLE DATA - BLACK FRIDAY OFFERS
-- ============================================

-- Offer 1: Starter Package
INSERT INTO offers (
    campaign_id, offer_type_id, offer_code,
    offer_name, offer_name_ar,
    subtitle, subtitle_ar,
    description, description_ar,
    target_audience, target_audience_ar,
    original_price, sale_price, discount_value, discount_type,
    savings_amount, discount_percentage,
    customer_segment,
    start_date, end_date,
    is_featured, is_active, display_order
) VALUES (
    (SELECT id FROM campaigns WHERE campaign_code = 'BF2025'),
    (SELECT id FROM offer_types WHERE type_code = 'bundle'),
    'BF-STARTER',
    'Startup Package', 'باقة البداية',
    'Perfect for individuals and small projects', 'مثالية للأفراد وأصحاب المشاريع الصغيرة',
    'Complete starter package including website, logo, social media integration, hosting, SSL, and training',
    'باقة بداية متكاملة تشمل موقع، شعار، ربط سوشال ميديا، استضافة، SSL، وتدريب',
    'Individuals and small business owners', 'الأفراد وأصحاب المشاريع الصغيرة',
    6500.00, 3999.00, 38, 'percentage',
    2501.00, 38,
    'all',
    '2025-11-16 00:00:00', '2025-11-30 23:59:59',
    FALSE, TRUE, 1
);

-- Offer 2: Growth Package
INSERT INTO offers (
    campaign_id, offer_type_id, offer_code,
    offer_name, offer_name_ar,
    subtitle, subtitle_ar,
    description, description_ar,
    target_audience, target_audience_ar,
    original_price, sale_price, discount_value, discount_type,
    savings_amount, discount_percentage,
    customer_segment,
    badge_text, badge_text_ar,
    start_date, end_date,
    is_featured, is_active, display_order
) VALUES (
    (SELECT id FROM campaigns WHERE campaign_code = 'BF2025'),
    (SELECT id FROM offer_types WHERE type_code = 'bundle'),
    'BF-GROWTH',
    'Growth Package', 'باقة النمو',
    'Ideal for startups and medium businesses', 'مثالية للشركات الناشئة والمتوسطة',
    'Complete growth package with website, app, branding, marketing plan, hosting, and 6-month support',
    'باقة نمو متكاملة مع موقع، تطبيق، هوية، خطة تسويق، استضافة، ودعم 6 أشهر',
    'Startups and medium-sized companies', 'الشركات الناشئة والمتوسطة',
    28000.00, 16999.00, 39, 'percentage',
    11001.00, 39,
    'all',
    'Most Popular', 'الأكثر طلباً',
    '2025-11-16 00:00:00', '2025-11-30 23:59:59',
    TRUE, TRUE, 2
);

-- Offer 3: Premium Package
INSERT INTO offers (
    campaign_id, offer_type_id, offer_code,
    offer_name, offer_name_ar,
    subtitle, subtitle_ar,
    description, description_ar,
    target_audience, target_audience_ar,
    original_price, sale_price, discount_value, discount_type,
    savings_amount, discount_percentage,
    customer_segment,
    start_date, end_date,
    is_featured, is_active, display_order
) VALUES (
    (SELECT id FROM campaigns WHERE campaign_code = 'BF2025'),
    (SELECT id FROM offer_types WHERE type_code = 'bundle'),
    'BF-PREMIUM',
    'Digital Transformation Package', 'باقة التحول الرقمي الكامل',
    'Complete solution for large companies', 'مثالية للشركات الكبيرة والمؤسسات',
    'Enterprise package with advanced website, dual-platform app, CRM/ERP, branding, 6-month marketing, photography, social media management, consultations, and full-year support',
    'باقة مؤسسات مع موقع متقدم، تطبيق، نظام إدارة، هوية، تسويق 6 أشهر، تصوير، إدارة سوشال ميديا، استشارات، ودعم سنة كاملة',
    'Large companies and enterprises', 'الشركات الكبيرة والمؤسسات',
    85000.00, 49999.00, 41, 'percentage',
    35001.00, 41,
    'business',
    '2025-11-16 00:00:00', '2025-11-30 23:59:59',
    FALSE, TRUE, 3
);

-- Offer 4: Limited Trust Package
INSERT INTO offers (
    campaign_id, offer_type_id, offer_code,
    offer_name, offer_name_ar,
    subtitle, subtitle_ar,
    description, description_ar,
    target_audience, target_audience_ar,
    original_price, sale_price, discount_value, discount_type,
    savings_amount, discount_percentage,
    customer_segment,
    badge_text, badge_text_ar,
    start_date, end_date,
    max_quantity, quantity_per_customer,
    is_featured, is_active, display_order
) VALUES (
    (SELECT id FROM campaigns WHERE campaign_code = 'BF2025'),
    (SELECT id FROM offer_types WHERE type_code = 'fixed_price'),
    'BF-TRUST',
    'First Trust Package', 'باقة الثقة الأولى',
    'Exclusive offer - First 10 customers only', 'عرض حصري - أول 10 عملاء فقط',
    'Special introductory package for our first customers including website, basic branding, photography, and 3-month support',
    'باقة تعريفية خاصة لأول عملائنا تشمل موقع، هوية أساسية، تصوير، ودعم 3 أشهر',
    'First-time clients looking for quality at best price', 'العملاء الجدد الباحثين عن الجودة بأفضل سعر',
    7500.00, 2999.00, 60, 'percentage',
    4501.00, 60,
    'new',
    'Limited - 10 Only', 'محدود - 10 فقط',
    '2025-11-16 00:00:00', '2025-11-20 23:59:59',
    10, 1,
    TRUE, TRUE, 4
);

-- ============================================
-- INSERT SAMPLE DATA - OFFER ITEMS
-- ============================================

-- Starter Package Items
INSERT INTO offer_items (offer_id, service_id, item_name, item_name_ar, display_order) VALUES
((SELECT id FROM offers WHERE offer_code = 'BF-STARTER'), (SELECT id FROM services WHERE service_code = 'WEB-INTRO'), 'Professional website (5 pages)', 'موقع تعريفي (5 صفحات)', 1),
((SELECT id FROM offers WHERE offer_code = 'BF-STARTER'), (SELECT id FROM services WHERE service_code = 'BRAND-LOGO'), 'Professional logo design', 'تصميم شعار احترافي', 2),
((SELECT id FROM offers WHERE offer_code = 'BF-STARTER'), NULL, 'Social media integration (3 platforms)', 'ربط بـ 3 منصات تواصل اجتماعي', 3),
((SELECT id FROM offers WHERE offer_code = 'BF-STARTER'), NULL, 'Free hosting for 1 year', 'استضافة سنة مجاناً', 4),
((SELECT id FROM offers WHERE offer_code = 'BF-STARTER'), NULL, 'SSL certificate', 'شهادة SSL', 5),
((SELECT id FROM offers WHERE offer_code = 'BF-STARTER'), NULL, 'Free website management training', 'تدريب مجاني على إدارة الموقع', 6);

-- Growth Package Items
INSERT INTO offer_items (offer_id, service_id, item_name, item_name_ar, display_order) VALUES
((SELECT id FROM offers WHERE offer_code = 'BF-GROWTH'), (SELECT id FROM services WHERE service_code = 'WEB-PRO'), 'Professional website (10 pages)', 'موقع احترافي (10 صفحات)', 1),
((SELECT id FROM offers WHERE offer_code = 'BF-GROWTH'), (SELECT id FROM services WHERE service_code = 'BRAND-FULL'), 'Complete brand identity', 'هوية بصرية متكاملة', 2),
((SELECT id FROM offers WHERE offer_code = 'BF-GROWTH'), (SELECT id FROM services WHERE service_code = 'APP-SINGLE'), 'Mobile app (Android or iOS)', 'تطبيق جوال (Android أو iOS)', 3),
((SELECT id FROM offers WHERE offer_code = 'BF-GROWTH'), NULL, 'Admin control panel', 'لوحة تحكم إدارية', 4),
((SELECT id FROM offers WHERE offer_code = 'BF-GROWTH'), (SELECT id FROM services WHERE service_code = 'MKT-PLAN'), 'Digital marketing plan (3 months)', 'خطة تسويق رقمي (3 أشهر)', 5),
((SELECT id FROM offers WHERE offer_code = 'BF-GROWTH'), NULL, 'Free hosting + domain for 1 year', 'استضافة سنة + نطاق مجاناً', 6),
((SELECT id FROM offers WHERE offer_code = 'BF-GROWTH'), NULL, 'Technical support for 6 months', 'دعم فني 6 أشهر', 7);

-- Premium Package Items
INSERT INTO offer_items (offer_id, service_id, item_name, item_name_ar, display_order) VALUES
((SELECT id FROM offers WHERE offer_code = 'BF-PREMIUM'), NULL, 'Advanced website (unlimited pages)', 'موقع ويب متقدم (مفتوح الصفحات)', 1),
((SELECT id FROM offers WHERE offer_code = 'BF-PREMIUM'), NULL, 'Complete mobile app (Android + iOS)', 'تطبيق جوال كامل (Android + iOS)', 2),
((SELECT id FROM offers WHERE offer_code = 'BF-PREMIUM'), NULL, 'Integrated management system (CRM/ERP)', 'نظام إدارة متكامل (CRM/ERP)', 3),
((SELECT id FROM offers WHERE offer_code = 'BF-PREMIUM'), (SELECT id FROM services WHERE service_code = 'BRAND-FULL'), 'Brand identity + usage guide', 'هوية بصرية + دليل استخدام', 4),
((SELECT id FROM offers WHERE offer_code = 'BF-PREMIUM'), NULL, 'Comprehensive marketing plan (6 months)', 'خطة تسويق شاملة (6 أشهر)', 5),
((SELECT id FROM offers WHERE offer_code = 'BF-PREMIUM'), NULL, 'Professional product/service photography', 'تصوير احترافي للمنتجات/الخدمات', 6),
((SELECT id FROM offers WHERE offer_code = 'BF-PREMIUM'), (SELECT id FROM services WHERE service_code = 'MKT-SOCIAL'), 'Social media management (3 months)', 'إدارة منصات التواصل (3 أشهر)', 7),
((SELECT id FROM offers WHERE offer_code = 'BF-PREMIUM'), NULL, 'Regular technical consultations', 'استشارات تقنية دورية', 8),
((SELECT id FROM offers WHERE offer_code = 'BF-PREMIUM'), NULL, 'Technical support for 1 full year', 'دعم فني سنة كاملة', 9);

-- Trust Package Items
INSERT INTO offer_items (offer_id, service_id, item_name, item_name_ar, display_order) VALUES
((SELECT id FROM offers WHERE offer_code = 'BF-TRUST'), (SELECT id FROM services WHERE service_code = 'WEB-INTRO'), 'Professional introductory website', 'موقع تعريفي احترافي', 1),
((SELECT id FROM offers WHERE offer_code = 'BF-TRUST'), NULL, 'Basic brand identity', 'هوية بصرية أساسية', 2),
((SELECT id FROM offers WHERE offer_code = 'BF-TRUST'), NULL, 'Professional photography', 'تصوير احترافي', 3),
((SELECT id FROM offers WHERE offer_code = 'BF-TRUST'), NULL, 'Free technical support for 3 months', '3 أشهر دعم فني مجاني', 4);

-- ============================================
-- INSERT SAMPLE DATA - OFFER RESTRICTIONS
-- ============================================

INSERT INTO offer_restrictions (
    offer_id,
    new_customers_only,
    first_purchase_only
) VALUES (
    (SELECT id FROM offers WHERE offer_code = 'BF-TRUST'),
    TRUE,
    TRUE
);

-- ============================================
-- INSERT SAMPLE DATA - COUPONS
-- ============================================

INSERT INTO coupons (
    campaign_id, coupon_code,
    coupon_name, coupon_name_ar,
    description, description_ar,
    discount_type, discount_value,
    min_purchase_amount, max_discount_amount,
    applies_to,
    usage_limit, usage_limit_per_customer,
    customer_segment,
    start_date, end_date,
    is_active, is_public
) VALUES (
    (SELECT id FROM campaigns WHERE campaign_code = 'BF2025'),
    'INFLUENCER20',
    'Influencer Special 20%', 'خصم المؤثرين 20%',
    'Special 20% discount for influencers and partners',
    'خصم خاص 20% للمؤثرين والشركاء',
    'percentage', 20.00,
    5000.00, 5000.00,
    'all',
    100, 1,
    'influencer',
    '2025-11-16 00:00:00', '2025-11-30 23:59:59',
    TRUE, FALSE
);

INSERT INTO coupons (
    campaign_id, coupon_code,
    coupon_name, coupon_name_ar,
    description, description_ar,
    discount_type, discount_value,
    min_purchase_amount,
    applies_to,
    usage_limit_per_customer,
    customer_segment,
    start_date, end_date,
    is_active, is_public
) VALUES (
    (SELECT id FROM campaigns WHERE campaign_code = 'BF2025'),
    'FIRST500',
    'First Order 500 SAR Off', 'خصم 500 ريال للطلب الأول',
    '500 SAR discount on your first order above 3000 SAR',
    'خصم 500 ريال على طلبك الأول فوق 3000 ريال',
    'fixed', 500.00,
    3000.00,
    'all',
    1,
    'new',
    '2025-11-16 00:00:00', '2025-11-30 23:59:59',
    TRUE, TRUE
);

INSERT INTO coupons (
    campaign_id, coupon_code,
    coupon_name, coupon_name_ar,
    description, description_ar,
    discount_type, discount_value,
    min_purchase_amount,
    applies_to,
    usage_limit_per_customer,
    customer_segment,
    start_date, end_date,
    is_active, is_public
) VALUES (
    (SELECT id FROM campaigns WHERE campaign_code = 'BF2025'),
    'VIP1000',
    'VIP Exclusive 1000 SAR', 'خصم VIP حصري 1000 ريال',
    'Exclusive 1000 SAR discount for VIP customers on orders above 10000 SAR',
    'خصم حصري 1000 ريال لعملاء VIP على الطلبات فوق 10000 ريال',
    'fixed', 1000.00,
    10000.00,
    'all',
    2,
    'vip',
    '2025-11-16 00:00:00', '2025-11-30 23:59:59',
    TRUE, FALSE
);

-- ============================================
-- CREATE VIEWS FOR REPORTING
-- ============================================

-- Active Offers View
CREATE OR REPLACE VIEW v_active_offers AS
SELECT 
    o.id,
    o.offer_code,
    o.offer_name,
    o.offer_name_ar,
    o.original_price,
    o.sale_price,
    o.savings_amount,
    o.discount_percentage,
    o.badge_text,
    o.badge_text_ar,
    o.is_featured,
    o.max_quantity,
    o.sold_count,
    o.quantity_per_customer,
    CASE 
        WHEN o.max_quantity IS NULL THEN 'Unlimited'
        ELSE CAST((o.max_quantity - o.sold_count) AS VARCHAR)
    END as remaining_quantity,
    c.campaign_name,
    c.campaign_name_ar,
    ot.type_name,
    ot.type_name_ar,
    o.start_date,
    o.end_date,
    CASE 
        WHEN NOW() < o.start_date THEN 'upcoming'
        WHEN NOW() > o.end_date THEN 'expired'
        WHEN o.max_quantity IS NOT NULL AND o.sold_count >= o.max_quantity THEN 'sold_out'
        ELSE 'active'
    END as offer_status
FROM offers o
LEFT JOIN campaigns c ON o.campaign_id = c.id
LEFT JOIN offer_types ot ON o.offer_type_id = ot.id
WHERE o.is_active = TRUE;

-- Campaign Performance View
CREATE OR REPLACE VIEW v_campaign_performance AS
SELECT 
    c.id,
    c.campaign_code,
    c.campaign_name,
    c.campaign_name_ar,
    c.start_date,
    c.end_date,
    c.target_revenue,
    c.target_customers,
    COUNT(DISTINCT o.id) as total_offers,
    COUNT(DISTINCT ord.id) as total_orders,
    COUNT(DISTINCT ord.customer_id) as unique_customers,
    COALESCE(SUM(ord.total_amount), 0) as total_revenue,
    COALESCE(SUM(ord.discount_amount), 0) as total_discounts_given,
    CASE 
        WHEN c.target_revenue > 0 THEN 
            ROUND((COALESCE(SUM(ord.total_amount), 0) / c.target_revenue) * 100, 2)
        ELSE 0
    END as revenue_achievement_percentage,
    CASE 
        WHEN c.target_customers > 0 THEN 
            ROUND((COUNT(DISTINCT ord.customer_id)::NUMERIC / c.target_customers) * 100, 2)
        ELSE 0
    END as customer_achievement_percentage
FROM campaigns c
LEFT JOIN offers o ON c.id = o.campaign_id
LEFT JOIN orders ord ON c.id = ord.campaign_id 
    AND ord.order_status NOT IN ('cancelled', 'refunded')
GROUP BY c.id;

-- Customer Insights View
CREATE OR REPLACE VIEW v_customer_insights AS
SELECT 
    c.id,
    c.customer_code,
    c.first_name,
    c.last_name,
    c.email,
    c.customer_type,
    c.total_orders,
    c.total_spent,
    COUNT(DISTINCT cu.coupon_id) as coupons_used,
    COALESCE(SUM(cu.discount_applied), 0) as total_discounts_received,
    CASE 
        WHEN c.total_orders = 0 THEN 'new'
        WHEN c.total_orders = 1 THEN 'one_time'
        WHEN c.total_orders BETWEEN 2 AND 5 THEN 'regular'
        WHEN c.total_orders > 5 THEN 'loyal'
    END as customer_segment,
    CASE 
        WHEN c.last_order_date IS NOT NULL THEN 
            EXTRACT(DAY FROM (NOW() - c.last_order_date))
        ELSE NULL
    END as days_since_last_order
FROM customers c
LEFT JOIN coupon_usage cu ON c.id = cu.customer_id
GROUP BY c.id;

-- ============================================
-- CREATE FUNCTIONS (PostgreSQL Stored Procedures)
-- ============================================

-- Function to check offer availability
CREATE OR REPLACE FUNCTION check_offer_availability(
    p_offer_id INTEGER,
    p_customer_id INTEGER
) RETURNS TABLE(
    is_available BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_offer RECORD;
    v_customer_purchases INTEGER;
    v_restriction RECORD;
    v_customer_order_count INTEGER;
BEGIN
    -- Get offer details
    SELECT * INTO v_offer
    FROM offers
    WHERE id = p_offer_id;
    
    -- Check if offer exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Offer not found'::TEXT;
        RETURN;
    END IF;
    
    -- Check if offer is active
    IF v_offer.is_active = FALSE THEN
        RETURN QUERY SELECT FALSE, 'Offer is not active'::TEXT;
        RETURN;
    END IF;
    
    -- Check date range
    IF NOW() < v_offer.start_date THEN
        RETURN QUERY SELECT FALSE, 'Offer has not started yet'::TEXT;
        RETURN;
    END IF;
    
    IF NOW() > v_offer.end_date THEN
        RETURN QUERY SELECT FALSE, 'Offer has expired'::TEXT;
        RETURN;
    END IF;
    
    -- Check quantity limit
    IF v_offer.max_quantity IS NOT NULL AND v_offer.sold_count >= v_offer.max_quantity THEN
        RETURN QUERY SELECT FALSE, 'Offer is sold out'::TEXT;
        RETURN;
    END IF;
    
    -- Check customer purchase limit
    SELECT COUNT(*) INTO v_customer_purchases
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.offer_id = p_offer_id 
        AND o.customer_id = p_customer_id
        AND o.order_status NOT IN ('cancelled', 'refunded');
    
    IF v_customer_purchases >= v_offer.quantity_per_customer THEN
        RETURN QUERY SELECT FALSE, 'Customer purchase limit reached'::TEXT;
        RETURN;
    END IF;
    
    -- Check new customers only restriction
    SELECT * INTO v_restriction
    FROM offer_restrictions
    WHERE offer_id = p_offer_id
    LIMIT 1;
    
    IF FOUND AND v_restriction.new_customers_only = TRUE THEN
        SELECT total_orders INTO v_customer_order_count
        FROM customers
        WHERE id = p_customer_id;
        
        IF v_customer_order_count > 0 THEN
            RETURN QUERY SELECT FALSE, 'Offer available for new customers only'::TEXT;
            RETURN;
        END IF;
    END IF;
    
    -- All checks passed
    RETURN QUERY SELECT TRUE, 'Offer is available'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(
    p_coupon_code VARCHAR(50),
    p_customer_id INTEGER,
    p_cart_total NUMERIC(10, 2)
) RETURNS TABLE(
    is_valid BOOLEAN,
    discount_amount NUMERIC(10, 2),
    message TEXT
) AS $$
DECLARE
    v_coupon RECORD;
    v_customer_usage INTEGER;
    v_calculated_discount NUMERIC(10, 2);
BEGIN
    -- Get coupon details
    SELECT * INTO v_coupon
    FROM coupons
    WHERE coupon_code = p_coupon_code;
    
    -- Check if coupon exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0::NUMERIC(10,2), 'Invalid coupon code'::TEXT;
        RETURN;
    END IF;
    
    -- Check if active
    IF v_coupon.is_active = FALSE THEN
        RETURN QUERY SELECT FALSE, 0::NUMERIC(10,2), 'Coupon is not active'::TEXT;
        RETURN;
    END IF;
    
    -- Check date range
    IF NOW() < v_coupon.start_date OR NOW() > v_coupon.end_date THEN
        RETURN QUERY SELECT FALSE, 0::NUMERIC(10,2), 'Coupon is expired or not yet valid'::TEXT;
        RETURN;
    END IF;
    
    -- Check minimum purchase
    IF p_cart_total < v_coupon.min_purchase_amount THEN
        RETURN QUERY SELECT FALSE, 0::NUMERIC(10,2), 
            'Minimum purchase of ' || v_coupon.min_purchase_amount || ' SAR required';
        RETURN;
    END IF;
    
    -- Check usage limit
    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.current_usage >= v_coupon.usage_limit THEN
        RETURN QUERY SELECT FALSE, 0::NUMERIC(10,2), 'Coupon usage limit reached'::TEXT;
        RETURN;
    END IF;
    
    -- Check customer usage limit
    SELECT COUNT(*) INTO v_customer_usage
    FROM coupon_usage
    WHERE coupon_id = v_coupon.id AND customer_id = p_customer_id;
    
    IF v_customer_usage >= v_coupon.usage_limit_per_customer THEN
        RETURN QUERY SELECT FALSE, 0::NUMERIC(10,2), 'You have already used this coupon'::TEXT;
        RETURN;
    END IF;
    
    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_calculated_discount := (p_cart_total * v_coupon.discount_value / 100);
    ELSE
        v_calculated_discount := v_coupon.discount_value;
    END IF;
    
    -- Apply max discount cap
    IF v_coupon.max_discount_amount IS NOT NULL 
       AND v_calculated_discount > v_coupon.max_discount_amount THEN
        v_calculated_discount := v_coupon.max_discount_amount;
    END IF;
    
    -- Make sure discount doesn't exceed cart total
    IF v_calculated_discount > p_cart_total THEN
        v_calculated_discount := p_cart_total;
    END IF;
    
    RETURN QUERY SELECT TRUE, v_calculated_discount,
        'Coupon applied! You save ' || v_calculated_discount || ' SAR';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE TRIGGERS
-- ============================================

-- Trigger function to update offer sold count
CREATE OR REPLACE FUNCTION trg_update_offer_sold_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.offer_id IS NOT NULL THEN
        UPDATE offers 
        SET sold_count = sold_count + NEW.quantity
        WHERE id = NEW.offer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_order_item_insert
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION trg_update_offer_sold_count();

-- Trigger function to update coupon usage
CREATE OR REPLACE FUNCTION trg_update_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE coupons 
    SET current_usage = current_usage + 1,
        total_revenue = total_revenue + NEW.order_total,
        total_discount_given = total_discount_given + NEW.discount_applied
    WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_coupon_usage_insert
AFTER INSERT ON coupon_usage
FOR EACH ROW
EXECUTE FUNCTION trg_update_coupon_usage();

-- Trigger function to update customer stats
CREATE OR REPLACE FUNCTION trg_update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_status = 'completed' AND OLD.order_status != 'completed' THEN
        UPDATE customers 
        SET total_orders = total_orders + 1,
            total_spent = total_spent + NEW.total_amount,
            last_order_date = NEW.ordered_at::DATE,
            first_order_date = COALESCE(first_order_date, NEW.ordered_at::DATE)
        WHERE id = NEW.customer_id;
        
        -- Update campaign stats
        IF NEW.campaign_id IS NOT NULL THEN
            UPDATE campaigns 
            SET total_revenue = total_revenue + NEW.total_amount,
                total_orders = total_orders + 1
            WHERE id = NEW.campaign_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_order_complete
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trg_update_customer_stats();

-- Trigger function to track price changes
CREATE OR REPLACE FUNCTION trg_track_price_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.original_price != NEW.original_price 
       OR OLD.sale_price != NEW.sale_price 
       OR OLD.discount_value != NEW.discount_value THEN
        
        INSERT INTO offer_price_history (
            offer_id,
            old_original_price, old_sale_price, old_discount_value,
            new_original_price, new_sale_price, new_discount_value,
            change_reason
        ) VALUES (
            NEW.id,
            OLD.original_price, OLD.sale_price, OLD.discount_value,
            NEW.original_price, NEW.sale_price, NEW.discount_value,
            'Price updated'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_offer_price_update
BEFORE UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION trg_track_price_changes();

-- Trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offer_restrictions_updated_at BEFORE UPDATE ON offer_restrictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGES
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ COMPREHENSIVE OFFERS SYSTEM CREATED SUCCESSFULLY (PostgreSQL)!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 DATABASE STATISTICS:';
    RAISE NOTICE '  🗂️  Tables Created: 13';
    RAISE NOTICE '  📦 Offer Types: % types', (SELECT COUNT(*) FROM offer_types);
    RAISE NOTICE '  📁 Service Categories: % categories', (SELECT COUNT(*) FROM service_categories);
    RAISE NOTICE '  🛠️  Services: % services', (SELECT COUNT(*) FROM services);
    RAISE NOTICE '  🎯 Campaigns: % campaigns', (SELECT COUNT(*) FROM campaigns);
    RAISE NOTICE '  🎁 Offers: % offers', (SELECT COUNT(*) FROM offers);
    RAISE NOTICE '  ✨ Offer Items: % items', (SELECT COUNT(*) FROM offer_items);
    RAISE NOTICE '  🎟️  Coupons: % coupons', (SELECT COUNT(*) FROM coupons);
    RAISE NOTICE '';
    RAISE NOTICE '✅ 3 Views Created for Analytics';
    RAISE NOTICE '✅ 2 Functions Created (check_offer_availability, validate_coupon)';
    RAISE NOTICE '✅ 8 Triggers Created for Auto-Updates';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 BLACK FRIDAY 2025 CAMPAIGN DATA LOADED!';
    RAISE NOTICE '🚀 SYSTEM IS 100%% REUSABLE FOR FUTURE CAMPAIGNS!';
END $$;

-- ============================================
-- END OF SQL FILE
-- ============================================
