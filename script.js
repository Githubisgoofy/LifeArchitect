const state = {
    name: "",
    gender: "",
    age: 0,
    money: 0,
    health: 100,
    happiness: 100,
    smarts: Math.floor(Math.random() * 50) + 20,
    looks: Math.floor(Math.random() * 60) + 20,
    job: "Unemployed",
    salary: 0,
    major: null,
    partner: null,
    kids: 0,
    pets: [],
    fame: 0,
    license: null,
    alive: true,
    retired: false,
    history: [],
    eventQueue: [],
    processingEvents: false
};

// --- CORE ENGINE ---
const game = {
    start: function() {
        if (!state.name || !state.gender) return;
        document.getElementById('char-creation').style.display = 'none';
        document.getElementById('game-screen').classList.remove('hidden');
        document.getElementById('header-name').innerText = state.name;
        this.log(`👶 You were born! Welcome to the world, ${state.name}.`, "good");
        ui.updateAvatar();
        ui.render();
    },

    ageUp: function() {
        if (!state.alive) return;
        state.age++;
        this.log(`🎂 You turned ${state.age} years old!`, "good");
        
        // Major selection at 18
        if (state.age === 18 && !state.major) {
            ui.showPopup("College Major", "Choose your major:", [
                { text: "Engineering (+Smarts)", action: () => { state.major = "Engineering"; state.smarts += 20; game.log("You chose Engineering!"); } },
                { text: "Business (+Fame)", action: () => { state.major = "Business"; state.fame += 10; game.log("You chose Business!"); } },
                { text: "Arts (+Looks)", action: () => { state.major = "Arts"; state.looks += 15; game.log("You chose Arts!"); } },
                { text: "Skip College", action: () => { game.log("You skipped college."); } }
            ]);
        }
        
        // Retirement at 65
        if (state.age >= 65 && !state.retired) {
            state.retired = true;
            state.salary = 0;
            this.log("🎉 You retired! You've earned a rest.", "good");
        }
        
        // Income
        if (!state.retired && state.salary > 0) {
            let tax = Math.floor(state.salary * 0.15);
            let net = state.salary - tax;
            state.money += net;
            this.log(`💼 Earned $${net} from work.`);
        }
        
        // Random life events
        this.randomEvents();
        
        // Stats decay
        if (state.age > 30) state.looks -= 1;
        if (state.age > 50) state.health -= 2;
        if (state.age > 70) state.health -= 5;
        
        // Check death
        if (state.health <= 0) {
            this.handleDeath();
            return;
        }
        
        ui.updateAvatar();
        ui.render();
        ui.scrollToBottom();
    },

    randomEvents: function() {
        state.eventQueue = [];
        
        // Check for milestones first
        let hasMilestone = false;
        if (state.age === 6) { state.eventQueue.push({text: "🎒 Started Elementary School.", type: "good"}); hasMilestone = true; }
        if (state.age === 18) { state.eventQueue.push({text: "🎓 Graduated High School.", type: "good"}); hasMilestone = true; }
        if (state.age === 21) { state.eventQueue.push({text: "🎉 You're officially an adult! Time to party!", type: "good"}); hasMilestone = true; }
        if (state.age === 30) { state.eventQueue.push({text: "📊 Halfway through your 30s! Reflect on your journey.", type: "neutral"}); hasMilestone = true; }
        if (state.age === 50) { state.eventQueue.push({text: "🎂 You hit the big 5-0! Still got it!", type: "good"}); hasMilestone = true; }
        
        // Only roll random events if there's NO milestone this age
        if (!hasMilestone) {
        const possibleEvents = [
            {
                chance: 0.04,
                condition: state.age > 30,
                effect: () => {
                    let inheritance = Math.floor(Math.random() * 50000) + 10000;
                    state.money += inheritance;
                    return `💰 A relative left you $${inheritance} in their will!`;
                },
                type: "good"
            },
            {
                chance: 0.03,
                condition: true,
                effect: () => {
                    let lottery = Math.floor(Math.random() * 100000) + 50000;
                    state.money += lottery;
                    return `🎰 Won lottery! +$${lottery}!`;
                },
                type: "good"
            },
            {
                chance: 0.05,
                condition: state.age >= 10,
                effect: () => {
                    let loss = Math.floor(Math.random() * 5000) + 1000;
                    state.money -= loss;
                    return `💸 Got pickpocketed! Lost $${loss}`;
                },
                type: "bad"
            },
            {
                chance: 0.03,
                condition: state.age >= 18,
                effect: () => {
                    state.money -= 2000;
                    return "⚖️ Paid unexpected legal fees -$2000";
                },
                type: "bad"
            },
            {
                chance: 0.07,
                condition: true,
                effect: () => {
                    state.health -= 15;
                    return "🚗 Car accident! -15 Health";
                },
                type: "bad"
            },
            {
                chance: 0.05,
                condition: true,
                effect: () => {
                    state.health -= 10;
                    return "🤒 Got the flu! -10 Health";
                },
                type: "bad"
            },
            {
                chance: 0.04,
                condition: true,
                effect: () => {
                    state.health += 20;
                    return "💪 Started an exercise routine! +20 Health";
                },
                type: "good"
            },
            {
                chance: 0.03,
                condition: true,
                effect: () => {
                    state.health -= 20;
                    state.money -= 5000;
                    return "🏥 Emergency hospital visit! -20 Health, -$5000";
                },
                type: "bad"
            },
            {
                chance: 0.02,
                condition: true,
                effect: () => {
                    state.health += 10;
                    return "😊 Feeling great today! +10 Health";
                },
                type: "good"
            },
            {
                chance: 0.06,
                condition: true,
                effect: () => {
                    state.happiness += 15;
                    return "🎊 Great day at work! +15 Happiness";
                },
                type: "good"
            },
            {
                chance: 0.05,
                condition: true,
                effect: () => {
                    state.happiness -= 15;
                    return "😞 Had a terrible day... -15 Happiness";
                },
                type: "bad"
            },
            {
                chance: 0.04,
                condition: true,
                effect: () => {
                    state.happiness += 10;
                    return "🎬 Watched a great movie! +10 Happiness";
                },
                type: "good"
            },
            {
                chance: 0.03,
                condition: true,
                effect: () => {
                    state.happiness -= 20;
                    return "💔 Relationship drama... -20 Happiness";
                },
                type: "bad"
            },
            {
                chance: 0.04,
                condition: true,
                effect: () => {
                    state.fame += 5;
                    return "📸 Went viral on social media! +5 Fame";
                },
                type: "good"
            },
            {
                chance: 0.03,
                condition: true,
                effect: () => {
                    state.fame += 10;
                    state.happiness += 20;
                    return "🌟 Became famous! +10 Fame, +20 Happiness";
                },
                type: "good"
            },
            {
                chance: 0.02,
                condition: true,
                effect: () => {
                    state.fame -= 5;
                    return "😬 Embarrassing incident... -5 Fame";
                },
                type: "bad"
            },
            {
                chance: 0.03,
                condition: true,
                effect: () => {
                    state.smarts += 5;
                    return "📚 Learned something new today! +5 Smarts";
                },
                type: "good"
            },
            {
                chance: 0.03,
                condition: true,
                effect: () => {
                    state.looks += 3;
                    return "💇 Got a makeover! +3 Looks";
                },
                type: "good"
            },
            {
                chance: 0.08,
                condition: state.partner && state.age > 25 && state.kids < 3,
                effect: () => {
                    state.kids++;
                    state.happiness += 30;
                    state.money -= 5000;
                    return "👶 You had a baby! +30 Happiness, -$5000";
                },
                type: "good"
            },
            {
                chance: 0.02,
                condition: state.partner,
                effect: () => {
                    state.happiness += 20;
                    return "💕 Romantic anniversary with " + state.partner + "! +20 Happiness";
                },
                type: "good"
            },
            {
                chance: 0.02,
                condition: state.partner,
                effect: () => {
                    state.partner = null;
                    state.happiness -= 30;
                    return "💔 Relationship ended! -30 Happiness";
                },
                type: "bad"
            },
            {
                chance: 0.02,
                condition: true,
                effect: () => {
                    state.money += 1000;
                    return "🎁 Found $1000 on the street!";
                },
                type: "good"
            },
            {
                chance: 0.02,
                condition: true,
                effect: () => {
                    state.happiness += 25;
                    return "🎉 Got invited to an amazing party! +25 Happiness";
                },
                type: "good"
            },
            {
                chance: 0.01,
                condition: true,
                effect: () => {
                    let winnings = Math.floor(Math.random() * 20000) + 10000;
                    state.money += winnings;
                    return "🏆 Won a competition! +$" + winnings;
                },
                type: "good"
            },
            {
                chance: 0.02,
                condition: true,
                effect: () => {
                    state.happiness += 5;
                    return "🐱 A stray cat followed you home today!";
                },
                type: "neutral"
            },
            {
                chance: 0.015,
                condition: true,
                effect: () => {
                    state.money -= 500;
                    return "🐝 Got stung by a bee! -$500 for medical care";
                },
                type: "bad"
            },
            {
                chance: 0.025,
                condition: state.age >= 16,
                effect: () => {
                    state.smarts -= 5;
                    state.happiness -= 10;
                    return "😵 Got too drunk last night! -5 Smarts, -10 Happiness";
                },
                type: "bad"
            },
            {
                chance: 0.02,
                condition: true,
                effect: () => {
                    state.health += 15;
                    return "🧘 Meditation and yoga session! +15 Health";
                },
                type: "good"
            },
            {
                chance: 0.015,
                condition: state.age >= 12,
                effect: () => {
                    state.happiness -= 10;
                    return "📱 Spent too much time on social media... -10 Happiness";
                },
                type: "bad"
            },
            {
                chance: 0.02,
                condition: state.age >= 16 && state.salary > 0,
                effect: () => {
                    state.money += 500;
                    return "💼 Got a bonus at work! +$500";
                },
                type: "good"
            }
        ];
        
        // Roll for events that trigger
        let triggeredEvents = [];
        for (let event of possibleEvents) {
            if (event.condition && Math.random() < event.chance) {
                triggeredEvents.push({
                    text: event.effect(),
                    type: event.type
                });
            }
        }
        
        // Limit to 0-1 random events per age (not counting milestones)
        if (triggeredEvents.length > 1) {
            // Shuffle and take top 1
            for (let i = triggeredEvents.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [triggeredEvents[i], triggeredEvents[j]] = [triggeredEvents[j], triggeredEvents[i]];
            }
            triggeredEvents = triggeredEvents.slice(0, 1);
        }
        
        // Add triggered events to queue
        state.eventQueue.push(...triggeredEvents);
        } // End of "if no milestone" block
        
        // Process queue (log events immediately, only 1 thing per age)
        for (let event of state.eventQueue) {
            this.log(event.text, event.type);
        }
    },

    handleDeath: function() {
        state.alive = false;
        let cause = "natural causes";
        if (state.age < 20) cause = "a tragic accident";
        else if (state.age < 35 && state.health <= 0) cause = "illness or accident";
        else if (state.health <= -50) cause = "severe illness";
        else if (state.age >= 100) cause = "extreme old age";
        else if (state.age >= 80) cause = "old age";
        else cause = "natural causes";
        
        const netWorth = Math.max(0, state.money);
        ui.showPopup("💀 Game Over", `You died at age ${state.age} from ${cause}.\n\nFinal Net Worth: $${netWorth.toLocaleString()}\nKids: ${state.kids}\nFame: ${state.fame}`, 
            [{ text: "Play Again", action: () => { location.reload(); } }]);
    },

    log: function(msg, type="neutral") {
        ui.addLog(msg, type);
    }
};

