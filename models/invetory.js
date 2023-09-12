module.exports=(sequelize,Datatypes)=>{
    const Inventory=sequelize.define("Inventory",{
        productId:{
            type:Datatypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
            allowNull:false,
        },
        productName:{
            type:Datatypes.STRING,
            allowNull:false,
        },
        quantity:{
            type:Datatypes.INTEGER,
            allowNull:false,
        },
        sellingPrice:{
            type:Datatypes.FLOAT,
            allowNull:false,
        },
    },{
        timestamps:false
    })
    
    return Inventory;
}