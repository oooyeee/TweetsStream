import { AddRules, DeleteRules, GetRules, GetStream, GetTweetMatchingRuleIDs } from "./lib/api.js"
import keys from "./keys.json" assert {type: "json"}
import resources from "./res.test.json" assert {type: "json"}
import process from "process"

let q = await AddRules(keys.BEARER_TOKEN, { value: resources.rules[1].value })
console.log(q);


let currentRules = await GetRules(keys.BEARER_TOKEN)
console.log(currentRules);

// console.log("== DEL ==");
// let d = await DeleteRules(keys.BEARER_TOKEN, { Values: [resources.rules[1].value] })
// console.log(d);

// console.log(await GetRules(keys.BEARER_TOKEN));

// console.log("== END ==");

let [stream, fn_streamAbort] = await GetStream(keys.BEARER_TOKEN);

function Bot1(msg, forRuleID) {
    let usesRuleID = currentRules.find(rule => {
        return rule.value === resources.rules[1].value;
    }).id;

    if (forRuleID === usesRuleID) {
        console.log("bot 1 says: ", msg);
    }
}

function Bot2(msg, forRuleID) {
    let usesRuleID = 123123123;

    if (forRuleID == usesRuleID) {
        console.log("bot 2 says: ", msg);
    }
}

stream.on("message", (msg) => {
    console.log("== MSG ==");
    console.log(msg);
    
    let matchingRules = GetTweetMatchingRuleIDs(msg);
    matchingRules.forEach(ruleID => {
        Bot1(msg, ruleID);
        Bot2(msg, ruleID);
    })

    console.log(matchingRules);
});

process.on("SIGINT", async () => {
    console.log("Cleaning up all Twitter streaming rules.");
    fn_streamAbort();
    let rules = await GetRules(keys.BEARER_TOKEN);

    let ruleIDs = rules.map(rule => rule.id);

    let deletion = await DeleteRules(keys.BEARER_TOKEN, { IDs: ruleIDs });
    console.log("DELETION");
    console.log(deletion);
    console.log("=== Exiting ===");
    process.exit(1);
})