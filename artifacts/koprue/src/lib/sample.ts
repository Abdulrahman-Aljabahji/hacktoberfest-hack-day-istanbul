import type { ActionPlan } from '@workspace/api-client-react';

export type Lang = 'en' | 'tr' | 'ar';

export const SAMPLE_NOTICE = {
  title: 'ÜCRETSİZ YAZILIM ATÖLYESİ',
  lines: [
    "Kayıt için 28 Ekim saat 15.00'e kadar formu doldurunuz.",
    "Atölye 29 Ekim saat 14.00'te B Blok Zemin Kat Salon 2'de yapılacaktır.",
    'Kimliğinizi ve dizüstü bilgisayarınızı getirmeyi unutmayınız.',
  ],
};

const S1 = "Kayıt için 28 Ekim saat 15.00'e kadar formu doldurunuz.";
const S2 = 'Kimliğinizi ve dizüstü bilgisayarınızı getirmeyi unutmayınız.';
const S3 = "Atölye 29 Ekim saat 14.00'te B Blok Zemin Kat Salon 2'de yapılacaktır.";
const F1 = "28 Ekim saat 15.00'e kadar";
const F2 = "29 Ekim saat 14.00'te";
const F3 = "B Blok Zemin Kat Salon 2'de";
const PH = 'Merhaba, yazılım atölyesine kayıt olmak istiyorum.';

export const SAMPLE: Record<Lang, ActionPlan> = {
  en: {
    sourceLang: 'tr-TR',
    headline: 'Your next creative adventure starts here.',
    summary: 'This fictional Turkish notice invites you to a free coding workshop. There is a registration deadline, a time and place, and two things to bring.',
    facts: [
      { label: 'Register by', value: 'Oct 28 · 3:00 PM', source: F1 },
      { label: 'Workshop', value: 'Oct 29 · 2:00 PM', source: F2 },
      { label: 'Location', value: 'Block B · Ground floor · Room 2', source: F3 },
    ],
    steps: [
      { title: 'Fill out the registration form', detail: 'Register before October 28 at 3 PM. The sample notice does not contain a form link.', source: S1 },
      { title: 'Bring your ID and laptop', detail: 'Have both ready before leaving.', source: S2 },
      { title: 'Go to the workshop', detail: 'Arrive October 29 at 2 PM, Block B, ground floor, Room 2.', source: S3 },
    ],
    phrase: { native: PH, meaning: 'Hello, I would like to register for the coding workshop.' },
    caution: 'Demo content only. This is an illustrative notice, not a real workshop.',
  },
  ar: {
    sourceLang: 'tr-TR',
    headline: 'خطوتك التالية نحو الإبداع تبدأ هنا.',
    summary: 'هذا الإعلان التركي الافتراضي يدعوك إلى ورشة برمجة مجانية. توجد مهلة للتسجيل وموعد ومكان محددان وأشياء يجب إحضارها.',
    facts: [
      { label: 'آخر موعد للتسجيل', value: '28 أكتوبر · 3:00 مساءً', source: F1 },
      { label: 'موعد الورشة', value: '29 أكتوبر · 2:00 ظهرًا', source: F2 },
      { label: 'المكان', value: 'المبنى B · الطابق الأرضي · القاعة 2', source: F3 },
    ],
    steps: [
      { title: 'املأ استمارة التسجيل', detail: 'سجّل قبل 28 أكتوبر الساعة 3 مساءً. لا يحتوي الإعلان التجريبي على رابط للاستمارة.', source: S1 },
      { title: 'أحضر هويتك وحاسوبك المحمول', detail: 'تأكد من وجودهما معك قبل المغادرة.', source: S2 },
      { title: 'اذهب إلى الورشة', detail: 'الموعد 29 أكتوبر الساعة 2 ظهرًا، المبنى B، الطابق الأرضي، القاعة 2.', source: S3 },
    ],
    phrase: { native: PH, meaning: 'مرحبًا، أريد التسجيل في ورشة البرمجة.' },
    caution: 'محتوى توضيحي فقط. هذا الإعلان افتراضي ولا يشير إلى ورشة حقيقية.',
  },
  tr: {
    sourceLang: 'tr-TR',
    headline: 'Yeni bir şey üretmeye hazır mısın?',
    summary: 'Bu örnek duyuru ücretsiz bir yazılım atölyesini anlatıyor. Kayıt son tarihi, etkinlik yeri ve getirmen gereken eşyalar aşağıda.',
    facts: [
      { label: 'Son kayıt', value: '28 Ekim · 15.00', source: F1 },
      { label: 'Atölye', value: '29 Ekim · 14.00', source: F2 },
      { label: 'Yer', value: 'B Blok · Zemin Kat · Salon 2', source: F3 },
    ],
    steps: [
      { title: 'Kayıt formunu doldur', detail: '28 Ekim saat 15.00’ten önce kayıt ol. Örnek duyuruda form bağlantısı yok.', source: S1 },
      { title: 'Kimliğini ve bilgisayarını hazırla', detail: 'Çıkmadan önce ikisini de yanına al.', source: S2 },
      { title: 'Atölyeye git', detail: '29 Ekim saat 14.00’te B Blok, zemin kat, Salon 2’de ol.', source: S3 },
    ],
    phrase: { native: PH, meaning: 'Atölye görevlisine söyleyebileceğin yararlı bir cümle.' },
    caution: 'Yalnızca tanıtım amaçlı örnek duyurudur; gerçek bir etkinlik değildir.',
  },
};

export const T: Record<Lang, Record<string, string>> = {
  en: { facts: 'Key facts', steps: 'Your next steps', evidence: 'Show original wording', hide: 'Hide original wording', say: 'Say it aloud', speak: 'Speak phrase', copy: 'Copy phrase', plan: 'Copy action plan', verify: 'Quotes may be inaccurate. Verify the original notice before acting.', caution: 'Caution', none: 'No reliable steps were found. Try a clearer photo or paste the text.', original: 'Original' },
  tr: { facts: 'Önemli bilgiler', steps: 'Sıradaki adımlar', evidence: 'Orijinal ifadeyi göster', hide: 'Orijinal ifadeyi gizle', say: 'Yüksek sesle söyle', speak: 'Cümleyi seslendir', copy: 'Cümleyi kopyala', plan: 'Eylem planını kopyala', verify: 'Alıntılar hatalı olabilir. İşlem yapmadan önce orijinal duyuruyu doğrulayın.', caution: 'Dikkat', none: 'Güvenilir adım bulunamadı. Daha net bir fotoğraf deneyin veya metni yapıştırın.', original: 'Orijinal' },
  ar: { facts: 'معلومات أساسية', steps: 'خطواتك التالية', evidence: 'اعرض النص الأصلي', hide: 'أخفِ النص الأصلي', say: 'قلها بصوت عالٍ', speak: 'انطق العبارة', copy: 'انسخ العبارة', plan: 'انسخ خطة العمل', verify: 'قد تكون الاقتباسات غير دقيقة. تحقق من الإعلان الأصلي قبل التصرف.', caution: 'تنبيه', none: 'لم يتم العثور على خطوات موثوقة. جرّب صورة أوضح أو الصق النص.', original: 'الأصل' },
};
