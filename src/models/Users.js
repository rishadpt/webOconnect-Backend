module.exports = (sequelize, Sequelize) => {

    const Users = sequelize.define("users", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,

        },
        email: {
            type: Sequelize.STRING,

        },
        password: {
            type: Sequelize.STRING,

        },
        phone: {
            type: Sequelize.STRING,

        },
        gender: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.INTEGER,   // 0: pending, 1: active ,2:deactive
            defaultValue: 0 //pending
        },
        date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.fn('NOW')
        }
    },
        {
            timestamps: false
        });
    return Users;
};