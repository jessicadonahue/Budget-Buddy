var express = require('express');
var router = express.Router();
var passport = require('passport');


var mongoose = require('mongoose');
var User = mongoose.model("User");
var Budget = mongoose.model("Budget");
var Expense = mongoose.model("Expense");



/*****/

//REGISTERING USER
router.get('/register', function(req, res) {
  res.render('register', {message: req.session.message});
});

router.post('/register', function(req, res, next) {
  //console.log('registering user');
  req.session.message = '';
  User.register(new User({username: req.body.username}), req.body.password, function(err) {
    if (err) {
      //console.log('error while user register!', err);
      //we can save the err message and redirect to the register page 
      req.session.message = err.message;
      //console.log("the message:",req.session.message);
      res.redirect('/register');
      return;
    }

    //console.log('user registered!');
    res.redirect('/dashboard');
  });
});


//USER LOGGING IN

/* GET home page. */
router.get('/', function(req, res, next) {
	//console.log('user:', req.user)
	if (req.user === undefined) {
		console.log('no user logged in');
	}
  res.render('home', {message: req.session.message, user: req.user});
});

router.post('/login', function(req, res, next) {

  passport.authenticate('local', function(err, user, info) {
    if (err) { 
    	return next(err); 
    }
    if (!user) { 
    	req.session.message = "Incorrect username or password";
    	res.redirect('/');
    	return; 
    }
    req.logIn(user, function(err) {
      if (err) { 
      	return next(err); 
      }
      //currentUser = user;
      req.session.user = user;

      return res.redirect('/dashboard');
    });
  })(req, res, next);


});



//USER LOGGING OUT 
router.get('/logout', function(req, res) {
  req.logout();
  req.session.message = '';
  res.redirect('/');
});


/******/



router.get('/dashboard', function(req, res, next) {

	var currentUser = req.user;
	if(currentUser === undefined) {
		res.redirect('/');
		return;

	}


	User.find({username: currentUser.username}, function(err, users, count) {


		for (user in users) {
			var currentUser = users[user];

			//get the overall budget
			var budgets = currentUser.budgetList;

			//HIGHER ORDER FUNCTION - REDUCE!! (1/3)
			var overall = budgets.reduce(function(sum, currentBudget) {

				return sum + currentBudget.amount;
			}, 0);




			//get the total expenses
			var expenses = currentUser.expenseList;

			//HIGHER ORDER FUNCTION - REDUCE!! (2/3)
			var totalExpense = expenses.reduce(function(sum, currentExpense) {

				return sum + currentExpense.amount;
			}, 0);


			//HIGHER ORDER FUNCTION - FILTER!! (3/3)
			//if a filter exists then filter the expenselist 
			if (req.session.filter) {
				var filtered = expenses.filter(function(expense) {

					return expense.type === req.session.filter;
				});

			}


			for (var i = 0; i < expenses.length; i++) {
				var currentExpense = expenses[i];

				var match = false;
				//loop through all the budgets and see if it i the same 
				for (var j = 0; j < budgets.length; j++) {

					if (currentExpense.type === budgets[j].type ) {
						match = true;
						budgets[j].totalSpent += currentExpense.amount;
						var moneyLeft = budgets[j].amount - budgets[j].totalSpent;
						//console.log('MONEY LEFT:', moneyLeft);
						budgets[j].spendingLeft = parseFloat(moneyLeft).toFixed(2);

					}
					else {
					}
				}
				if (match === false) {
					console.log('there is no matching budget for the current expense:', currentExpense.type);
					req.session.noMatch = 'Make sure to set a budget for the specified expense!'

				}
				console.log(match);

			}
			//console.log(totalExpense);

			var left = overall - totalExpense;

		}
		//console.log(overall);
		var message = req.session.message;
		var message2 = req.session.message2;

		var filterFlag = req.session.filter;
		if (filterFlag === 'No Filter') {
			filterFlag = undefined;
		}


		overall = parseFloat(overall).toFixed(2);

		left = parseFloat(left).toFixed(2);

		totalExpense = parseFloat(totalExpense).toFixed(2);

		var noMatch = req.session.noMatch;
		req.session.noMatch = '';
		res.render('dashboard', {noMatch: noMatch, expenses: expenses, budgets: budgets, filtered: filtered, filterFlag: filterFlag, message2: message2, message: message, users: users, overall: overall, totalExpense: totalExpense, left: left});

	});
});


