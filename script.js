const state = {
    name: "Alex",
    age: 0,
    money: 0,
    health: 100,
    happiness: 100,
    smarts: Math.floor(Math.random() * 60) + 20,
    looks: Math.floor(Math.random() * 60) + 20,
    job: "Unemployed",
    salary: 0,
    education: "None",
    partner: null,  // New: Tracks who you are dating
    alive: true,
    history: []
};

const game = {
    ageUp: function() {
        if (!state.alive) return alert("You are dead. Reload to restart.");
        state.age++;
        
        // Income
        if (state.salary > 0) {
            let tax = Math.floor(state.salary * 0.2);
            let net = state.salary - tax;
            state.money += net;
            this.log(`Earned $${net} from work.`);
        }

        // Relationship Events
        if (state.partner) {
            if (Math.random() > 0.8) {
                state.happiness += 10;
                this.log(`❤️ You went on a romantic date with ${state.partner.name}.`);
            }
            if (Math.random() < 0.05) {
                this.log(`💔 ${state.partner.name} dumped you!`);
                state.partner = null;
                state.happiness -= 30;
            }
        }

        // Random Age Events
        this.randomEvents();

        // Stat Decay
        if(state.age > 30) state.looks -= 1;
        if(state.age > 60) state.health -= 2;

        ui.render();
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
