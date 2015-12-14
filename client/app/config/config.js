angular.module('codingChallengeApp').constant(
        'config',
        {
            main: {
                parse: {
                    applicationKey: "JyHA29BGTe9B12FlDdrmnTEgtc0etHocLU4uLyuq",
                    secret: "jx8aHTbzLnrsdQVL8T5ohllILd43bLWeWUQcbglp"
                }
            },
            modules: {
                codingGame: {
                    name: "Coding Game",
                    params: {
                        refreshPeriod: 20000
                    }
                },
                booking: {
                    name: "Booking",
                    params: {
                        refreshPeriod: 20000
                    }
                }
            }
        }
);