const familles = {
    rollingford: {
        nom: "Rollingford",
        couleur : "#DD7E6B",
        description: "Une famille influente du royaume de Renblood.",
        data: {
            name: "Jonh † ❤️ Inconnu",
            keyName: "Jonh Rollingford",
            children: [
                {
                    name: "Didier ❤️ Elisabeth Goodbrook",
                    keyName: "Didier Rollingford",
                    children: [{ name: "Adeline", keyName: "Adeline Rollingford" }],
                },
                {
                    name: "Stannis † ❤️ Jade Lynster",
                    keyName: "Stannis Rollingford",
                    children: [
                        {
                            name: "Herbert ❤️ Dolores Wyne",
                            keyName: "Herbert Rollingford",
                            children: [
                                { name: "Philipe", keyName: "Philipe Rollingford" },
                                { name: "Audrey", keyName: "Audrey Rollingford" },
                            ],
                        },
                        {
                            name: "James ❤️ Walda Banefort",
                            keyName: "James Rollingford",
                        },
                        {
                            name: "Pristine",
                            keyName: "Pristine Rollingford",
                        },
                    ],
                },
            ],
        },
    },
    wyne: {
        nom: "Wyne",
        couleur: "#D20000",
        description: "Une famille noble et puissante, connue pour son lien avec les dragons et sa domination militaire.",
        data: {
            name: "Vactir ❤️ Inconnu",
            keyName: "Vactir Wyne",
            children: [
                {
                    name: "Arthur I ❤️ Araceli Roxton †",
                    keyName: "Arthur I Wyne",
                    children: [
                        {
                            name: "Arthur II ❤️ Lyza Lynster",
                            keyName: "Arthur II Wyne",
                            children: [
                                { name: "Arthur III", keyName: "Arthur III Wyne", children: [] },
                                { name: "Lys", keyName: "Lys Wyne", children: [] },
                            ],
                        },
                        {
                            name: "Dolores ❤️ Herbert Rollingford",
                            keyName: "Dolores Wyne",
                            children: [
                                { name: "Philipe Rollingford", keyName: "Philipe Rollingford", children: [] },
                                { name: "Audrey Rollingford", keyName: "Audrey Rollingford", children: [] },
                            ],
                        },
                        {
                            name: "Ethan ❤️ Connie Feran",
                            keyName: "Ethan Wyne",
                            children: [{ name: "Rob", keyName: "Rob Wyne", children: [] }],
                        },
                        {
                            name: "Ebony ❤️ Conrad Roxton",
                            keyName: "Ebony Wyne",
                            children: [],
                        },
                        {
                            name: "Carle Sand",
                            keyName: "Carle Sand",
                            children: [],
                            parents: ["Arthur I ❤️ Prostituée"]
                        },
                    ],
                },
            ],
        },
    },
    lynster: {
        nom: "Lynster",
        couleur: "#E2B007",
        description: "Une famille noble et influente du Nord, connue pour son expertise militaire et ses alliances stratégiques.",
        data: {
            name: "Robert † ❤️ Inconnu",
            keyName: "Robert Lynster",
            children: [
                {
                    name: "Lenyll † ❤️ Anna †",
                    keyName: "Lenyll Lynster",
                    children: [
                        {
                            name: "Stanislas ❤️ Michelle Feran",
                            keyName: "Stanislas Lynster",
                            children: [
                                { name: "Leny III", keyName: "Leny III Lynster" },
                                { name: "Mircella", keyName: "Mircella Lynster" },
                            ],
                        },
                        {
                            name: "Sergio ❤️ Jeanne Banefort",
                            keyName: "Sergio Lynster",
                            children: [
                                { name: "Lina", keyName: "Lina Lynster" },
                            ],
                        },
                        {
                            name: "Lyza ❤️ Arthur II Wyne",
                            keyName: "Lyza Lynster",
                            children: [
                                { name: "Arthur III Wyne", keyName: "Arthur III Wyne" },
                                { name: "Lys Wyne", keyName: "Lys Wyne" },
                            ],
                        },
                    ],
                },
                {
                    name: "Reli † ❤️ Terron Rok",
                    keyName: "Reli Lynster",
                    children: [
                        {
                            name: "Astra ❤️ Oman",
                            keyName: "Astra Lynster",
                            children: [{ name: "Levonn Goodbrook", keyName: "Levonn Goodbrook" }],
                        },
                        {
                            name: "Drak Rok",
                            keyName: "Drak Rok",
                        },
                    ],
                },
                {
                    name: "Tanguy †",
                    keyName: "Tanguy Lynster",
                },
                {
                    name: "Jade † ❤️ Stannis Rollingford",
                    keyName: "Jade Lynster",
                    children: [
                        {
                            name: "HERBERT ❤️ Dolores Wyne",
                            keyName: "Herbert Rollingford",
                            children: [
                                { name: "Philipe Rollingford", keyName: "Philipe Rollingford" },
                                { name: "Audrey Rollingford", keyName: "Audrey Rollingford" },
                            ],
                        },
                        {
                            name: "James ❤️ Walda Banefort",
                            keyName: "James Rollingford",
                        },
                        {
                            name: "Pristine Rollingford",
                            keyName: "Pristine Rollingford",
                        },
                    ],
                },
            ],
        },
    },
    chalk: {
        nom: "Chalk",
        couleur: "#F78DD8",
        description: "Une famille érudite et mystique, reconnue pour sa connexion avec la nature et la magie ancienne.",
        data: {
            name: "Elanor † ❤️ Qinfir †",
            keyName: "Elanor Chalk",
            children: [
                {
                    name: "Wranmaris † ❤️ Xillana",
                    keyName: "Wranmaris Chalk",
                    children: [
                        { name: "Glynvalur", keyName: "Glynvalur Chalk" },
                        { name: "Tia", keyName: "Tia Chalk" },
                    ],
                },
                {
                    name: "Orixina ❤️ Zumpetor",
                    keyName: "Orixina Chalk",
                    children: [
                        { name: "Wynyra", keyName: "Wynyra Chalk" },
                    ],
                },
                {
                    name: "Herris ❤️ Orizorwyn",
                    keyName: "Herris Chalk",
                },
            ],
        },
    },
    roxton: {
        nom: "Roxton",
        couleur: "#4973C2",
        description: "Une famille influente du royaume, connue pour son passé de navigateurs, de guerriers et ses alliances stratégiques.",
        data: {
            name: "Bob † ❤️ Louisa Paltain",
            keyName: "Bob Roxton",
            children: [
                {
                    name: "Lassiou † ❤️ Louize Ouloh",
                    keyName: "Lassiou Roxton",
                    children: [
                        {
                            name: "Isandre † ❤️ Daé Feran",
                            keyName: "Isandre Roxton",
                            children: [
                                {
                                    name: "Joras ❤️ Louiza Juifou",
                                    keyName: "Joras Roxton",
                                    children: [
                                        { name: "Sévrin Roxton", keyName: "Sévrin Roxton" },
                                        { name: "Edmon Roxton", keyName: "Edmon Roxton" },
                                    ],
                                },
                            ],
                        },
                        {
                            name: "Anna ❤️ Leny II Lynster",
                            keyName: "Anna Roxton",
                            children: [
                                { 
                                    name: "Conrad ❤️ Ebony Wyne", 
                                    keyName: "Conrad Roxton" 
                                },
                            ],
                        },
                        {
                            name: "Araceli ❤️ Arthur I Wyne",
                            keyName: "Araceli Roxton",
                        },
                    ],
                },
                {
                    name: "Antina † ❤️ Entropi Rok",
                    keyName: "Antina Roxton",
                },
            ],
        },
    },
};

export default familles;
