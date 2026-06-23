module.exports = {
  config: {
    name: "ابلاغ",
    aliases: ["نداء", "بلاغ", "call", "report"],
    version: "2.0",
    author: "كـيـوي ےۦٰ۪۫٭",
    countDown: 10,
    role: 0,
    shortDescription: {
      ar: "إرسال بلاغ أو نداء لمطور البوت عند وجود مشكلة"
    },
    category: "المالك",
    guide: {
      ar: "{pn} [نص المشكلة أو الرسالة]"
    }
  },

  onStart: async function ({ message, event, usersData, threadsData, api }) {
    const { threadID, senderID, messageID, body } = event;
    const args = body.split(/\s+/).slice(1);
    const content = args.join(" ");

    // دالة إرسال بتصميم مارو الرمادي
    const send = (msg) => {
      return message.reply(
        `◈ MARO SYSTEM ◈\n──────────────────\n${msg}\n──────────────────\nالمطور 👤 : كـيـوي ےۦٰ۪۫٭`
      );
    };

    if (!content) 
      return send("⚠️ يرجى كتابة نص البلاغ بعد الأمر.");

    const name = await usersData.getName(senderID);
    const threadName = (await threadsData.get(threadID)).threadName || "مجموعة غير مسمى";

    // المعرف الخاص بمجموعة الاستقبال
    const supportThreadID = "1637988127236596";

    const reportBody = 
      `◈ MARO SYSTEM ◈\n──────────────────\n` +
      `🔔 إبلاغ جديد للمطور\n\n` +
      `👤 المرسل: ${name}\n` +
      `🆔 آيدي المرسل: ${senderID}\n` +
      `🏙 من مجموعة: ${threadName}\n` +
      `🌐 آيدي المجموعة: ${threadID}\n\n` +
      `📝 الرسالة:\n${content}\n` +
      `──────────────────\n` +
      `💡 للرد على المستخدم، قم بعمل ريبلاي (Reply) على هذه الرسالة.\n` +
      `──────────────────\n` +
      `المطور 👤 : كـيـوي ےۦٰ۪۫٭`;

    try {
      await api.sendMessage(reportBody, supportThreadID, (err, info) => {
        if (err) return send("❌ حدث خطأ أثناء إرسال البلاغ.");
        
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID,
          threadID: threadID
        });

        return send("✅ تم إرسال بلاغك بنجاح، سيصلك الرد قريباً.");
      });
    } catch (e) {
      return send("❌ عذراً، لم أتمكن من إرسال البلاغ حالياً.");
    }
  },

  onReply: async function ({ message, event, Reply, api }) {
    const { senderID, body, threadID } = event;
    const { author, threadID: originalThreadID } = Reply;

    // التأكد من أن الرد من مجموعة الدعم فقط
    if (threadID != "1637988127236596") return;

    const replyBody = 
      `◈ MARO SYSTEM ◈\n──────────────────\n` +
      `📩 رد من المطور:\n\n${body}\n` +
      `──────────────────\n` +
      `💡 يمكنك الرد مجدداً باستخدام أمر إبلاغ.\n` +
      `──────────────────\n` +
      `المطور 👤 : كـيـوي ےۦٰ۪۫٭`;

    try {
      await api.sendMessage(replyBody, originalThreadID);
      message.reply(`◈ MARO SYSTEM ◈\n──────────────────\n✅ تم إرسال الرد للمستخدم بنجاح.\n──────────────────\nالمطور 👤 : كـيـوي ےۦٰ۪۫٭`);
    } catch (e) {
      message.reply(`◈ MARO SYSTEM ◈\n──────────────────\n❌ فشل إرسال الرد للمستخدم.\n──────────────────\nالمطور 👤 : كـيـوي ےۦٰ۪۫٭`);
    }
  }
};