router.post('/budgets', function(req, res, next) {
//check to see if that budget already exists
	var budgetType = req.body.type;
	var currentUser = req.user;

	



	if (isNaN(req.body.amount)) {
		req.session.message = "Please input just numbers";
	}
	else {
		req.session.message = "";
	}

	if (req.body.amount === "") {
		console.log('it was undefined');
		res.redirect('/dashboard');

	}
	else {
		//turn all numbers to floats to 2 positions
		var budgetAmount = parseFloat(req.body.amount).toFixed(2);


		User.find({username: currentUser.username}, function(err, users, count) { 
			for (user in users) {
				var currentUser = users[user];

				//get the overall budget
				var budgets = currentUser.budgetList;
				//console.log('budgets:',budgets);

				var exists = false;
				for (var i = 0; i < budgets.length; i++) {
					var currentBudget = budgets[i];
					//console.log(currentBudget.type);
					if (currentBudget.type === budgetType) {
						exists = true;
					}
				}
			}

			//console.log("EXISTS:",exists);

			//if this is a new budget type - if it doesnt exist in the list --> make a new budget item 
			if(exists === false) {
				//console.log(currentUser.username);
				console.log(budgetAmount);
				User.findOneAndUpdate({username: currentUser.username}, {$push: {budgetList: {type: budgetType,
								amount: budgetAmount,
								totalSpent: 0,
								spendingLeft: budgetAmount}
							}}, function(err, users, count) {
					//console.log("current users:",users);
				});
			}
			//if it does exists --> update the budget amount
			else {


			}
			res.redirect('/dashboard');


		});

	}

});


router.post('/expenses', function(req, res, next) {
	//console.log("user after add:",req.user);
	if (isNaN(req.body.amount)) {
		req.session.message2 = "Please input just numbers";
	}
	else {
		req.session.message2 = "";
	}

	if (req.body.amount === "") {
		console.log('it was undefined');
		res.redirect('/dashboard');
	}
	else {
		var expenseAmount = parseFloat(req.body.amount).toFixed(2);

		User.findOneAndUpdate({username: req.user.username}, {$push: {expenseList: {type: req.body.type,
						amount: expenseAmount,
						description: req.body.description}
					}}, function(err, users, count) {
			//console.log("current users:",users);
			res.redirect('/dashboard');
		});

	}


});
router.post('/filter', function(req, res, next) {
	req.session.filter = req.body.type;
	res.redirect('/dashboard');

});

router.post('/dashboard/delete', function(req, res, next) {

	//console.log("deleteBudgets is:",req.body.deleteExpenses);
	req.session.filter = undefined;
	User.findOne({username: req.user.username}, function(err, expenses, count) {
		//console.log('EXPENSES:',expenses)
		if (Array.isArray(req.body.deleteExpenses)) {
			for (expenseId in req.body.deleteExpenses) {

				expenses.expenseList.id(req.body.deleteExpenses[expenseId]).remove();
			}

		}
		else {

			expenses.expenseList.id(req.body.deleteExpenses).remove();


		}

		expenses.save();

		res.redirect('/dashboard');
	});	


});

router.post('/dashboard/deleteBudgets', function(req, res, next) {

	//console.log("deleteBudgets is:",req.body.deleteExpenses);
	req.session.filter = undefined;
	User.findOne({username: req.user.username}, function(err, budgets, count) {
		//console.log('EXPENSES:',expenses)
		if (Array.isArray(req.body.deleteBudgets)) {
			for (budgetId in req.body.deleteBudgets) {

				budgets.budgetList.id(req.body.deleteBudgets[budgetId]).remove();
			}

		}
		else {

			budgets.budgetList.id(req.body.deleteBudgets).remove();


		}

		budgets.save();

		res.redirect('/dashboard');
	});	


});


module.exports = router;
