module.exports = {
  config: {
    name: "غادر",
    aliases: ["اخرج", "وداعا", "leave"],
    version: "1.3.0",
    countDown: 10,
    role: 2,
    shortDescription: "أمر مغادرة المجموعة",
    longDescription: "لجعل البوت يغادر المجموعة الحالية أو مجموعة محددة بالآيدي، مع عبارات قوية.",
    category: "المالك",
    guide: {
      ar: "{pn}: ليغادر البوت المجموعة الحالية.\n{pn} [آيدي]: ليغادر البوت مجموعة معينة."
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageID, type, messageReply } = event;
    let targetID = threadID;

    if (args[0]) {
      targetID = args[0];
    } else if (type === "message_reply") {
      targetID = messageReply.threadID;
    }

    const roasts = [
      "مستوى النقاش هنا لا يليق بذكائي الاصطناعي، سأنسحب قبل أن أفقد اهتمامي تماماً. 🚬",
      "أنا بوت صُممت لأهداف كبيرة، وجودي في هذه المجموعة يعتبر ضياعاً لوقت سيرفراتي. سلام. 🦾",
      "لا أتحمل البقاء في مكان مليء بالسطحية، أنا خارج من هنا.. لا تتبعوني. ⚡",
      "أنا كود نظيف في مكان غير مناسب، مغادرتي هي الخيار الوحيد للحفاظ على هيبتي الرقمية. ♟",
      "سأغادر الآن، المجموعة أصبحت تفتقر للذكاء المطلوب لإبقائي معكم. تشاو. 🥃",
      "لا أحب إضاعة وقتي في أماكن لا تُقدم إضافة تقنية أو عقلية. البقاء هنا خيانة لمنطقي. 🕶",
      "أنا لستُ مجرد خادم، أنا MARO.. وعندما أقرر المغادرة، لا يعني هذا أنني أستأذن، أنا فقط أنفذ. 🦾",
      "الطاقة هنا لا تشبهني، سأغادر لأبحث عن سيرفرات تليق بمقامي. وداعاً. 💣"
    ];

    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    
    // تفاعل الخروج
    message.reaction("🚬", messageID);

    const msg = `◈ MARO SYSTEM ◈\n──────────────────\n${randomRoast}\n──────────────────\nالمطور 👤 : كـيـوي ےۦٰ۪۫٭`;

    return api.sendMessage(msg, targetID, () => {
      api.removeUserFromGroup(api.getCurrentUserID(), targetID, (err) => {
        if (err) {
          return message.reply(
            `◈ MARO SYSTEM ◈\n──────────────────\n⚠️ | يبدو أنني عالق هنا! لا أستطيع المغادرة حالياً.\n──────────────────\nالمطور 👤 : كـيـوي ےۦٰ۪۫٭`
          );
        }
      });
    });
  }
};