/*  Skill Clicker by Michael Walsh
Some code might be messy, I'll go back and clean up later. Using both JQuery and Vanilla JS.

TEMP NOTES - You can ignore this! Unless you like spoilers :D
http://home.kpn.nl/vanadovv/BignumbyN.html
https://en.wikipedia.org/wiki/Mineral
https://en.wikipedia.org/wiki/Clay_minerals
https://en.wikipedia.org/wiki/Sulfate_minerals

$('#').effect("highlight", {
                color: 'red'
            });

=====================================================================================
GAME ENGINE: GLOBAL GAME DATA
=======================================================================================*/

//================================
//START LOAD TIMER (for debugging)
var system = {
    start: 0,
    end: 0,
    time: 0
}
system.start = new Date();
//================================

//version
var version = "0.0.5"; //update with releases MAJOR.MINOR.PATCH
var build = "17" //update each upload

//player data
var p = {
    name: "",
    level: 1,
    curXp: 0,
    nextXp: 0,
    multXp: 1,
    totalXp: 0
};

//skill data
var s = {
    excavation: {
        level: 1,
        curXp: 0,
        nextXp: 0,
        power: 1,
        chance: 100, //base chance, going down improves overall chance
        speed: 1,
        multXp: 1,
        totalXp: 0
    }
};

//game data
var g = {
    //resources
    r: {
        //ground materials
        dirt: {
            name: "Dirt",
            current: 0,
            total: 0
        },
        sand: {
            name: "Sand",
            current: 0,
            total: 0
        },
        gravel: {
            name: "Gravel",
            current: 0,
            total: 0
        },
        clay: {
            name: "Clay",
            current: 0,
            total: 0
        },
        //minerals and ores

        //crafting components
        fiber: {
            name: "Grass Fiber",
            current: 0,
            total: 0
        },
        twig: {
            name: "Twig",
            current: 0,
            total: 0
        },
        seed: {
            name: "Seed",
            current: 0,
            total: 0
        }
    }
};

/*=====================================================================================
GAME DATA: SAVE/LOAD/RESET & INITIALIZATION
=======================================================================================*/

//check for game initalization
function gameInitialization() {
    if (document.cookie != "") {
        console.log("Game Found, Loading Data.");
        loadGame(); //load game data
    } else {
        console.log("Game Data Not Found. Creating New Game State.");
        do {
            p.name = prompt('What do you wish to name your character?', 'Name');
        } while (p.name === null)
        saveGame();
        newsFeed(`You are ready to begin your adventure, <span style="color: orange">${p.name}</span>!`, 'blue');
    }
}

function windowLoad() {
    console.log(`Initializing Build Version: ${version} (${build})`);
    newsFeed(`[SYSTEM] Initializing Skill Clicker by blue -- Version: ${version} (${build})`, 'darkred');
    newsFeed('Join the official Skill Clicker Discord: <a href="https://discord.gg/jnK3ppW">https://discord.gg/jnK3ppW</a>', 'darkorange');
    gameInitialization();
    console.log("Game Initialization Complete!");
    gameTick(); //force tick to update values after initialization
}

//game initialize as soon as window loads
window.onload = windowLoad();

//auto save every 5 minutes
window.setInterval(function () {
    console.log("Begin Auto Save.");
    saveGame();
}, 300000);

//used to set data during game save
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

//used to load saved game data
function getCookie(cname, fallback) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return fallback;
}

//reset game data
function resetGame() {
    var r = confirm("WARNING: Confirming will erase all game data!");
    if (r == true) {
        var cookies = document.cookie.split(";");
        //sets cookies to expired so they can be cleared on reload
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        location.reload(); //force reload to initialize game and clear cookies
    } else {
        console.log("Game Reset Canceled.")
    }
}

//manual saving
function saveGame() {
    saveData();
    console.log("Game Save Complete!");
    newsFeed('Game saved!', 'blue');
}

