const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// Express Server
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running alive!'));
app.listen(PORT, () => console.log(Server listening on port ${PORT}));

// Telegram Bot
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const userSessions = {};

// /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "👋 Welcome to Sex Sturdy Group Myanmar!\n\n/register ကို နှိပ်ပြီး Profile စတင် ပြုလုပ်ပါ။"
  );
});

// /register
bot.onText(/\/register/, (msg) => {
  const chatId = msg.chat.id;
  userSessions[chatId] = { step: 'ASK_NAME' };
  bot.sendMessage(chatId, "📝 ကျေးဇူးပြု၍ သင့် နာမည် (သို့မဟုတ်) အမည်ဝှက် ကို ရိုက်ထည့်ပေးပါ:");
});

// Message Handling
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  const session = userSessions[chatId];
  if (!session) return;

  if (session.step === 'ASK_NAME') {
    session.name = text;
    session.step = 'ASK_AGE';
    return bot.sendMessage(chatId, "🔢 သင့် အသက် ကို ရိုက်ထည့်ပေးပါ (ဥပမာ - 21):");
  }

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

  if (session.step === 'ASK_CITY') {
    session.city = text;

    const summary = 
✅ **Profile ပြုလုပ်ခြင်း အဆင်ပြေပါသည်**

👤 နာမည်: ${session.name}
🔢 အသက်: ${session.age}
⚧ မိမိ Gender: ${session.gender}
🎯 ရှာဖွေချင်သည့် Gender: ${session.targetGender}
📍 မြို့: ${session.city}

ကျေးဇူးတင်ပါတယ်။ အချက်အလက်များကို မှတ်သားထားလိုက်ပါပြီ!;

    bot.sendMessage(chatId, summary, { parse_mode: 'Markdown' });
    delete userSessions[chatId];
  }
});

// Callback Query (Buttons)
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const session = userSessions[chatId];

  if (!session) return;

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
  } else if (session.step === 'ASK_TARGET_GENDER') {
    session.targetGender = data === 'target_male' ? 'ကျား (Male)' : 'မ (Female)';
    session.step = 'ASK_CITY';

    bot.sendMessage(chatId, "📍 သင်နေထိုင်သမြို့ု့** ကို ရိုက်ထည့်ပေးပါ (ဥပမာ - ရန်ကုန်/မန္တလေး):");
  }

  bot.answerCallbackQuery(query.id);
});
