export const seed = {
  users: [
    { id: "u1", firstName: "Alice", district: "Centre" },
    { id: "u2", firstName: "Bilal", district: "Gare" },
    { id: "u3", firstName: "Chloé", district: "Port" },
    { id: "u4", firstName: "David", district: "Faubourg" },
  ],
  tools: [
    { id: "t1", ownerId: "u1", name: "Perceuse à percussion", category: "Perçage", description: "Bosch 750 W, coffret de forets fourni.", status: "available" },
    { id: "t2", ownerId: "u1", name: "Niveau laser", category: "Mesure", description: "Laser croix, portée 15 m.", status: "lent" },
    { id: "t3", ownerId: "u2", name: "Tondeuse électrique", category: "Jardinage", description: "Coupe 38 cm, bac 40 L.", status: "available" },
    { id: "t4", ownerId: "u2", name: "Taille-haie", category: "Jardinage", description: "Lame 50 cm, batterie incluse.", status: "unavailable" },
    { id: "t5", ownerId: "u3", name: "Rouleau et bac à peinture", category: "Peinture", description: "Rouleau 180 mm, manche télescopique.", status: "available" },
    { id: "t6", ownerId: "u3", name: "Nettoyeur haute pression", category: "Nettoyage", description: "130 bars, lance rotative.", status: "available" },
    { id: "t7", ownerId: "u4", name: "Visseuse sans fil", category: "Perçage", description: "18 V, deux batteries.", status: "available" },
    { id: "t8", ownerId: "u4", name: "Mètre ruban 8 m", category: "Mesure", description: "Ruban large, blocage automatique.", status: "available" },
  ],
  loans: [],
};
