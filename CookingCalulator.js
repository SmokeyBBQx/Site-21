var ingredientValues = "";

function main(c) {

}

var techniques = [
    { name: "Roasting", complexity: 2, active: false },
    { name: "Grilling", complexity: 2, active: false },
    { name: "Baking", complexity: 2, active: false },
    { name: "Boiling", complexity: 1, active: false },
    { name: "Steaming", complexity: 1, active: false },
    { name: "Poaching", complexity: 2, active: false },
    { name: "Deep Frying", complexity: 3, active: false },
    { name: "Pan-Frying", complexity: 2, active: false },
    { name: "Stir-Frying", complexity: 3, active: false },
    { name: "Braise and Stew", complexity: 4, active: false },
    { name: "Steam and Finish", complexity: 3, active: false },
    { name: "Sear and Deglaze", complexity: 3, active: false },
    { name: "Dicing", complexity: 1, active: false },
    { name: "Julienne", complexity: 2, active: false },
    { name: "Chiffonade", complexity: 2, active: false },
    { name: "Whipping", complexity: 2, active: false },
    { name: "Beating", complexity: 1, active: false },
    { name: "Folding", complexity: 2, active: false },
    { name: "Dry Rub", complexity: 1, active: false },
    { name: "Brining", complexity: 2, active: false },
    { name: "Marinating", complexity: 2, active: false },
    { name: "Reduction", complexity: 2, active: false },
    { name: "Emulsification", complexity: 3, active: false },
    { name: "Beurre Blanc", complexity: 3, active: false },
    { name: "Chopped Herbs", complexity: 1, active: false },
    { name: "Citrus Zest", complexity: 1, active: false },
    { name: "Edible Flowers", complexity: 2, active: false },
    { name: "Swirls", complexity: 2, active: false },
    { name: "Stacking", complexity: 2, active: false },
    { name: "Negative Space", complexity: 3, active: false },
    { name: "Curing and Smoking", complexity: 4, active: false },
    { name: "Dehydrating and Infusing", complexity: 3, active: false },
    { name: "Fermenting and Pickling", complexity: 3, active: false },
    { name: "Sous Vide Cooking", complexity: 4, active: false },
    { name: "Tempering", complexity: 3, active: false },
    { name: "Flambéing", complexity: 3, active: false }
];

function onPlayerMessage(c) {
    var message = c.getValue("message");
    
    if (message.startsWith("!cook")) {
        c.cancel();
        openUI(c);
    }
}

function openUI(c) {
    var ui = pageOne(c);
    c.getSubject().openUI(ui)
}

function pageOne(c) {
    var ui = mappet.createUI(c, "handlerOne").background();
    
    var ingredient = ui.textbox().id("ingredients").tooltip("Ingredient Values (seperate by comma)");
    ingredient.rxy(0.5, 0.5).wh(160, 20).anchor(0.5);

    var complexityLabel = ui.label("Complexity Sum: 0").id("complexity-label");
    complexityLabel.rx(0.5).ry(0.5, 25).anchor(0.5).labelAnchor(0.5);
    
    var buttonConfirm = ui.button("Confirm").id("buttonConfirm");
    buttonConfirm.rxy(0.5, 0.6).wh(160, 20).anchor(0.5);
    
    for (var i = 0; i < techniques.length; i++) {
        var technique = techniques[i];
        technique = ui.toggle(technique.name, false).id(technique.name).tooltip("Complexity: " + technique.complexity);
        if (i < techniques.length/2) {
            technique.rxy(0.1, (i + 3)* 0.035).wh(160,20).anchor(0.5);
        }
        else {
            technique.rxy(0.3, (3+ i - techniques.length/2) * 0.035).wh(160,20).anchor(0.5);
        }
    }
    
    return ui;
}

function pageTwo(c) {
    var ui = mappet.createUI(c, "handlerTwo").background();
    
    var modifier = ui.textbox().id("modifierInput").tooltip("Skill Modifier");
    modifier.rxy(0.5, 0.5).wh(160,20).anchor(0.5);
    
    var buttonRoll = ui.button("Roll").id("buttonRoll");
    buttonRoll.rxy(0.5, 0.6).wh(160, 20).anchor(0.5);
    
    return ui;
}

function handlerOne(c) {
    var uiContext = c.getSubject().getUIContext();
    var data = uiContext.getData();
    
    if (uiContext.getLast() === "buttonConfirm") {
        ingredientValues = data.getString("ingredients");
    
        var ui = pageTwo(c);
        c.getSubject().openUI(ui);
    }
    
    for (var i = 0; i < techniques.length; i++) {
        var technique = techniques[i];
        
        if (uiContext.getLast() === technique.name) {
            technique.active = uiContext.getData().getBoolean(technique.name);
            break;
        }
    }    
    
    updateComplexityLabel(uiContext, c);
}

function handlerTwo(c) {
    var uiContext = c.getSubject().getUIContext();
    var data = uiContext.getData();
    
    var modifierInput = data.getString("modifierInput");
    var modifier = parseInt(modifierInput);
    var ingredientsString = ingredientValues;
    
    if (uiContext.getLast() === "buttonRoll") {
        var result = roll(1, 20);
        var skillCheck = 0;
        
        if (isNaN(modifier)) {
            skillCheck = result;
        } else {
            skillCheck = result + modifier;
        }
        
        var complexity = calculateComplexitySum(ingredientsString);
        var performance = skillCheck - complexity;
        var quality = performance + skillCheck;
        
        c.getSubject().send("Skillcheck: " + skillCheck);
        c.getSubject().send("Complexity: " + complexity);
        c.getSubject().send("Performance: " + performance);
        c.getSubject().send("Quality: " + quality);
        
        var qualityMessage = getCookingMessage(quality);
        c.send(c.getSubject().getName() + " has made a " + qualityMessage + " dish");
        
        c.getSubject().closeUI();
        ingredientValues = "";
    }
}

function getCookingMessage(quality) {
    if (quality < 0) {
        return "Inedible";
    } else if (quality >= 0 && quality <= 2) {
        return "Poor";
    } else if (quality >= 3 && quality <= 5) {
        return "Below Average";
    } else if (quality >= 6 && quality <= 8) {
        return "Average";
    } else if (quality >= 9 && quality <= 11) {
        return "Good";
    } else if (quality >= 12 && quality <= 14) {
        return "Very Good";
    } else if (quality >= 15 && quality <= 17) {
        return "Excellent";
    } else if (quality >= 18 && quality <= 20) {
        return "Gourmet";
    } else if (quality >= 21 && quality <= 22) {
        return "Artisan";
    } else if (quality >= 23 && quality <= 25) {
        return "Luxury";
    } else {
        return "Pinnacle";
    }
}

function updateComplexityLabel(uiContext, c) {
    var sum = calculateComplexitySum(uiContext.getData().getString("ingredients"));
    uiContext.get("complexity-label").label("Complexity Sum: " + sum);
}

function calculateComplexitySum(ingredientString) {
    var sum = 0;

    for (var i = 0; i < techniques.length; i++) {
        var technique = techniques[i];

        if (technique.active) {
            sum += technique.complexity;
        }
    }

    var ingredientValues = ingredientString.split(",");

    for (var i = 0; i < ingredientValues.length; i++) {
        var value = parseFloat(ingredientValues[i]);
        if (!isNaN(value)) {
            sum += value;
        }
    }

    return sum;
}

function roll(min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
