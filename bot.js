const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const fs = require('fs');
require('dotenv').config()

const recordFsFile = () => {
  fs.writeFileSync('goalslist.json', JSON.stringify(goalslist, null, 2), 'utf8');
};

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const bot = new Telegraf(BOT_TOKEN);

const goalslist = JSON.parse(fs.readFileSync('goalslist.json', 'utf8'));

bot.start((ctx) => {
  if (ADMIN_ID !== ctx.from.id) {
    ctx.reply('Оу Привет дорогой гость!');
    ctx.reply('Если хочешь посмотреть что умеет бот введи /help');
    return;
  }
  ctx.reply('Приветсвую мой Хозяин! Что на сегодня?');
});

bot.command('goalslist', (ctx) => {
  const goals = goalslist.map((goal, index) => {
    const achieved = goal.achievedBy
      ? `(Достигнуто ${goal.achievedBy})`
      : ` (Ещё никем не достигнуто)`;
    const row = `${index + 1}. ${goal.title} ${achieved}`;
    return row;
  });
  ctx.reply(`Твои цели:\n${goals.join('\n')}`);
});

bot.command('add', (ctx) => {
  if (ADMIN_ID !== ctx.from.id) {
    ctx.reply('Уппссс у вас нет прав на эту команду');
    return;
  }
  const goalTitle = ctx.message.text.split(' ').slice(1).join(' ');
  const goal = { title: goalTitle, achievedBy: null };
  goalslist.push(goal);
  recordFsFile();
  ctx.reply(`Цель "${goalTitle}" успешно добавлена!`);
});

bot.command('delete', (ctx) => {
  if (ADMIN_ID !== ctx.from.id) {
    ctx.reply('Уппссс у вас нет прав на эту команду');
    return;
  }
  const goalIndex = Number(ctx.message.text.split(' ')[1]);
  const [deletedGoal] = goalslist.splice(goalIndex - 1, 1);
  ctx.reply(`Цель ${deletedGoal.title} успешно удалена!`);
  recordFsFile();
});

bot.command('achieve', (ctx) => {
  if (ADMIN_ID !== ctx.from.id) {
    ctx.reply('Уппссс у вас нет прав на эту команду');
    return;
  }
  const goalIndex = Number(ctx.message.text.split(' ')[1]);
  goalslist[goalIndex - 1].achievedBy = ctx.from.username;
  recordFsFile();
  ctx.reply(
    `Молодец ${ctx.from.username}! Ты справился с целью: ${
      goalslist[goalIndex - 1].title
    }  `,
  );
});

bot.help((ctx) =>
  ctx.reply(
    'Вот основные комманды:\n/goalslist - Список целей.\n/add "название цели" - Добавить цель.\n/delete "номер цели" - Удалить цель\n/achieve "номер цели" - Отметить что цель достигнута.',
  ),
);
// bot.on(message('sticker'), (ctx) => ctx.reply('👍'));
// bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
