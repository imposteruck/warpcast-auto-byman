import axios from 'axios';
import { conf } from "./conf.js";


let tokenBarier, myFid;

try {
    tokenBarier = conf.barier;
    myFid = conf.myFid;
    console.log("get fid", myFid);
    console.log("get barier", tokenBarier);
} catch (e) {
    console.log("Terjadi pengecualian:", e);
}

const threshold = 1000;

const urlGetFollowers = "https://client.warpcast.com/v2/followers?fid={}&limit={}";
const urlGetFollowerCount = "https://client.warpcast.com/v2/profile-casts?fid={}&limit=1";
const urlFollow = "https://client.warpcast.com/v2/follows";

const headers = {
    'authority': 'client.warpcast.com',
    'accept': '*/*',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'authorization': 'Bearer ' + tokenBarier,
    'content-type': 'application/json; charset=utf-8',
    'fc-amplitude-device-id': 'RHcQ1GzjH-9qsvlnMlVriG',
    'fc-amplitude-session-id': '1707233061257',
    'if-none-match': 'W/"J+6FScokLa8cs2EWfP+Ka3mLI0A="',
    'origin': 'https://warpcast.com',
    'referer': 'https://warpcast.com/',
    'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
};

async function getListUserByFid(myFid) {
    const getFollowerCount = await setupRequest("GET", urlGetFollowerCount.replace("{}", myFid), headers);
    const fidUser = getFollowerCount.result.casts[0].author.displayName;
    console.log("jumlah follower", fidUser, getFollowerCount.result.casts[0].author.followerCount);
    const detailFollowers = await setupRequest("GET", urlGetFollowers.replace("{}", myFid).replace("{}", getFollowerCount.result.casts[0].author.followerCount), headers);
    return detailFollowers.result.users;
}

async function setupRequest(method, url, headers) {
    const response = await axios({
        method: method,
        url: url,
        headers: headers,
    });
    return response.data;
}


async function doLoop(users, followFollowing, unfollowNotFollow, followFidFollower) {
    for (const user of users) {
        const isFollowing = user.viewerContext.following;
        const isFollowedBy = user.viewerContext.followedBy;

        if (unfollowNotFollow) {
            if (isFollowing && !isFollowedBy) {
                console.log(user.displayName, "not follow you");
                if (user.followerCount < threshold) {
                    console.log("unfollow not airdrop project owner");
                    const payload = JSON.stringify({ "targetFid": user.fid });
                    const response = await axios.put(urlFollow, payload, { headers: headers });
                    console.log(response.data);
                }
            }
        } else if (followFollowing) {
            if (!isFollowing && isFollowedBy && myFid === "239815") {
                console.log("you didn't follow", user.displayName);
                const payload = JSON.stringify({ "targetFid": user.fid });
                const response = await axios.put(urlFollow, payload, { headers: headers });
                console.log(response.data);
            }
        } else if (followFidFollower) {
            if (!isFollowing) {
                console.log("you didn't follow", user.displayName);
                const payload = JSON.stringify({ "targetFid": user.fid });
                const response = await axios.put(urlFollow, payload, { headers: headers });
                console.log(response.data);
            }
        }

        if (isFollowing && isFollowedBy) {
            console.log("you're mutual", user.displayName);
        }
    }
}

async function runAutomation(menu) {
    try {
        if (menu === 1) {
            console.log("using Fid", conf.myFid);
            const users = await getListUserByFid(myFid);
            await doLoop(users, true, false, false);
        }else if (menu === 2){
            console.log("using Fid", conf.myFid);
            const users = await getListUserByFid(myFid);
            await doLoop(users, false, true, false);
        }else if (menu === 3){
            console.log("using Fid", conf.fidTarget);
            const users = await getListUserByFid(myFid);
            await doLoop(users, false, false, true);
        }else{
            console.log("do nothing")
        }
    } catch (e) {
        console.log("masuk except");
    }
}

(async () => {
    await runAutomation(1)
})();