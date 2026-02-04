const state = {
    name: "Alex",
    age: 0,
    money: 0,
    health: 100,
    happiness: 100,
    alive: true,
    history: []
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
    }
};

const ui = {
    render: function() {
        document.getElementById('disp-name').innerText = state.name + " (" + state.age + "y)";
        document.getElementById('disp-money').innerText = "Bank: $" + state.money;
        document.getElementById('disp-health').innerText = "Health: " + state.health + "%";
        document.getElementById('disp-happy').innerText = "Happy: " + state.happiness + "%";
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
