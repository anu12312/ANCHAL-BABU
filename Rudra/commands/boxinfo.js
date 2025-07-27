const fs = require("fs-extra");
const totalPath = __dirname + '/cache/hethong/totalChat.json';
const _24hours = 86400000;

module.exports.config = {
    name: "boxinfo",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "SHANKAR PROJECT",
    description: "View your box information",
    commandCategory: "Box chat",
    usages: "",
    cooldowns: 0
};
module.exports.languages = {
    "vi": {},
    "en": {},
    "hi": {
        "boxInfo": {
            "setting": "सेटिंग्स",
            "name": "नाम",
            "id": "आईडी",
            "approval": "अनुमोदन",
            "themeName": "थीम का नाम",
            "emojiTheme": "इमोजी थीम",
            "iconThread": "थ्रेड आइकन",
            "totalMembers": "कुल सदस्यों की संख्या",
            "male": "पुरुष",
            "female": "महिला",
            "undefined": "अनिश्चित लिंग",
            "totalAdmins": "कुल प्रशासक",
            "interactionStats": "इंटरैक्शन आँकड़े",
            "yesterday": "कल",
            "today": "आज",
            "totalMessages": "कुल संदेश",
            "interactionRate": "इंटरैक्शन दर",
            "currentTime": "वर्तमान समय"
        }
    }
};

module.exports.handleEvent = async ({
    api,
    event,
    args
}) => {
    if (!fs.existsSync(totalPath)) fs.writeFileSync(totalPath, JSON.stringify({}));
    let totalChat = JSON.parse(fs.readFileSync(totalPath));
    if (!totalChat[event.threadID]) return;
    if (Date.now() - totalChat[event.threadID].time > (_24hours * 2)) {
        let sl = (await api.getThreadInfo(event.threadID)).messageCount;
        totalChat[event.threadID] = {
            time: Date.now() - _24hours,
            count: sl,
            ytd: sl - totalChat[event.threadID].count
        };
        fs.writeFileSync(totalPath, JSON.stringify(totalChat, null, 2));
    }
};

