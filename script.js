const state = {
    name: "Alex",
    age: 0,
    money: 0,
    health: 100,
    happiness: 100,
    alive: true,
    history: [],
    job: null,
    crimes: 0,
    casinoWins: 0
};

const game = {
    init: function() {
        this.log("You were born. Welcome to the world, " + state.name + ".");
        ui.render();
    },
    ageUp: function() {
        if (!state.alive) return;
        state.age++;
        
        // Random Logic
        let eventRoll = Math.random();
        if (state.age === 6) this.log("You started Elementary School.");
        if (state.age === 18) this.log("You graduated High School.");
        
        if (eventRoll < 0.1) {
            state.health -= 10;
            state.happiness -= 15;
            this.log("You caught the flu! <span class='red'>-10 Health</span>");
        }
        if (state.age > 18) {
            state.money -= 100;
            this.log("Cost of living deduction. <span class='red'>-$100</span>");
        }
        if (state.health <= 0) {
            state.alive = false;
            this.log("<b class='red'>You have died. Game Over.</b>");
        }
        ui.render();
    },
    log: function(msg) {
        state.history.push({ age: state.age, text: msg });
        ui.addLog(state.age, msg);
    }
};

const actions = {
    askMoney: function() {
        if (!state.alive) return;
        if (state.age < 5) {
            game.log("You are too young to understand money.");
            return;
        }
        let amount = Math.floor(Math.random() * 50) + 10;
        state.money += amount;
        game.log("Your parents gave you $" + amount + ". <span class='green'>+$" + amount + "</span>");
        ui.render();
    },
    workout: function() {
        if (!state.alive) return;
        state.health = Math.min(100, state.health + 5);
        game.log("You had a good workout. <span class='green'>+Health</span>");
        ui.render();
    },
    getJob: function() {
        if (!state.alive || state.age < 16) {
            game.log("You must be at least 16 to work.");
            return;
        }
        const jobs = ["Barista", "Cashier", "Developer", "Teacher", "Doctor"];
        state.job = jobs[Math.floor(Math.random() * jobs.length)];
        game.log("You got a job as a " + state.job + "! <span class='green'>+Job</span>");
        ui.render();
    },
    work: function() {
        if (!state.alive || !state.job) {
            game.log("You need a job to work!");
            return;
        }
        let salary = Math.floor(Math.random() * 500) + 200;
        state.money += salary;
        state.happiness -= 5;
        game.log("You worked as a " + state.job + " and earned $" + salary + ". <span class='green'>+$" + salary + "</span> <span class='red'>-Happy</span>");
        ui.render();
    },
    playCasino: function() {
        if (!state.alive || state.money < 50) {
            game.log("You need at least $50 to play casino.");
            return;
        }
        let bet = 50;
        state.money -= bet;
        let won = Math.random() < 0.4;
        if (won) {
            let winnings = bet * 2;
            state.money += winnings;
            state.happiness += 10;
            state.casinoWins++;
            game.log("Lucky day! You won $" + winnings + " at the casino! <span class='green'>+$" + winnings + "</span>");
        } else {
            state.happiness -= 10;
            game.log("You lost $" + bet + " at the casino. <span class='red'>-$" + bet + "</span>");
        }
        ui.render();
    },
    commitCrime: function() {
        if (!state.alive || state.age < 18) {
            game.log("You're too young for crime.");
            return;
        }
        let caught = Math.random() < 0.5;
        if (!caught) {
            let loot = Math.floor(Math.random() * 1000) + 500;
            state.money += loot;
            state.crimes++;
            state.happiness += 15;
            game.log("You committed a crime and got away with $" + loot + "! <span class='green'>+$" + loot + "</span> <span class='red'>Crimes: " + state.crimes + "</span>");
        } else {
            state.health -= 20;
            state.money = Math.max(0, state.money - 500);
            game.log("You got caught! Police took your money and beat you up. <span class='red'>-$500 -20 Health</span>");
        }
        ui.render();
    }
};

const ui = {
    render: function() {
        document.getElementById('disp-name').innerText = state.name + " (" + state.age + "y) - " + (state.job || "No Job");
        document.getElementById('disp-money').innerText = "Bank: $" + state.money;
        document.getElementById('disp-health').innerText = "Health: " + state.health + "%";
        document.getElementById('disp-happy').innerText = "Happy: " + state.happiness + "% | Crimes: " + state.crimes;
    },
    addLog: function(age, text) {
        const logBox = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = "log-entry";
        entry.innerHTML = "<span class='age-badge'>" + age + "y</span> " + text;
        logBox.prepend(entry);
    }
};

game.init();
