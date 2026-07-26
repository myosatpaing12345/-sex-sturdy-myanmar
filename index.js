require("dotenv").config();

const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {

  ctx.reply(

`👋 Welcome to Sex Sturdy Group Myanmar

Use /register to create your profile.`

  );

});

bot.command("register", (ctx) => {

  ctx.reply("Registration feature coming soon...");

});

bot.launch();

console.log("Bot is running...");