module.exports.run = async ({
    api,
    event,
    args,
    Threads,
    Users
}) => {
    try {
        const {
            threadID,
            messageID,
            senderID,
            isGroup
        } = event;
        let timeByMS = Date.now();
        let threadInfo = await Threads.getInfo(threadID);
        let dataThread = (await Threads.getData(threadID)).threadInfo;
        let threadAllUsers = threadInfo.participantIDs.length;
        var arrayNam = [];
        var arrayNu = [];
        var arrayUndefined = [];
        for (let getUsers in threadInfo.userInfo) {
            var getGender = threadInfo.userInfo[getUsers].gender;
            var getName = threadInfo.userInfo[getUsers].name;
            if (getGender == "MALE") {
                arrayNam.push(getUsers + getGender);
            } else if (getGender == "FEMALE") {
                arrayNu.push(getGender);
            } else {
                arrayUndefined.push(getName);
            }
        }

        var countNam = arrayNam.length;
        var countNu = arrayNu.length;
        var countUndefined = arrayUndefined.length;
        let adminID = dataThread.adminIDs || threadInfo.adminID || {};
        let countAdmin = adminID.length || {};
        let countAllMessage = threadInfo.messageCount;
        let threadIcon = threadInfo.emoji || dataThread.threadIcon || "";
        let themeName = dataThread.themeName || "";
        let emojiTheme = dataThread.themeEmoji || "";
        let threadName = dataThread.threadName || threadInfo.threadName || "undefined";
        let threadId = threadInfo.threadID;
        var approvalMode = threadInfo.approvalMode || dataThread.approvalMode || {};
        let approve = approvalMode == false ? "बंद" : approvalMode == true ? "चालू" : approvalMode == 0 ? "बंद" : approvalMode == 1 ? "चालू" : "";
        var listAD = "";
        for (let id of adminID) {
            let infoUsers = await Users.getInfo(id.id);
            listAD += `• 🕵‍♂️${infoUsers.name}\n`;
        }
        const moment = require("moment-timezone");
        var timeNow = moment.tz("Asia/Kolkata").format("HH:mm:ss");
        if (!fs.existsSync(totalPath)) fs.writeFileSync(totalPath, JSON.stringify({}));
        let totalChat = JSON.parse(fs.readFileSync(totalPath));
        if (!totalChat[threadID]) {
            totalChat[threadID] = {
                time: timeByMS,
                count: countAllMessage,
                ytd: 0
            };
            fs.writeFileSync(totalPath, JSON.stringify(totalChat, null, 2));
        }
        let mdtt = "कोई आँकड़ा उपलब्ध नहीं है";
        let preCount = totalChat[threadID].count || 0;
        let ytd = totalChat[threadID].ytd || 0;
        let hnay = (ytd != 0) ? (countAllMessage - preCount) : "कोई आँकड़ा उपलब्ध नहीं है";
        let hqua = (ytd != 0) ? ytd : "कोई आँकड़ा उपलब्ध नहीं है";
        if (timeByMS - totalChat[threadID].time > _24hours) {
            if (timeByMS - totalChat[threadID].time > (_24hours * 2)) {
                totalChat[threadID].count = countAllMessage;
                totalChat[threadID].time = timeByMS - _24hours;
                totalChat[threadID].ytd = countAllMessage - preCount;
                fs.writeFileSync(totalPath, JSON.stringify(totalChat, null, 2));
            }

            let getHour = Math.ceil((timeByMS - totalChat[threadID].time - _24hours) / 3600000);
            if (ytd == 0) mdtt = 100;
            else mdtt = ((((hnay) / ((hqua / 24) * getHour))) * 100).toFixed(0);
            mdtt += "%";
        }
        api.sendMessage({
            body: "[======》 बॉक्स जानकारी 《======]" + "\n\n" +
                "◆━━━━━━━━━━━━━◆" + "\n" +
                "➣ सेटिंग्स: " + "\n" +
                "• नाम: " + threadName + "\n" +
                "• आईडी: " + threadId + "\n" +
                "• अनुमोदन: " + approve + "\n" +
                "• थीम का नाम: " + themeName + "\n" +
                "• इमोजी थीम: " + emojiTheme + "\n" +
                "• थ्रेड आइकन: " + threadIcon + "\n" +
                "◆━━━━━━━━━━━━━◆" + "\n" +
                "➣ कुल " + threadAllUsers + " सदस्य, शामिल हैं: " + "\n" +
                "• 👨‍🦰पुरुष: " + countNam + "\n" +
                "• 👩‍🦰महिला: " + countNu + "\n" +
                "• 🧟‍♂️अनिश्चित लिंग: " + countUndefined + "\n\n" +
                "➣ " + countAdmin + " प्रशासक, शामिल हैं: " + "\n" +
                listAD +
                "◆━━━━━━━━━━━━━◆" + "\n" +
                "➣ इंटरैक्शन आँकड़े: " + "\n" +
                "• कल: " + hqua + "\n" +
                "• आज: " + hnay + "\n" +
                "• कुल: " + countAllMessage + "\n" +
                "• इंटरैक्शन दर: " + mdtt + "\n" +
                "◆━━━━━━━━━━━━━◆" + "\n\n" +
                "[=====[ " + timeNow + " ]=====]",
            attachment: await DownLoad(threadInfo.imageSrc, __dirname + "/cache/avtbox.jpg")
        }, threadID, () => fs.unlinkSync(__dirname + "/cache/avtbox.jpg"));
    } catch (e) {
        return api.sendMessage(e, threadID, messageID);
    }
};

async function DownLoad(url, path) {
    await require("image-downloader").image({
        url: url,
        dest: path
    });
    return fs.createReadStream(path);
}
