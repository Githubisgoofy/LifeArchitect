const state = {
    name: "Alex",
    gender: Math.random() > 0.5 ? "Male" : "Female",
    age: 0,
    money: 0,
    health: 100,
    happiness: 100,
    smarts: Math.floor(Math.random() * 50) + 20,
    looks: Math.floor(Math.random() * 60) + 20,
    job: "Unemployed",
    education: "None",
    partner: null,
    alive: true,
    history: []
};

// --- CORE ENGINE ---
const game = {
    start: function() {
        this.log(`👶 You were born! You are a ${state.gender}.`);
        ui.updateAvatar();
        ui.render();
    },

    ageUp: function() {
        if (!state.alive) return;
        state.age++;
        
        // Income
        if (state.job !== "Unemployed") {
            // Simplified salary logic
            let salary = state.job === "Janitor" ? 15000 : (state.job === "Brain Surgeon" ? 250000 : 0);
            state.money += salary;
        }

        // Stats Check
        if (state.health <= 0) {
            state.alive = false;
            ui.showPopup("Game Over", `You died at age ${state.age}.`, [{text: "RIP", action: null}]);
            return;
        }

        ui.updateAvatar();
        this.randomEvents();
        ui.render();
        ui.scrollToBottom();
    },

    randomEvents: function() {
        const r = Math.random();
        
        if (state.age === 6) this.log("🎒 Started Elementary School.", "good");
        if (state.age === 18) this.log("🎓 Graduated High School.", "good");

        // Random Popups using the new UI
        if (state.age > 5 && r < 0.1) {
            ui.showPopup("Class Clown", "A kid dared you to eat a worm.", [
                { text: "Eat it 🪱", action: () => { state.health -= 5; state.happiness += 10; game.log("You ate the worm. Gross but funny."); } },
                { text: "Refuse ✋", action: () => { state.happiness -= 5; game.log("You refused the dare."); } }
            ]);
        }
    },

    log: function(msg, type="neutral") {
        ui.addLog(msg, type);
    }
};

