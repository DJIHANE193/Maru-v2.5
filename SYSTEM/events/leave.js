const { getTime, drive } = global.utils;

module.exports = {
    config: {
        name: "leave",
        version: "2.5",
        author: "maru",
        category: "events"
    },

    langs: {
        ar: {
            session1: "فجر اليوم 🌅",
            session2: "وقت الظهيرة ☀️",
            session3: "بعد الظهر 💼",
            session4: "مساءً 🌙",
            leaveType1: "انسحاب طوعي",
            leaveType2: "إنهاء الصلاحية (طرد)",
            defaultLeaveMessage: `｢ ⚖️ ━ **سجل نظام مارو** ━ ⚡ ｣\n\n┝━━━━━━━━━━━━━━━\n┇ 👤 **المستخدم:** {userName}\n┇ 📑 **الإجراء:** {type}\n┇ 📍 **المجموعة:** {boxName}\n┇ ⏳ **التوقيت:** {session}\n┝━━━━━━━━━━━━━━━\n\n  *تم إنهاء الجلسة. أُغلق الاتصال بهذا المستخدم.* 🔱\n\n｢ 📊 ｣ ━ المعرف: {userNameTag}`
        }
    },

    onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
        if (event.logMessageType !== "log:unsubscribe") return;

        const { threadID } = event;
        const threadData = await threadsData.get(threadID);
        if (!threadData.settings.sendLeaveMessage) return;

        const { leftParticipantFbId } = event.logMessageData;
        if (leftParticipantFbId == api.getCurrentUserID()) return;

        const hours = getTime("HH");
        const threadName = threadData.threadName;
        const userName = await usersData.getName(leftParticipantFbId);

        let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;

        const form = {
            mentions: [{
                tag: userName,
                id: leftParticipantFbId
            }]
        };

        leaveMessage = leaveMessage
            .replace(/\{userName\}|\{userNameTag\}/g, userName)
            .replace(/\{type\}/g, leftParticipantFbId == event.author ? getLang("leaveType1") : getLang("leaveType2"))
            .replace(/\{threadName\}|\{boxName\}/g, threadName)
            .replace(/\{time\}/g, hours)
            .replace(/\{session\}/g, hours <= 10 ?
                getLang("session1") :
                hours <= 12 ?
                    getLang("session2") :
                    hours <= 18 ?
                        getLang("session3") :
                        getLang("session4")
            );

        form.body = leaveMessage;

        if (threadData.data.leaveAttachment) {
            const files = threadData.data.leaveAttachment;
            const attachments = files.reduce((acc, file) => {
                acc.push(drive.getFile(file, "stream"));
                return acc;
            }, []);
            form.attachment = (await Promise.allSettled(attachments))
                .filter(({ status }) => status == "fulfilled")
                .map(({ value }) => value);
        }

        message.send(form);
    }
};
