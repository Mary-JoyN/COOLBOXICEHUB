-- =============================================================================
-- CoolerBox Ice Hub - Hostinger MariaDB / MySQL Production Migration
-- =============================================================================
-- SAFE TO IMPORT: Uses CREATE TABLE IF NOT EXISTS and INSERT IGNORE INTO.
-- Does NOT drop existing tables, does NOT include customer PII, and does NOT
-- seed any default administrator password.
--
-- First-time Admin Setup: After importing this file and deploying public_html/,
-- visit https://coolerboxicehub.com/admin to create your administrator account.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- -----------------------------------------------------------------------------
-- SECTION 1: SCHEMA CREATION
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reference` VARCHAR(64) NOT NULL,
  `status` VARCHAR(64) NOT NULL DEFAULT 'Received',
  `total_cents` INT NOT NULL DEFAULT 0,
  `customer_json` LONGTEXT NOT NULL,
  `details_json` LONGTEXT NOT NULL,
  `items_json` LONGTEXT NOT NULL,
  `created_at` VARCHAR(64) NOT NULL,
  `updated_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_orders_reference` (`reference`),
  KEY `idx_orders_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `updates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_reference` VARCHAR(64) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` VARCHAR(64) NOT NULL,
  `read_at` VARCHAR(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_updates_order_ref` (`order_reference`),
  CONSTRAINT `fk_updates_order` FOREIGN KEY (`order_reference`) REFERENCES `orders` (`reference`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(128) NOT NULL,
  `rating` INT NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `comment` TEXT NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `anonymous` TINYINT(1) NOT NULL DEFAULT 0,
  `reference` VARCHAR(64) DEFAULT NULL,
  `permission` TINYINT(1) NOT NULL DEFAULT 1,
  `status` VARCHAR(64) NOT NULL DEFAULT 'published',
  `created_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `posts` (
  `id` VARCHAR(128) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `body` TEXT NOT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `link` VARCHAR(512) DEFAULT NULL,
  `image` VARCHAR(512) DEFAULT NULL,
  `event_date` VARCHAR(64) DEFAULT NULL,
  `status` VARCHAR(64) NOT NULL DEFAULT 'published',
  `created_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `catalogue` (
  `id` VARCHAR(128) NOT NULL,
  `data_json` LONGTEXT NOT NULL,
  `updated_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `services` (
  `id` VARCHAR(128) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(128) NOT NULL DEFAULT 'Business & Events',
  `price_label` VARCHAR(128) NOT NULL DEFAULT 'Custom Quote',
  `summary` TEXT,
  `details_json` LONGTEXT,
  `image_url` VARCHAR(512) DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `updated_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(128) NOT NULL,
  `value_json` LONGTEXT NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `faqs` (
  `id` VARCHAR(128) NOT NULL,
  `category` VARCHAR(128) NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `keywords` TEXT,
  `source` VARCHAR(128) DEFAULT 'curated',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reference` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `email_sent` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_contact_reference` (`reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(128) NOT NULL DEFAULT 'Administrator',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` VARCHAR(64) NOT NULL,
  `last_login_at` VARCHAR(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- SECTION 2: ESSENTIAL NON-PII SEED DATA (Catalogue, Services, Settings, FAQs, News)
-- -----------------------------------------------------------------------------

-- Seed data for `catalogue` (11 rows)
INSERT IGNORE INTO `catalogue` (`id`, `data_json`, `updated_at`) VALUES ('ice', '{\"id\": \"ice\", \"name\": \"2 kg Ice Cubes\", \"description\": \"Regular or gourmet ice cubes, packaged in the same 2 kg bags for households, shops, service stations, bars and events.\", \"unit\": \"bag\", \"size\": 2, \"sizeUnit\": \"kg\", \"retailPrice\": 15, \"bulkPrice\": 12, \"bulkMinimum\": 20, \"availability\": \"available\", \"leadDays\": 1, \"image\": \"\", \"samplePrice\": true, \"salesRevision\": 0, \"minOrder\": 1, \"orderMultiple\": 1, \"maxPerOrder\": null, \"dailyCapacity\": null, \"gourmetRetailPrice\": 18, \"gourmetBulkPrice\": 14}', '2026-10-29T15:31:41.777425+00:00');
INSERT IGNORE INTO `catalogue` (`id`, `data_json`, `updated_at`) VALUES ('ice3', '{\"id\": \"ice3\", \"name\": \"3 kg Ice Cubes\", \"description\": \"Regular or gourmet ice cubes, packaged in the same 3 kg bags for retail customers, events and cooling.\", \"unit\": \"bag\", \"size\": 3, \"sizeUnit\": \"kg\", \"retailPrice\": null, \"bulkPrice\": null, \"bulkMinimum\": 50, \"availability\": \"advance-booking\", \"leadDays\": 1, \"image\": \"\", \"samplePrice\": true, \"salesRevision\": 0, \"minOrder\": 1, \"orderMultiple\": 1, \"maxPerOrder\": null, \"dailyCapacity\": null, \"gourmetRetailPrice\": 26, \"gourmetBulkPrice\": 22}', '2026-10-29T15:31:41.777425+00:00');
INSERT IGNORE INTO `catalogue` (`id`, `data_json`, `updated_at`) VALUES ('ice5', '{\"id\": \"ice5\", \"name\": \"5 kg Ice Cubes\", \"description\": \"Regular or gourmet ice cubes, packaged in the same 5 kg bags for events, businesses and hospitality.\", \"unit\": \"bag\", \"size\": 5, \"sizeUnit\": \"kg\", \"retailPrice\": null, \"bulkPrice\": null, \"bulkMinimum\": 50, \"availability\": \"advance-booking\", \"leadDays\": 1, \"image\": \"\", \"samplePrice\": true, \"salesRevision\": 0, \"minOrder\": 1, \"orderMultiple\": 1, \"maxPerOrder\": null, \"dailyCapacity\": null, \"gourmetRetailPrice\": 42, \"gourmetBulkPrice\": 35}', '2026-10-29T15:31:41.777425+00:00');
INSERT IGNORE INTO `catalogue` (`id`, `data_json`, `updated_at`) VALUES ('blocks', '{\"id\": \"blocks\", \"name\": \"Ice blocks\", \"description\": \"Large commercial 30 kg ice blocks for funerals, events, fishing, vendors, businesses and bulk cooling requirements.\", \"unit\": \"block\", \"size\": 30, \"sizeUnit\": \"kg\", \"retailPrice\": 45, \"bulkPrice\": 40, \"bulkMinimum\": 10, \"availability\": \"advance-booking\", \"leadDays\": 3, \"image\": \"/assets/blocks-product.jpg\", \"samplePrice\": true, \"salesRevision\": 0, \"minOrder\": 1, \"orderMultiple\": 1, \"maxPerOrder\": null, \"dailyCapacity\": null}', '2026-10-29T15:31:41.777425+00:00');
INSERT IGNORE INTO `catalogue` (`id`, `data_json`, `updated_at`) VALUES ('cups', '{\"id\": \"cups\", \"name\": \"300 ml Ice Cups\", \"description\": \"Ready-to-use 300 ml cups filled with ice. N$10 per cup.\", \"unit\": \"cup\", \"size\": 300, \"sizeUnit\": \"ml\", \"retailPrice\": 10, \"bulkPrice\": null, \"bulkMinimum\": 50, \"availability\": \"advance-booking\", \"leadDays\": 1, \"image\": \"\", \"samplePrice\": false, \"salesRevision\": 1, \"minOrder\": 1, \"orderMultiple\": 1, \"maxPerOrder\": null, \"dailyCapacity\": null}', '2026-10-29T15:31:41.777425+00:00');
INSERT IGNORE INTO `catalogue` (`id`, `data_json`, `updated_at`) VALUES ('cups500', '{\"id\": \"cups500\", \"name\": \"500 ml Ice Cups\", \"description\": \"Ready-to-use 500 ml cups filled with ice. N$12 per cup.\", \"unit\": \"cup\", \"size\": 500, \"sizeUnit\": \"ml\", \"retailPrice\": 12, \"bulkPrice\": null, \"bulkMinimum\": 50, \"availability\": \"advance-booking\", \"leadDays\": 1, \"image\": \"\", \"samplePrice\": false, \"salesRevision\": 1, \"minOrder\": 1, \"orderMultiple\": 1, \"maxPerOrder\": null, \"dailyCapacity\": null}', '2026-10-29T15:31:41.777425+00:00');
INSERT IGNORE INTO `catalogue` (`id`, `data_json`, `updated_at`) VALUES ('water', '{\"id\": \"water\", \"name\": \"500 ml Bottled Water\", \"description\": \"Purified 500 ml water, supplied only in packs of 10. N$12 per bottle / N$120 per pack. Minimum five packs (50 bottles) per order. Personalised printing is N$4 extra per bottle.\", \"unit\": \"bottle\", \"size\": 500, \"sizeUnit\": \"ml\", \"retailPrice\": 12, \"bulkPrice\": null, \"bulkMinimum\": 48, \"availability\": \"available\", \"leadDays\": 1, \"image\": \"\", \"samplePrice\": false, \"salesRevision\": 1, \"minOrder\": 50, \"orderMultiple\": 10, \"maxPerOrder\": null, \"dailyCapacity\": null}', '2026-10-29T15:31:41.777425+00:00');
INSERT IGNORE INTO `catalogue` (`id`, `data_json`, `updated_at`) VALUES ('water330', '{\"id\": \"water330\", \"name\": \"330 ml Bottled Water\", \"description\": \"Purified 330 ml water, supplied only in packs of 10. N$9 per bottle / N$90 per pack. Minimum five packs (50 bottles) per order. Personalised printing is N$4 extra per bottle.\", \"unit\": \"bottle\", \"size\": 330, \"sizeUnit\": \"ml\", \"retailPrice\": 9, \"bulkPrice\": null, \"bulkMinimum\": 48, \"availability\": \"advance-booking\", \"leadDays\": 1, \"image\": \"\", \"samplePrice\": false, \"salesRevision\": 1, \"minOrder\": 50, \"orderMultiple\": 10, \"maxPerOrder\": null, \"dailyCapacity\": null}', '2026-10-29T15:31:41.777425+00:00');
INSERT IGNORE INTO `catalogue` (`id`, `data_json`, `updated_at`) VALUES ('refill', '{\"id\": \"refill\", \"name\": \"Water refills\", \"description\": \"Refill your clean, suitable drinking-water containers.\", \"unit\": \"container\", \"size\": 25, \"sizeUnit\": \"litres\", \"retailPrice\": 25, \"bulkPrice\": 20, \"bulkMinimum\": 4, \"availability\": \"available\", \"leadDays\": 0, \"image\": \"\", \"samplePrice\": true, \"salesRevision\": 0, \"minOrder\": 1, \"orderMultiple\": 1, \"maxPerOrder\": null, \"dailyCapacity\": null}', '2026-10-29T15:31:41.777425+00:00');

-- Seed data for `settings` (2 rows)
INSERT IGNORE INTO `settings` (`key`, `value_json`) VALUES ('settings', '{\"email\": \"info@coolerboxicehub.com\", \"whatsapp\": \"264852485426\", \"socials\": {\"facebook\": \"https://facebook.com/coolerboxicehub\", \"instagram\": \"https://instagram.com/coolerboxicehub\", \"tiktok\": \"\", \"linkedin\": \"\", \"youtube\": \"\"}, \"phone\": \"+264 85 248 5426\"}');
INSERT IGNORE INTO `settings` (`key`, `value_json`) VALUES ('business', '{\"about\": \"The CoolerBox Ice Hub is a Namibian ice and purified drinking-water business focused on making cold products readily available where and when customers need them. We serve individuals, retailers, service stations, events, funeral undertakers, hospitality businesses and commercial customers through direct sales, deliveries and long-term supply partnerships. Consistent supply, product quality and dependable distribution guide our approach.\", \"location\": \"Makalani Mall, Ongwediva, Namibia\", \"hours\": \"Monday\\u2013Saturday: 08:30\\u201320:00. Sunday: 10:00\\u201318:00.\", \"collection\": \"Collect at Makalani Mall, Ongwediva, during trading hours. Monday\\u2013Thursday 09:00\\u201319:00; Friday\\u2013Saturday 09:00\\u201320:00; Sunday 10:00\\u201318:00. Orders and collection times require confirmation.\", \"deliveryAreas\": \"Free delivery within 25 km of Makalani Mall, Ongwediva, requires at least three different catalogue products, each meeting its minimum order. Regular and gourmet of the same bag size count as one product. Thursday delivery only: 08:00\\u201310:00 or 16:00\\u201317:00. Address and distance are confirmed by the team. Other delivery charges require a quote.\", \"deliveryFee\": null, \"quality\": \"Purified water treated through multi-stage filtration and UV sterilization. Ice manufactured from food-grade purified water under strict hygienic standards.\", \"logo\": \"/assets/logo-primary.jpeg\", \"shopImage\": \"\", \"salesRevision\": 2, \"bookingMinHours\": 48, \"bookingMaxHours\": 72, \"deliveryDay\": 4, \"deliveryWindows\": [{\"start\": \"08:00\", \"end\": \"10:00\"}, {\"start\": \"16:00\", \"end\": \"17:00\"}], \"freeDeliveryProducts\": 3, \"deliveryRadiusKm\": 25, \"taxNote\": \"No VAT is added to the displayed prices.\", \"refundTerms\": \"Payments are non-refundable.\", \"bookingTerms\": \"Place orders strictly 48\\u201372 hours before scheduled collection or delivery. Delivery is Thursday only, 08:00\\u201310:00 or 16:00\\u201317:00, Windhoek time.\", \"paymentTerms\": \"Approved contract customers pay on delivery under their agreed terms. New and ordinary customers pay before delivery. Payment and order confirmation are arranged with the team on WhatsApp.\", \"cancellationTerms\": \"Cancel at least six hours before scheduled collection or delivery via WhatsApp, quoting your reference. Payments are non-refundable.\", \"labelTerms\": \"Personalised-label minimum: 50 bottles. Printing: N$4 extra per bottle. Turnaround: 48\\u201372 hours after final artwork approval and order confirmation.\", \"weeklyHours\": {\"0\": {\"start\": \"10:00\", \"end\": \"18:00\"}, \"1\": {\"start\": \"09:00\", \"end\": \"19:00\"}, \"2\": {\"start\": \"09:00\", \"end\": \"19:00\"}, \"3\": {\"start\": \"09:00\", \"end\": \"19:00\"}, \"4\": {\"start\": \"09:00\", \"end\": \"19:00\"}, \"5\": {\"start\": \"09:00\", \"end\": \"20:00\"}, \"6\": {\"start\": \"09:00\", \"end\": \"20:00\"}}, \"cutoffTime\": \"\", \"collectionStart\": \"09:00\", \"collectionEnd\": \"19:00\"}');

-- Seed data for `faqs` (40 rows)
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('refund-policy', 'Ordering & collection', 'Are payments refundable?', 'Cancellations requested before production or dispatch are reviewed fairly on a case-by-case basis. Custom-branded orders cannot be cancelled once artwork proof is approved and printing has started. Please contact our team with your reference.', 'refund,refunds,non refundable,no refunds', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('tax-policy', 'Prices & special offers', 'Is VAT added to the price?', 'No VAT is added to the displayed prices.', 'vat,tax,inclusive,exclusive', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('payment-policy', 'Ordering & collection', 'When do I pay?', 'Approved contract customers pay on delivery under their agreed terms. New and ordinary customers pay before delivery. Confirm the payment arrangement with the team on WhatsApp.', 'payment,pay,deposit,contract,cash on delivery', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('cancel-policy', 'Ordering & collection', 'When can I cancel?', 'Cancellations requested before production or dispatch are reviewed fairly on a case-by-case basis. Custom-branded orders cannot be cancelled once artwork proof is approved and printing has started. Please contact our team with your reference.', 'cancel,cancellation,refund,six hours,6 hours', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('water-330', 'Bottled water', 'Do you supply 330 ml bottled water?', '330 ml bottled water costs N$9 per bottle, supplied only in packs of 10 at N$90 per pack. Minimum five packs (50 bottles) per size. 500 ml water costs N$12 per bottle / N$120 per pack, also minimum five packs. Both sizes can be included in one order.', '330 ml,330ml,small bottle,small bottles,bottle sizes,water sizes', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('ice-types', 'Products & quantities', 'Can I choose regular or gourmet ice cubes?', 'Yes. Gourmet is an ice-cube type, not a separately packaged product. Select regular, gourmet or both within the 2 kg, 3 kg or 5 kg ice-cube bag options in the gathering planner or order form. Both types use the same bag sizes and have independent quantity fields. For example, one enquiry can include 30 regular 3 kg bags and 30 gourmet 3 kg bags. Gourmet pricing requires a quotation unless a price is published for the selected size. Supplier minimums apply to the selected bag size and type.', 'gourmet,regular,ice type,ice types,packaging,bag sizes', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('full-range', 'Products & quantities', 'What is your full product range?', 'Our range is 30 kg ice blocks; regular and gourmet ice cubes in 2 kg, 3 kg and 5 kg bags; 300 ml and 500 ml ice cups; 330 ml and 500 ml bottled water; and refill water. Bottled water is sold in packs of 10, minimum 50 bottles per size.\n\n2 kg Ice Cubes: 2 kg per bag\n3 kg Ice Cubes: 3 kg per bag\n5 kg Ice Cubes: 5 kg per bag\nIce blocks: 30 kg per block\n300 ml Ice Cups: 300 ml per cup\n500 ml Ice Cups: 500 ml per cup\n500 ml Bottled Water: 500 ml per bottle\n330 ml Bottled Water: 330 ml per bottle\nWater refills: 25 litres per container', 'full range,3 kg,5 kg,gourmet ice', 'products');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('supply-services', 'Business supply', 'Which supply and partnership services do you provide?', 'Request ice and water delivery, retail supply, recurring business supply, freezer/vendor partnerships, funeral packages, wedding and event supply, corporate and public event supply, or bulk orders. Delivery is for qualifying customers and requires confirmation. Selected partners may become distribution points under agreed terms. Cold storage, technical/water services and equipment trading in our company profile are planned; ask the team about availability. See Products & services for the complete descriptions.', 'services,delivery distribution,funeral package,event package,freezer,vendor partnership,retail supply,technical services,cold storage', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('local-suppliers', 'Business supply', 'How do I apply to become a local supplier?', 'Choose Become a Local Supplier, or turn on the supplier option in Order Now. Select your ice products, enter quantities, then add your trading name, local area, outlet type and preferred supply schedule. The minimum is 50 units of EACH selected ice product PER DELIVERY: 50 bags of 2 kg ice cubes (100 kg total), 50 bags of each selected 3 kg or 5 kg option, 50 ice blocks or 50 ice cups. Water follows their catalogue terms. Save your application and continue on WhatsApp for approval and final prices. An application does not guarantee approval or reserve stock.', 'local supplier,supplier application,become a supplier,reseller,resell,50 bags,minimum ice,minimum order', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('ice-cups', 'Products & quantities', 'Do you sell ice cups?', 'Our ice cups are 300 ml at N$10 each and 500 ml at N$12 each. Choose either or both in the catalogue and order form. Supplier application minimums still apply.', 'ice cup,ice cups,cups', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('why-water', 'Bottled water', 'Why choose CoolerBox bottled water?', 'Our bottled water is purified and hygienically filled and packed. It provides a convenient, individually packaged water option for everyday use and organised occasions. Bottles are kept in cooled storage at approximately 10°C before collection.', 'why bottled water,why choose,benefits,purified water,purification,purified', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('hygiene', 'Bottled water', 'How is the bottled water packed?', 'Our purified water is filled and packed hygienically. Packaging and handling are intended to keep the bottles clean before collection. Check the closure and label before use, and contact the team about any damaged or leaking bottle.', 'hygiene,hygienic,hygienically,packed,packaging,filled,clean bottles', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('storage', 'Bottled water', 'At what temperature do you store bottled water?', 'Our bottled water is kept in cooled storage at approximately 10°C before collection. After collection, follow the product label and keep bottles away from direct sunlight and heat.', 'temperature,10 degrees,10degress,10°C,storage,stored,room temperature,kept cold', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('occasions', 'Events & personalised supply', 'Which occasions can you supply bottled water for?', 'Our bottled-water supply is designed for designated occasions, including funerals, birthdays, anniversaries, weddings, corporate functions and community gatherings. Tell us the occasion, guest numbers, required date and preferred bottle size so we can discuss a suitable supply arrangement.', 'funeral,funerals,birthday,birthdays,anniversary,anniversaries,wedding,weddings,occasion,occasions,water for events,event water,designated events', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('labels', 'Events & personalised supply', 'Can I request event-specific bottle labels or presentation?', 'Personalised-label minimum is 50 bottles. Printing costs N$4 extra per bottle. Turnaround is 48–72 hours after final artwork approval and order confirmation. Discuss and approve artwork on WhatsApp before production.', 'custom label,custom labels,personalised,personalized,branding,branded bottles,event label,design bottles', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('sizes', 'Products & quantities', 'Which products and pack sizes do you offer?', 'See the current catalogue below. Initial values are sample settings and require confirmation.\n\n2 kg Ice Cubes: 2 kg per bag\n3 kg Ice Cubes: 3 kg per bag\n5 kg Ice Cubes: 5 kg per bag\nIce blocks: 30 kg per block\n300 ml Ice Cups: 300 ml per cup\n500 ml Ice Cups: 500 ml per cup\n500 ml Bottled Water: 500 ml per bottle\n330 ml Bottled Water: 330 ml per bottle\nWater refills: 25 litres per container', 'sizes,pack size,bottle size,what do you sell,products,product range,litres,millilitres', 'products');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('prices', 'Prices & special offers', 'How much do your products cost?', 'Current catalogue prices and bulk thresholds are shown below. Prices marked as demonstration values are for this sample only.\n\n2 kg Ice Cubes: N$15.00 / bag · bulk N$12.00 from 20 units · demonstration price\n3 kg Ice Cubes: quote required · demonstration price\n5 kg Ice Cubes: quote required · demonstration price\nIce blocks: N$45.00 / block · bulk N$40.00 from 10 units · demonstration price\n300 ml Ice Cups: N$10.00 / cup\n500 ml Ice Cups: N$12.00 / cup\n500 ml Bottled Water: N$12.00 / bottle\n330 ml Bottled Water: N$9.00 / bottle\nWater refills: N$25.00 / container · bulk N$20.00 from 4 units · demonstration price', 'price,prices,cost,how much,price list,pricing', 'prices');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('bulk', 'Business supply', 'Do you offer bulk prices?', 'Yes. The catalogue supports a bulk price once a product’s minimum whole-unit quantity is met per delivery. The estimator applies the saved threshold automatically. Use the complete enquiry form for a formal confirmation.', 'bulk price,bulk prices,bulk discount,wholesale,large order,bulk order,discount', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('combos', 'Prices & special offers', 'Do you have combo specials or promotional bundles?', 'Published, unexpired combo offers appear under Special announcements and Promotional bundles. Select the price button to open the enquiry form with that bundle’s products already selected.\n\nNo combo specials are currently published.', 'combo,combos,special,specials,promotion,promotions,bundle,bundles,offer,offers', 'offers');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('friday', 'Prices & special offers', 'What is the suggested Friday offer?', 'Our proposed Friday promotion is a Weekend Cooler Combo: two 2 kg bags of gourmet ice cubes plus 50 × 500 ml bottles of water. This is a proposed offer, not a live special. Its final price and availability will be announced once approved.', 'friday,weekend combo,weekend cooler,friday special', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('quantity', 'Products & quantities', 'How much ice and water should I order?', 'Use our estimator and adjust guest numbers and allowances for your event. Its illustrative starting settings are 0.5 kg of drink ice and 1 litre of water per guest, plus 20% reserve. These are illustrative event-supply assumptions. Quantities round up to whole packs.', 'how many,how much ice,how much water,calculate,calculator,estimator,guests,quantity,quantities', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('order', 'Ordering & collection', 'How do I place an enquiry?', 'Choose products or a combo, complete your customer details and select collection or delivery. Saving creates a sample enquiry reference. Sign in with the same account at Track my enquiry to view status updates. Formal quotations and artwork are handled on WhatsApp. You may then open an email or WhatsApp draft, review it and send it yourself. Saving does not reserve stock or take payment.', 'order,ordering,buy,purchase,enquire,enquiry,place an order', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('contact', 'Ordering & collection', 'How do I contact CoolerBox?', 'Use the contact links in the page footer or the email and WhatsApp draft buttons after creating an enquiry. The sample currently uses temporary contact details which will be replaced when business accounts are ready.', 'contact,phone,number,whatsapp,email,speak to someone,talk to a person', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('lead', 'Ordering & collection', 'How far in advance should I book?', 'Order strictly 48–72 hours before your scheduled collection or delivery time. Earlier and later requests are rejected. Delivery is Thursday only: 08:00–10:00 or 16:00–17:00, Windhoek time.', 'advance,lead time,notice,book ahead,how soon,turnaround', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('availability', 'Products & quantities', 'Are all products always available?', 'Availability is managed in the catalogue. Available, sold-out and advance-booking products are identified below; the team confirms actual stock and production capacity.\n\n2 kg Ice Cubes: available · strictly 48–72 hours advance booking\n3 kg Ice Cubes: advance booking · strictly 48–72 hours advance booking\n5 kg Ice Cubes: advance booking · strictly 48–72 hours advance booking\nIce blocks: advance booking · strictly 48–72 hours advance booking\n300 ml Ice Cups: advance booking · strictly 48–72 hours advance booking\n500 ml Ice Cups: advance booking · strictly 48–72 hours advance booking\n500 ml Bottled Water: available · strictly 48–72 hours advance booking\n330 ml Bottled Water: advance booking · strictly 48–72 hours advance booking\nWater refills: available · strictly 48–72 hours advance booking', 'available,availability,sold out,stock,in stock', 'availability');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('location', 'Ordering & collection', 'Where are you based?', 'Our current location is listed below.\n\nMakalani Mall, Ongwediva, Namibia', 'where,location,address,find you,located', 'location');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('hours', 'Ordering & collection', 'What are your opening hours?', 'Monday–Thursday 09:00–19:00; Friday–Saturday 09:00–20:00; Sunday 10:00–18:00. Visit Makalani Mall, Ongwediva.\n\nMonday–Thursday: 09:00–19:00. Friday–Saturday: 09:00–20:00. Sunday: 10:00–18:00.', 'opening hours,open,closed,sunday,saturday,trading hours', 'hours');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('collection', 'Ordering & collection', 'How does collection work?', 'Please follow these collection instructions and confirm arrangements with the team.\n\nCollect at Makalani Mall, Ongwediva, during trading hours. Monday–Thursday 09:00–19:00; Friday–Saturday 09:00–20:00; Sunday 10:00–18:00. Orders and collection times require confirmation.', 'collection,collect,pickup,pick up', 'collection');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('delivery', 'Ordering & collection', 'Do you deliver, and what does delivery cost?', 'Free delivery within 25 km requires at least three different catalogue products, each meeting its minimum order. Thursday only: 08:00–10:00 or 16:00–17:00. The team verifies the address and distance. Regular and gourmet of one bag size count as one product.\n\nFree delivery within 25 km of Makalani Mall, Ongwediva, requires at least three different catalogue products, each meeting its minimum order. Regular and gourmet of the same bag size count as one product. Thursday delivery (08:00–10:00 or 16:00–17:00) is for bulk contract clients only; all other orders pick up at the agreed time once confirmed. Address and distance are confirmed by the team. Other delivery charges require a quote.\nDelivery charge: to be quoted.', 'delivery,deliver,transport,drop off,delivery charge', 'delivery');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('payment', 'Ordering & collection', 'Which payment methods do you accept?', 'Formal quotations are provided or further discussed on WhatsApp. Payment methods, deposit requirements and deadlines will be confirmed with your quotation. This sample does not accept payments or provide bank details.', 'payment,pay,cash,eft,card,deposit,bank details', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('changes', 'Ordering & collection', 'Can I change or cancel my enquiry?', 'Contact the team with your enquiry reference as soon as possible. Changes depend on production and supply arrangements. Cancellation, refund and deposit terms must be confirmed with your quote; no blanket refund promise is made by this sample.', 'change,cancel,cancellation,refund,return,reschedule', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('quality', 'Water quality', 'Can I see testing or certification information?', 'Request current testing results and certification details from CoolerBox. Published certification details will be added when confirmed.\n\nCurrent testing results and certification documents will be added once available. Request current information from the team.', 'test,testing,certification,certificate,certified,water quality,standards', 'quality');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('shelf-life', 'Bottled water', 'What is the shelf life of your bottled water?', 'Use the batch and best-before information on the actual product label. A shelf-life period has not been confirmed on this sample. Contact the team if you need batch-specific information.', 'shelf life,expiry,expire,best before,expiration,batch', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('refills', 'Products & quantities', 'Can I refill my own water container?', 'Water refills are part of our product range. Bring a clean, suitable drinking-water container and confirm accepted sizes and refill arrangements with the team. The catalogue prices refills per listed container size; the bulk estimator can display the equivalent litre rate.', 'refill,refills,container,own bottle,own container', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('ice', 'Products & quantities', 'What is the difference between ice cubes and ice blocks?', 'Gourmet ice cubes are offered for drinks and refreshments. Ice blocks are for bulk cooling needs. Use the catalogue to check the listed size, availability and booking requirements, then confirm the intended use with the team.', 'ice cubes,ice blocks,gourmet,difference,block ice', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('recurring', 'Business supply', 'Can you supply my shop, gym or business regularly?', 'Yes, you can request regular supply. Select your business category and daily, weekly or monthly supply in the enquiry form. Quantities and estimates are per delivery. Share your schedule and requirements so the team can confirm capacity and terms.', 'regular supply,recurring,weekly supply,daily supply,monthly supply,gym,retailer,restaurant,office,workplace,supplier', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('news', 'Community & updates', 'Where can I read your news and community stories?', 'Visit News & Community for published headlines, community work and event announcements. Stories appear after the owner publishes them.', 'news,community,headlines,charity,outreach,donation', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('upcoming', 'Community & updates', 'What events are coming up?', 'See News & Community for the current event calendar. No event should be assumed confirmed until a published announcement includes its details.', 'upcoming events,next event,event calendar,calendar', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('tracking', 'Ordering & collection', 'How do I track my enquiry and receive updates?', 'Open Track my enquiry and sign in with the same account used to save it. Search your reference or view your enquiries. Saving an enquiry and later status changes create automatic in-app updates. WhatsApp messages are prepared as drafts and sent manually.', 'track,tracking,status,reference,notification,notifications,updates,my order', 'static');
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `keywords`, `source`) VALUES ('quotations', 'Events & personalised supply', 'Where do I receive my formal quotation and artwork proof?', 'Formal quotations, label artwork proofs and further discussion are provided or handled on WhatsApp. Quote your enquiry reference when contacting the team. Agree the final price, availability and any artwork proof before production.', 'formal quotation,formal quote,quotation,quote,artwork proof,artwork,proof,invoice', 'static');

-- Seed data for `posts` (3 rows)
INSERT IGNORE INTO `posts` (`id`, `title`, `category`, `body`, `location`, `link`, `image`, `event_date`, `status`, `created_at`) VALUES ('post-welcome-ongwediva', 'Welcome to The CoolerBox Ice Hub in Ongwediva', 'news', 'The CoolerBox Ice Hub is open at Makalani Mall, Ongwediva! We provide fresh gourmet ice cubes, 30 kg commercial ice blocks, ice cups, and multi-stage purified drinking water and refills. Visit our shop or place your event and retail supply orders through our website.', 'Makalani Mall, Ongwediva', '', '/assets/hero-coolerbox.webp', '', 'published', '2026-10-20T08:00:00Z');
INSERT IGNORE INTO `posts` (`id`, `title`, `category`, `body`, `location`, `link`, `image`, `event_date`, `status`, `created_at`) VALUES ('post-supplier-program', 'Local Supplier & Retailer Partnership Programme', 'community', 'Run a cuca shop, retail outlet, bar or service station in the Oshana region? CoolerBox offers dedicated local supply partnerships with 50-pack wholesale rates, freezer placement options, and dependable Thursday delivery cycles.', 'Ongwediva & Oshakati', '/order?supplier=1', '/assets/ice-product.webp', '', 'published', '2026-10-24T10:00:00Z');
INSERT IGNORE INTO `posts` (`id`, `title`, `category`, `body`, `location`, `link`, `image`, `event_date`, `status`, `created_at`) VALUES ('post-custom-water-events', 'Personalised Bottled Water for Funerals, Weddings & Anniversaries', 'events', 'Make your special occasion memorable with customized 330 ml and 500 ml purified water bottles featuring your loved one\'s photo, family crest, wedding monogram, or corporate branding. Contact us 48–72 hours in advance for artwork and cooled delivery.', 'Makalani Mall Hub', '/order?product=water&occasion=1', '/assets/event-water.webp', '2026-11-15', 'published', '2026-10-27T12:00:00Z');

-- Seed data for `services` (4 rows)
INSERT IGNORE INTO `services` (`id`, `title`, `category`, `price_label`, `summary`, `details_json`, `image_url`, `active`, `sort_order`, `updated_at`) VALUES ('wholesale-ice-supply', 'Wholesale Ice Supply', 'Business & Events', 'Bulk / Scheduled', 'Reliable regular ice supply for retailers, supermarkets, bars, restaurants, lodges and service stations across Ongwediva and surrounding areas.', '[\"Daily or weekly scheduled restocking\",\"2 kg, 5 kg and 30 kg ice block formats\",\"Priority bulk pricing for regular accounts\"]', '/assets/blocks-product.jpg', 1, 1, '2026-11-16T00:00:00Z');
INSERT IGNORE INTO `services` (`id`, `title`, `category`, `price_label`, `summary`, `details_json`, `image_url`, `active`, `sort_order`, `updated_at`) VALUES ('event-ice-and-water', 'Event Ice & Bottled Water', 'Business & Events', 'Custom Quote', 'Bulk bagged ice, 30 kg blocks and chilled bottled water crates tailored for weddings, funerals, conferences, festivals and sports days.', '[\"Pre-chilled bottled water cases\",\"Custom event quantities & delivery scheduling\",\"Dedicated coordination for large gatherings\"]', '/assets/gourmet-reference.jpeg', 1, 2, '2026-11-16T00:00:00Z');
INSERT IGNORE INTO `services` (`id`, `title`, `category`, `price_label`, `summary`, `details_json`, `image_url`, `active`, `sort_order`, `updated_at`) VALUES ('custom-branded-water', 'Custom Branded Bottled Water', 'Personalised Water', 'From N$4.00 / label', 'Personalised 500 ml bottled water with custom-designed labels for corporate branding, weddings, memorials and hospitality venues.', '[\"Upload your own artwork or request design assistance\",\"Minimum order quantities apply for custom runs\",\"Chilled or ambient delivery options\"]', '/assets/water-500ml.png', 1, 3, '2026-11-16T00:00:00Z');
INSERT IGNORE INTO `services` (`id`, `title`, `category`, `price_label`, `summary`, `details_json`, `image_url`, `active`, `sort_order`, `updated_at`) VALUES ('water-refills-bulk', 'Purified Water Refills', 'Refill Station', 'Per Litre', 'Hygienic purified water refills at our Makalani Mall hub for households, offices and bulk container customers.', '[\"Multi-stage filtration & quality checks\",\"Walk-in refills at Makalani Mall, Ongwediva\",\"5 L, 20 L and customer-owned containers\"]', '/assets/water-refill.png', 1, 4, '2026-11-16T00:00:00Z');

SET FOREIGN_KEY_CHECKS = 1;