//system save game data
function saveData() {
    //player stats
    setCookie("playerName", p.name, 9999); //player name
    setCookie("playerLevel", p.level, 9999); //player level
    setCookie("playerXp", p.curXp, 9999); //current player xp
    setCookie("playerTotalXp", p.totalXp, 9999); //total player xp
    //skill stats
    setCookie("excavationLevel", s.excavation.level, 9999); //excavation level
    setCookie("excavationXp", s.excavation.curXp, 9999); //current excavation xp
    setCookie("excavationTotalXp", s.excavation.totalXp, 9999); //total excavation xp
    //resources
    setCookie("dirtCurrent", g.r.dirt.current, 9999); //current dirt
    setCookie("dirtTotal", g.r.dirt.total, 9999); //total dirt

    setCookie("clayCurrent", g.r.clay.current, 9999); //current clay
    setCookie("clayTotal", g.r.clay.total, 9999); //total clay
    setCookie("fiberCurrent", g.r.fiber.current, 9999); //current fiber
    setCookie("fiberTotal", g.r.fiber.total, 9999); //total fiber
}

//load game data
function loadGame() {
    //player stats
    p.name = getCookie("playerName"); //player name
    p.level = parseFloat(getCookie("playerLevel")); //player level
    p.curXp = parseFloat(getCookie("playerXp", p.curXp)); //current player xp
    p.totalXp = parseFloat(getCookie("playerTotalXp", p.totalXp)); //total player xp
    //skill stats
    s.excavation.level = parseFloat(getCookie("excavationLevel", s.excavation.level)); //excavation level
    s.excavation.curXp = parseFloat(getCookie("excavationXp"), s.excavation.curXp); //current excavation xp
    s.excavation.totalXp = parseFloat(getCookie("excavationTotalXp", s.excavation.totalXp)); //total excavation xp
    //resources
    g.r.dirt.current = parseInt(getCookie("dirtCurrent", g.r.dirt.current)); //current dirt
    g.r.dirt.total = parseInt(getCookie("dirtTotal", g.r.dirt.total)); //total dirt

    g.r.clay.current = parseInt(getCookie("clayCurrent", g.r.clay.current)); //current clay
    g.r.clay.total = parseInt(getCookie("clayTotal", g.r.clay.total)); //total clay
    g.r.fiber.current = parseInt(getCookie("fiberCurrent", g.r.fiber.current)); //current fiber
    g.r.fiber.total = parseInt(getCookie("fiberTotal", g.r.fiber.total)); //total fiber
    console.log("Game Data Loaded");
    newsFeed(`Welcome back <span style="color: darkorange">${p.name}</span>!`, 'blue');
}

//rename character
function renameChar() {
    var newName = prompt('What do you wish to name your character?', 'Name');
    if (newName === null) {
        console.log('Canceled name change');
        newsFeed('Name change canceled.', 'darkred');
    } else {
        p.name = newName;
        saveGame();
        console.log(`name changed to ${p.name}`);
        newsFeed(`Your name changed, you will now be known as <span style="color: orange">${p.name}</span>!`, 'blue');
        gameTick();
    }
}

/*=====================================================================================
GAME ENGINE: UI FUNCTIONALITY
=======================================================================================*/

//resizes scroll bar for interfaces
function resizeScreen() {
    var usableHeight = window.innerHeight;
    var height = usableHeight - 226;
    $('#gameWindows').height(height);
    $('#resourceWindows').height(height + 20);
    $('#shopWindows').height(height);
}
window.onload = resizeScreen();
window.onresize = resizeScreen;

//footer info
$('#footerInfo').html(`Skill Clicker by blue -- Version: ${version} (${build}) -- <a target="_blank" href="https://discord.gg/jnK3ppW">Official Discord</a> -- <a target="_blank" href="https://github.com/blue1177/SkillClicker">Github</a> -- <a target="_blank" href="version.txt">Changelog</a> -- <a href="#" onclick="saveGame()">Save</a>`);

//info tab stuff
$('#gameVersion').html(version);
$('#gameBuild').html(build);

