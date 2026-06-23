const axios = require("axios");
const moment = require("moment-timezone");
const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

const apiKey = "d7e795ae6a0d44aaa8abb1a0a7ac19e4";
const language = "ar";
const timezone = "Africa/Algiers";

module.exports.config = {
  name: "طقس",
  aliases: ["الجو", "weather"],
  version: "2.1.0",
  author: "كـيـوي ےۦٰ۪۫٭",
  countDown: 10,
  role: 0,
  shortDescription: "حالة الطقس مع صورة",
  longDescription: "يعرض حالة الطقس لـ 5 أيام لمدينة معينة مع صورة توضيحية",
  category: "وسائط",
  guide: "{pn} [اسم المدينة]\nمثال: {pn} الجزائر"
};

module.exports.onStart = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const area = args.join(" ");

  // دالة إرسال موحدة بتصميم MARO SYSTEM الرمادي
  const send = (msg, attachment) => {
    const body = `◈ MARO SYSTEM ◈\n──────────────────\n${msg}\n──────────────────\nالمطور 👤 : كـيـوي ےۦٰ۪۫٭`;
    return api.sendMessage(attachment ? { body, attachment } : body, threadID, messageID);
  };

  if (!area) {
    return send("⚠️ يرجى إدخال اسم المدينة أو المنطقة.\nمثال: .طقس بومرداس");
  }

  const cachePath = path.join(__dirname, "cache");
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

  let areaKey, locationName, countryName, dataWeather;

  // البحث عن المدينة
  try {
    const searchUrl = `https://api.accuweather.com/locations/v1/cities/search.json?q=${encodeURIComponent(area)}&apikey=${apiKey}&language=${language}`;
    const searchRes = await axios.get(searchUrl);

    if (!searchRes.data || searchRes.data.length === 0) {
      return send(`❌ لم يتم العثور على منطقة باسم: ${area}`);
    }

    const locationData = searchRes.data[0];
    areaKey = locationData.Key;
    locationName = locationData.LocalizedName;
    countryName = locationData.Country.LocalizedName;
  } catch (err) {
    return send("⚠️ حدث خطأ أثناء البحث عن الموقع.");
  }

  // جلب بيانات الطقس
  try {
    const forecastUrl = `http://api.accuweather.com/forecasts/v1/daily/5day/${areaKey}?apikey=${apiKey}&details=true&language=${language}&metric=true`;
    const forecastRes = await axios.get(forecastUrl);
    dataWeather = forecastRes.data;
  } catch (err) {
    return send("⚠️ حدث خطأ أثناء جلب بيانات الطقس.");
  }

  const today = dataWeather.DailyForecasts[0];
  const headline = dataWeather.Headline.Text;

  const formatTime = (timeStr) => moment(timeStr).tz(timezone).format("HH:mm");

  let msg = `🌤 حالة الطقس في: ${locationName}، ${countryName}\n\n` +
            `📝 ملخص اليوم: ${headline}\n` +
            `🌡 الحرارة: ${Math.round(today.Temperature.Minimum.Value)}°C ~ ${Math.round(today.Temperature.Maximum.Value)}°C\n` +
            `🌅 الشروق: ${formatTime(today.Sun.Rise)} | 🌄 الغروب: ${formatTime(today.Sun.Set)}\n\n` +
            `📊 توقعات الـ 5 أيام القادمة ⬇`;

  const fontPath = path.join(__dirname, "src", "font", "Arial.ttf");
  const bgPath = path.join(__dirname, "src", "image", "bgweather.jpg");
  const imgSavePath = path.join(cachePath, `weather_${threadID}.jpg`);

  // محاولة رسم الصورة
  if (fs.existsSync(fontPath) && fs.existsSync(bgPath)) {
    try {
      Canvas.registerFont(fontPath, { family: "Arial Arabic" });
      const bg = await Canvas.loadImage(bgPath);
      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, bg.width, bg.height);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";

      let xPos = 150;
      const forecasts = dataWeather.DailyForecasts;

      for (let i = 0; i < forecasts.length; i++) {
        const dayData = forecasts[i];
        ctx.font = "bold 35px 'Arial Arabic'";
        ctx.fillText(moment(dayData.Date).tz(timezone).format("dddd"), xPos, 150);
        ctx.font = "bold 45px 'Arial Arabic'";
        ctx.fillText(`${Math.round(dayData.Temperature.Maximum.Value)}°C`, xPos, 350);
        xPos += 220;
      }

      const buffer = canvas.toBuffer("image/jpeg");
      fs.writeFileSync(imgSavePath, buffer);

      return api.sendMessage(
        {
          body: `◈ MARO SYSTEM ◈\n──────────────────\n${msg}\n──────────────────\nالمطور 👤 : كـيـوي ےۦٰ۪۫٭`,
          attachment: fs.createReadStream(imgSavePath)
        },
        threadID,
        () => {
          if (fs.existsSync(imgSavePath)) fs.unlinkSync(imgSavePath);
        },
        messageID
      );
    } catch (canvasErr) {
    }
  }

  return send(msg);
};