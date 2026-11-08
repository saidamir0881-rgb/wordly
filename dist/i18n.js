// Both language packs are local; vocabulary and user answers never leave the device.
let appLanguage='uz';
try{if(localStorage.getItem('wordly-language-v1')==='ru')appLanguage='ru'}catch{}
const meaning=w=>w[appLanguage];
const translationLocale=()=>appLanguage==='ru'?'ru-RU':'uz-UZ';
const checkpointStorageKey=()=>appLanguage==='ru'?'wordly-sessions-ru-v1':'wordly-sessions-v1';
const russianUI={
  'Lesson':'Урок', 'Exercises':'Упражнения', 'Text':'Текст',
  'Keyingi bosqichga o‘ting. Keng lug‘at, aniq ifodalar va murakkab iboralar.':'Переходите на следующий уровень. Богатая лексика, точные выражения и сложные обороты.',
  'Kitob matni va mashqlar':'Текст урока и упражнения', 'Dars matni':'Текст урока', 'Mashqlar matni':'Текст упражнений',
  'Asl inglizcha matn':'Оригинальный английский текст', 'PDF sahifasi':'Страница PDF',
  'Asosiy menyu':'Главное меню', 'Kutubxona':'Библиотека', 'Statistika':'Статистика',
  'HAR KUNI BIR QADAM':'ШАГ ВПЕРЁД КАЖДЫЙ ДЕНЬ', 'Yangi so‘zlar.':'Новые слова.', 'Yangi imkoniyatlar.':'Новые возможности.',
  'Darajangizga mos kitobni tanlang.':'Выберите книгу своего уровня.', 'So‘zlarni o‘rganing va o‘sishingizni kuzating.':'Учите слова и следите за своим прогрессом.',
  'SIZNING KITOBLARINGIZ':'ВАШИ КНИГИ', 'Qaysi kitobdan boshlaymiz?':'С какой книги начнём?', 'Osondan murakkabga':'От простого к сложному',
  'Ingliz tilidagi ilk qadamingiz. Kundalik hayot uchun eng kerakli so‘zlar.':'Ваш первый шаг в английском. Самые нужные слова для повседневной жизни.',
  'So‘z boyligingizni kengaytiring. Ko‘proq mavzu, ibora va yangi imkoniyatlar.':'Расширяйте словарный запас. Больше тем, выражений и новых возможностей.',
  'O‘rganish jarayoni':'Ваш прогресс', 'Yangi boshlanish':'Новое начало', 'Kitobni ochish':'Открыть книгу',
  'yodlangan so‘zlar':'выученные слова', 'yodlangan':'выучено',
  'Kichik qadamlar katta natijaga yetaklaydi.':'Маленькие шаги ведут к большим результатам.',
  'Hozirgacha':'Пока вы выучили', 'ta so‘z yodladingiz. Bugun ham davom eting.':'слов. Продолжайте и сегодня.', 'Natijalarim':'Мои результаты',
  'Natijalar shu brauzerda saqlanadi.':'Результаты сохраняются в этом браузере.',
  'HARAKATINGIZ NATIJASI':'РЕЗУЛЬТАТ ВАШИХ УСИЛИЙ', 'Mening statistikam':'Моя статистика',
  'Har bir o‘rganilgan so‘z — oldinga bir qadam.':'Каждое выученное слово — шаг вперёд.',
  'Yodlangan so‘zlar':'Выученные слова', 'Takrorlash kerak':'Нужно повторить', 'takrorlash kerak':'нужно повторить',
  'Tugallangan unitlar':'Завершённые уроки', 'Jami javoblar':'Всего ответов', '% lug‘at yodlangan':'% слов выучено',
  'Yana bir bor mashq qiling':'Потренируйтесь ещё раз', 'Barcha so‘zlari ko‘rib chiqilgan':'Все слова просмотрены',
  'ta so‘z bilan ishlangansiz':'слов вы уже изучали', 'So‘zlar holati':'Статус слов', 'Kitoblar bo‘yicha':'По книгам',
  'tugallangan unit':'завершённых уроков', 'Oxirgi o‘rganilgan so‘zlar':'Недавно изученные слова',
  'Hali so‘z o‘rganilmagan.':'Вы ещё не изучали слова.', 'Kitob tanlab, birinchi mashqni boshlang.':'Выберите книгу и начните первое упражнение.',
  'Kitob tanlash':'Выбрать книгу', ' kitob':' книги', ' unit':' уроков',
  'WORDLY — So‘z yodlash':'WORDLY — Изучение слов',
  'so‘z yodlash':'изучение слов', 'SIZNING LUG‘ATINGIZ':'ВАШ СЛОВАРЬ',
  'ENGLISH':'АНГЛИЙСКИЙ',
  'Unit yoki so‘z qidirish…':'Поиск урока или слова…', 'Unit yoki so‘z qidirish':'Поиск урока или слова',
  'Barcha mavzular':'Все темы', 'Mavzu':'Тема', 'Unitlar':'Уроки',
  'Kitobdagi qalin so‘z va iboralar asosida. Natijalar shu brauzerda saqlanadi.':'На основе выделенных слов и выражений из учебника. Результаты сохраняются в этом браузере.',
  'Hech narsa topilmadi. Boshqa so‘z bilan qidiring.':'Ничего не найдено. Попробуйте другое слово.',
  'ta so‘z yodlangan':'слов выучено', 'ta so‘z ko‘rib chiqilgan':'слов просмотрено',
  'ta so‘zni bildingiz':'слов вы знаете', 'ta so‘z':'слов', 'ta unit':'уроков',
  'ta bilaman':'знаю', 'ta takrorlash':'на повторение',
  'Bilmayman':'Не знаю', 'bilmayman':'не знаю', 'Bilaman':'Знаю', 'bilaman':'знаю',
  'Yangi':'Новые', 'yangi':'новых', 'Hammasi':'Все', 'Tugallangan':'Завершено',
  'Davom etish':'Продолжить', 'Boshlash':'Начать',
  '2-usul &middot; 10 soniyada aytish':'2-й способ &middot; Ответ за 10 секунд',
  'Yozib mashq qilish':'Письменная практика', 'Gapni to‘ldirish':'Заполнить пропуск',
  'So‘z holati':'Статус слова', 'O‘qilishi':'Произношение узбекскими буквами',
  'Bu bo‘limda hali so‘z yo‘q. «Hammasi»ni tanlang.':'В этом разделе нет слов. Выберите «Все».',
  'Bu bo‘limda so‘z yo‘q. Boshqa bo‘limni tanlang.':'В этом разделе нет слов. Выберите другой раздел.',
  'Oldingi unit':'Предыдущий урок', 'Keyingi unit':'Следующий урок', 'Unitga qaytish':'Вернуться к уроку',
  'Tarjimani ko‘rish uchun bosing':'Нажмите, чтобы увидеть перевод',
  'So‘zga qaytish uchun bosing':'Нажмите, чтобы вернуться к слову',
  'Inglizcha so‘zni':'английское слово', 'Tarjimani':'перевод', 'ko‘rsatish':'Показать',
  'O‘ZBEKCHA':'РУССКИЙ', 'O‘zbekcha':'Русский',
  'Kartochkani aylantirish':'Перевернуть карточку', 'Aylantirish':'Перевернуть', 'aylantirish':'перевернуть',
  'talaffuzini tinglash':'слушать произношение', 'Talaffuzini tinglash':'Слушать произношение',
  'Talaffuzni tinglash':'Слушать произношение', 'To‘g‘ri talaffuzni tinglash':'Слушать правильное произношение',
  'Tinglash':'Слушать', 'tinglash':'слушать',
  'TARJIMASINI YOZING':'НАПИШИТЕ ПЕРЕВОД', 'Tarjimasi':'Перевод',
  'Inglizcha':'Английский', 'javobni yozing…':'ответ…', 'Tekshirish':'Проверить',
  'To‘g‘ri!':'Правильно!', 'To‘g‘ri javob:':'Правильный ответ:',
  'Bu so‘z «Bilmayman» bo‘limiga saqlandi.':'Слово сохранено в разделе «Не знаю».',
  'Avval javob yozing.':'Сначала введите ответ.',
  'Mikrofon yoqilgach 10 soniya beriladi.':'После включения микрофона даётся 10 секунд.',
  'Javobni yozing va Enter bosing.':'Введите ответ и нажмите Enter.',
  'Barakalla!':'Отлично!', 'Ajoyib natija! So‘zlarni juda yaxshi bilasiz.':'Отличный результат! Вы очень хорошо знаете слова.',
  'Yaxshi, qoniqarli':'Хорошо', 'Yaxshi harakat! Bilmagan so‘zlarni yana bir marta takrorlang.':'Хорошая работа! Повторите незнакомые слова ещё раз.',
  'Yomon':'Нужно повторить', 'Yodlash kerak, bo‘lmasa darsda tik turasan!':'Потренируйтесь ещё, чтобы лучше запомнить слова.',
  'Mashq tugadi. Shu urinish natijasi.':'Упражнение завершено. Результат этой попытки.',
  'Bilmaganlarni takrorlash':'Повторить незнакомые слова', 'Barcha so‘zlarni bildingiz!':'Вы знаете все слова!',
  'So‘zlar ro‘yxatiga qaytish':'Вернуться к списку слов', 'Mashq uchun so&#8216;z yo&#8216;q.':'Нет слов для упражнения.',
  'Brauzer xotirasi ishlamayapti. Natijalar faqat shu seansda saqlanadi.':'Хранилище браузера недоступно. Результаты сохранятся только на время сеанса.',
  'Xotira bilan bog‘liq muammo: natijalar brauzer yopilganda yo‘qolishi mumkin.':'Ошибка хранилища: результаты могут исчезнуть после закрытия браузера.',
  'Bu brauzerda ovozli talaffuz mavjud emas.':'Этот браузер не поддерживает озвучивание.',
  'Ovoz ijro etilmadi. Qurilmangizdagi inglizcha ovozni tekshiring.':'Не удалось воспроизвести звук. Проверьте наличие английского голоса на устройстве.',
  'Mashqni saqlab bo‘lmadi. Brauzer xotirasini tekshiring.':'Не удалось сохранить упражнение. Проверьте хранилище браузера.',
  'Mashq yarim qolgan':'Есть незавершённое упражнение',
  '-kartochkadan davom eting. Natijalar saqlangan.':' — продолжите с этой карточки. Результаты сохранены.',
  'Qayta yodlang':'Повторите',
  '2-USUL · OVOZLI JAVOB':'2-Й СПОСОБ · ГОЛОСОВОЙ ОТВЕТ',
  'Vaqt tugadi':'Время вышло', 'Yana mashq qiling':'Попробуйте ещё',
  'Siz aytdingiz:':'Вы сказали:', 'Inglizcha javob eshitilmadi.':'Английский ответ не распознан.',
  'O‘zbekcha ma’nosini eshiting. Inglizchasini 10 soniyada ayting.':'Послушайте значение по-русски. Скажите по-английски за 10 секунд.',
  'O‘zbekcha ma’no o‘qilmoqda…':'Читаем значение по-русски…',
  'Mikrofon ruxsatini kutyapmiz. Vaqt hali boshlanmadi.':'Ожидаем разрешение на микрофон. Отсчёт ещё не начался.',
  'Tinglayapman. Inglizchasini ayting!':'Слушаю. Скажите по-английски!',
  'Mashq to‘xtatildi. Davom etganda yangi 10 soniya beriladi.':'Упражнение приостановлено. После продолжения даётся ещё 10 секунд.',
  'Mikrofon ishlamadi. Qayta urinib ko‘ring.':'Микрофон не сработал. Попробуйте ещё раз.',
  'Bu brauzer ovozli javobni taniy olmaydi. Saytni Chrome yoki Safari orqali oching.':'Браузер не поддерживает распознавание речи. Откройте сайт в Chrome или Safari.',
  'Javob uchun qolgan soniyalar':'Осталось секунд для ответа', 'soniya':'секунд',
  'Qurilmada o‘zbekcha ovoz topilmadi. Ma’noni ekrandan o‘qib javob bering.':'На устройстве нет русского голоса. Прочитайте значение на экране и ответьте.',
  'Mikrofon yoqilgan':'Микрофон включён', 'Javobingiz shu yerda ko‘rinadi…':'Здесь появится ваш ответ…',
  'Mikrofonni yoqish':'Включить микрофон', 'Tinglash va aytish':'Слушать и говорить',
  'To‘xtatish':'Остановить', 'Brauzerda ochish':'Открыть в браузере',
  'Inglizchasini yozib mashq qilish':'Написать ответ по-английски',
  'Mikrofon uchun ruxsat kerak. Javob va natijangiz saqlanadi.':'Необходимо разрешение на микрофон. Ответ и результат сохраняются.',
  'Ovozni tanish ishga tushmadi. Brauzerda ochib ko‘ring.':'Не удалось запустить распознавание речи. Попробуйте открыть сайт в браузере.',
  'Mikrofonga ruxsat berilmadi. Brauzer sozlamasidan ruxsat berib qayta bosing.':'Доступ к микрофону запрещён. Разрешите доступ в настройках браузера и повторите.',
  'Bu oynada ovozni tanish bloklangan. Saytni tashqi brauzerda oching.':'Распознавание речи заблокировано. Откройте сайт во внешнем браузере.',
  'Mikrofon topilmadi yoki boshqa dastur band qilgan.':'Микрофон не найден или занят другим приложением.',
  'Ovozni tanishda tarmoq xatosi. Internetni tekshirib qayta urinib ko‘ring.':'Ошибка сети при распознавании речи. Проверьте интернет и повторите.',
  'Brauzer inglizcha ovozni tanishni qo‘llamayapti.':'Браузер не поддерживает распознавание английской речи.',
  'Ovozni tanish to‘xtadi. Qayta urinib ko‘ring.':'Распознавание речи остановлено. Попробуйте ещё раз.',
  'Mikrofon tinglashni to‘xtatdi. Qayta yoqing — bu xato javob hisoblanmaydi.':'Микрофон перестал слушать. Включите его снова — это не считается ошибкой.',
  'Mikrofon hali ishga tushmadi. Ruxsatni tekshirib, qayta bosing.':'Микрофон ещё не запустился. Проверьте разрешение и нажмите ещё раз.',
  'Mikrofonni yoqish uchun yana bir marta bosing yoki tashqi brauzerda oching.':'Нажмите ещё раз для включения микрофона или откройте сайт во внешнем браузере.',
  'Bu bo‘limda tayyor gap yo‘q. «Hammasi»ni tanlang.':'В этом разделе нет готовых предложений. Выберите «Все».',
  'Bu so‘z uchun gap topilmadi.':'Для этого слова не найдено предложение.',
  'GAPNI TO‘LDIRING':'ЗАПОЛНИТЕ ПРОПУСК',
  'Bo‘sh joyga unitdagi inglizcha so‘z yoki iborani yozing.':'Впишите в пропуск английское слово или выражение из урока.',
  'Bo‘sh joy':'Пропуск', 'O‘ZBEKCHA MA’NOSI':'ЗНАЧЕНИЕ ПО-РУССКИ',
  'Tushirib qoldirilgan inglizcha so‘z yoki ibora':'Пропущенное английское слово или выражение',
  'Inglizcha javobni yozing…':'Напишите ответ по-английски…', 'Siz yozdingiz:':'Вы написали:',
  'Javob ovozi:':'Звук ответа:', 'yoqilgan':'включён', 'o?chirilgan':'выключен',
  'Javob ovozini o?chirish':'Выключить звук ответа', 'Javob ovozini yoqish':'Включить звук ответа',
  'APK yuklab olasizmi?':'Скачать APK?', 'APK yuklab olish':'Скачать APK', 'Hozir emas':'Не сейчас',
  'WORDLY’ni telefoningizga ilova sifatida o‘rnating.':'Установите WORDLY как приложение на телефон.',
  'Internet kerak. Ilovada yodlash natijalari alohida saqlanadi; Telegram’dagi natijalar avtomatik ko‘chmaydi.':'Нужен интернет. Результаты в приложении сохраняются отдельно и не переносятся из Telegram автоматически.',
  'Android 8 yoki yangiroq. Yuklab olgach, APK faylini oching va Android so‘ragan o‘rnatish ruxsatini bering.':'Android 8 и новее. После загрузки откройте APK и разрешите установку по запросу Android.',
  'Android ilovasini yuklab olish':'Скачать приложение для Android',
};
// One pass, longest first: translated text cannot be translated a second time.
const uiPattern=new RegExp(Object.keys(russianUI).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
function t(text){return appLanguage==='ru'?String(text).replace(uiPattern,key=>russianUI[key]).replace(/(\d)\s+ta\b/g,'$1'):String(text)}
function localizeMarkup(markup){
  if(appLanguage!=='ru')return markup;
  let protectedDepth=0;
  const stack=[];
  return markup.split(/(<[^>]+>)/g).map(part=>{
    if(!part.startsWith('<'))return protectedDepth?part:t(part);
    if(/^<\//.test(part)){if(stack.pop())protectedDepth--;return part}
    if(/^<!/.test(part))return part;
    const protectedText=/\blang="(?:en|uz|ru)"/.test(part);
    if(!/^<(?:input|br|hr|img|meta|link)\b/.test(part)&&!part.endsWith('/>')){stack.push(protectedText);if(protectedText)protectedDepth++}
    return part.replace(/\b(aria-label|placeholder|title)="([^"]*)"/g,(_,name,value)=>`${name}="${t(value)}"`);
  }).join('');
}
function languageControl(){return `<nav class="language-control" aria-label="Til / Язык"><button type="button" data-language="uz" lang="uz" aria-pressed="${appLanguage==='uz'}">O‘zbekcha</button><button type="button" data-language="ru" lang="ru" aria-pressed="${appLanguage==='ru'}">Русский</button></nav>`}
function changeLanguage(language){
  if(!['uz','ru'].includes(language)||language===appLanguage)return;
  stopAnswerAudio();stopVoiceRound();saveActiveSession();
  session=null;appLanguage=language;
  try{localStorage.setItem('wordly-language-v1',language)}catch{}
  loadSavedSessions();storageError=storageError||checkpointReadError;render();
}