//collapse resource tiles
function collapseGroundResources() {
    $('#resourceGround').slideToggle(250);
}

function collapseCraftingResources() {
    $('#resourceCrafting').slideToggle(250);
}

/*=====================================================================================
GAME ENGINE: GAME TICK SYSTEM
=======================================================================================*/

//defines what a game tick does
function gameTick() {
    playerDataUpdate(); //update player data
    skillDataUpdate(); //update skill data
    resourceDataUpdate(); //update resource data
    levelUpCheck(); //check for level up
    levelUpSequence(); //leveling up sequence
    updateTooltips(); //update tooltip data
    console.log("Game Tick");
}

//do game tick every second
window.setInterval(function () {
    gameTick();
}, 1000);

//updates all player related data in game interface
function playerDataUpdate() {
    $('#playerName').html(p.name); //loads player name
    $('.playerLevel').html(p.level.toLocaleString()); //update level
    $('.playerCurXp').html(abbrNum(p.curXp)); //update current xp
    $('.playerNextXp').html(abbrNum(p.nextXp)); //update next level xp
    $('.playerTotalXp').html(abbrNum(p.totalXp)); //update total xp
    playerLevelBar(); //update player level bar
}

//updates value and progress on player level bar
function playerLevelBar() {
    var percent = ((p.curXp / p.nextXp) * 100);
    var value = +(percent.toFixed(2)) + "%";
    $('#playerLevelBar').css('width', value);
}

//update skill data
function skillDataUpdate() {
    //excavation
    $('.excavationLevel').html(s.excavation.level.toLocaleString()); //update excavaion level
    $('.excavationCurXp').html(abbrNum(s.excavation.curXp)); //update excavation current xp
    $('.excavationNextXp').html(abbrNum(s.excavation.nextXp)); //update excavation next level xp
    $('.excavationTotalXp').html(abbrNum(s.excavation.totalXp)); //update excavation total xp
}

//update resource data
function resourceDataUpdate() {
    //ground resources
    $('.dirtCurrent').html(abbrNum(g.r.dirt.current)); //update current dirt

    $('.clayCurrent').html(abbrNum(g.r.clay.current)); //update current clay
    $('.fiberCurrent').html(abbrNum(g.r.fiber.current)); //update current fiber
}

//update tooltips
function updateTooltips() {
    //skill tooltips
    tileExcavationInfo();
    //excavation tooltips
    dirtFieldInfo();
}

/*=====================================================================================
GAME ENGINE: CORE FUNCTIONALITY
=======================================================================================*/

