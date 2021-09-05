class Location {
  constructor({
    id,
    getDisplayName = function () {
      return id[0].toUpperCase() + id.slice(1);
    },
    getConnections = function () {
      return [];
    },
    dropPreposition = "at",
    getSentient = function () {
      return false;
    },
    getDescription,
    onEnterGameStateEffect,
    onExitGameStateEffect,
    onEnterItemLocationEffect,
    onExitItemLocationEffect,
    // payDescription,
    // payGameStateEffect,
    // payItemLocationEffect,
  }) {
    this.id = id;
    this.getDisplayName = getDisplayName;
    this.getSentient = getSentient;
    this.dropPreposition = dropPreposition;
    this.getConnections = getConnections;
    this.getDescription = getDescription;
    this.onEnterGameStateEffect = onEnterGameStateEffect;
    this.onExitGameStateEffect = onExitGameStateEffect;
    this.onEnterItemLocationEffect = onEnterItemLocationEffect;
    this.onExitItemLocationEffect = onExitItemLocationEffect;
  }
}

const blank = new Location({
  id: "blank",
  dropPreposition: "at",
  getConnections: function () {
    return [];
  },
  getDescription: function (props) {},
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const room = new Location({
  id: "room",
  getConnections: function () {
    return ["window", "wardrobe", "inn"];
  },
  dropPreposition: "in",
  getDescription: function (props) {
    let baseText =
      "You are in a room with a bed. A window faces the west. A wardrobe sits on the north side of the room, opposite a door. ";

    if (props.itemLocations.room.has("lute")) {
      baseText += "A lute leans against the bed. ";
    }

    if (props.gameState.fire) {
      baseText += "You smell fire and hear screams in the distance. ";
    }
    return baseText;
  },
});

const window = new Location({
  id: "window",
  getConnections: function () {
    return ["room"];
  },
  dropPreposition: "at", // todo could change to out and have anything dropped out any window end in location below
  getDescription: function (props) {
    return props.gameState.fire
      ? "Through the window, you see flames and smoke coming from a nearby mansion. A crowd has gathered in front of the mansion."
      : "Through the window, you see the charred remains of a nearby mansion.";
  },
});

const wardrobe = new Location({
  id: "wardrobe",
  getConnections: function () {
    return ["room", "mirror"];
  },
  dropPreposition: "in",
  getDescription: function (props) {
    return `Inside the wardrobe, there is a mirror ${
      props.itemLocations.wardrobe.has("clothes") ? "and a set of clothes" : ""
    }.`;
  },
});

const mirror = new Location({
  id: "mirror",
  getConnections: function () {
    return ["wardrobe"];
  },
  dropPreposition: "at",
  getDescription: function (props) {
    // todo could also handle poopy, singed
    return `${
      props.gameState.naked
        ? "You're naked!"
        : "You are quite good looking, if you say so yourself."
    }`;
  },
});

const inn = new Location({
  id: "inn",
  getDisplayName: function (props) {
    return `${props.playerLocation === "room" ? "Door" : "Inn"}`;
  },
  getConnections: function () {
    return ["room", "courtyard"];
  },
  dropPreposition: "in",
  getDescription: function (props) {
    return `You enter what appears to be the common room of an inn. ${
      props.itemLocations.inn.has("apple")
        ? "A complementary apple rests on the table. "
        : ""
    }${
      props.gameState.naked
        ? 'The inn keeper laughs, "Haven\'t you heard of clothes?!"'
        : ""
    }`;
  },
  onEnterGameStateEffect: function (props) {
    if (props.gameState.naked) {
      return { reputation: props.gameState.reputation - 1 };
    }
  },
});

const courtyard = new Location({
  id: "courtyard",
  getConnections: function () {
    return ["inn", "fountain", "smithy"];
  },
  dropPreposition: "in",
  getDescription: function (props) {
    return `You are in a small courtyard. The entrance to the inn sits at the north side. To the east you hear sounds of a blacksmith shop. To the west you see a fountain. ${
      props.gameState.fire
        ? "Beyond the fountain, you see flames and smoke. "
        : ""
    }${
      props.gameState.firstCourtyardEntry
        ? "An adolescent runs west to east, crying as they flee. They drop a handkerchief in their distress. "
        : ""
    }`;
  },
  onExitGameStateEffect: function (props) {
    if (props.gameState.firstCourtyardEntry) {
      return { firstCourtyardEntry: false };
    }
  },
});

const fountain = new Location({
  id: "fountain",
  dropPreposition: "in",
  getConnections: function () {
    return ["manor", "courtyard"];
  },
  getDescription: function (props) {
    let text =
      "You stand at the edge of a fountain. In the center is a statue of a dragon surrounded by cowering people. To the east is a courtyard. To the north is a manor. ";

    if (props.props.gameState.fire) {
      text += "The manor is on fire and surrounded by a crowd of people. ";
    } else {
      text += "The manor is a framework of charred wood.";
    }

    if (props.itemLocations.nursery.has("baby")) {
      text +=
        'You hear a voice sobbing, "My baby! My baby is trapped in the nursery."';
    }

    if (props.gameState.savedBaby && !props.gameState.receivedBabyReward) {
      if (props.gameState.babyCough) {
        text +=
          'You hear a voice: "My baby! You saved my baby! But my dear baby has a terrible cough from being carried through the smoke. Regardless, take this gold as thanks." As you take the gold and praise, you see the roof collapse. Finally, the crowd is able to douse the flames. ';
      } else {
        text +=
          'You hear a voice: "Thank you for saving my baby! Please take this gold as thanks." As you take the gold and praise, you see the roof collapse. Finally, the crowd is able to douse the flames.';
      }
    }
    return text;
  },
  onEnterGameStateEffect: function (props) {
    if (props.gameState.savedBaby && !props.gameState.receivedBabyReward) {
      return {
        gold: props.gameState.gold + 50,
        reputation: props.gameState.babyCough
          ? props.gameState.reputation + 1
          : props.gameState.reputation + 2,
      };
    }
  },
  onExitGameStateEffect: function (props) {
    if (props.gameState.savedBaby && !props.gameState.receivedBabyReward) {
      return { fire: false, receivedBabyReward: true };
    }
  },
  onEnterItemLocationEffect: function (props) {
    if (props.gameState.savedBaby && !props.gameState.receivedBabyReward) {
      return {
        item: "baby",
        oldLocation: "inventory",
        newLocation: "outOfPlay",
      };
    }
  },
  onExitItemLocationEffect: function (props) {},
});

const manor = new Location({
  id: "manor",
  dropPreposition: "in",
  getConnections: function () {
    return props.gameState.fire &&
      props.gameState.handkerchiefDamp &&
      props.gameState.masked
      ? ["fountain", "nursery"]
      : ["fountain"]; // todo allow to continue if not masked but developcough/lose reputation. todo could instead allow to continue if no fire but have manor collapse
  },
  getDescription: function (props) {
    let text = "";

    if (props.gameState.fire) {
      text += "You stand in the entrance of the burning manor. ";
    } else {
      text += "You stand in the charred remains of the manor. ";
    }

    if (props.itemLocations.nursery.has("baby")) {
      text += "You hear a baby crying upstairs. ";
    }

    if (
      props.gameState.fire &&
      (!props.gameState.handkerchiefDamp || !props.gameState.masked)
    ) {
      text +=
        "Your throat burns from the smoke and heat. You can't breath this air. ";
    }

    if (
      props.gameState.fire &&
      props.gameState.handkerchiefDamp &&
      props.gameState.masked
    ) {
      text +=
        "Although the smoke is thick, the damp handkerchief over your mouth helps you breath.";
    }

    return text;
  },
  onEnterGameStateEffect: function (props) {
    if (props.itemLocations.inventory.has("baby")) {
      return { babyCough: true };
    }
  },
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const nursery = new Location({
  id: "nursery",
  getDisplayName: function (props) {
    if (props.gameState.fire) {
      if (props.itemLocations.nursery.has("baby")) {
        return "You stand in a nursery. You see a baby wailing in the crib under an open window. The open window must be the only thing keeping the baby alive in this smoke. ";
      } else {
        return "You stand in a nursery with an empty crib. The fire continues to burn, pouring smoke into the room. ";
      }
    } else {
      return "You stand in the charred remains of a nursery.";
    }
  },
  dropPreposition: "in",
  getConnections: function () {
    return ["nurseryWindow", "manor"];
  },
  getDescription: function (props) {},
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const nurseryWindow = new Location({
  id: "nurseryWindow",
  getDisplayName: function (props) {
    return "Window";
  },
  dropPreposition: "at",
  getConnections: function () {
    return ["nursery"];
  },
  getDescription: function (props) {
    return props.gameState.fire
      ? "Below the window, you see the gathered crowd. "
      : "You see the charred remains of the manor below you. ";
  },
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const smithy = new Location({
  id: "blank",
  dropPreposition: "at",
  getConnections: function () {
    return ["courtyard", "blacksmith", "gate", "pasture"];
  },
  getDescription: function (props) {
    let text =
      "You stand in front of a blacksmith shop. To the north and south are city gates. To the west is a courtyard. The blacksmith is working inside the shop. ";

    if (props.itemLocations.smithy.has("sword")) {
      text +=
        "In front of the shop, you see a sword gleaming as if someone was recently polishing it.";
    }
    return text;
  },
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const blacksmith = new Location({
  id: "blacksmith",
  dropPreposition: "by",
  getConnections: function () {
    return ["smithy"];
  },
  getDescription: function (props) {
    let text = "The blacksmith looks up as you walk in. ";

    if (!props.gameState.ownSword && props.itemLocations.smithy.has("sword")) {
      text += `"Are you interested in buying that sword? It costs ${
        props.gameState.swordCost
      } gold${
        props.itemLocations.inventory.has("lute")
          ? " or I would trade it for your lute"
          : ""
      }. `;

      return text;
    }
  },
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const pasture = new Location({
  id: "pasture",
  getSentient: function () {
    return props.itemLocations.pasture.has("horse");
  },
  dropPreposition: "at",
  getConnections: function () {
    return ["smithy"];
  },
  getDescription: function (props) {
    let text =
      "You are standing in a wide field. There is no road in sight. To the north, you hear sounds of the blacksmith shop.";

    if (props.itemLocations.pasture.has("horse")) {
      text +=
        'A horse is grazing in the field. Its reins have come untied from the post. A sign reads: "Free horse (if you can catch it)."';
    }

    return text;
  },
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const gate = new Location({
  id: "gate",
  dropPreposition: "at",
  getConnections: function () {
    return ["adolescent", "smithy", "road"];
  },
  getDescription: function (props) {
    return `You are standing at the north gate. To the north, you see a road leading up a mountain. The adolescent that you saw earlier stands at the courtyard${
      !props.gameState.playedForAdolescent ? ", crying" : ""
    }.`;
  },
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const adolescent = new Location({
  id: "adolescent", // todo decide what to call
  getSentient: function () {
    return true;
  },
  dropPreposition: "by",
  getConnections: function () {
    return ["gate"];
  },
  getDescription: function (props) {}, // todo
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const road = new Location({
  // todo
  id: "road",
  dropPreposition: "on",
  getConnections: function () {
    return ["gate", "stream"];
  },
  getDescription: function (props) {},
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const stream = new Location({
  id: "stream",
  dropPreposition: "in",
  getConnections: function () {
    return ["road", "clearing"];
  },
  getDescription: function (props) {
    return "You come across a steam. It looks crossable by foot or by horse. On the north side, you see a bush full of berries. To the south, the road stretches back to the city.";
  },
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const clearing = new Location({
  id: "clearing",
  dropPreposition: "in",
  getConnections: function () {
    return ["wizard", "squirrel", "stream", "cliff"];
  },
  getDescription: function (props) {
    return `You stand in a clearing. A bush full of berries catches your eye. To the south, a stream burbles. To the north, you see a rocky cliff with a cave. A man stands in the middle of the clearing. His long white beard, pointed hat, and staff mark him as a wizard. ${
      props.gameState.squirrelDead
        ? "A dead squirrel lies at the base of a tree. "
        : "A squirrel scampers around a tree."
    }`;
  },
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const squirrel = new Location({
  id: "squirrel",
  getSentient: function () {
    return true;
  },
  dropPreposition: "by",
  getConnections: function () {
    return ["clearing"];
  },
  getDescription: function (props) {
    return props.gameState.squirrelDead
      ? "The squirrel lies dead on the ground."
      : "You approach the squirrel. It pauses, perhaps curious if you will feed it, before scampering up the tree.";
  },
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const wizard = new Location({
  id: "wizard",
  getSentient: function () {
    return true;
  },
  dropPreposition: "by",
  getConnections: function () {
    return ["clearing"];
  },
  getDescription: function (props) {
    // todo
    return "The wizard looks at you though bushy eyebrows.";
  },
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const cliff = new Location({
  id: "cliff",
  dropPreposition: "on",
  getConnections: function () {
    return props.itemLocations.inventory.has("horse")
      ? ["clearing"]
      : ["clearing", "caveEntrance"];
  },
  getDescription: function (props) {
    return props.itemLocations.inventory.has("horse")
      ? `The horse cannot make it up the rocky cliff. You must return to the clearing.`
      : `You scramble on the rocky cliff. Above you is the entrance to a cave. Below you is a clearing next to a stream.`;
  },
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const caveEntrance = new Location({
  id: "caveEntrance",
  getDisplayName: function (props) {
    return "Cave entrance";
  },
  dropPreposition: "at",
  getConnections: function () {
    return ["cliff", "lair", "puddle", "boulder", "dung"];
  },
  getDescription: function (props) {
    let text =
      "You stand in a large, foul smelling cavern. On the west side, there is a puddle of clear water, and a pile of dragon dung. To the east, there is an entrance to a room that glitters with gems and gold. To the south, you feel the fresh air from the cave entrance. ";

    if (!props.gameState.dragonAsleep) {
      text +=
        "You hear coins clanking from the east room, as if a large beast is rolling in piles of gold.";
    }

    if (!props.gameState.poopy && !props.gameState.dragonAsleep)
      text += 'From the east room, a voice booms "WHO DO I SMELL?"';

    return text;
  },
  onEnterGameStateEffect: function (props) {},
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const puddle = new Location({
  id: "puddle",
  dropPreposition: "in",
  getConnections: function () {
    return ["caveEntrance", "boulder", "dung"];
  },
  getDescription: function (props) {
    return `You stand at a puddle of clear water. Nearby, there is a large boulder and a pile of dragon dung. The cave entrance is on the opposite side of the room. 

    ${dragonDescription(props)}`;
  },
  onEnterGameStateEffect: function (props) {
    return {
      // always increase the time
      timeInCave: props.gameState.timeInCave + 1,
      // if dragon is not poisoned and time is enough to trigger dragon entry and you are not poopy+hidden, you get singed
      ...(!props.gameState.dragonPoisoned &&
        (props.gameState.timeInCave + 1) % 4 === 3 &&
        (!props.gameState.poopy || props.playerLocation !== "boulder") && {
          singeCount: props.gameState.singeCount + 1,
          reputation: props.gameState.reputation - 1,
        }),
    };
  },
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const boulder = new Location({
  id: "boulder",
  dropPreposition: "behind",
  getConnections: function () {
    return ["caveEntrance", "puddle", "dung"];
  },
  getDescription: function (props) {
    return `You walk behind the boulder. It seems large enough to hide your from sight. Nearby, there is a pile of dragon dung and a puddle of clear water. The cave entrance is on the opposite side of the room. 
      
    ${dragonDescription(props)}`;
  },
  onEnterGameStateEffect: function (props) {
    return {
      // always increase the time
      timeInCave: props.gameState.timeInCave + 1,
      // if dragon is not poisoned and time is enough to trigger dragon entry and you are not poopy+hidden, you get singed
      ...(!props.gameState.dragonPoisoned &&
        (props.gameState.timeInCave + 1) % 4 === 3 &&
        (!props.gameState.poopy || props.playerLocation !== "boulder") && {
          singeCount: props.gameState.singeCount + 1,
          reputation: props.gameState.reputation - 1,
        }),
      // if the berries are in the puddle and you are poopy_hidden, the dragon is poisoned
      ...(props.itemLocations.puddle.has("berries") &&
        props.gameState.poopy &&
        props.playerLocation === "boulder" && { dragonPoisoned: true }),
    };
  },
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const dung = new Location({
  id: "dung",
  dropPreposition: "in",
  getConnections: function () {
    return ["caveEntrance", "puddle", "boulder"];
  },
  getDescription: function (props) {
    return `You stand in front of a large puddle of dragon dung. The stench makes your eyes water. Nearby, there is a large boulder and a puddle of clear water. The cave entrance is on the opposite side of the room. 
      
    ${dragonDescription(props)}`;
  },
  onEnterGameStateEffect: function (props) {
    return {
      // always increase the time
      timeInCave: props.gameState.timeInCave + 1,
      // if dragon is not poisoned and time is enough to trigger dragon entry and you are not poopy+hidden, you get singed
      ...(!props.gameState.dragonPoisoned &&
        (props.gameState.timeInCave + 1) % 4 === 3 &&
        (!props.gameState.poopy || props.playerLocation !== "boulder") && {
          singeCount: props.gameState.singeCount + 1,
          reputation: props.gameState.reputation - 1,
        }),
    };
  },
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

const lair = new Location({
  id: "lair",
  dropPreposition: "in",
  getConnections: function () {
    return ["caveEntrance"];
  },
  getDescription: function (props) {
    let text = "You stand in a room full of gold and gems.";

    if (
      !props.gameState.dragonAsleep &&
      !props.gameState.dragonDead &&
      !props.gameState.dragonPoisoned
    ) {
      text +=
        "A dragon sits atop the pile of treasure. It shoots fire as you approach, singing you. You cannot go closer without getting burnt further. ";
    }

    if (props.gameState.dragonAsleep && !props.gameState.dragonDead) {
      text += "The dragon lies in a deep slumber atop the pile of treasure. ";
    }

    if (props.gameState.dragonDead) {
      text +=
        "The dragon's body lies top the pile of treasure, its head severed. ";
    }

    if (
      !props.gameState.dragonAsleep &&
      !props.gameState.dragonDead &&
      props.gameState.dragonPoisoned
    ) {
      text +=
        "The dragon looks half dead from the poison but still shoots flame as you approach it and its pile of treasure. The flame is no longer strong enough to harm you from the entrance to the lair, but it will surely singe you if you get closer. ";
    }

    return text;
  },
  onEnterGameStateEffect: function (props) {
    if (
      !props.gameState.dragonAsleep &&
      !props.gameState.dragonDead &&
      !props.gameState.dragonPoisoned
    ) {
      return {
        singeCount: props.gameState.singeCount + 1,
        reputation: props.gameState.reputation - 1,
      };
    }
  },
  onExitGameStateEffect: function (props) {},
  onEnterItemLocationEffect: function (props) {},
  onExitItemLocationEffect: function (props) {},
});

function dragonDescription(props) {
  const timeInterval = props.gameState.timeInCave % 4;

  let text = "";

  if (
    timeInterval === 3 ||
    (props.gameState.poopy &&
      props.playerLocation === "boulder" &&
      props.itemLocations.puddle.has("berries"))
  ) {
    text += "The dragon prowls into the cavern. ";
    // not poop and not hidden
    if (!props.gameState.poopy && props.playerLocation !== "boulder") {
      text += `"I KNEW I SMELT A HUMAN." The dragon singes you before you can fight or defend yourself. `;
    } // poop and not hidden
    else if (props.gameState.poopy && props.playerLocation !== "boulder") {
      text += `"YOU DO NOT SMELL LIKE A HUMAN BUT YOU LOOK LIKE ONE. The dragon singes you before you can fight or defend yourself. " `;
    } // not poop and hidden
    else if (!props.gameState.poopy && props.playerLocation === "boulder") {
      text += `"I SMELL A HUMAN SOMEWHERE NEARBY." The dragon peaks around the boulder and spots you. The dragon singes you before you can fight or defend yourself. `;
    } // poop and hidden
    else if (props.gameState.poopy && props.playerLocation === "boulder") {
      text += "It seems unaware of your location. ";
      // dragon drinks
      if (props.itemLocations.puddle.has("berries")) {
        text +=
          "The dragon drinks from the puddle. It starts foaming at the mouth. Enraged and in pain, it stumbles back to the lair.";
      } else {
        text += "The dragon drinks from the puddle, then returns to the lair.";
      }
    }
  } else if (timeInterval === 2) {
    text += "You hear the dragon just outside.";
  } else if (timeInterval === 1) {
    text +=
      "You hear coins clanking from the east room, as if a large beast is rising from a sea of treasure. ";
  }

  return text;
}

export const locations = {
  room: room,
  window: window,
  wardrobe: wardrobe,
  mirror: mirror,
  inn: inn,
  courtyard: courtyard,
  fountain: fountain,
  manor: manor,
  nursery: nursery,
  nurseryWindow: nurseryWindow,
  smithy: smithy,
  blacksmith: blacksmith,
  pasture: pasture,
  gate: gate,
  adolescent: adolescent,
  road: road,
  stream: stream,
  clearing: clearing,
  squirrel: squirrel,
  wizard: wizard,
  cliff: cliff,
  caveEntrance: caveEntrance,
  dung: dung,
  puddle: puddle,
  boulder: boulder,
  lair: lair,
};
export default {
  locations,
};