/**
 * Location Templates
 *
 * Pre-authored town layout templates with fixed SVG coordinates.
 * Each template provides a set of location slots with coordinate positions,
 * connection graphs, and name/description variants for variety.
 *
 * Variety comes from:
 * 1. Which template is selected (hub-and-spoke, linear-road, clustered)
 * 2. Which name/description variant is picked per slot (RNG-driven)
 */

/**
 * LocationSlot - A position in a layout template that can become a Location.
 * Each slot has a type, pre-computed SVG coordinates, connections to other slots,
 * and multiple name/description variants for procedural variety.
 */
export interface LocationSlot {
  type: string;
  nameVariants: string[];
  descriptionVariants: string[];
  x: number;
  y: number;
  connections: string[];
}

/**
 * LocationLayout - A complete town layout template.
 * Contains an ID and a set of location slots with their spatial arrangement.
 */
export interface LocationLayout {
  id: string;
  slots: LocationSlot[];
}

/**
 * LOCATION_TEMPLATES - 3 distinct town layout templates.
 * Each provides 6-8 location slots with pre-computed SVG coordinates
 * in the 0-1000 x, 0-800 y range.
 */
export const LOCATION_TEMPLATES: LocationLayout[] = [
  // 1. Hub-and-spoke: Central square connected to surrounding locations
  {
    id: 'hub-and-spoke',
    slots: [
      {
        type: 'gathering',
        nameVariants: ['Town Square', 'The Commons', 'Market Square'],
        descriptionVariants: [
          'The heart of town where paths converge and gossip flows',
          'A dusty square where the faithful gather after services',
          'The central clearing where all roads meet under a weathered signpost',
        ],
        x: 500,
        y: 400,
        connections: ['church', 'store', 'office', 'homestead-1', 'landmark'],
      },
      {
        type: 'church',
        nameVariants: ['The Chapel', 'Meeting House', 'House of Worship'],
        descriptionVariants: [
          'A modest house of worship with a single bell tower',
          'The wooden chapel where doctrine is spoken and sins confessed',
          'A whitewashed building where the faithful kneel each Sabbath',
        ],
        x: 500,
        y: 180,
        connections: ['gathering', 'outskirts-1'],
      },
      {
        type: 'store',
        nameVariants: ['General Store', 'Trading Post', 'Dry Goods'],
        descriptionVariants: [
          'Shelves of provisions and remedies line the dim interior',
          'A cramped shop smelling of lamp oil and dried herbs',
          'The only place for miles to buy what the land cannot provide',
        ],
        x: 280,
        y: 350,
        connections: ['gathering', 'homestead-2'],
      },
      {
        type: 'office',
        nameVariants: ["Sheriff's Office", 'The Jail', 'Lawman\'s Post'],
        descriptionVariants: [
          'A squat building with iron bars on the single window',
          'Order is kept here through threat more than justice',
          'The lawman watches the square from this vantage point',
        ],
        x: 720,
        y: 350,
        connections: ['gathering', 'outskirts-2'],
      },
      {
        type: 'homestead',
        nameVariants: ['The Homestead', 'Settler\'s Farm', 'The Farmstead'],
        descriptionVariants: [
          'A small farm on the edge of town, desperately kept',
          'Tired fences surround patchy crops and a weathered cabin',
          'The land here yields grudgingly, reflecting its keeper\'s struggle',
        ],
        x: 200,
        y: 550,
        connections: ['gathering', 'store'],
      },
      {
        type: 'landmark',
        nameVariants: ['The Well', 'The Crossroads', 'The Old Oak'],
        descriptionVariants: [
          'Where the town gathers water and gossip flows freely',
          'A junction marked by a crooked signpost pointing to nowhere good',
          'An ancient tree where the elders once held council',
        ],
        x: 650,
        y: 230,
        connections: ['gathering', 'church'],
      },
      {
        type: 'outskirts',
        nameVariants: ['Cemetery', 'The Burying Ground', 'Boot Hill'],
        descriptionVariants: [
          'The town buries its dead on this windswept hill',
          'Wooden crosses lean at angles in the dry earth',
          'Too many fresh graves for a town this size',
        ],
        x: 500,
        y: 50,
        connections: ['church'],
      },
      {
        type: 'homestead',
        nameVariants: ['The Widow\'s Cottage', 'Mourner\'s House', 'The Old Place'],
        descriptionVariants: [
          'A small dwelling set apart, curtains always drawn',
          'Grief hangs over this place like morning fog that never lifts',
          'A home that feels emptier than its walls should allow',
        ],
        x: 150,
        y: 250,
        connections: ['store'],
      },
      {
        type: 'outskirts',
        nameVariants: ['The Bluffs', 'Lookout Point', 'The Ridge'],
        descriptionVariants: [
          'High ground overlooking the town, exposed to the wind',
          'From here you can see who comes and goes on the only road',
          'A rocky outcrop where someone has worn a path from pacing',
        ],
        x: 850,
        y: 250,
        connections: ['office'],
      },
    ],
  },

  // 2. Linear-road: Main street with branching paths at ends
  {
    id: 'linear-road',
    slots: [
      {
        type: 'gathering',
        nameVariants: ['Main Street', 'The Thoroughfare', 'Wagon Road'],
        descriptionVariants: [
          'The single road through town, rutted by wagon wheels',
          'A dusty strip where all commerce and conflict passes through',
          'The only street worth naming, lined with buildings on each side',
        ],
        x: 500,
        y: 400,
        connections: ['store', 'office', 'church'],
      },
      {
        type: 'store',
        nameVariants: ['Mercantile', 'The Supply House', 'Provision Store'],
        descriptionVariants: [
          'A false-fronted building promising goods from back East',
          'The merchant watches every customer with calculating eyes',
          'Barrels and crates crowd the boardwalk outside',
        ],
        x: 300,
        y: 400,
        connections: ['gathering', 'homestead-1'],
      },
      {
        type: 'office',
        nameVariants: ['Marshal\'s Office', 'The Stockade', 'Peace Office'],
        descriptionVariants: [
          'A solid building with a rack of rifles visible through the window',
          'Justice is dispensed here quickly and without ceremony',
          'The law keeps long hours watching from this doorway',
        ],
        x: 700,
        y: 400,
        connections: ['gathering', 'outskirts-1'],
      },
      {
        type: 'church',
        nameVariants: ['The Tabernacle', 'Prayer Hall', 'The Sanctuary'],
        descriptionVariants: [
          'A tall-steepled building at the end of the street',
          'The largest structure in town, demanding reverence by size alone',
          'Built first when the town was founded, now weathered by years of doctrine',
        ],
        x: 500,
        y: 200,
        connections: ['gathering', 'landmark'],
      },
      {
        type: 'homestead',
        nameVariants: ['The Ranch', 'Creek Farm', 'Settler\'s Claim'],
        descriptionVariants: [
          'A working ranch down the west road, fences in disrepair',
          'The creek runs past this farm but the crops look thirsty',
          'Hard land claimed by harder people, now showing the strain',
        ],
        x: 120,
        y: 500,
        connections: ['store'],
      },
      {
        type: 'landmark',
        nameVariants: ['The Graveyard', 'Rest Hill', 'The Quiet Place'],
        descriptionVariants: [
          'Behind the church where the dead keep their own counsel',
          'A fenced patch of earth with names the living try to forget',
          'Stones mark the faithful departed, some more recent than comfortable',
        ],
        x: 500,
        y: 80,
        connections: ['church'],
      },
      {
        type: 'outskirts',
        nameVariants: ['The Mine', 'Shaft Entrance', 'The Diggings'],
        descriptionVariants: [
          'A dark hole in the hillside where men go in and sometimes come out changed',
          'Abandoned mine works with timber frames that creak in the wind',
          'The earth was opened here seeking wealth and found something else',
        ],
        x: 880,
        y: 500,
        connections: ['office'],
      },
      {
        type: 'homestead',
        nameVariants: ['The Parsonage', 'Elder\'s House', 'The Manse'],
        descriptionVariants: [
          'The preacher lives here, close enough to the church to never truly leave',
          'A comfortable home by town standards, speaking to certain privileges',
          'Books and doctrine fill this dwelling more than warmth',
        ],
        x: 350,
        y: 200,
        connections: ['church', 'store'],
      },
    ],
  },

  // 3. Clustered: Two neighborhoods connected by a bridge location
  {
    id: 'clustered',
    slots: [
      {
        type: 'gathering',
        nameVariants: ['The Bridge', 'Creek Crossing', 'The Ford'],
        descriptionVariants: [
          'A wooden bridge connecting the two halves of town',
          'The creek divides the settlement but this crossing unites it',
          'Neither side claims this ground, making it neutral territory',
        ],
        x: 500,
        y: 400,
        connections: ['church', 'store', 'homestead-1', 'office'],
      },
      {
        type: 'church',
        nameVariants: ['Faith Hall', 'The Old Church', 'Worship House'],
        descriptionVariants: [
          'The original church from founding days, walls thick with history',
          'A stone building on the hill overlooking both sides of town',
          'Where doctrine was first spoken in this valley, for good or ill',
        ],
        x: 300,
        y: 200,
        connections: ['gathering', 'homestead-2', 'landmark'],
      },
      {
        type: 'store',
        nameVariants: ['Creek Store', 'The Emporium', 'Trading House'],
        descriptionVariants: [
          'Built right on the creek bank, goods arrive by water and road',
          'The smell of coffee and leather greets visitors from the east side',
          'A prosperous-looking building that draws envy from across the creek',
        ],
        x: 700,
        y: 300,
        connections: ['gathering', 'office'],
      },
      {
        type: 'homestead',
        nameVariants: ['West Farm', 'The Orchard', 'Hillside Claim'],
        descriptionVariants: [
          'Fruit trees line the approach to this westside homestead',
          'The land here is better, and everyone on the east side knows it',
          'A prosperous farm that has not shared its bounty in some time',
        ],
        x: 180,
        y: 400,
        connections: ['gathering', 'church'],
      },
      {
        type: 'office',
        nameVariants: ['East Station', 'The Watch House', 'Guard Post'],
        descriptionVariants: [
          'The law keeps its office on the rougher side of town',
          'A fortified building with a view of the bridge and the east bank',
          'Where order is imposed on those who cross certain lines',
        ],
        x: 820,
        y: 400,
        connections: ['gathering', 'store', 'outskirts-1'],
      },
      {
        type: 'homestead',
        nameVariants: ['The Healer\'s Hut', 'Herb Garden', 'The Apothecary'],
        descriptionVariants: [
          'Drying herbs hang from every rafter of this small dwelling',
          'The smell of poultices and prayers fills this humble home',
          'A place of healing set apart from both sides of town',
        ],
        x: 200,
        y: 600,
        connections: ['church'],
      },
      {
        type: 'landmark',
        nameVariants: ['The Standing Stones', 'Council Rock', 'The Circle'],
        descriptionVariants: [
          'Ancient stones older than the town, older than the faith',
          'A ring of rocks where the elders once gathered before the church was built',
          'Something about this place makes the faithful uneasy',
        ],
        x: 400,
        y: 100,
        connections: ['church'],
      },
      {
        type: 'outskirts',
        nameVariants: ['The Ravine', 'Dead End Gulch', 'The Drop'],
        descriptionVariants: [
          'A deep cut in the earth at the edge of town, avoided after dark',
          'The creek falls away here into something deeper and darker',
          'No one goes here without reason, and reasons are seldom good',
        ],
        x: 900,
        y: 550,
        connections: ['office'],
      },
    ],
  },
];
