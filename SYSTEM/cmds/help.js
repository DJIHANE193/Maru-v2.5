const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.NeroBot;

module.exports = {
	config: {
		name: "اوامر",
		version: "1.17",
		author: "كـيـوي ےۦٰ۪۫٭",
		countDown: 5,
		role: 0,
		shortDescription: { ar: "عرض قائمة الأوامر" },
		longDescription: { ar: "عرض استخدام الأوامر وسرد كافة الأوامر مباشرة" },
		category: "النظام",
		guide: { ar: "{pn} [اسم الأمر]" },
		priority: 1,
	},

	onStart: async function ({ message, args, event, threadsData, role }) {
		const { threadID } = event;
		const prefix = getPrefix(threadID);

		if (args.length === 0) {
			const categories = {};
			let msg = `◈ MARO SYSTEM ◈\n──────────────────\n📋 ┋ سجل الأوامر ┋\n`;

			for (const [name, value] of commands) {
				if (value.config.role > 1 && role < value.config.role) continue;
				const category = value.config.category || "عام";
				categories[category] = categories[category] || { commands: [] };
				categories[category].commands.push(name);
			}

			Object.keys(categories).forEach(category => {
				msg += `\n• القسم: ${category.toUpperCase()}\n`;
				const names = categories[category].commands.sort();
				msg += `— ${names.join(" — ")}\n`;
			});

			msg += `\n──────────────────\nالمطور 👤 : كـيـوي ےۦٰ۪۫٭`;

			await message.reply(msg);
		} else {
			const commandName = args[0].toLowerCase();
			const command = commands.get(commandName) || commands.get(aliases.get(commandName));

			if (!command) {
				await message.reply(`◈ MARO SYSTEM ◈\n──────────────────\n❌ الأمر "${commandName}" غير موجود.`);
			} else {
				const configCommand = command.config;
				const guideBody = configCommand.guide?.ar || "لا يوجد شرح.";
				const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

				const response = `◈ MARO SYSTEM ◈\n──────────────────\n` +
					`إسم الأمر : ${configCommand.name}\n` +
					`الوصف : ${configCommand.longDescription?.ar || "لا يوجد"}\n` +
					`الصلاحية : ${roleTextToString(configCommand.role)}\n` +
					`طريقة الإستخدام : ${usage}\n` +
					`──────────────────\n` +
					`المطور 👤 : كـيـوي ےۦٰ۪۫٭`;

				await message.reply(response);
			}
		}
	},
};

function roleTextToString(role) {
	return role === 0 ? "الجميع" : role === 1 ? "الآدمن" : "المطور";
}