// --- ACTIONS ---
const actions = {
    job: function() {
        if(state.age < 16) return ui.showPopup("Too Young", "You must be at least 16 to work!", [{text:"Okay", action:null}]);
        
        let jobs = [
            { name: "Janitor", salary: 20000 },
            { name: "Barista", salary: 25000 },
            { name: "Teacher", salary: 50000, req: "smarts > 60" },
            { name: "Software Engineer", salary: 120000, req: "smarts > 80" },
            { name: "Doctor", salary: 200000, req: "smarts > 90" },
            { name: "CEO", salary: 250000, req: "fame > 30" },
            { name: "Actor", salary: 150000, req: "looks > 80" }
        ];
        
        let jobOptions = jobs.map(j => ({
            text: `${j.name} ($${j.salary/1000}k)`,
            action: () => {
                if (j.req) {
                    if (j.req.includes("smarts") && state.smarts < 60) return game.log("Not smart enough!", "bad");
                    if (j.req.includes("fame") && state.fame < 30) return game.log("Not famous enough!", "bad");
                    if (j.req.includes("looks") && state.looks < 80) return game.log("Not attractive enough!", "bad");
                }
                state.job = j.name;
                state.salary = j.salary;
                game.log(`Hired as ${j.name}!`, "good");
            }
        }));
        jobOptions.push({ text: "Cancel", action: null });
        
        ui.showPopup("Career", "Choose a job:", jobOptions);
    },

    school: function() {
        ui.showPopup("Education", "What to study?", [
            { text: "Enroll University ($30k)", action: () => { this.doUniversity(); }},
            { text: "Study Hard (Free)", action: () => { this.doStudy(); }},
            { text: "Cancel", action: null }
        ]);
    },

    doUniversity: function() {
        if(state.age < 18) return game.log("❌ You must be at least 18 for university!", "bad");
        if(state.money < 30000) return game.log("❌ Not enough money!", "bad");
        const outcomes = [
            () => { state.money -= 30000; state.smarts += 25; state.fame += 5; game.log("🎓 Graduated with honors! +25 Smarts, +5 Fame", "good"); },
            () => { state.money -= 30000; state.smarts += 15; game.log("📚 Got your degree! +15 Smarts", "good"); },
            () => { state.money -= 30000; state.smarts += 10; state.happiness -= 30; game.log("😫 Finished but miserable. +10 Smarts, -30 Happy", "neutral"); },
            () => { state.money -= 30000; state.smarts -= 5; game.log("🤦 Dropped out after first semester. -5 Smarts", "bad"); },
            () => { state.money -= 30000; state.smarts += 30; state.fame += 10; game.log("🌟 Top of your class! Legendary! +30 Smarts, +10 Fame", "good"); },
            () => { state.money -= 30000; state.smarts += 20; state.partner = "College Sweetheart"; state.happiness += 30; game.log("💕 Met your soulmate! +20 Smarts, +30 Happy", "good"); },
            () => { state.money -= 30000; state.smarts += 8; state.health -= 20; game.log("🤒 Got sick freshman year. +8 Smarts, -20 Health", "neutral"); },
            () => { state.money -= 30000; state.smarts += 12; state.looks += 3; game.log("💪 Fit and smart! +12 Smarts, +3 Looks", "good"); },
            () => { state.money -= 30000; state.smarts += 18; state.money += 50000; game.log("💼 Great internship! Got job offer! +18 Smarts, +$50k", "good"); },
            () => { state.money -= 30000; state.smarts += 14; state.happiness += 15; game.log("👥 Made lifelong friends! +14 Smarts, +15 Happy", "good"); }
        ];
        outcomes[Math.floor(Math.random() * outcomes.length)]();
    },

    doStudy: function() {
        const outcomes = [
            () => { state.smarts += 10; state.health -= 5; game.log("📖 Studied hard. Eyes sore. +10 Smarts, -5 Health", "good"); },
            () => { state.smarts += 8; game.log("✏️ Got some studying done. +8 Smarts", "good"); },
            () => { state.smarts += 3; state.happiness -= 20; game.log("😫 Studied but couldn't focus. +3 Smarts, -20 Happy", "bad"); },
            () => { state.smarts += 15; state.happiness += 10; game.log("🧠 Felt so smart! +15 Smarts, +10 Happy", "good"); },
            () => { state.smarts += 1; game.log("😴 Fell asleep while studying. +1 Smarts", "bad"); },
            () => { state.smarts += 12; state.fame += 2; game.log("⭐ Became known as the smart kid! +12 Smarts, +2 Fame", "good"); },
            () => { state.smarts += 7; state.health += 5; game.log("🧘 Studied with peaceful mind. +7 Smarts, +5 Health", "good"); },
            () => { state.smarts += 20; state.looks -= 5; game.log("🤓 Super focused! Looks neglected. +20 Smarts, -5 Looks", "neutral"); },
            () => { state.smarts -= 2; game.log("🎮 Got distracted by games. -2 Smarts", "bad"); },
            () => { state.smarts += 9; state.happiness += 8; game.log("📝 Productive session! +9 Smarts, +8 Happy", "good"); }
        ];
        outcomes[Math.floor(Math.random() * outcomes.length)]();
    },

    love: function() {
        if(state.age < 16) return ui.showPopup("Too Young", "Wait until you are 16.", [{text:"Okay", action:null}]);
        
        let names = ["Alex", "Sam", "Jordan", "Casey", "Riley", "Morgan", "Taylor", "Quinn"];
        let lover = { name: names[Math.floor(Math.random() * names.length)], look: Math.floor(Math.random()*100) };
        
        ui.showPopup("Dating App", `Matched with ${lover.name}. Looks: ${lover.look}%`, [
            { text: "Ask Out 💘", action: () => { this.doAskOut(lover); }},
            { text: "Swipe Left ❌", action: () => { game.log("You stayed single."); } }
        ]);
    },

    doAskOut: function(lover) {
        const outcomes = [
            () => { state.partner = lover.name; state.happiness += 25; game.log(`✨ ${lover.name} said YES! Congrats! +25 Happy`, "good"); },
            () => { state.partner = lover.name; state.happiness += 20; game.log(`💕 ${lover.name} is your partner now! +20 Happy`, "good"); },
            () => { state.happiness -= 15; game.log(`😢 ${lover.name} rejected you. -15 Happy`, "bad"); },
            () => { state.happiness -= 25; game.log(`😳 ${lover.name} blocked you! -25 Happy`, "bad"); },
            () => { state.partner = lover.name; state.happiness += 30; state.fame += 3; game.log(`🌟 ${lover.name} thinks you're amazing! +30 Happy, +3 Fame`, "good"); },
            () => { state.happiness -= 10; game.log(`😕 ${lover.name} said maybe later... -10 Happy`, "bad"); },
            () => { state.partner = lover.name; state.happiness += 15; game.log(`😊 ${lover.name} gave you a chance. +15 Happy`, "good"); },
            () => { state.happiness -= 30; state.looks -= 2; game.log(`😲 Humiliating rejection! -30 Happy, -2 Looks`, "bad"); },
            () => { state.partner = lover.name; state.happiness += 22; state.smarts -= 5; game.log(`🎉 Love makes you dumb but happy! ${lover.name} ❤️`, "good"); },
            () => { state.health += 10; state.happiness += 35; state.partner = lover.name; game.log(`🚀 Life-changing romance! +35 Happy, +10 Health`, "good"); }
        ];
        outcomes[Math.floor(Math.random() * outcomes.length)]();
    },
    
    crime: function() {
        if(state.age < 16) return ui.showPopup("Too Young", "You must be at least 16 to commit crimes!", [{text:"Okay", action:null}]);
        ui.showPopup("Crime", "What's your move?", [
            { text: "Rob House", action: () => { this.doRob(); }},
            { text: "Pickpocket", action: () => { this.doPickpocket(); }},
            { text: "Cancel", action: null }
        ]);
    },

    doRob: function() {
        const outcomes = [
            () => { state.money += 10000; game.log("💰 Robbed a mansion! +$10,000!", "good"); },
            () => { state.money += 5000; game.log("💼 Broke into an apartment! +$5,000", "good"); },
            () => { state.money -= 5000; state.happiness -= 30; state.job = "Unemployed"; game.log("🚨 Caught immediately! Prison time & fired! -$5000, -30 Happy", "bad"); },
            () => { state.health -= 20; game.log("🔫 Got shot by security! -20 Health", "bad"); },
            () => { state.money += 20000; state.fame += 10; game.log("🌟 Pulled off the heist of the century! +$20,000, +10 Fame", "good"); },
            () => { state.money += 1000; game.log("😒 Only found $1000. Weak haul. +$1000", "neutral"); },
            () => { state.health -= 5; state.money += 3000; game.log("🚪 Got into a fight but escaped! +$3000, -5 Health", "neutral"); },
            () => { state.money -= 10000; state.happiness -= 50; game.log("😱 Set off alarm and got arrested! Fine: -$10,000, -50 Happy", "bad"); },
            () => { state.money += 15000; state.happiness += 20; game.log("😎 Smooth criminal. +$15,000, +20 Happy", "good"); },
            () => { state.smarts -= 10; game.log("🤦 Got caught on camera by your own dumb mistake. Arrested!", "bad"); },
            () => { state.money += 7500; game.log("🎯 Targeted house was worth it! +$7,500", "good"); },
            () => { state.health -= 10; state.money += 8000; game.log("🥊 Brutal fight but won the loot! +$8000, -10 Health", "neutral"); },
            () => { state.money += 2000; state.fame += 3; game.log("🦸 Legendary criminal! +$2000, +3 Fame", "good"); },
            () => { state.health -= 25; game.log("💀 Nearly died during robbery! -25 Health", "bad"); },
            () => { state.money += 12000; state.looks += 2; game.log("💎 Stole valuable jewels! +$12,000, +2 Looks", "good"); }
        ];
        outcomes[Math.floor(Math.random() * outcomes.length)]();
    },

    doPickpocket: function() {
        const outcomes = [
            () => { state.money += 500; game.log("👜 Pickpocketed $500. Smooth.", "good"); },
            () => { state.money += 1000; game.log("💼 Got a fat wallet! +$1000", "good"); },
            () => { state.money -= 200; state.happiness -= 20; game.log("😬 Caught! Had to pay them back + fine. -$200, -20 Happy", "bad"); },
            () => { state.money += 200; game.log("🎒 Only got $200. Not worth it.", "neutral"); },
            () => { state.fame += 2; state.money += 750; game.log("🕵️ Legendary pickpocket! +$750, +2 Fame", "good"); },
            () => { state.money -= 500; game.log("👮 Got chased by police! Had to drop everything. -$500", "bad"); },
            () => { state.money += 300; state.happiness -= 10; game.log("😰 Got $300 but paranoid now. -10 Happy", "neutral"); },
            () => { state.money += 2000; game.log("🍀 Hit jackpot! +$2000!", "good"); },
            () => { state.health -= 5; state.money += 600; game.log("👊 Got punched but kept the money! +$600, -5 Health", "neutral"); },
            () => { state.money -= 1000; game.log("🚨 Arrested! Spent $1000 on bail. -$1000", "bad"); },
            () => { state.money += 800; game.log("💰 Nice score! +$800", "good"); },
            () => { state.money += 100; game.log("😅 Guy only had $100. Pathetic.", "bad"); },
            () => { state.smarts += 3; state.money += 1200; game.log("🧠 Used your brain! Perfect execution. +$1200, +3 Smarts", "good"); },
            () => { state.happiness -= 15; game.log("😔 Felt guilty. Couldn't enjoy it. -15 Happy", "bad"); },
            () => { state.money += 900; state.fame += 1; game.log("⭐ Street legend! +$900, +1 Fame", "good"); }
        ];
        outcomes[Math.floor(Math.random() * outcomes.length)]();
    },

    assets: function() {
        ui.showPopup("🛍️ Shopping", "What would you like to buy?", [
            { text: "🎫 Driver's License ($200)", action: () => { 
                if(state.age < 16) return game.log("Too young for license!", "bad");
                if(state.license) return game.log("You already have a license!", "bad");
                if(state.money < 200) return game.log("Not enough money!", "bad");
                ui.showPopup("Driving Test", "Answer 3 questions correctly to pass!\nYou have a 70% chance.", [
                    { text: "Take Test", action: () => {
                        const passed = Math.random() < 0.7;
                        if(passed) {
                            state.license = "Driver's License";
                            state.money -= 200;
                            game.log("✅ You passed! Got your license! 🎫", "good");
                        } else {
                            game.log("❌ Failed the test. Try again later.", "bad");
                        }
                    }},
                    { text: "Cancel", action: null }
                ]);
            }},
            { text: "🚗 Car ($25k)", action: () => { 
                if(!state.license) return game.log("❌ You need a driver's license first!", "bad");
                if(state.money < 25000) return game.log("❌ Not enough money!", "bad");
                state.money -= 25000; 
                game.log("Bought a sleek car! 🚗", "good");
            }},
            { text: "🏠 House ($100k)", action: () => { 
                if(state.money < 100000) return game.log("❌ Not enough money!", "bad");
                state.money -= 100000; 
                game.log("Bought a beautiful house! 🏠", "good");
            }},
            { text: "🐕 Dog ($2k)", action: () => { 
                if(state.money < 2000) return game.log("❌ Not enough money!", "bad");
                state.money -= 2000; 
                state.pets.push("Dog");
                state.happiness += 10;
                game.log("Got a cute dog! 🐕 +10 Happiness", "good");
            }},
            { text: "Cancel", action: null }
        ]);
    },
    
    activities: function() {
        ui.showPopup("Activities", "What to do?", [
            { text: "Party", action: () => { this.doParty(); } },
            { text: "Gym", action: () => { this.doGym(); } },
            { text: "Plastic Surgery ($5k)", action: () => { this.doPlasticSurgery(); }},
            { text: "Therapy ($2k)", action: () => { this.doTherapy(); }},
            { text: "Cancel", action: null }
        ]);
    },

    doParty: function() {
        if(state.age < 16) return game.log("❌ Too young to party! Come back at 16.", "bad");
        const outcomes = [
            () => { state.happiness += 20; state.health -= 5; game.log("🎉 Epic party! Everyone was dancing! +20 Happy", "good"); },
            () => { state.happiness += 15; game.log("🎊 Great music and friends! +15 Happy", "good"); },
            () => { state.happiness -= 10; game.log("😢 Party was boring and lame. -10 Happy", "bad"); },
            () => { state.health -= 10; state.happiness -= 10; game.log("🤮 Got too drunk, terrible hangover. -10 Health/Happy", "bad"); },
            () => { state.money -= 50; game.log("💸 Lost $50 to drunk gambling", "bad"); },
            () => { state.happiness += 25; state.fame += 5; game.log("⭐ Everyone wanted to talk to you! +25 Happy, +5 Fame", "good"); },
            () => { state.smarts -= 5; game.log("🍸 Brain cells lost to shots. -5 Smarts", "bad"); },
            () => { state.health -= 15; state.happiness += 20; game.log("🎸 Insane mosh pit! Bruised but happy. -15 Health, +20 Happy", "neutral"); },
            () => { state.looks += 2; game.log("💅 Got compliments on your outfit! +2 Looks", "good"); },
            () => { state.happiness -= 30; game.log("😳 Awkward situation... wanted to leave immediately. -30 Happy", "bad"); },
            () => { state.money -= 200; state.happiness -= 20; game.log("🚨 Got arrested for public intoxication! Lost $200, -20 Happy", "bad"); },
            () => { state.happiness += 30; state.fame += 3; game.log("🎤 Sang karaoke and killed it! +30 Happy, +3 Fame", "good"); },
            () => { state.health += 5; state.happiness += 10; game.log("🕺 Great dancing session! +5 Health, +10 Happy", "good"); },
            () => { state.happiness -= 5; game.log("😒 Spent whole time on phone. -5 Happy", "bad"); },
            () => { state.smarts += 3; state.happiness += 10; game.log("🧠 Met intelligent people, great conversations! +3 Smarts, +10 Happy", "good"); },
            () => { state.money += 100; game.log("🎰 Won money at beer pong! +$100", "good"); },
            () => { state.looks -= 3; state.happiness -= 10; game.log("🤕 Face-planted on the dance floor! -3 Looks, -10 Happy", "bad"); },
            () => { state.happiness += 15; game.log("💃 Danced until 3 AM! +15 Happy", "good"); },
            () => { state.health -= 8; game.log("🍻 Too much drinking. -8 Health", "bad"); },
            () => { state.fame += 2; game.log("📸 Got tagged in tons of party pics! +2 Fame", "good"); }
        ];
        outcomes[Math.floor(Math.random() * outcomes.length)]();
    },

    doGym: function() {
        const outcomes = [
            () => { state.health += 20; state.looks += 2; game.log("💪 Killer workout! Muscles growing! +20 Health, +2 Looks", "good"); },
            () => { state.health += 15; game.log("🏋️ Good gym session. +15 Health", "good"); },
            () => { state.health -= 10; state.smarts -= 5; game.log("🤯 Lifted too heavy and injured yourself! -10 Health, -5 Smarts", "bad"); },
            () => { state.health -= 5; game.log("😫 Sore and exhausted. -5 Health", "bad"); },
            () => { state.health += 25; state.happiness += 10; game.log("⚡ Best workout ever! Feel amazing! +25 Health, +10 Happy", "good"); },
            () => { state.health += 10; state.happiness += 5; game.log("😊 Gym cleared your mind. +10 Health, +5 Happy", "good"); },
            () => { state.money -= 1000; game.log("🏦 Gym membership overcharged you! -$1000", "bad"); },
            () => { state.looks += 5; state.health += 18; game.log("🔥 Getting shredded! +5 Looks, +18 Health", "good"); },
            () => { state.health -= 20; game.log("😵 Dehydrated and collapsed! -20 Health", "bad"); },
            () => { state.happiness += 15; state.health += 10; game.log("😍 Attractive person complimented you! +15 Happy, +10 Health boost", "good"); },
            () => { state.health += 8; game.log("🚴 Nice cardio session. +8 Health", "good"); },
            () => { state.health -= 3; game.log("🍎 Forgot to stretch. Minor soreness. -3 Health", "bad"); },
            () => { state.smarts -= 2; game.log("🤪 Gym bro brain. -2 Smarts", "bad"); },
            () => { state.fame += 3; game.log("⭐ Gym regulars know you! +3 Fame", "good"); },
            () => { state.happiness -= 15; game.log("😩 Trainer was a jerk. -15 Happy", "bad"); },
            () => { state.health += 12; state.looks += 1; game.log("🏃 Sprint workout done! +12 Health, +1 Looks", "good"); },
            () => { state.money += 50; game.log("💰 Found $50 in locker room! +$50", "good"); },
            () => { state.health -= 8; state.looks -= 2; game.log("🤢 Threw up during workout. -8 Health, -2 Looks", "bad"); },
            () => { state.health += 22; state.happiness += 8; game.log("🌟 Broke a personal record! +22 Health, +8 Happy", "good"); },
            () => { state.happiness += 10; game.log("👥 Made new gym buddies! +10 Happy", "good"); }
        ];
        outcomes[Math.floor(Math.random() * outcomes.length)]();
    },

    doPlasticSurgery: function() {
        if(state.age < 18) return game.log("❌ You must be at least 18 for plastic surgery!", "bad");
        if(state.money < 5000) return game.log("❌ Not enough money!", "bad");
        const outcomes = [
            () => { state.money -= 5000; state.looks = 100; state.happiness += 30; game.log("✨ You look absolutely stunning! +30 Happy, Looks: MAX", "good"); },
            () => { state.money -= 5000; state.looks = 95; state.happiness += 25; game.log("💫 Excellent results! +25 Happy", "good"); },
            () => { state.money -= 5000; state.looks = 75; state.happiness -= 20; game.log("😬 Botched job! Looks worse! -20 Happy", "bad"); },
            () => { state.money -= 5000; state.looks = 60; state.happiness -= 30; game.log("😱 Terrible surgery! What did they do?! -30 Happy", "bad"); },
            () => { state.money -= 5000; state.looks = 90; state.happiness += 20; state.fame += 5; game.log("🌟 New look = instant fame! +20 Happy, +5 Fame", "good"); },
            () => { state.money -= 5000; state.looks = 85; game.log("👍 Decent improvements. +Looks", "good"); },
            () => { state.money -= 5000; state.health -= 15; state.looks = 80; game.log("🏥 Some complications, but looks great. -15 Health", "neutral"); },
            () => { state.money -= 5000; state.looks = 92; state.happiness += 25; state.smarts -= 2; game.log("💅 Look amazing but feeling ditzy. -2 Smarts, +25 Happy", "neutral"); },
            () => { state.money -= 5000; state.looks = 70; game.log("🤷 Okay results. Nothing special.", "neutral"); },
            () => { state.money -= 5000; state.looks = 88; state.fame += 8; game.log("📸 Red carpet worthy! +8 Fame", "good"); }
        ];
        outcomes[Math.floor(Math.random() * outcomes.length)]();
    },

    doTherapy: function() {
        if(state.age < 13) return game.log("❌ You must be at least 13 for therapy!", "bad");
        if(state.money < 2000) return game.log("❌ Not enough money!", "bad");
        const outcomes = [
            () => { state.money -= 2000; state.happiness = 100; game.log("😌 Feel so much better! Problems solved! +100 Happy", "good"); },
            () => { state.money -= 2000; state.happiness += 30; game.log("☺️ Great session! Really helped. +30 Happy", "good"); },
            () => { state.money -= 2000; state.happiness -= 5; game.log("😒 Therapist sucks. -5 Happy", "bad"); },
            () => { state.money -= 2000; state.happiness += 40; state.smarts += 5; game.log("🧠 Gained real insights about yourself! +40 Happy, +5 Smarts", "good"); },
            () => { state.money -= 2000; state.happiness -= 20; game.log("😫 Dredged up old trauma. -20 Happy", "bad"); },
            () => { state.money -= 2000; state.happiness += 20; state.health += 10; game.log("🌟 Mental and physical health improved! +20 Happy, +10 Health", "good"); },
            () => { state.money -= 2000; game.log("🤐 Therapist didn't say much. No change.", "neutral"); },
            () => { state.money -= 2000; state.happiness += 25; state.fame -= 2; game.log("💭 Therapist gossiped about you. -2 Fame", "bad"); },
            () => { state.money -= 2000; state.happiness += 50; game.log("✨ Life-changing session! Everything makes sense now! +50 Happy", "good"); },
            () => { state.money -= 2000; state.happiness -= 10; state.smarts += 2; game.log("📖 Learned a lot but still sad. -10 Happy, +2 Smarts", "neutral"); }
        ];
        outcomes[Math.floor(Math.random() * outcomes.length)]();
    },
};

