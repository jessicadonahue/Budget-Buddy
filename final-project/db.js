var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');




// an item (or group of the same items) in a budget list
// * includes the type of the budget (overall, food, rent, etc.)
// * includes the amount entered for that budget
var Budget = new mongoose.Schema({
  type: String,
  amount: Number,
  totalSpent: Number,
  spendingLeft: Number
});

// an item (or group of the same items) in a budget list
// * includes the type of the budget (overall, food, rent, etc.)
// * includes the amount entered for that budget
var Expense = new mongoose.Schema({
  type: String,
  amount: Number,
  description: String,
  created : {
    type: Date,
    default: Date.now
  }
});

var User = new mongoose.Schema({
    username: String,
    password: String,
    budgetList: [Budget],
    expenseList: [Expense],

});

/*
// a budget list
// * each list must have a related user
// * a list can have 0 or more items
var BudgetList = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  budgets: [Budget]
});


// an expense list
// * each list must have a related user
// * a list can have 0 or more items
var ExpenseList = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  expenses: [Expense]
}); */


// after declaring your user schema...
User.plugin(passportLocalMongoose);

// I export the user model for apps.js to use it.
module.exports = mongoose.model('User', User);


// (2) use my schema to define my model (used as a constructor
// to create new documents)
//mongoose.model('User', User);
mongoose.model("Budget", Budget);
mongoose.model("Expense", Expense);
//mongoose.model("BudgetList", BudgetList);
//mongoose.model("ExpenseList", ExpenseList);




// (3) connect to database

//put this before you connect
// is the environment variable, NODE_ENV, set to PRODUCTION? 
if (process.env.NODE_ENV == 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 var fs = require('fs');
 var path = require('path');
 var fn = path.join(__dirname, 'config.json');
 var data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 var conf = JSON.parse(data);
 var dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/final_project';
}

console.log(dbconf);
mongoose.connect(dbconf); 