//selects all classes and updates the value inputed, handles data by shortening large numbers
function abbrNum(v) {
    if (v >= Math.pow(10, 120)) {
        v = +(v / Math.pow(10, 120)).toFixed(3) + "NoT"; //Noventrigintillion
    }
    if (v >= Math.pow(10, 117)) {
        v = +(v / Math.pow(10, 117)).toFixed(3) + "OcT"; //Octotrigintillion
    }
    if (v >= Math.pow(10, 114)) {
        v = +(v / Math.pow(10, 114)).toFixed(3) + "SpT"; //Septentrigintillion
    }
    if (v >= Math.pow(10, 111)) {
        v = +(v / Math.pow(10, 111)).toFixed(3) + "SeT"; //Sestrigintillion
    }
    if (v >= Math.pow(10, 108)) {
        v = +(v / Math.pow(10, 108)).toFixed(3) + "QiT"; //Quinquatrigintillion
    }
    if (v >= Math.pow(10, 105)) {
        v = +(v / Math.pow(10, 105)).toFixed(3) + "QaT"; //Quattuortrigintillion
    }
    if (v >= Math.pow(10, 102)) {
        v = +(v / Math.pow(10, 102)).toFixed(3) + "TrT"; //Trestrigintillion
    }
    if (v >= Math.pow(10, 99)) {
        v = +(v / Math.pow(10, 99)).toFixed(3) + "DuT"; //Duotrigintillion
    }
    if (v >= Math.pow(10, 96)) {
        v = +(v / Math.pow(10, 96)).toFixed(3) + "UnT"; //Untrigintillion
    }
    if (v >= Math.pow(10, 93)) {
        v = +(v / Math.pow(10, 93)).toFixed(3) + "Ti"; //Trigintillion
    }
    if (v >= Math.pow(10, 90)) {
        v = +(v / Math.pow(10, 90)).toFixed(3) + "NoV"; //Novemvigintillion
    }
    if (v >= Math.pow(10, 87)) {
        v = +(v / Math.pow(10, 87)).toFixed(3) + "OcV"; //Octovigintillion
    }
    if (v >= Math.pow(10, 84)) {
        v = +(v / Math.pow(10, 84)).toFixed(3) + "SpV"; //Septemvigintillion
    }
    if (v >= Math.pow(10, 81)) {
        v = +(v / Math.pow(10, 81)).toFixed(3) + "SeV"; //Sesvigintillion
    }
    if (v >= Math.pow(10, 78)) {
        v = +(v / Math.pow(10, 78)).toFixed(3) + "QiV"; //Quinquavigintillion
    }
    if (v >= Math.pow(10, 75)) {
        v = +(v / Math.pow(10, 75)).toFixed(3) + "QaV"; //Quattuorvigintillion
    }
    if (v >= Math.pow(10, 72)) {
        v = +(v / Math.pow(10, 72)).toFixed(3) + "TrV"; //Tresvigintillion
    }
    if (v >= Math.pow(10, 69)) {
        v = +(v / Math.pow(10, 69)).toFixed(3) + "DuV"; //Duovigintillion
    }
    if (v >= Math.pow(10, 66)) {
        v = +(v / Math.pow(10, 66)).toFixed(3) + "UnV"; //Unvigintillion
    }
    if (v >= Math.pow(10, 63)) {
        v = +(v / Math.pow(10, 63)).toFixed(3) + "Vi"; //Vigintillion
    }
    if (v >= Math.pow(10, 60)) {
        v = +(v / Math.pow(10, 60)).toFixed(3) + "NoD"; //Novendecillion
    }
    if (v >= Math.pow(10, 57)) {
        v = +(v / Math.pow(10, 57)).toFixed(3) + "OcD"; //Octodecillion
    }
    if (v >= Math.pow(10, 54)) {
        v = +(v / Math.pow(10, 54)).toFixed(3) + "SpD"; //Septendecillion
    }
    if (v >= Math.pow(10, 51)) {
        v = +(v / Math.pow(10, 51)).toFixed(3) + "SxD"; //Sedecillion
    }
    if (v >= Math.pow(10, 48)) {
        v = +(v / Math.pow(10, 48)).toFixed(3) + "QiD"; //Quinquadecillion
    }
    if (v >= Math.pow(10, 45)) {
        v = +(v / Math.pow(10, 45)).toFixed(3) + "QaD"; //Quattuordecillion
    }
    if (v >= Math.pow(10, 42)) {
        v = +(v / Math.pow(10, 42)).toFixed(3) + "TrD"; //Tredecillion
    }
    if (v >= Math.pow(10, 39)) {
        v = +(v / Math.pow(10, 39)).toFixed(3) + "DoD"; //Duodecillion
    }
    if (v >= Math.pow(10, 36)) {
        v = +(v / Math.pow(10, 36)).toFixed(3) + "UnD"; //Undecillion
    }
    if (v >= Math.pow(10, 33)) {
        v = +(v / Math.pow(10, 33)).toFixed(3) + "Dc"; //Decillion
    }
    if (v >= Math.pow(10, 30)) {
        v = +(v / Math.pow(10, 30)).toFixed(3) + "No"; //Nonillion
    }
    if (v >= Math.pow(10, 27)) {
        v = +(v / Math.pow(10, 27)).toFixed(3) + "Oc"; //Octillion
    }
    if (v >= Math.pow(10, 24)) {
        v = +(v / Math.pow(10, 24)).toFixed(3) + "Sp"; //Septillion
    }
    if (v >= Math.pow(10, 21)) {
        v = +(v / Math.pow(10, 21)).toFixed(3) + "Sx"; //Sextillion
    }
    if (v >= Math.pow(10, 18)) {
        v = +(v / Math.pow(10, 18)).toFixed(3) + "Qi"; //Quintillion
    }
    if (v >= Math.pow(10, 15)) {
        v = +(v / Math.pow(10, 15)).toFixed(3) + "Qa"; //Quadrillion
    }
    if (v >= Math.pow(10, 12)) {
        v = +(v / Math.pow(10, 12)).toFixed(3) + "T"; //Trillion
    }
    if (v >= Math.pow(10, 9)) {
        v = +(v / Math.pow(10, 9)).toFixed(3) + "B"; //Billion
    }
    if (v >= Math.pow(10, 6)) {
        v = +(v / Math.pow(10, 6)).toFixed(3) + "M"; //Million
    }
    if (v >= Math.pow(10, 3)) {
        v = +(v / Math.pow(10, 3)).toFixed(3) + "K";
    }
    if (v < 1000) {
        v = +(v * 10 / 10).toFixed(2);
    }
    return v;
}

