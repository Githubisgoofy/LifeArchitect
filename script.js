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
    alive: true,
    retired: false,
    history: []
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
        const r = Math.random();
        
        if (state.age === 6) this.log("🎒 Started Elementary School.", "good");
        if (state.age === 18) this.log("🎓 Graduated High School.", "good");
        
        // Random inheritance
        if (r < 0.05 && state.age > 30) {
            let inheritance = Math.floor(Math.random() * 50000) + 10000;
            state.money += inheritance;
            this.log(`💰 An uncle left you $${inheritance} in their will!`, "good");
        }
        
        // Random accidents
        if (r < 0.08) {
            state.health -= 15;
            this.log("🚗 You got in an accident! -15 Health", "bad");
        }
        
        // Kids with partner
        if (state.partner && state.age > 25 && r < 0.1 && state.kids < 3) {
            state.kids++;
            state.happiness += 30;
            state.money -= 5000;
            this.log(`👶 You had a baby! +30 Happiness, -$5000`, "good");
        }
    },

    handleDeath: function() {
        state.alive = false;
        let cause = "natural causes";
        if (state.age < 30) cause = "a tragic accident";
        else if (state.health < -50) cause = "illness";
        else cause = "old age";
        
        ui.showPopup("💀 Game Over", `You died at age ${state.age} from ${cause}.\n\nFinal Net Worth: $${state.money}\nKids: ${state.kids}\nFame: ${state.fame}`, 
            [{ text: "Play Again", action: () => { location.reload(); } }]);
    },

    log: function(msg, type="neutral") {
        ui.addLog(msg, type);
    }
};

// --- ACTIONS ---
const actions = {
    job: function() {
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
        ui.showPopup("Education", "University costs $30,000.", [
            { text: "Enroll ($30k)", action: () => {
                if(state.money >= 30000) { 
                    state.money -= 30000; 
                    state.smarts += 20; 
                    game.log("Enrolled in University.", "good"); 
                } else { 
                    game.log("Too poor for school.", "bad"); 
                }
            }},
            { text: "Study Hard (Free)", action: () => { state.smarts += 5; game.log("You studied hard."); } },
            { text: "Cancel", action: null }
        ]);
    },

    love: function() {
        if(state.age < 16) return ui.showPopup("Too Young", "Wait until you are 16.", [{text:"Okay", action:null}]);
        
        let names = ["Alex", "Sam", "Jordan", "Casey", "Riley"];
        let lover = { name: names[Math.floor(Math.random() * names.length)], look: Math.floor(Math.random()*100) };
        
        ui.showPopup("Dating App", `Matched with ${lover.name}. Looks: ${lover.look}%`, [
            { text: "Ask Out 💘", action: () => { 
                if (Math.random() > 0.4) {
                    state.partner = lover;
                    state.happiness += 20;
                    game.log(`Dating ${lover.name}!`, "good");
                } else {
                    game.log(`${lover.name} rejected you.`, "bad");
                }
            }},
            { text: "Swipe Left ❌", action: () => { game.log("You stayed single."); } }
        ]);
    },
    
    crime: function() {
        ui.showPopup("Crime", "What's your move?", [
            { text: "Rob House", action: () => {
                if(Math.random() > 0.5) { 
                    state.money += 10000; 
                    game.log("Stole $10,000!", "good"); 
                } else { 
                    state.happiness -= 30; 
                    state.job = "Unemployed";
                    game.log("Caught! Prison time & fired.", "bad"); 
                }
            }},
            { text: "Pickpocket", action: () => {
                state.money += 500; 
                game.log("Pickpocketed $500.");
            }},
            { text: "Cancel", action: null }
        ]);
    },

    assets: function() {
        ui.showPopup("Shopping", "What to buy?", [
            { text: "Car ($25k)", action: () => { 
                if(state.money>=25000){
                    state.money-=25000; 
                    game.log("Bought a car!");
                } else game.log("Too poor!", "bad");
            }},
            { text: "House ($100k)", action: () => { 
                if(state.money>=100000){
                    state.money-=100000; 
                    game.log("Bought a house!", "good");
                } else game.log("Too poor!", "bad");
            }},
            { text: "Dog ($2k)", action: () => { 
                if(state.money>=2000){
                    state.money-=2000; 
                    state.pets.push("Dog");
                    state.happiness += 10;
                    game.log("Got a dog! +10 Happiness");
                } else game.log("Too poor!", "bad");
            }},
            { text: "Cancel", action: null }
        ]);
    },
    
    activities: function() {
        ui.showPopup("Activities", "What to do?", [
            { text: "Party", action: () => { state.happiness += 10; game.log("Great party! +10 Happy"); } },
            { text: "Gym", action: () => { state.health += 10; game.log("Worked out. +10 Health"); } },
            { text: "Plastic Surgery ($5k)", action: () => { 
                if(state.money>=5000){
                    state.money-=5000; 
                    state.looks=100; 
                    game.log("You look amazing now!", "good");
                }
            }},
            { text: "Therapy ($2k)", action: () => { 
                if(state.money>=2000){
                    state.money-=2000; 
                    state.happiness=100; 
                    game.log("Feeling much better!", "good");
                }
            }},
            { text: "Cancel", action: null }
        ]);
    }
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
        state.name = name;
        state.gender = this.selectedGender;
        game.start();
    },
    
    render: function() {
        document.getElementById('header-age').innerText = "Age: " + state.age;
        document.getElementById('header-money').innerText = "$" + state.money.toLocaleString();
        
        document.getElementById('bar-health').style.width = Math.max(0, state.health) + "%";
        document.getElementById('bar-happy').style.width = Math.max(0, state.happiness) + "%";
        document.getElementById('bar-smarts').style.width = Math.min(100, state.smarts) + "%";
        document.getElementById('bar-looks').style.width = Math.min(100, state.looks) + "%";
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