// --- UI HANDLERS ---
const ui = {
    selectedGender: null,
    
    selectGender: function(gender) {
        this.selectedGender = gender;
        document.querySelectorAll('.gender-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    },
    
    startGame: function() {
        let name = document.getElementById('char-name').value.trim();
        if (!name || !this.selectedGender) {
            alert("Please enter a name and select a gender!");
            return;
        }
        
        // Max length check
        if (name.length > 20) {
            alert("Name too long! Max 20 characters.");
            return;
        }
        
        // Only letters, numbers, and spaces allowed
        if (!/^[a-zA-Z0-9\s\-']+$/.test(name)) {
            alert("⚠️ Name can only contain letters, numbers, spaces, hyphens, and apostrophes.");
            return;
        }
        
        // Filter inappropriate content - STRICT CHECK
        const badWords = ["ass", "shit", "fuck", "bitch", "damn", "hell", "cunt", "dick", "pussy", "whore", "slut", "nigga", "nigger", "faggot", "retard", "piss", "cock", "twat", "bastard", "asshole", "dumbass"];
        const nameLower = name.toLowerCase();
        
        for (let word of badWords) {
            if (nameLower.includes(word)) {
                alert("⚠️ Name contains inappropriate content. Please choose another.");
                document.getElementById('char-name').value = "";
                return;
            }
        }
        
        state.name = name;
        state.gender = this.selectedGender;
        game.start();
    },
    
    render: function() {
        // Clamp all stats to valid ranges (0-100)
        state.health = Math.max(0, Math.min(100, state.health));
        state.happiness = Math.max(0, Math.min(100, state.happiness));
        state.smarts = Math.max(0, Math.min(100, state.smarts));
        state.looks = Math.max(0, Math.min(100, state.looks));
        state.money = Math.max(0, state.money); // Money can't go negative
        state.fame = Math.max(0, state.fame); // Fame can't go negative
        
        document.getElementById('header-age').innerText = "Age: " + state.age;
        document.getElementById('header-money').innerText = "$" + state.money.toLocaleString();
        
        document.getElementById('bar-health').style.width = state.health + "%";
        document.getElementById('bar-happy').style.width = state.happiness + "%";
        document.getElementById('bar-smarts').style.width = state.smarts + "%";
        document.getElementById('bar-looks').style.width = state.looks + "%";
    },

    updateAvatar: function() {
        const el = document.getElementById('avatar-display');
        if (state.age < 5) el.innerText = "👶";
        else if (state.age < 13) el.innerText = state.gender === "Male" ? "👦" : "👧";
        else if (state.age < 25) el.innerText = state.gender === "Male" ? "🧑" : "👩";
        else if (state.age < 60) el.innerText = state.gender === "Male" ? "👨" : "👩";
        else el.innerText = state.gender === "Male" ? "👴" : "👵";
    },

    addLog: function(text, type) {
        const logBox = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `<b>${state.age}y:</b> ${text}`;
        logBox.appendChild(entry);
        
        // Limit log entries to 30 - FIXED LOGIC
        let entries = logBox.querySelectorAll('.log-entry');
        while (entries.length > 30) {
            entries[0].remove();
            entries = logBox.querySelectorAll('.log-entry');
        }
        
        // Auto-scroll to bottom immediately
        logBox.scrollTop = logBox.scrollHeight;
        
        this.playSound();
    },

    scrollToBottom: function() {
        const logBox = document.getElementById('game-log');
        setTimeout(() => { logBox.scrollTop = logBox.scrollHeight; }, 10);
    },

    playSound: function() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch(e) {}
    },

    showPopup: function(title, text, buttons) {
        const overlay = document.getElementById('modal-overlay');
        const mTitle = document.getElementById('modal-title');
        const mText = document.getElementById('modal-text');
        const mBtns = document.getElementById('modal-buttons');

        mTitle.innerText = title;
        mText.innerText = text;
        mBtns.innerHTML = "";

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.innerText = btn.text;
            button.className = "modal-btn btn-primary";
            if (btn.text.includes("Cancel")) button.className = "modal-btn btn-cancel";
            
            button.onclick = () => {
                if (btn.action) btn.action();
                overlay.classList.add('hidden');
                ui.render();
            };
            mBtns.appendChild(button);
        });

        overlay.classList.remove('hidden');
    }
};
