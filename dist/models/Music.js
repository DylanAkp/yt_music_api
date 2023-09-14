"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Music = void 0;
const requestManager_1 = require("../utils/requestManager");
class Music {
    constructor(data, autoMix) {
        this.artworks = data.artworks;
        this.id = data.id;
        this.title = data.title;
        this.artists = data.artists;
        this.duration = data.duration;
        this.typeVideo = data.type;
        this.browseId = data.browseId;
        this.isAudioOnly = data.type.includes('ATV');
        if (autoMix)
            this.autoMix = autoMix;
    }
    getLyrics() {
        return new Promise((resolve, reject) => {
            (0, requestManager_1.requestToYtApi)('browse', {
                browseId: this.browseId,
                context: { client: { clientVersion: "1.20230522.01.00", clientName: "WEB_REMIX" } }
            }).then((res) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                if (!((_e = (_d = (_c = (_b = (_a = res.data.contents) === null || _a === void 0 ? void 0 : _a.sectionListRenderer) === null || _b === void 0 ? void 0 : _b.contents) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.musicDescriptionShelfRenderer) === null || _e === void 0 ? void 0 : _e.description))
                    return reject(new NoLyrics((_k = (_j = (_h = (_g = (_f = res.data.contents) === null || _f === void 0 ? void 0 : _f.messageRenderer) === null || _g === void 0 ? void 0 : _g.text) === null || _h === void 0 ? void 0 : _h.runs) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.text));
                else {
                    const resolveData = new Lyrics();
                    resolveData.lyrics = res.data.contents.sectionListRenderer.contents[0].musicDescriptionShelfRenderer.description.runs[0].text;
                    resolveData.source = res.data.contents.sectionListRenderer.contents[0].musicDescriptionShelfRenderer.footer.runs[0].text.replace('Source: ', '');
                    resolve(resolveData);
                }
            }).catch(reject);
        });
    }
    getRelative() {
        return new Promise((resolve, reject) => {
        });
    }
}
exports.Music = Music;
function extractArtistData(data) {
    return data.longBylineText.runs.find((item) => { var _a, _b, _c, _d; return ((_d = (_c = (_b = (_a = item.navigationEndpoint) === null || _a === void 0 ? void 0 : _a.browseEndpoint) === null || _b === void 0 ? void 0 : _b.browseEndpointContextSupportedConfigs) === null || _c === void 0 ? void 0 : _c.browseEndpointContextMusicConfig) === null || _d === void 0 ? void 0 : _d.pageType) === 'MUSIC_PAGE_TYPE_ARTIST'; });
}
function timeToSec(time) {
    const time_split = time.split(':');
    let time_sec = 0;
    for (let i = 0; i < time_split.length; i++) {
        time_sec += parseInt(time_split[i]) * Math.pow(60, time_split.length - i - 1);
    }
    return time_sec;
}
class Lyrics {
}
class NoLyrics {
    constructor(message) {
        this.message = message;
        this.status = false;
    }
}
