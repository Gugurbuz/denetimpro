/*
  # Test Kullanıcısı Oluşturma

  ## Açıklama
  Hızlı test girişi için demo kullanıcı hesabı oluşturur.

  ## Detaylar
  - Email: test@denetimpro.com
  - Password: test123456
  - Ad: Test Kullanıcı
  - Subscription: Free tier
  - Demo audit kaydı ile birlikte

  ## Not
  Bu kullanıcı sadece test/demo amaçlıdır.
*/

-- Test kullanıcısı için profil oluştur (eğer yoksa)
-- Not: Gerçek auth kullanıcı kaydı Supabase Auth üzerinden yapılacak
-- Bu sadece profil için hazırlık

-- Test için örnek audit verisi ekle (kullanıcı oluşturulduğunda)
-- Bu migration, test kullanıcısı ilk kez giriş yaptığında profil oluşturulacağından
-- sadece varsayılan ayarları hazırlar

-- Test kullanıcısı için demo veriler hazırlama fonksiyonu
CREATE OR REPLACE FUNCTION create_demo_audit_for_user(user_id uuid)
RETURNS void AS $$
BEGIN
  -- Demo audit oluştur
  INSERT INTO audits (user_id, name, period, status, data_loaded)
  VALUES (
    user_id,
    'ABC Teknoloji A.Ş. (Demo)',
    'Ocak 2024',
    'active',
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Yorum: Test kullanıcısı Supabase Auth üzerinden kayıt olacak
-- İlk giriş yaptığında profil otomatik oluşturulacak