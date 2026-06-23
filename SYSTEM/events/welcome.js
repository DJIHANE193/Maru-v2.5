const { getTime, drive } = global.utils;

if (!global.temp.welcomeEvent)
global.temp.welcomeEvent = {};

module.exports = {
config: {
name: "welcome",
version: "2.5",
author: "maru", // تم التحديث بلمسة مارو ⚖️
category: "events",
},

langs: {
ar: {
session1: "فجر يوم جديد 🌅",
session2: "وقت الظهيرة ☀️",
session3: "ما بعد الظهر 💼",
session4: "هدوء المساء 🌙",

// بطاقة تعريفية للبوت عند التفعيل:
welcomeMessage: `┌─── ･ ｡ﾟ☆: *.⚖️.* :☆ﾟ. ───┐\n\n *Hii! I'm Maro system* ⚡\n\n أنظمة دقيقة، تحكم كامل، وبصمة ثابتة..\n جاهز لإدارة العمليات! 🔱\n\n└─── ･ ｡ﾟ☆: *.⚡.* :☆ﾟ. ───┘`,

multiple1: "بك",
multiple2: "بكم جميعاً",
defaultWelcomeMessage: `┌────━━━ ❖ ⚖️ ❖ ━━━────┐\n\n ◇ 𓊈 ⚡ مـارو يـرحب {multiple} ⚡ 𓊉 ◇\n\n┝━━━━━━━━━━━━━━━\n┇ 🔱 أهلاً بـ 『 {userName} 』\n┝━━━━━━━━━━━━━━━\n┇ ⚖️ المجمـوعة: 『 {boxName} 』\n┝━━━━━━━━━━━━━━━\n┇ ⏳ الوقـت: 『 {session} 』\n┝━━━━━━━━━━━━━━━\n\n ⚡ نتمنى لكم تواجد مثمر وفعال هنا! 🔱\n\n└────━━━ ❖ ⚖️ ❖ ━━━────┘`
}
},

onStart: async ({ threadsData, message, event, api, getLang }) => {
if (event.logMessageType !== "log:subscribe") return;

const hours = getTime("HH");
const { threadID } = event;
const prefix = global.utils.getPrefix(threadID);
const dataAddedParticipants = event.logMessageData.addedParticipants;

// التحقق من انضمام البوت نفسه
if (dataAddedParticipants.some((item) => item.userFbId === api.getCurrentUserID())) {
return message.send(getLang("welcomeMessage", prefix));
}

if (!global.temp.welcomeEvent[threadID]) {
global.temp.welcomeEvent[threadID] = {
joinTimeout: null,
dataAddedParticipants: [],
};
}

global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
const threadData = await threadsData.get(threadID);

if (threadData.settings.sendWelcomeMessage === false) return;

const threadName = threadData.threadName;
const userName = [];
const mentions = [];
let multiple = dataAddedParticipants.length > 1;

for (const user of dataAddedParticipants) {
userName.push(user.fullName);
mentions.push({
tag: user.fullName,
id: user.userFbId,
});
}

if (userName.length === 0) return;

let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

// تعديل المنشن ليعمل دائماً
const form = {
body: "",
mentions: mentions
};

welcomeMessage = welcomeMessage
.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
.replace(/\{boxName\}|\{threadName\}/g, threadName)
.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
.replace(/\{session\}/g, hours <= 10 ? getLang("session1") : hours <= 12 ? getLang("session2") : hours <= 18 ? getLang("session3") : getLang("session4"));

form.body = welcomeMessage;

if (threadData.data.welcomeAttachment) {
const files = threadData.data.welcomeAttachment;
const attachments = files.reduce((acc, file) => {
acc.push(drive.getFile(file, "stream"));
return acc;
}, []);
form.attachment = (await Promise.allSettled(attachments))
.filter(({ status }) => status === "fulfilled")
.map(({ value }) => value);
}

message.send(form);
delete global.temp.welcomeEvent[threadID];
}, 1500);
},
};
