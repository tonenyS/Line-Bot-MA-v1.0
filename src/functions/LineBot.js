const { getDataFromRange, setDataToStore, isEmpty } = require('./utils.js');

const MESSAGE_TYPE = {
    NORMAL: 'Normal',
    QUICKREPLY: 'Quickreply',
};

async function getUserProfile(userId, groupId) {
    try {
        if (
            PropertiesService.getScriptProperties().getProperty('LINE_CHANEL_ACCESS_TOKEN').toString() !==
            ''
        ) {
            var options = {
                method: 'get',
                headers: {
                    Authorization: 'Bearer ' +
                        PropertiesService.getScriptProperties()
                        .getProperty('LINE_CHANEL_ACCESS_TOKEN')
                        .toString(),
                },
            };

            let response = await UrlFetchApp.fetch(
                `https://api.line.me/v2/bot/group/${groupId}/member/${userId}`,
                options
            );
            return JSON.parse(response);
        } else {
            Logger.log('[getUserProfile()] : LINE_CHANEL_ACCESS_TOKEN empty.');
            return;
        }
    } catch (error) {
        Logger.log('[getUserProfile()] : error.');
    }
}

async function sendLineNotify(replyText) {
    if (
        String(
            PropertiesService.getScriptProperties().getProperty('LINE_NOTIFY_TOKEN').toString()
        ).trim() == ''
    ) {
        Logger.log('[sendLineNotify()] : empty line token.');
        return;
    }

    Logger.log('[sendLineNotify()] : starting function.');
    var formData = {
        message: replyText,
    };
    var options = {
        method: 'post',
        contentType: 'application/x-www-form-urlencoded',
        headers: {
            Authorization: 'Bearer ' +
                PropertiesService.getScriptProperties().getProperty('LINE_NOTIFY_TOKEN').toString(),
        },
        payload: formData,
    };

    let response = await UrlFetchApp.fetch(
        PropertiesService.getScriptProperties().getProperty('LINE_NOTIFY_URL').toString(),
        options
    );
    Logger.log('[sendLineNotify()] : response: ' + response);
}

function replyMessage(replytoken, replyText, type, items = []) {
    try {
        var response = UrlFetchApp.fetch(
            PropertiesService.getScriptProperties().getProperty('LINE_MESSAGE_REPLY_URL').toString(),
            replyMessageStructure(replytoken, replyText, type, items)
        );
    } catch (error) {
        Logger.log(error.name + '：' + error.message);
        return;
    }

    if (response.getResponseCode() === 200) {
        Logger.log('[replyMessage()] Sending message completed.');
    }
}

function replyMessageStructure(replytoken, replyText, type, items = []) {
    let messages = null;
    switch (type) {
        case MESSAGE_TYPE.NORMAL:
            messages = normalReplyMessage(replyText);
            break;
        case MESSAGE_TYPE.QUICKREPLY:
            messages = quickReplyMessage(replyText, items);
            break;
        default:
            messages = normalReplyMessage(replyText);
            break;
    }

    var lineHeader = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' +
            PropertiesService.getScriptProperties().getProperty('LINE_CHANEL_ACCESS_TOKEN').toString(),
    };

    var postData = {
        replyToken: replytoken,
        messages: messages,
    };

    var options = {
        method: 'POST',
        headers: lineHeader,
        payload: JSON.stringify(postData),
    };

    return options;
}

function normalReplyMessage(replyText) {
    try {
        let numOfslot = Math.ceil(replyText.length / 5000);
        var normalStructure = [];
        for (let i = 0; i < numOfslot; i++) {
            normalStructure.push({
                type: 'text',
                text: replyText.slice(
                    i * 5000,
                    replyText.length - i * 5000 >= 5000 ? (i + 1) * 5000 : replyText.length
                ),
            });
        }
    } catch (error) {
        Logger.log('normalReplyMessage() :' + error);
    }
    return normalStructure;
}

function quickReplyMessage(title, items) {
    let quickStructure = [{
        type: 'text',
        text: title,
        quickReply: {
            items: items,
        },
    }, ];

    return quickStructure;
}

function pushMessage(message, groupId = '') {
    if (groupId.trim() === '') {
        groupId = PropertiesService.getScriptProperties()
            .getProperty('LINE_DEFAULT_GROUP_ID')
            .toString();
    }
    var postData = {
        to: groupId,
        messages: [{
            type: 'text',
            text: message,
        }, ],
    };
    var options = {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' +
                PropertiesService.getScriptProperties().getProperty('LINE_CHANEL_ACCESS_TOKEN').toString(),
        },
        payload: JSON.stringify(postData),
    };
    UrlFetchApp.fetch(
        PropertiesService.getScriptProperties().getProperty('LINE_PUSH_MESSAGE_URL').toString(),
        options
    );
}

export { sendLineNotify, replyMessage, MESSAGE_TYPE, getUserProfile, pushMessage };