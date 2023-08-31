function main(c) {

}

var ingredients = [];
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
    inventoryReader(c);
    var ui = pageOne(c);
    c.getSubject().openUI(ui);
}

function inventoryReader(c) {
    var inventory = c.getSubject().getInventory();
    
    for (var i = 0; i < inventory.size(); i++) {
        var item = inventory.getStack(i);
        var loreList = item.getLoreList();
        var itemName = item.getDisplayName();
        
        for (var j = 0; j < loreList.size(); j++) {
            var loreLine = loreList.get(j);

            if (loreLine.startsWith("Food Quality:")) {
                var qualityNumber = parseFloat(loreLine.split(": ")[1]);

                if (!isNaN(qualityNumber)) {
                    ingredients.push({ name: itemName, quality: qualityNumber, active: false });
                }
            }
        }
    }
}

function pageOne(c) {
    var ui = mappet.createUI(c, "handlerOne").background();

    var complexityLabel = ui.label("Complexity Sum: 0").id("complexity-label");
    complexityLabel.rx(0.5).ry(0.5, 25).anchor(0.5).labelAnchor(0.5);
    
    var buttonConfirm = ui.button("Confirm").id("buttonConfirm");
    buttonConfirm.rxy(0.5, 0.6).wh(160, 20).anchor(0.5);
    
    for (var i = 0; i < techniques.length; i++) {
        var technique = techniques[i];
        technique = ui.toggle(technique.name, false).id(technique.name).tooltip("Complexity: " + technique.complexity);
        if (i < techniques.length/2) {
            technique.rxy(0.1, (i + 3) * 0.035).wh(160,20).anchor(0.5);
        } 
        else {
            technique.rxy(0.3, (3 + i - techniques.length/2) * 0.035).wh(160,20).anchor(0.5);
        }
    }
    
    for (var i = 0; i <ingredients.length; i++) {
        var ingredient = ingredients[i];
        ingredient = ui.toggle(ingredient.name, false).id(ingredient.name).tooltip("Quality: " + ingredient.quality);
        if (i < ingredients.length/2) {
            ingredient.rxy(0.7, (i + 3) * 0.035).wh(160,20).anchor(0.5);
        } 
        else {
            ingredient.rxy(0.9, (3 + i - ingredients.length/2) * 0.035).wh(160,20).anchor(0.5);
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
    
    if (uiContext.isClosed()) {
        ingredients = [];
    }
    
    if (uiContext.getLast() === "buttonConfirm") {
        var ui = pageTwo(c);
        c.getSubject().openUI(ui);
        useItem(c);
    }       
    
    for (var i = 0; i < techniques.length; i++) {
        var technique = techniques[i];
        
        if (uiContext.getLast() === technique.name) {
            technique.active = uiContext.getData().getBoolean(technique.name);
            break;
        }
    }    
    
    for (var i = 0; i < ingredients.length; i++) {
        var ingredient = ingredients[i];
        
        if (uiContext.getLast() === ingredient.name) {
            ingredient.active = uiContext.getData().getBoolean(ingredient.name);
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
    
    if (uiContext.getLast() === "buttonRoll") {
        var result = roll(1, 20);
        var skillCheck = 0;
        
        if (isNaN(modifier)) {
            skillCheck = result;
        } else {
            skillCheck = result + modifier;
        }
        
        var complexity = calculateComplexitySum();
        var performance = skillCheck - complexity;
        var quality = performance + skillCheck/2;
        
        c.getSubject().send("Skillcheck: " + skillCheck);
        c.getSubject().send("Complexity: " + complexity);
        c.getSubject().send("Performance: " + performance);
        c.getSubject().send("Quality: " + quality);
        
        var qualityMessage = getCookingMessage(quality);
        c.send(c.getSubject().getName() + " has made a " + qualityMessage + " dish");
        
        for (var i = 0; i < techniques.length; i++) {
        techniques[i].active = false;
        }
        ingredients = [];
        c.getSubject().closeUI();
    }
}

function useItem(c) {
    var inventory = c.getSubject().getInventory();

    var activeIngredients = [];
    for (var i = 0; i < ingredients.length; i++) {
        if (ingredients[i].active) {
            activeIngredients.push(ingredients[i]);
        }
    }

    for (var i = 0; i < activeIngredients.length; i++) {
        var activeIngredient = activeIngredients[i];
        
        for (var j = 0; j < inventory.size(); j++) {
            var item = inventory.getStack(j);

            if (item.getDisplayName() === activeIngredient.name) {
                var newCount = item.getCount() - 1;
                item.setCount(newCount);
                break;
            }
        }
    }
}


function getCookingMessage(quality) {
    if (quality < 0) {
        return "inedible";
    } else if (quality <= 2) {
        return "poor";
    } else if (quality <= 5) {
        return "below average";
    } else if (quality <= 8) {
        return "average";
    } else if (quality <= 11) {
        return "good";
    } else if (quality <= 14) {
        return "very good";
    } else if (quality <= 17) {
        return "excellent";
    } else if (quality <= 20) {
        return "gourmet";
    } else if (quality <= 23) {
        return "artisan";
    } else if (quality <= 26) {
        return "luxury";
    } else {
        return "pinnacle";
    }
}

function updateComplexityLabel(uiContext, c) {
    var sum = calculateComplexitySum(uiContext.getData().getString("ingredients"));
    uiContext.get("complexity-label").label("Complexity Sum: " + sum);
}

function calculateComplexitySum() {
    var sum = 0;

    for (var i = 0; i < techniques.length; i++) {
        var technique = techniques[i];

        if (technique.active) {
            sum += technique.complexity;
        }
    }

    for (var i = 0; i < ingredients.length; i++) {
        var ingredient = ingredients[i];
        
        if (ingredient.active) {
            sum += ingredient.quality;
        }
    }

    return sum;
}

function roll(min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