// --- ACTIONS ---
const actions = {
    job: function() {
        ui.showPopup("Job Center", "Select a career path:", [
            { text: "Janitor ($15k)", action: () => { state.job = "Janitor"; game.log("Hired as Janitor."); } },
            { text: "Brain Surgeon (Req: Smart)", action: () => { 
                if(state.smarts > 80) { state.job = "Brain Surgeon"; game.log("Hired as Surgeon!"); }
                else { ui.showPopup("Rejected", "You aren't smart enough!", [{text:"Okay", action:null}]); }
            }},
            { text: "Cancel", action: null }
        ]);
    },

    school: function() {
        ui.showPopup("Education", "University costs $20,000.", [
            { text: "Enroll ($20k)", action: () => {
                if(state.money >= 20000) { state.money -= 20000; state.smarts += 10; game.log("Enrolled in University."); }
                else { game.log("Too poor for school.", "bad"); }
            }},
            { text: "Study Hard (Free)", action: () => { state.smarts += 5; game.log("You studied hard."); } },
            { text: "Cancel", action: null }
        ]);
    },

    love: function() {
        if(state.age < 16) return ui.showPopup("Too Young", "Wait until you are 16.", [{text:"Okay", action:null}]);
        
        let lover = { name: "Sam", look: Math.floor(Math.random()*100) };
        ui.showPopup("Dating App", `You matched with ${lover.name}. Looks: ${lover.look}%`, [
            { text: "Ask Out 💘", action: () => { state.partner = lover; state.happiness += 20; game.log(`Dating ${lover.name}!", "good"); } },
            { text: "Swipe Left ❌", action: () => { game.log("You stayed single."); } }
        ]);
    },
    
    crime: function() {
         ui.showPopup("Life of Crime", "What do you want to do?", [
             { text: "Rob House (Risk: High)", action: () => {
                 if(Math.random() > 0.6) { state.money += 5000; game.log("Stole $5000!", "good"); }
                 else { state.happiness -= 20; game.log("Caught by police! Beat up.", "bad"); }
             }},
             { text: "Pickpocket (Risk: Low)", action: () => {
                 state.money += 100; game.log("Pickpocketed $100.");
             }},
             { text: "Cancel", action: null }
         ]);
    },

    assets: function() {
        ui.showPopup("Shopping", "Buy Assets:", [
            { text: "Buy Car ($20k)", action: () => { if(state.money>=20000){state.money-=20000; game.log("Bought a car!");} }},
            { text: "Cancel", action: null }
        ]);
    },
    
    activities: function() {
        ui.showPopup("Activities", "What to do?", [
            { text: "Go to Club", action: () => { state.happiness += 5; game.log("Partied at the club."); } },
            { text: "Gym", action: () => { state.health += 5; game.log("Worked out."); } },
            { text: "Plastic Surgery ($5k)", action: () => { 
                if(state.money>=5000){state.money-=5000; state.looks=100; game.log("You look amazing now!", "good");}
                else { game.log("Can't afford surgery."); }
            }},
            { text: "Cancel", action: null }
        ]);
    }
};

// --- UI HANDLERS ---
const ui = {
    render: function() {
        document.getElementById('header-age').innerText = "Age: " + state.age;
        document.getElementById('header-money').innerText = "$" + state.money.toLocaleString();
        
        // Bars
        document.getElementById('bar-health').style.width = state.health + "%";
        document.getElementById('bar-happy').style.width = state.happiness + "%";
        document.getElementById('bar-smarts').style.width = state.smarts + "%";
        document.getElementById('bar-looks').style.width = state.looks + "%";
    },

    updateAvatar: function() {
        const el = document.getElementById('avatar-display');
        if (state.age < 3) el.innerText = "👶";
        else if (state.age < 13) el.innerText = state.gender === "Male" ? "👦" : "👧";
        else if (state.age < 60) el.innerText = state.gender === "Male" ? "👨" : "👩";
        else el.innerText = state.gender === "Male" ? "👴" : "👵";
    },

    addLog: function(text, type) {
        const logBox = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `<b>${state.age}y:</b> ${text}`;
        logBox.appendChild(entry);
    },

    scrollToBottom: function() {
        const logBox = document.getElementById('game-log');
        logBox.scrollTop = logBox.scrollHeight;
    },

    // CUSTOM POPUP SYSTEM
    showPopup: function(title, text, buttons) {
        const overlay = document.getElementById('modal-overlay');
        const mTitle = document.getElementById('modal-title');
        const mText = document.getElementById('modal-text');
        const mBtns = document.getElementById('modal-buttons');

        mTitle.innerText = title;
        mText.innerText = text;
        mBtns.innerHTML = ""; // Clear old buttons

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.innerText = btn.text;
            button.className = "modal-btn btn-primary";
            if (btn.text.includes("Cancel")) button.className = "modal-btn btn-cancel";
            
            button.onclick = () => {
                if (btn.action) btn.action(); // Run code
                overlay.classList.add('hidden'); // Close modal
                ui.render();
            };
            mBtns.appendChild(button);
        });

        overlay.classList.remove('hidden');
    }
};

// Start
game.start();
        ui.scrollToBottom();
    },

    randomEvents: function() {
        const r = Math.random();
        if (state.age === 6) this.log("🎒 Started Elementary School.");
        if (state.age === 18) { this.log("🎓 Graduated High School."); state.education = "High School"; }
        
        if (r < 0.05) {
            state.health -= 10;
            this.log("🤒 You got sick. -10 Health");
        }
    },

    log: function(msg) {
        state.history.push({age: state.age, txt: msg});
        ui.addLog(msg);
    }
};

const actions = {
    school: function() {
        if(state.education === "University") return game.log("You already have a degree!");
        if (state.money >= 20000 && confirm("Go to University for $20k?")) {
            state.money -= 20000;
            state.education = "University";
            state.smarts += 15;
            game.log("🎓 Enrolled in University.");
        } else {
            game.log("❌ Can't afford tuition.");
        }
        ui.render();
    },

    job: function() {
        let choice = prompt("1. Janitor ($15k)\n2. Teacher ($40k, Req: Degree)\n3. Surgeon ($250k, Req: Degree + 90 Smarts)");
        if (choice === '1') { state.job = "Janitor"; state.salary = 15000; }
        else if (choice === '2' && state.education === "University") { state.job = "Teacher"; state.salary = 40000; }
        else if (choice === '3' && state.education === "University" && state.smarts >= 90) { state.job = "Surgeon"; state.salary = 250000; }
        else { return alert("You didn't get the job."); }
        game.log(`You were hired as a ${state.job}.`);
        ui.render();
    },

    love: function() {
        if(state.age < 16) return alert("Too young for the dating app.");
        
        // If single, find partner
        if (!state.partner) {
            let names = ["Sarah", "Jessica", "Emily", "Michael", "David", "Chris", "Ashley", "Amanda"];
            let randomName = names[Math.floor(Math.random() * names.length)];
            let randomLooks = Math.floor(Math.random() * 100);
            let randomSmarts = Math.floor(Math.random() * 100);
            
            let choice = confirm(`You found ${randomName} on the Dating App.\nLooks: ${randomLooks}\nSmarts: ${randomSmarts}\n\nAsk them out?`);
            
            if (choice) {
                if (Math.random() > 0.3) {
                    state.partner = { name: randomName, looks: randomLooks, smarts: randomSmarts, status: "Dating" };
                    state.happiness += 20;
                    game.log(`💘 You started dating ${randomName}!`);
                } else {
                    state.happiness -= 5;
                    game.log(`💔 ${randomName} rejected you.`);
                }
            }
        } 
        // If already dating, propose marriage
        else if (state.partner.status === "Dating") {
            if (confirm(`Propose to ${state.partner.name}? (Ring costs $5000)`)) {
                if (state.money < 5000) return alert("You can't afford a ring!");
                state.money -= 5000;
                
                if (Math.random() > 0.2) {
                    state.partner.status = "Married";
                    state.happiness += 50;
                    game.log(`💍 SHE SAID YES! You are now married to ${state.partner.name}.`);
                } else {
                    state.happiness -= 30;
                    state.partner = null;
                    game.log(`💔 Proposal rejected! She broke up with you.`);
                }
            }
        }
        else {
            alert(`You are happily married to ${state.partner.name}.`);
        }
        ui.render();
    },

    crime: function() {
        if (Math.random() > 0.6) {
            game.log("👮 You were caught! Went to jail.");
            state.job = "Unemployed";
            state.salary = 0;
        } else {
            let stolen = Math.floor(Math.random() * 1000) + 100;
            state.money += stolen;
            game.log(`🔫 Stole $${stolen}.`);
        }
        ui.render();
    },
    
    casino: function() {
        let bet = prompt("Bet amount:");
        bet = parseInt(bet);
        if (bet > state.money) return;
        if (Math.random() > 0.5) { state.money += bet; game.log(`🎰 Won $${bet}!`); }
        else { state.money -= bet; game.log(`🎰 Lost $${bet}.`); }
        ui.render();
    },

    doctor: function() {
        state.money -= 500; state.health = 100; game.log("🏥 Cured by doctor."); ui.render();
    },
    
    assets: function() {
         if(state.money >= 100000 && confirm("Buy Condo ($100k)?")) {
             state.money -= 100000; game.log("🏠 Bought a Condo!");
         }
         ui.render();
    },

    profile: function() {
        let pText = state.partner ? `${state.partner.name} (${state.partner.status})` : "Single";
        alert(`Name: ${state.name}\nJob: ${state.job}\nStatus: ${pText}`);
    }
};

const ui = {
    render: function() {
        document.getElementById('header-money').innerText = "$" + state.money.toLocaleString();
        document.getElementById('val-health').innerText = state.health + "%";
        document.getElementById('val-happy').innerText = state.happiness + "%";
        document.getElementById('val-smarts').innerText = state.smarts + "%";
        document.getElementById('val-looks').innerText = state.looks + "%";
        
        document.getElementById('bar-health').style.width = state.health + "%";
        document.getElementById('bar-happy').style.width = state.happiness + "%";
        document.getElementById('bar-smarts').style.width = state.smarts + "%";
        document.getElementById('bar-looks').style.width = state.looks + "%";
    },
    addLog: function(text) {
        const logBox = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = "log-entry";
        entry.innerHTML = `<span class='badge'>${state.age}y</span> ${text}`;
        logBox.appendChild(entry);
    },
    scrollToBottom: function() {
        const logBox = document.getElementById('game-log');
        logBox.scrollTop = logBox.scrollHeight;
    }
};

ui.render();
