var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var remarkSchema = new Schema({
	resolver_id:{ type: String, required: true },
	date:{ type: Date, default: Date.now },
	remark:{ type: String, required: true }
});
/**
 * Tickets to be resolved by resolver.
 * Tickets to be created by the user.
 * Status ==> -1 = new Ticket, 1 ==> resolved, 0 ==> escalated, 2 ==> assigned
 * @type {Schema}
 */
var Ticket = new Schema({
	title: { type: String, required: true },
	user_id: { type: String, required: true },
	resolver_id: { type: String},
	description: { type: String, required: true },
	status: { type: Number, required:true },
	remark: [remarkSchema],
	modified: { type: Date, default: Date.now }
});

Ticket.path('title').validate((v) => {
	return v.length > 5 && v.length < 70;
});

Ticket.path('description').validate((v) => {
	return v.length > 20 && v.length < 200;
});

module.exports = mongoose.model('Ticket', Ticket);