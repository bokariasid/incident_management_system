var express = require('express');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = console;
var db = require(libs + 'db/mongoose');
var Ticket = require(libs + 'model/ticket');

// get a list of all the tickets available for the current user.
router.get('/', (req, res) => {
	let user_id = req.user.userId;
	// we can implement a first level filter on the basis of ticket statuses.
	// also we can implement pagination for a better approach in fetching the resolver tickets.
	Ticket.find({user_id:user_id}, (err, articles) => {
		if (!err) {
			return res.status(200).json(articles).send();
		} else {
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			return res.status(500).json({error: 'Server error'}).send();
		}
	});
});

// create a new ticket.
router.post('/', (req, res) => {
	let user_id = req.user.userId;
	var ticket = new Ticket({
		title: req.body.title,
		user_id: user_id,
		description: req.body.description,
		status:-1
	});
	ticket.save((err) => {
		if (!err) {
			log.info("New ticket created with id: %s", ticket.id);
			return res.status(200).json({status: 'OK',ticket:ticket}).send();
		} else {
			if(err.name === 'ValidationError') {
				res.status(406).json({error: 'Validation error'}).send();
			} else {
				res.status(500).json({error: 'Server error'}).send();
			}
			log.error('Internal error(%d): %s', res.statusCode, err.message);
		}
	});
});

// get a ticket with a particular id.
router.get('/:id',(req, res) => {
	Ticket.findById(req.params.id, (err, ticket) => {
		if(!ticket) {
			return res.status(404).json({error: 'Not found'}).send();
		}
		if (!err) {
			return res.status(200).json({status: 'OK',ticket:ticket}).send();
		} else {
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			return res.status(500).json({error: 'Server error'}).send();
		}
	});
});

// update the ticket.
router.put('/:id', (req, res) => {
	let ticketId = req.params.id;
	let requestBody = req.body;
	Ticket.findById(ticketId, (err, ticket) => {
		if(!ticket) {
			log.error('Ticket with id: %s Not Found', ticketId);
			return res.status(404).json({error: 'Not found'}).send();
		}
		if(requestBody.title){
			ticket.title = requestBody.title;
		}
		if(requestBody.description){
			ticket.description = requestBody.description;
		}
		ticket.save((err) => {
			if (!err) {
				log.info("Ticket with id: %s updated", ticket.id);
				return res.status(201).json({status: 'OK',ticket:ticket}).send();
			} else {
				if(err.name === 'ValidationError') {
					return res.status(400).json({error: 'Validation error'}).send();
				} else {
					return res.status(500).json({error: 'Server error'}).send();
				}
				log.error('Internal error (%d): %s', res.statusCode, err.message);
			}
		});
	});
});

module.exports = router;