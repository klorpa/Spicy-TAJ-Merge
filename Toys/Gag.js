
const GAG_TYPE_SPIDER_GAG = createToy('spider gag');
const GAG_TYPE_BALL_GAG = createToy('ball gag');
const GAG_TYPE_BUTTPLUG_GAG = createToy('buttplug');
const GAG_TYPE_INFLATABLE_GAG = createToy('inflatable gag');
const GAG_TYPE_DILDO_GAG = createToy('dildo gag');

let currentGagType = GAG_TYPE_BALL_GAG;

function isGaged() {
    return getVar(VARIABLE_IS_GAGED, false);
}

function setGaged(gaged) {
    return setVar(VARIABLE_IS_GAGED, gaged);
}

function hasBallGag() {
    return GAG_TYPE_BALL_GAG.hasToy();
}

function hasAnyGag() {
    return GAG_TYPE_SPIDER_GAG.hasToy() || GAG_TYPE_BALL_GAG.hasToy() || GAG_TYPE_INFLATABLE_GAG.hasToy() || GAG_TYPE_DILDO_GAG.hasToy();
}

function getRandomGag() {
    let gags = [];

    if(GAG_TYPE_DILDO_GAG.hasToy()) {
        gags.push(GAG_TYPE_DILDO_GAG);
    }

    if(GAG_TYPE_BALL_GAG.hasToy()) {
        gags.push(GAG_TYPE_BALL_GAG);
    }

    if(GAG_TYPE_INFLATABLE_GAG.hasToy()) {
        gags.push(GAG_TYPE_INFLATABLE_GAG);
    }

    if(GAG_TYPE_SPIDER_GAG.hasToy()) {
        gags.push(GAG_TYPE_SPIDER_GAG);
    }

    if(gags.length === 0) {
        return null;
    }

    return gags[randomInteger(0, gags.length - 1)];
}

function wantsToGagSub() {
    if(isGaged() || !hasAnyGag()) {
        return false;
    }

    return isAnnoyedByTalking() || isChance(20);
}

function decideGag(pain = false) {
    if(isGaged() || !hasAnyGag()) {
        return false;
    }

    if(isAnnoyedByTalking()) {
        sendMessageBasedOnSender('You know what %SlaveName%');

        if(pain) {
            sendMessageBasedOnSender('I am not in the mood to hear your whimpering %GeneralTime%');
        } else {
            //TODO: More?
            sendMessageBasedOnSender(random('I want you to shut your mouth', 'I want you to shut up', 'I want you to stop talking', 'I want you to be silent', 'I want some silence'));
            sendMessageBasedOnSender('And I just know a good way to accomplish this %Grin%');
        }

        selectAndPutInGag();
        return true;
    } else if(isChance(25)) {
        selectAndPutInGag();
        return true;
    }

    return false;
}

function selectGag() {
    let dildoGagChance = 0;

    if(GAG_TYPE_DILDO_GAG.hasToy()) {
        dildoGagChance += 25;

        if(isAnnoyedByTalking()) {
            dildoGagChance += 25;
        }
    }

    if(isChance(dildoGagChance)) {
        return GAG_TYPE_DILDO_GAG;
    } else if(feelsLikePunishingSlave() && GAG_TYPE_SPIDER_GAG.hasToy() || BODY_PART_TONGUE.currentClamps > 0 && isChance(15*getMood())) {
        return GAG_TYPE_SPIDER_GAG;
    }

    //TODO: Has used buttplug laying around?

    if(hasBallGag()) {
        return GAG_TYPE_BALL_GAG;
    } else {
        return getRandomGag();
    }
}

function selectAndPutInGag() {
    let gag = selectGag();

    //Right now spider gag is only picked if she wants to punish the slave but we might change that at some point
    return putInGag(gag, gag === GAG_TYPE_SPIDER_GAG);
}

function putInGag(gagType = GAG_TYPE_BALL_GAG, addPinToTongue = false) {
    if(!gagType.hasToy()) {
        gagType = selectGag();
    }

    if(addPinToTongue && BODY_PART_TONGUE.currentClamps === 0) {
        if(fetchToy('clothespin', undefined, 1)) {
            putClampsOn(1, BODY_PART_TONGUE, false, true);
        }
    }

    let keepPins = false;

    if(BODY_PART_TONGUE.currentClamps > 0 && !!addPinToTongue) {
        //Keep pin on and use spider gag
        if(GAG_TYPE_SPIDER_GAG.hasToy() && feelsLikePunishingSlave()) {
            gagType = GAG_TYPE_SPIDER_GAG;
            keepPins = true;
        } else {
            sendMessageBasedOnSender('%SlaveName%');
            sendMessageBasedOnSender('Remove all clamps from your tongue %EmoteHappy%', 5);
            BODY_PART_TONGUE.currentClamps = 0;
        }
    }

    if (!fetchToy(gagType.name)) {
        return false;
    }

    if(keepPins) {
        sendMessageBasedOnSender('And no, you won\'t be allowed to take those clothespins of your tongue');
        sendMessageBasedOnSender('They will stay where they are %Grin%');
        sendMessageBasedOnSender('That is why I made you get the spider gag anyway %Lol%');
        sendMessageBasedOnSender('You better make it work %EmoteHappy%');
    } else if(addPinToTongue) {
        sendMessageBasedOnSender('This is gonna be good');
        sendMessageBasedOnSender('Your tongue clipped with that pin and your gag pulling your mouth wide open %Grin%');
    }

    sendMessageBasedOnSender('Now put it in. Tell me when you are done %SlaveName%');
    waitForDone();

    currentGagType = gagType;

    return true;
}

function removeGag() {
    sendMessageBasedOnSender("%SlaveName% go ahead and remove that gag from your mouth");
    let answer = sendInput("Tell me when you are ready to continue");
    while(true) {
        if(answer.isLike("done", "yes")) {
            sendMessageBasedOnSender("%Good%");
            break;
        } else {
            sendMessageBasedOnSender("Have you removed the gag yet?");
            answer.loop();
        }
    }

    sendMessageBasedOnSender("Put the gag aside for now");
    setTempVar(VARIABLE_IS_GAGED, false);
}

function isGagPlay() {
    return getVar(VARIABLE_TOY_GAG_INTERACTION_MODE) === TOY_BOTH_MODE || getVar(VARIABLE_TOY_GAG_INTERACTION_MODE) === TOY_PLAY_MODE;
}

function isGagPunish() {
    return getVar(VARIABLE_TOY_GAG_INTERACTION_MODE) === TOY_BOTH_MODE || getVar(VARIABLE_TOY_GAG_INTERACTION_MODE) === TOY_PUNISHMENT_MODE;
}

function setupGags(domChose) {
    GAG_TYPE_BALL_GAG.askForToy();
    sendVirtualAssistantMessage(random("Okay then...", "Next...", "Let's see...", "Moving on..."));

    GAG_TYPE_SPIDER_GAG.askForToy();
    sendVirtualAssistantMessage(random("Okay then...", "Next...", "Let's see...", "Moving on..."));

    GAG_TYPE_DILDO_GAG.askForToy();
    sendVirtualAssistantMessage(random("Okay then...", "Next...", "Let's see...", "Moving on..."));

    GAG_TYPE_INFLATABLE_GAG.askForToy();
    sendVirtualAssistantMessage(random("Okay then...", "Next...", "Let's see...", "Moving on..."));

    askForToyUsage('gag', domChose);
}