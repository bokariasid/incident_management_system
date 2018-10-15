var express = require('express');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = console;
var db = require(libs + 'db/mongoose');
var Ticket = require(libs + 'model/ticket');

// get a list of all the tickets available.
router.get('/', (req, res) => {
	Ticket.find((err, articles) => {
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
	var ticket = new Ticket({
		title: req.body.title,
		user_id: req.body.user_id,
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
		if(requestBody.status == 0){
			// ticket has been escalated.
			if(ticket.remark.length == 0){
				ticket.remark = [requestBody.remark];
			} else {
				ticket.remark.push(requestBody.remark);
			}
		} else if(requestBody.status == 1) {
			// ticket has been resolved.
			ticket.status = 1;
		}
		ticket.resolver_id = req.body.resolver_id;
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