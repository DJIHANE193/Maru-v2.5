const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "مدير",
  version: "2.2.0",
  role: 2,
  author: "كـيـوي ےۦٰ۪۫٭",
  countDown: 5,
  shortDescription: "إدارة النظام",
  longDescription: "لوحة تحكم احترافية لملفات الأوامر",
  category: "النظام",
  guide: "{pn} عرض | كود | حذف | اضافة | تعديل | اعادة_تسمية | تصنيف"
};

module.exports.onStart = async function({ api, event, args }) {
  const { threadID, messageID, senderID, body } = event;
  const devIDs = ["61550272160988", "61589255038437"];
  const dirPath = __dirname;

  // دالة إرسال الرسالة بالإطار المختار
  const send = (msg) => {
    return api.sendMessage(
      `▣ MARO SYSTEM ▣\n──────────────────\n${msg}\n──────────────────\nالمطور 👤 : كـيـوي ےۦٰ۪۫٭`,
      threadID, messageID
    );
  };

  // التحقق من المطورين
  if (!devIDs.includes(senderID)) {
    return send("⛔ صلاحية الوصول مقيدة.");
  }

  const action = args[0]?.toLowerCase();
  const target = args[1];
  const extraArg = args[2];
  const allFiles = fs.readdirSync(dirPath).filter(f => f.endsWith(".js"));

  const findFile = (name) => {
    for (const f of allFiles) {
      const p = path.join(dirPath, f);
      try {
        if (f === name || f === name + ".js") return { filePath: p, fileName: f };
        const cmd = require(p);
        if (cmd.config && cmd.config.name === name) return { filePath: p, fileName: f };
      } catch(e) {}
    }
    return null;
  };

  if (!action) {
    return send(
      `📋 لوحة التحكم:\n\n` +
      `▪ مدير عرض — قائمة الملفات\n` +
      `▪ مدير كود [الاسم] — عرض المحتوى\n` +
      `▪ مدير حذف [الاسم] — مسح نهائي\n` +
      `▪ مدير اضافة [الاسم] — إنشاء أمر\n` +
      `▪ مدير تعديل [الاسم] — تحديث الكود\n` +
      `▪ مدير اعادة_تسمية [القديم] [الجديد]\n` +
      `▪ مدير تصنيف [الاسم] [0/1/2]`
    );
  }

  if (action === "عرض") {
    let list = `📂 الملفات (${allFiles.length}):\n`;
    allFiles.forEach((f, i) => list += `${i+1}. ${f}\n`);
    return send(list);
  }

  if (action === "كود") {
    if (!target) return send("⚠️ حدد اسم الملف.");
    const found = findFile(target);
    if (!found) return send("❌ الملف غير موجود.");
    const code = fs.readFileSync(found.filePath, "utf-8");
    return send(`🔍 محتوى [ ${found.fileName} ]:\n\n${code}`);
  }

  if (action === "حذف") {
    if (!target) return send("⚠️ حدد الملف للحذف.");
    const found = findFile(target);
    if (!found) return send("❌ الملف غير موجود.");
    fs.unlinkSync(found.filePath);
    return send(`🗑 تم حذف [ ${target} ] بنجاح.`);
  }

  if (action === "اضافة") {
    if (!target) return send("⚠️ حدد اسم الأمر.");
    const filePath = path.join(dirPath, `${target}.js`);
    if (fs.existsSync(filePath)) return send("⚠️ الملف موجود بالفعل.");
    const template = `module.exports.config = { name: "${target}", version: "1.0.0", role: 0, author: "كـيـوي ےۦٰ۪۫٭", category: "عام" };\n\nmodule.exports.onStart = async ({ api, event }) => { api.sendMessage("✅ تم التنفيذ.", event.threadID); };`;
    fs.writeFileSync(filePath, template, "utf-8");
    return send(`✅ تم إنشاء [ ${target} ] بنجاح.`);
  }

  if (action === "تعديل") {
    if (!target) return send("⚠️ حدد اسم الملف.");
    const found = findFile(target);
    if (!found) return send("❌ الملف غير موجود.");
    const codeMatch = body.match(/```([\s\S]*?)```/);
    if (!codeMatch) return send("⚠️ أرسل الكود داخل كود بلوك ``` ```.");
    fs.writeFileSync(found.filePath, codeMatch[1].trim(), "utf-8");
    return send(`✅ تم تعديل [ ${target} ] بنجاح.`);
  }

  if (action === "اعادة_تسمية") {
    if (!target || !extraArg) return send("⚠️ الاستخدام: مدير اعادة_تسمية [القديم] [الجديد]");
    const found = findFile(target);
    if (!found) return send("❌ الملف غير موجود.");
    fs.renameSync(found.filePath, path.join(dirPath, `${extraArg}.js`));
    return send(`✅ تم تغيير الاسم إلى [ ${extraArg} ].`);
  }

  if (action === "تصنيف") {
    if (!target || !extraArg) return send("⚠️ الاستخدام: مدير تصنيف [الاسم] [0/1/2]");
    const found = findFile(target);
    if (!found) return send("❌ الملف غير موجود.");
    let content = fs.readFileSync(found.filePath, "utf-8");
    content = content.replace(/role:\s*\d/, `role: ${extraArg}`);
    fs.writeFileSync(found.filePath, content, "utf-8");
    return send(`✅ تم تغيير الصلاحية إلى [ ${extraArg} ].`);
  }

  return send("⚠️ أمر غير معروف. اكتب 'مدير' للمساعدة.");
};
