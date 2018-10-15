var express = require('express');
var router = express.Router();
const moment = require('moment');
var libs = process.cwd() + '/libs/';
var log = console;
var db = require(libs + 'db/mongoose');
var Ticket = require(libs + 'model/ticket');

// get a list of all the tickets for the current resolver
router.get('/tickets', (req, res) => {
	let resolver_id = req.user.userId;
	// we can implement a first level filter on the basis of ticket statuses.
	// also we can implement pagination for a better approach in fetching the resolver tickets.
	Ticket.find({resolver_id:resolver_id}, (err, articles) => {
		if (!err) {
			return res.status(200).json(articles).send();
		} else {
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			return res.status(500).json({error: 'Server error'}).send();
		}
	});
});

// get a ticket with a particular id.
router.get('/ticket/:id',(req, res) => {
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
router.put('/ticket/:id', (req, res) => {
	let ticketId = req.params.id;
	let requestBody = req.body;
	let resolver_id = req.user.userId;
	Ticket.findById(ticketId, (err, ticket) => {
		if(!ticket) {
			log.error('Ticket with id: %s Not Found', ticketId);
			return res.status(404).json({error: 'Not found'}).send();
		}
		let dateString = moment().format('YYYY-MM-DD HH:m:ss');
		// ticket assigned to the resolver.
		if(requestBody.assignTicket == 1){
			ticket.resolver_id = resolver_id;
			ticket.status = 2;
			let remark = {
				resolver_id:resolver_id,
				remark:'Ticket assigned on '+dateString
			};
			ticket.remark = [remark];
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