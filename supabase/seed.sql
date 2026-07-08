-- ============================================================================
-- Al-Tomoh — optional seed data (Arabic-first)
--
-- Seeds ONLY store configuration and copy: categories, store settings, and
-- testimonials. It deliberately seeds NO books — every book must be created
-- through the hidden host console so the catalogue is always the single
-- source of truth in Supabase.
-- ============================================================================

-- Categories -----------------------------------------------------------------
insert into public.categories (name, slug, description, sort_order) values
  ('الأدب', 'literature', 'روايات وقصص وشعر وروائع الأدب العالمي والعربي.', 1),
  ('التاريخ', 'history', 'من العالم القديم إلى يومنا هذا.', 2),
  ('العلوم', 'science', 'العلوم الميسّرة والطبيعة وأسرار الكون.', 3),
  ('الفلسفة', 'philosophy', 'الأفكار والأخلاق والحياة المتأملة.', 4),
  ('الدين', 'religion', 'الإيمان والنصوص والفكر الروحي.', 5),
  ('كتب الأطفال', 'childrens-books', 'كتب مصورة وقصص لصغار القراء.', 6),
  ('الأعمال', 'business', 'الاقتصاد والقيادة وريادة الأعمال.', 7),
  ('التقنية', 'technology', 'الحاسوب والهندسة والعصر الرقمي.', 8)
on conflict (slug) do nothing;

-- Store settings -------------------------------------------------------------
insert into public.store_settings (key, value) values
  ('currency', '{"try_per_usd": 34}'::jsonb),
  ('shipping', '{"domestic_flat_try": 80, "international_flat_usd": 18, "free_shipping_threshold_try": 1500}'::jsonb),
  ('tax', '{"vat_percent": 0, "prices_include_tax": true}'::jsonb),
  ('payments', '{"enable_card_payments": true, "enable_bank_transfer": true, "bank_transfer_instructions": "حوّل إجمالي الطلب إلى حسابنا البنكي مع كتابة رقم الطلب في وصف التحويل. يُشحن طلبك فور تأكيد وصول المبلغ."}'::jsonb)
on conflict (key) do nothing;

-- A few testimonials to make the homepage feel alive on first launch.
insert into public.testimonials (name, role, message, sort_order) values
  ('إلِف ك.', 'قارئة من إسطنبول', 'كان التغليف جميلًا ووصل الكتاب بحالة ممتازة. أصبحت الطموح مكتبتي الوحيدة.', 1),
  ('محمود ر.', 'قارئ من أنقرة', 'مكان هادئ فعلًا لشراء الكتب عبر الإنترنت. الاختيارات مدروسة والخدمة دافئة.', 2),
  ('سارة ل.', 'عميلة من خارج تركيا', 'طلبت من الخارج وكان كل شيء — من الدفع حتى التسليم — سلسًا وواضحًا.', 3)
on conflict do nothing;

-- ============================================================================
-- After seeding, promote your own account to admin:
--   1. Register normally through the website (/login → إنشاء حساب).
--   2. Run, replacing the email:
--        update public.profiles p
--        set role = 'admin'
--        from auth.users u
--        where u.id = p.id and u.email = 'you@example.com';
--   3. Sign out and back in. The hidden console lives at /host-console.
-- ============================================================================
