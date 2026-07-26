const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// Express Server Setup (Render Free Plan Awake ဖြစ်စေရန်)
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is active!'));
app.listen(PORT, () => console.log(Server listening on port ${PORT}));

// Telegram Bot Setup
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// User တွေရဲ့ ဖြည့်လက်စ အချက်အလက်များကို ခေတ္တ မှတ်ထားရန် Object
const userSessions = {};

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    👋 Welcome to Sex Sturdy Group Myanmar!\n\n/register ကို နှိပ်ပြီး Profile စတင် ပြုလုပ်ပါ။
  );
});

// /register command
bot.onText(/\/register/, (msg) => {
  const chatId = msg.chat.id;

  // Session အသစ် စတင်ခြင်း
  userSessions[chatId] = { step: 'ASK_NAME' };

  bot.sendMessage(chatId, "📝 ကျေးဇူးပြု၍ သင့် နာမည် (သို့မဟုတ်) အမည်ဝှက် ကို ရိုက်ထည့်ပေးပါ:");
});

// User ဆီက လာသမျှ Message များကို အဆင့်လိုက် လက်ခံခြင်း
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Command တွေ ဖြစ်ရင် လျစ်လျူရှုမည်
  if (!text || text.startsWith('/')) return;

  const session = userSessions[chatId];
  if (!session) return;

  // အဆင့် ၁ - နာမည် တောင်းခြင်း
  if (session.step === 'ASK_NAME') {
    session.name = text;
    session.step = 'ASK_AGE';
    return bot.sendMessage(chatId, "🔢 သင့် အသက် ကို ရိုက်ထည့်ပေးပါ (ဥပမာ - 21):");
  }

  // အဆင့် ၂ - အသက် တောင်းခြင်း
  if (session.step === 'ASK_AGE') {
    session.age = text;
    session.step = 'ASK_GENDER';

    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "ကျား (Male)", callback_data: "gender_male" },
            { text: "မ (Female)", callback_data: "gender_female" }
          ]
        ]
      }
    };
    return bot.sendMessage(chatId, "👤 သင့် Gender (မိမိကျား/မ) ကို ရွေးချယ်ပါ:", opts);
  }

  // အဆင့် ၅ - မြို့ တောင်းခြင်း
  if (session.step === 'ASK_CITY') {
    session.city = text;

    // အချက်အလက်များ အားလုံး စုစည်းပြသခြင်း
    const summary = 
✅ **Registration မအောင်မြင်သေးပါ (Preview)**

👤 နာမည်: ${session.name}
🔢 အသက်: ${session.age}
⚧ မိမိ Gender: ${session.gender}
🎯 ရှာဖွေချင်သည့် Gender: ${session.targetGender}
📍 မြို့: ${session.city}

ကျေးဇူးတင်ပါတယ်။ အချက်အလက်များကို မှတ်သားထားလိုက်ပါပြီ!;

    bot.sendMessage(chatId, summary, { parse_mode: 'Markdown' });
    delete userSessions[chatId]; // Session ပြီးဆုံး
  }
});

// Inline Keyboard Button များ နှိပ်သည့်အခါ လက်ခံခြင်း
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const session = userSessions[chatId];

  if (!session) return;

  // မိမိ Gender ရွေးချယ်ခြင်း
  if (session.step === 'ASK_GENDER') {
    session.gender = data === 'gender_male' ? 'ကျား (Male)' : 'မ (Female)';
    session.step = 'ASK_TARGET_GENDER';

    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "ကျား (Male)", callback_data: "target_male" },
            { text: "မ (Female)", callback_data: "target_female" }
          ]
        ]
      }
    };
    bot.sendMessage(chatId, "🔍 ဘယ် Gender ကို ရှာဖွေချင်တာလဲလဲ**:", opts);
  }

  // ရှာဖွေချင်သည့် Gender ရွေးချယ်ခြင်း
  else if (session.step === 'ASK_TARGET_GENDER') {
    session.targetGender = data === 'target_male' ? 'ကျား (Male)' : 'မ (Female)';
    session.step = 'ASK_CITY';

    bot.sendMessage(chatId, "📍 သင်နေထိုင်သမြို့ု့** ကို ရိုက်ထည့်ပေးပါ (ဥပမာ - ရန်ကုန်/မန္တလေး):");
  }

  bot.answerCallbackQuery(query.id);
});