var newsConsole = 0;
//adds message to news feed -- requires msg + color
function newsFeed(message, color) {
    var d = new Date();
    var time = d.toLocaleTimeString();
    $('#console').prepend(`<p style="font-weight: bold; color: ${color};"><span style="color: black">[${time}]: </span>${message}</p>`);
    newsConsole++;
    //clear last news feed entry after 25 entries
    if (newsConsole >= 25) {
        $('#console p:last-child').remove();
        console.log('News overflow - removed oldest entry');
        newsConsole--;
    }
}

//rng function
function rng(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*=====================================================================================
GAME ENGINE: LEVELING FUNCTIONALITY
=======================================================================================*/

//level xp check sequence
function levelUpCheck() {
    xpPerCharLevel(); //player level check
    xpPerExcavationLevel(); //excavation level check
}

//level up sequence
function levelUpSequence() {
    playerLevelUpCheck(); //player level up
    excavationLevelUpCheck(); //excavation level up
}

//=================================================
//PLAYER LEVELING
//calculating xp for character level
function xpPerCharLevel() {
    p.nextXp = 10 * (p.level - 1 + (Math.pow(1.28, (p.level - 1))));
    $('.playerNextXp').html(abbrNum(p.nextXp)); //update xp display
}

//checks current player xp and if equal or greater initiates level up
function playerLevelUpCheck() {
    if (p.curXp >= p.nextXp) {
        p.level++;
        p.curXp = 0;
        console.log(`${p.name} achieved character level: ${p.level}`);
        newsFeed(`<span style="color: blue;">${p.name}</span> achieved character level <span style="color: darkorange;">${p.level}</span>.`, 'green');
        gameTick(); //force game tick to prevent xp overflow
    }
}

//=================================================
//EXCAVATION LEVELING
//calculating xp for excavation level
function xpPerExcavationLevel() {
    s.excavation.nextXp = 10 * (s.excavation.level - 1 + (Math.pow(1.15, (s.excavation.level - 1))));
    $('.excavationNextXp').html(abbrNum(s.excavation.nextXp)); //update xp display
}

//checks current excavation xp and if equal or greater initiates level up
function excavationLevelUpCheck() {
    if (s.excavation.curXp >= s.excavation.nextXp) {
        s.excavation.level++;
        $('#tileExcavation').effect("highlight", 3000);
        s.excavation.curXp = 0;
        console.log(`${p.name} achieved excavation level: ${s.excavation.level}`);
        newsFeed(`<span style="color: blue;">${p.name}</span> achieved excavation level <span style="color: darkorange;">${s.excavation.level}</span>.`, 'green');
        gameTick(); //force game tick to prevent xp overflow
    }
}

/*=====================================================================================
GAME ENGINE: GENERAL TOOLTIPS
=======================================================================================*/

function tileExcavationInfo() {
    var chance = 100 - s.excavation.chance;
    $('#tileExcavationInfoExtra').html(`
        <p>Power: <span style="color: red;">${s.excavation.power}</span></p>
        <p>Bonus Chance: <span style="color: darkblue;">${+(chance.toFixed(2))}%</span></p>
        <p>Speed Mult: <span style="color: goldenrod;">${(s.excavation.speed).toFixed(1)}x</span></p>
        <p>XP Mult: <span style="color: sienna;">${(s.excavation.multXp).toFixed(1)}x</span></p>
    `);
}

/*=====================================================================================
SKILL - GATHERING: EXCAVATION
=======================================================================================*/

//dirt field - lv1
var dirtFieldProgress, dirtFieldInterval, dirtFieldTimeStart, dirtFieldTimeEnd, dirtFieldTimeElapsed;

function excavateDirtField() { //starts cycle
    dirtFieldTimeStart = new Date();
    $('#dirtField').attr('disabled', 'disabled');
    dirtFieldProgress = 0;
    dirtFieldInterval = setInterval(function () {
        dirtFieldCycle();
    }, 5);
}

function dirtFieldCycle() { //progress and ends cycle at 100%
    if (dirtFieldProgress >= 100) {
        clearInterval(dirtFieldInterval);
        lootDirtField();
    } else {
        dirtFieldProgress += (1 * s.excavation.speed); //takes speed into account
        dirtFieldBar();
    }
}

function dirtFieldBar() { //updates progress bar on screen
    var percent;
    if (dirtFieldProgress > 100) { //prevents overflow of progress
        percent = 100;
    } else {
        percent = dirtFieldProgress;
    }
    var value = +(percent.toFixed(2)) + "%";
    $('#dirtFieldBar').css('width', value);
    $('#dirtFieldValue').text(value);
}

function lootDirtField() { //loot table
    var fail = s.excavation.chance - 75;
    var x = rng(0, 100);
    var pxp = (p.multXp * 0.4);
    var exp = (s.excavation.multXp * 0.8);
    console.log(`Rolled ${x} and needed ${fail}`);
    if (x <= fail) { //failed attempt - gain 25% xp
        p.curXp += (0.25 * pxp);
        p.totalXp += (0.25 * pxp);
        s.excavation.curXp += (0.25 * exp);
        s.excavation.totalXp += (0.25 * exp);
        newsFeed(
            `You failed to find anything of use, for your efforts you gain <span style="color: darkorange;">${+(0.25 * pxp)}</span> Player Xp and <span style="color: darkblue;">${+(0.25 * exp)}</span> Excavation Xp.`,
            'red'
        );
        console.log('Failed');
    } else { //successful attempt
        p.curXp += pxp;
        p.totalXp += pxp;
        s.excavation.curXp += exp;
        s.excavation.totalXp += exp;
        if (x >= 95) { //super lucky table
            var sDirt = Math.floor(rng(1, 5) * s.excavation.power);
            var sFiber = Math.floor(rng(1, 3) * s.excavation.power);
            var sClay = Math.floor(rng(1, 2) * s.excavation.power);
            g.r.dirt.current += sDirt;
            $('#tileDirt').effect("highlight");
            g.r.dirt.total += sDirt;
            g.r.fiber.current += sFiber;
            $('#tileFiber').effect("highlight");
            g.r.fiber.total += sFiber;
            g.r.clay.current += sClay;
            $('#tileClay').effect("highlight");
            g.r.clay.total += sClay;
            newsFeed(
                `While excavating you find <span style="color: brown;">${sDirt} ${g.r.dirt.name}</span>, <span style="color: green;">${sFiber} ${g.r.fiber.name}</span>, <span style="color: darkslategray;">${sClay} ${g.r.clay.name}</span> and gain <span style="color: darkorange;">${+(pxp).toFixed(2)}</span> Player Xp and <span style="color: darkblue;">${+(exp).toFixed(2)}</span> Excavation Xp.`,
                'blue'
            );
            console.log('Super Lucky!');
        } else if (x >= 75) { //lucky table
            var lDirt = Math.floor(rng(1, 3) * s.excavation.power);
            var lFiber = Math.floor(rng(1, 2) * s.excavation.power);
            g.r.dirt.current += lDirt;
            $('#tileDirt').effect("highlight");
            g.r.dirt.total += lDirt;
            g.r.fiber.current += lFiber;
            $('#tileFiber').effect("highlight");
            g.r.fiber.total += lFiber;
            newsFeed(
                `While excavating you find <span style="color: brown;">${lDirt} ${g.r.dirt.name}</span>, <span style="color: green;">${lFiber} ${g.r.fiber.name}</span> and gain <span style="color: darkorange;">${+(pxp).toFixed(2)}</span> Player Xp and <span style="color: darkblue;">${+(exp).toFixed(2)}</span> Excavation Xp.`,
                'blue'
            );
            console.log('Lucky!');
        } else { //normal table
            var nDirt = Math.floor(rng(1, 2) * s.excavation.power);
            g.r.dirt.current += nDirt;
            $('#tileDirt').effect("highlight");
            g.r.dirt.total += nDirt;
            console.log('Success');
            newsFeed(
                `While excavating you find <span style="color: brown;">${nDirt} ${g.r.dirt.name}</span> and gain <span style="color: darkorange;">${+(pxp).toFixed(2)}</span> Player Xp and <span style="color: darkblue;">${+(exp).toFixed(2)}</span> Excavation Xp.`,
                'blue'
            );
        }
    }
    $('#dirtField').removeAttr('disabled');
    dirtFieldTimeEnd = new Date();
    dirtFieldTimeElapsed = (dirtFieldTimeEnd - dirtFieldTimeStart) / 1000;
    console.log(`${dirtFieldTimeElapsed} Seconds`);
    gameTick();
}

function dirtFieldInfo() { //tooltip
    var fail = s.excavation.chance - 75;
    var pxp = (p.multXp * 0.4);
    var exp = (s.excavation.multXp * 0.8);
    if (dirtFieldTimeElapsed == undefined) {
        dirtFieldTimeElapsed = 0.5; //sets default time
    }
    $('#dirtFieldInfo').html(`
        <p style="font-size: 16px;">Dirt Field</p>
        <hr>
        <p>Excavation Lvl: <span style="color: purple;">1</span></p>
        <p>Player XP: <span style="color: blue;">${+(pxp).toFixed(2)}</span</p>
        <p>Excavation XP: <span style="color: green;">${+(exp).toFixed(2)}</span></p>
        <p>Resources:</p><p><span style="color: brown;">${g.r.dirt.name}</span>, <span style="color: green;">${g.r.fiber.name}</span>, <span style="color: darkslategray;">${g.r.clay.name}</span></p>
        <p>Fail Chance: <span style="color: darkorange;">${+(fail).toFixed(2)}%</span></p>
        <p>Rate: <span style="color: purple;">${+(dirtFieldTimeElapsed).toFixed(3)}s</span></p>
    `);
}

/*=====================================================================================
DEBUGGING
=======================================================================================*/

//custom error handler for logging
function errorLog() {
    console.log('Fatal ERROR');
    console.log('Please report to @blue#0859 on discord!')
    newsFeed('[SYSTEM] Fatal ERROR', 'darkred');
    newsFeed('[SYSTEM] Please report to @blue#0859 on discord!', 'darkred');
}

//used for incompleted objects, lets users know interaction works but has no function yet
function unfLog() {
    console.log('Unfinished Content. This is not a bug, function still in development!');
    newsFeed('[SYSTEM] Unfinished Content. This is not a bug, function still in development!', 'darkred');
}

//=================================================
gameTick(); //force tick on end of document load
saveData(); //force system save data to force new cookies to save
//=================================================
//END OF LOAD TIMER (for debugging)
system.end = new Date();
system.time = (system.end - system.start) / 1000;
console.log(`Game file loaded in ${system.time}s`)
//=================================================
